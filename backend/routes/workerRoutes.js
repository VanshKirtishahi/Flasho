const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking'); 
const authMiddleware = require('../middleware/auth');

// 🟢 CRITICAL INJECTION: Import the Notification Service
const NotificationService = require('../services/NotificationService');

// ===============================================================
// 🟢 SUBMIT KYC & DOCUMENTS (Updates nested schema fields)
// ===============================================================
router.put('/kyc', authMiddleware, async (req, res) => {
  try {
    // 1. Try to use the pre-fetched Mongo user from authMiddleware
    let worker = req.mongoUser;

    // 2. 🟢 BULLETPROOF FALLBACK: If ID fails, find them by their phone number!
    if (!worker && req.phone) {
       worker = await User.findOne({ phone: req.phone });
    }

    // 3. If STILL not found, throw error
    if (!worker) {
      return res.status(404).json({ error: "Worker profile not found in database." });
    }

    // Force fix the auth_id if it was out of sync
    if (req.authId) worker.auth_id = req.authId;

    const { 
      skills, has_vehicle, vehicle_type, vehicle_number, 
      govt_id_type, documents, custom_service, agency_id 
    } = req.body;

    if (skills) worker.skills = skills;
    if (custom_service !== undefined) worker.custom_service = custom_service;
    if (has_vehicle !== undefined) worker.has_vehicle = has_vehicle;
    if (vehicle_type) worker.vehicle_type = vehicle_type;
    if (vehicle_number) worker.vehicle_number = vehicle_number;
    if (govt_id_type) worker.govt_id_type = govt_id_type;

    if (agency_id) {
      worker.agency_id = agency_id;
    } else {
      worker.agency_id = null;
    }

    if (documents) {
      worker.documents = { ...worker.documents, ...documents };
    }

    worker.verification_status = 'pending';
    await worker.save();

    res.status(200).json({ message: "KYC submitted successfully.", user: worker });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/status', authMiddleware, async (req, res) => {
  try {
    const { is_online, latitude, longitude } = req.body;
    const workerId = req.mongoUser ? req.mongoUser._id : req.user._id;

    const updateData = { is_online: is_online };
    if (latitude != null && longitude != null) {
      updateData.live_location = { type: 'Point', coordinates: [longitude, latitude] };
    }

    const updatedWorker = await User.findByIdAndUpdate(workerId, { $set: updateData }, { new: true });
    res.status(200).json({ message: "Status updated successfully", is_online: updatedWorker.is_online });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟢 WORKER ACCEPTS TASK
router.put('/tasks/:id/accept', authMiddleware, async (req, res) => {
  try {
    const workerId = req.mongoUser ? req.mongoUser._id : req.user._id;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) return res.status(404).json({ error: "Task not found" });
    if (booking.status !== 'pending') return res.status(400).json({ error: "Task already taken" });

    booking.worker_id = workerId;
    booking.status = 'assigned';
    await booking.save();

    // 🔔 ALERT THE CLIENT
    const workerName = req.mongoUser ? req.mongoUser.full_name : "Your Professional";
    await NotificationService.sendToUser(
      booking.user_id,
      "Professional Assigned! ✅",
      `${workerName} has accepted your request.`,
      { type: 'job_update', job_id: booking._id.toString(), status: 'assigned' }
    );

    res.status(200).json({ message: "Task accepted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 🟢 WORKER UPDATES TASK STATUS (workerRoutes.js)
// ==========================================
router.put('/tasks/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body; 
    const workerId = req.mongoUser ? req.mongoUser._id : req.user._id;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Task not found" });

    const isNewlyCompleted = (status === 'completed') && (booking.status !== 'completed');
    booking.status = status;
    await booking.save();

    if (isNewlyCompleted) {
      const worker = await User.findById(workerId);
      if (worker) {
        const jobEarnings = Number(booking.price) || 0;
        
        if (!worker.agency_id && !worker.franchise_id) {
          // 🟢 INDIVIDUAL WORKER: 90%
          const workerCut = Math.round(jobEarnings * 0.90);
          worker.wallet_balance = Math.round((worker.wallet_balance || 0) + workerCut);
        } else {
          // 🟢 AGENCY/FRANCHISE: Gets their 15% pure profit
          const Agency = require('../models/Agency');
          const agency = await Agency.findById(worker.agency_id || worker.franchise_id);
          if (agency) {
            agency.wallet_balance = Math.round((agency.wallet_balance || 0) + (jobEarnings * 0.15));
            agency.completed_jobs = (agency.completed_jobs || 0) + 1;
            await agency.save();
          }
        }
        worker.completed_jobs = (worker.completed_jobs || 0) + 1;
        await worker.save();
      }
    }
    res.status(200).json({ message: "Status updated successfully", status: booking.status });
  } catch (error) { res.status(500).json({ error: error.message }); }
});


// ==========================================
// 🟢 GET OPEN TASKS (Available Jobs)
// ==========================================
router.get('/tasks/open', authMiddleware, async (req, res) => {
  try {
    const workerId = req.mongoUser ? req.mongoUser._id : req.user._id;

    // Fetch pending tasks that this worker hasn't rejected
    const openTasks = await Booking.find({
      status: 'pending',
      rejected_by: { $ne: workerId }
    }).sort({ created_at: -1 });

    res.status(200).json(openTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 🟢 GET MY TASKS (Earnings & History)
// ==========================================
router.get('/tasks/mine', authMiddleware, async (req, res) => {
  try {
    const workerId = req.mongoUser ? req.mongoUser._id : req.user._id;

    // Fetch jobs assigned to this specific worker
    const myTasks = await Booking.find({
      worker_id: workerId
    }).sort({ scheduled_date: -1 });

    res.status(200).json(myTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;