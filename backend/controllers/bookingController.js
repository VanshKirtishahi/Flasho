const Booking = require('../models/Booking');
const User = require('../models/User');
const Review = require('../models/Review');
const NotificationService = require('../services/NotificationService');

exports.createBooking = async (req, res) => {
  try {
    let mongoUserId = req.mongoUser ? req.mongoUser._id : null;
    if (!mongoUserId) {
      const safeEmail = req.email || '';
      const newUser = new User({ auth_id: req.authId, email: safeEmail, full_name: safeEmail ? safeEmail.split('@')[0] : 'Client', role: 'client', phone: 'Not Provided' });
      await newUser.save();
      mongoUserId = newUser._id;
    }
    const { service_title, description, scheduled_date, location, latitude, longitude, price, category, images } = req.body;
    
    const newBooking = new Booking({ 
      user_id: mongoUserId, service_title, description, scheduled_date, location, 
      latitude, longitude, price, category: category || 'General', images: images || [], status: 'pending' 
    });
    await newBooking.save();

    const nearbyWorkers = await User.find({ role: 'worker', is_online: true }).select('_id');
    const workerIds = nearbyWorkers.map(w => w._id);
    
    if (workerIds.length > 0) {
      await NotificationService.sendToMultipleUsers(
        workerIds,
        "New Job Request! 🚀",
        `A new ₹${price} ${service_title} task is available. Tap to view!`,
        { type: 'new_job', job_id: newBooking._id.toString() }
      );
    }

    res.status(201).json(newBooking);
  } catch (err) { res.status(500).json({ error: "Server Error: " + err.message }); }
};

exports.addAddon = async (req, res) => {
  try {
    const { title, price, payment_id } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ error: "Original booking not found" });
    if (booking.user_id.toString() !== req.mongoUser._id.toString()) return res.status(403).json({ error: "Unauthorized" });
    if (!booking.worker_id) return res.status(400).json({ error: "You cannot add services before a professional is assigned." });

    booking.price += Number(price);
    booking.description += `\n\n[➕ Add-On Paid: ${title} (+₹${price})]`;
    await booking.save();

    await NotificationService.sendToUser(
      booking.worker_id, "Add-On Paid & Added! 💸", `The client added '${title}'. Your job payout has increased by ₹${price}.`,
      { type: 'job_update', job_id: booking._id.toString(), status: booking.status }
    );

    res.status(200).json(booking);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMyBookings = async (req, res) => {
  try {
    if (!req.mongoUser) return res.json([]); 
    const bookings = await Booking.find({ user_id: req.mongoUser._id }).sort({ scheduled_date: -1 }); 
    res.json(bookings);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateClientStatus = async (req, res) => {
  try {
    const { status, payment_id } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.user_id.toString() !== req.mongoUser._id.toString()) return res.status(403).json({ error: "Not authorized to update this booking." });
    
    booking.status = status;
    await booking.save();

    if (status === 'confirmed' && booking.worker_id) {
      await NotificationService.sendToUser(
        booking.worker_id, "Booking Confirmed! ⚡", `Payment received for ${booking.service_title}. Proceed to the job safely.`,
        { type: 'job_update', job_id: booking._id.toString(), status: 'confirmed' }
      );
    } else if (status === 'cancelled' && booking.worker_id) {
      await NotificationService.sendToUser(
        booking.worker_id, "Job Cancelled ✕", `The customer cancelled the booking for ${booking.service_title}.`,
        { type: 'job_update', job_id: booking._id.toString(), status: 'cancelled' }
      );
    }

    res.status(200).json({ message: "Booking status updated safely", booking });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, review_text } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.status !== 'completed') return res.status(400).json({ error: "You can only rate completed services." });
    if (booking.user_id.toString() !== req.mongoUser._id.toString()) return res.status(403).json({ error: "Not authorized to rate this booking." });

    let existingReview = null;
    if (Review) { 
      existingReview = await Review.findOne({ booking_id: booking._id });
      if (existingReview) return res.status(400).json({ error: "You have already rated this service." });
      
      const review = new Review({
        booking_id: booking._id, client_id: req.mongoUser._id, worker_id: booking.worker_id,
        rating: Number(rating), review_text: review_text || ''
      });
      await review.save();

      const ratingStats = await Review.aggregate([
        { $match: { worker_id: booking.worker_id } },
        { $group: { _id: null, averageRating: { $avg: "$rating" } } }
      ]);
      const completedJobsCount = await Booking.countDocuments({ worker_id: booking.worker_id, status: 'completed' });
      const newAvgRating = ratingStats.length > 0 ? ratingStats[0].averageRating.toFixed(1) : 0;

      await User.findByIdAndUpdate(booking.worker_id, { rating: newAvgRating, completed_jobs: completedJobsCount });
      return res.status(200).json({ message: "Review submitted successfully", new_stats: { rating: newAvgRating, completed_jobs: completedJobsCount }});
    }

    res.status(200).json({ message: "Review handled" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAdminBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user_id', 'full_name phone')
      .populate('worker_id', 'full_name phone agency_id')
      .sort({ _id: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAgencyBookings = async (req, res) => {
  try {
    const user = await User.findOne({ auth_id: req.authId });
    if (!user || !user.agency_id) return res.status(403).json({error: "Not an agency"});
    
    const workers = await User.find({ agency_id: user.agency_id }).select('_id');
    const workerIds = workers.map(w => w._id);

    const bookings = await Booking.find({ worker_id: { $in: workerIds } })
      .populate('user_id', 'full_name phone')
      .populate('worker_id', 'full_name phone')
      .sort({ _id: -1 });
    
    res.json(bookings);
  } catch (err) { res.status(500).json({ error: err.message }); }
};