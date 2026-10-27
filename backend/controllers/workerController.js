const Booking = require('../models/Booking');
const User = require('../models/User');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const NotificationService = require('../services/NotificationService');
const axios = require('axios');

exports.acceptTask = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.status !== 'pending') return res.status(400).json({ error: "Job no longer available" });
    
    booking.worker_id = req.mongoUser._id;
    booking.status = 'assigned';
    await booking.save();
    
    const workerName = req.mongoUser ? req.mongoUser.full_name : "Your Professional";
    await NotificationService.sendToUser(
      booking.user_id,
      "Professional Assigned! 🚀",
      `${workerName} has accepted your request. Open the app to pay and confirm.`,
      { type: 'job_update', job_id: booking._id.toString(), status: 'assigned' }
    );

    res.json({ message: "Job accepted", booking });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, before_image, after_image } = req.body;
    const workerId = req.mongoUser ? req.mongoUser._id : req.user._id;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ error: "Task not found" });
    if (booking.worker_id.toString() !== req.mongoUser._id.toString()) return res.status(403).json({ error: "Unauthorized" });

    const isNewlyCompleted = (status === 'completed') && (booking.status !== 'completed');

    booking.status = status;
    if (before_image) booking.before_image = before_image;
    if (after_image) booking.after_image = after_image;
    await booking.save();

    if (isNewlyCompleted) {
      const worker = await User.findById(workerId);
      if (worker) {
        const jobEarnings = Number(booking.price) || 0;
        
        if (!worker.agency_id && !worker.franchise_id) {
          // 🟢 FIX: Keep exact 2 decimal places instead of Math.round()
          const workerCut = Number((jobEarnings * 0.90).toFixed(2));
          worker.wallet_balance = Number(((worker.wallet_balance || 0) + workerCut).toFixed(2));
        } else {
          // 🟢 FIX: Keep exact 2 decimal places instead of Math.round()
          const Agency = require('../models/Agency');
          const agency = await Agency.findById(worker.agency_id || worker.franchise_id);
          if (agency) {
            const agencyPayout = Number((jobEarnings * 0.15).toFixed(2));
            agency.wallet_balance = Number(((agency.wallet_balance || 0) + agencyPayout).toFixed(2));
            agency.completed_jobs = (agency.completed_jobs || 0) + 1;
            await agency.save();
          }
        }
        
        worker.completed_jobs = (worker.completed_jobs || 0) + 1;
        await worker.save();
        
        await NotificationService.sendToUser(
          booking.user_id,
          "Service Completed ✅",
          "Your service has been completed successfully. Please review the work and leave a rating!",
          { type: 'job_update', job_id: booking._id.toString(), status: 'completed' }
        );
      }
    }

    res.json({ message: "Status updated", booking });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.submitVerification = async (req, res) => {
  try {
    const { has_vehicle, vehicle_type, vehicle_number, skills, custom_service, govt_id_type, documents, agency_id } = req.body;
    let user = await User.findOne({ auth_id: req.authId });

    if (!user) return res.status(404).json({ error: "User not found." });

    user.verification_status = 'pending';
    user.has_vehicle = has_vehicle || false;
    user.vehicle_type = vehicle_type || 'none';
    user.vehicle_number = vehicle_number || '';
    user.skills = skills || [];
    user.custom_service = custom_service || '';
    user.govt_id_type = govt_id_type || 'Aadhar';
    user.agency_id = agency_id || null;
      
    if (documents) {
      user.documents = {
        id_proof: documents.id_proof || '', license: documents.license || '', vehicle_rc: documents.vehicle_rc || '',
        govt_front: documents.govt_front || '', govt_back: documents.govt_back || '', selfie: documents.selfie || ''
      };
    }

    await user.save();
    res.status(200).json({ message: "Verification submitted successfully", user });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, payout_method, payout_details } = req.body;
    const worker = await User.findOne({ auth_id: req.authId });
    
    if (!worker || worker.role !== 'worker') return res.status(403).json({ error: "Access denied." });

    const withdrawAmount = Number(Number(amount).toFixed(2));
    if (withdrawAmount <= 0 || worker.wallet_balance < withdrawAmount) return res.status(400).json({ error: "Invalid amount or insufficient balance." });

    worker.wallet_balance = Number((worker.wallet_balance - withdrawAmount).toFixed(2));
    await worker.save();

    const request = new WithdrawalRequest({
      entity_id: worker._id, 
      entity_type: 'worker', 
      entity_name: worker.full_name,
      contact_info: worker.phone || worker.email || 'N/A', 
      amount: withdrawAmount,
      payout_method: payout_method || 'upi', 
      payout_details: payout_details || {}, 
      status: 'pending' 
    });
    
    await request.save();

    return res.status(200).json({ 
        message: "Withdrawal request submitted to Admin for approval!", 
        new_balance: worker.wallet_balance 
    });

  } catch (error) {
     res.status(500).json({ error: error.message });
  }
};