const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Agency = require('../models/Agency'); 
const Franchise = require('../models/Franchise'); // Added just in case it was missing

// --- 1. DASHBOARD STATS ---
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'client' });
    const totalWorkers = await User.countDocuments({ role: 'worker' });
    
    // 🟢 FIXED: Check for 'pending' status specifically to match your Onboarding logic
    const pendingWorkers = await User.countDocuments({ role: 'worker', verification_status: 'pending' });
    
    const totalBookings = await Booking.countDocuments();
    
    const revenueAgg = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);
    const revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    res.json({ totalUsers, totalWorkers, pendingWorkers, totalBookings, revenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 2. USER MANAGEMENT ---
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'client' }).sort({ created_at: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 3. WORKER MANAGEMENT ---

// 🟢 NEW ROUTE ADDED: Fetch specifically pending workers for the Verification Tab
exports.getPendingVerifications = async (req, res) => {
    try {
        const pendingWorkers = await User.find({
            role: 'worker',
            verification_status: 'pending'
        })
        .populate('agency_id', 'name') // 🟢 Safely fetches Agency Name
        .sort({ created_at: -1 });

        res.status(200).json(pendingWorkers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getAllWorkers = async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' })
        .populate('agency_id', 'name') // 🟢 FIXED: Fetches Agency Name for standard list
        .sort({ created_at: -1 });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyWorker = async (req, res) => {
  try {
    // 🟢 FIXED: Also update 'verification_status' so they disappear from the pending list
    const worker = await User.findByIdAndUpdate(
        req.params.id, 
        { is_verified: true, verification_status: 'approved' }, 
        { new: true }
    );
    res.json(worker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 4. SERVICE CATALOG MANAGEMENT ---
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ category: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const newService = new Service(req.body);
    await newService.save();
    res.status(201).json(newService);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 5. AGENCIES MANAGEMENT ---
exports.createAgency = async (req, res) => {
  try {
    const { name, contact_person, phone, address } = req.body;
    const newAgency = new Agency({ name, contact_person, phone, address });
    await newAgency.save();
    res.status(201).json(newAgency);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAgenciesStats = async (req, res) => {
  try {
    const stats = await Agency.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'agency_id',
          as: 'workers'
        }
      },
      {
        $lookup: {
          from: 'bookings',
          localField: 'workers._id',
          foreignField: 'worker_id',
          as: 'jobs'
        }
      },
      {
        $project: {
          name: 1,
          contact_person: 1,
          phone: 1,
          address: 1,
          total_workers: { $size: "$workers" },
          total_jobs_completed: {
            $size: {
              $filter: {
                input: "$jobs",
                as: "job",
                cond: { $eq: ["$$job.status", "completed"] }
              }
            }
          },
          total_earnings: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$jobs",
                    as: "job",
                    cond: { $eq: ["$$job.status", "completed"] }
                  }
                },
                as: "completedJob",
                in: "$$completedJob.price"
              }
            }
          }
        }
      }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAgencyCredentials = async (req, res) => {
  try {
    const { email, password } = req.body;
    const agencyId = req.params.id;

    // 1. Find the existing Agency
    const agency = await Agency.findById(agencyId);
    if (!agency) return res.status(404).json({ error: "Agency not found" });

    // 2. Create Auth User in Supabase directly
    // Ensure supabaseAdmin is required properly in your file if using this!
    if (typeof supabaseAdmin === 'undefined') {
        return res.status(500).json({ error: "supabaseAdmin is not configured in this controller." });
    }
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true 
    });

    if (authError) return res.status(400).json({ error: authError.message });

    // 3. Create the Franchise Owner User in MongoDB
    const franchiseOwner = new User({
      auth_id: authData.user.id,
      email: email,
      full_name: agency.contact_person || agency.name,
      phone: agency.phone,
      role: 'franchise_owner',
      agency_id: agency._id 
    });
    await franchiseOwner.save();

    // 4. Create the Franchise Record
    const newFranchise = new Franchise({
      name: agency.name,
      location_address: agency.address || 'Not Provided',
      owner_id: franchiseOwner._id,
      status: 'active'
    });
    await newFranchise.save();

    // 5. Link the Franchise ID back to the Owner
    franchiseOwner.franchise_id = newFranchise._id;
    await franchiseOwner.save();

    res.status(201).json({ 
      message: "Franchise credentials created successfully!", 
      email: email 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};