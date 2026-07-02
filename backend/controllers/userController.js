const User = require('../models/User');
const Service = require('../models/Service');
const Agency = require('../models/Agency');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

exports.syncUser = async (req, res) => {
  try {
    const { full_name, role, phone, email } = req.body; 
    const firebaseUid = req.authId;
    const verifiedPhone = req.phone || phone;

    let existingUser = await User.findOne({
      $or: [{ auth_id: firebaseUid }, { phone: verifiedPhone }]
    });

    if (existingUser) {
      existingUser.auth_id = firebaseUid;
      if (email) existingUser.email = email; 
      
      if (role && existingUser.role !== role) {
        existingUser.role = role;
      }
      if (full_name) {
        existingUser.full_name = full_name;
      }

      await existingUser.save();
      return res.status(200).json(existingUser);
    }

    const newUser = new User({
      auth_id: firebaseUid,
      phone: verifiedPhone,
      full_name: full_name || 'Partner',
      email: email || '', 
      role: role || 'client',
      verification_status: role === 'worker' ? 'unsubmitted' : 'approved',
      is_verified: false,
      wallet_balance: 0,
      completed_jobs: 0
    });

    await newUser.save();
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ auth_id: req.authId }).populate('agency_id', 'name').lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    // 🟢 EXACT 2-DECIMAL "PENDING SETTLEMENT" CALCULATION
    if (user.role === 'worker' && (user.agency_id || user.franchise_id)) {
        const fId = user.franchise_id || user.agency_id;
        const completedJobs = await Booking.find({ worker_id: user._id, status: 'completed' });
        
        let totalGenerated = 0;
        for(let j of completedJobs) totalGenerated += (Number(j.price) || 0);
        
        // 75% Cut calculated exactly
        const totalEarned = Number((totalGenerated * 0.75).toFixed(2)); 

        const Transaction = require('../models/Transaction');
        const pastPayouts = await Transaction.find({
            franchise_id: fId, type: 'expense', category: 'payout',
            $or: [{ user_id: user._id }, { description: new RegExp(user.full_name, 'i') }]
        });
        
        let totalPaidOut = 0;
        for(let t of pastPayouts) totalPaidOut += (Number(t.amount) || 0);

        // Deduct exactly what has been paid
        let pending = Number((totalEarned - totalPaidOut).toFixed(2));
        user.pending_settlement = pending > 0 ? pending : 0;
    } else {
        user.pending_settlement = 0;
    }

    res.json(user);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const { full_name, phone, email, profile_image } = req.body;
    let updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (profile_image !== undefined) updateData.profile_image = profile_image; 

    const updatedUser = await User.findOneAndUpdate({ auth_id: req.authId }, { $set: updateData }, { new: true, runValidators: true });
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findOne({ auth_id: req.authId });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user.addresses || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addAddress = async (req, res) => {
  try {
    const user = await User.findOne({ auth_id: req.authId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { name, address, city, type, latitude, longitude } = req.body;
    user.addresses.push({ name, address, city, type: type || 'Home', latitude: latitude || 0, longitude: longitude || 0 });
    
    await user.save();
    res.status(200).json({ message: "Address added successfully", addresses: user.addresses });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findOne({ auth_id: req.authId });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
    await user.save();
    res.status(200).json({ message: "Address deleted successfully", addresses: user.addresses });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAgencies = async (req, res) => {
  try {
    const agencies = await Agency.find().sort({ name: 1 });
    res.json(agencies);
  } catch (err) { res.status(500).json({ error: err.message }); }
};