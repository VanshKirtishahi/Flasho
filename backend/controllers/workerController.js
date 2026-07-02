const Booking = require('../models/Booking');
const User = require('../models/User');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const NotificationService = require('../services/NotificationService');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, 
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.acceptTask = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.status !== 'pending') return res.status(400).json({ error: "Job no longer available" });
    
    booking.worker_id = req.mongoUser._id;
    booking.status = 'assigned';
    await booking.save();
    
    await NotificationService.sendToUser(
      booking.user_id, "Professional Assigned! 👨‍🔧", `${req.mongoUser.full_name} has accepted your job. Open the app to pay and confirm.`,
      { type: 'job_update', job_id: booking._id.toString(), status: 'assigned' }
    );

    res.json({ message: "Job accepted", booking });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, before_image, after_image } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.worker_id.toString() !== req.mongoUser._id.toString()) return res.status(403).json({ error: "Unauthorized" });

    booking.status = status;
    if (before_image) booking.before_image = before_image;
    if (after_image) booking.after_image = after_image;
    await booking.save();

    if (status === 'completed') {
       const worker = await User.findById(req.mongoUser._id);
       const isFranchiseWorker = worker.agency_id || worker.franchise_id;
       
       if (!isFranchiseWorker) {
         // 🟢 EXACT 2-DECIMAL CALCULATION (Independent gets 90%)
         const payout = Number((booking.price * 0.90).toFixed(2));
         worker.wallet_balance = Number(((worker.wallet_balance || 0) + payout).toFixed(2));
       } else {
         // 🟢 EXACT 2-DECIMAL CALCULATION (Agency gets 15%)
         const Agency = require('../models/Agency');
         const agency = await Agency.findById(isFranchiseWorker);
         if (agency) {
            const agencyPayout = Number((booking.price * 0.15).toFixed(2));
            agency.wallet_balance = Number(((agency.wallet_balance || 0) + agencyPayout).toFixed(2));
            agency.completed_jobs = (agency.completed_jobs || 0) + 1;
            await agency.save();
         }
       }
       
       worker.completed_jobs = (worker.completed_jobs || 0) + 1;
       await worker.save();
       
       await NotificationService.sendToUser(
         booking.user_id, "Service Completed ✅", "Your service has been completed successfully. Please review the work and leave a rating!",
         { type: 'job_update', job_id: booking._id.toString(), status: 'completed' }
       );
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

    // EXACT 2-DECIMAL WITHDRAWAL
    const withdrawAmount = Number(Number(amount).toFixed(2));
    if (withdrawAmount <= 0 || worker.wallet_balance < withdrawAmount) return res.status(400).json({ error: "Invalid amount or insufficient balance." });

    const request = new WithdrawalRequest({
      entity_id: worker._id, entity_type: 'worker', entity_name: worker.full_name,
      contact_info: worker.phone || worker.email || 'N/A', amount: withdrawAmount,
      payout_method: payout_method || 'upi', payout_details: payout_details || {}, status: 'pending'
    });
    await request.save();

    try {
      // 🟢 BYPASS THE SDK & USE DIRECT AXIOS CALLS TO RAZORPAYX
      const axios = require('axios');
      const authHeader = `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`;

      // 1. Create Contact
      const contactData = { 
        name: request.entity_name, 
        type: "vendor", // 🟢 FIXED: Razorpay only accepts 'vendor', 'employee', or 'customer'
        reference_id: request.entity_id.toString(),
        contact: worker.phone || undefined,
        email: worker.email || undefined
      };
      
      const contactRes = await axios.post('https://api.razorpay.com/v1/contacts', contactData, {
        headers: { 'Authorization': authHeader }
      });

      // 2. Create Fund Account
      let fundAccountPayload = { 
        contact_id: contactRes.data.id, 
        account_type: request.payout_method === 'upi' ? 'vpa' : 'bank_account' 
      };

      if (request.payout_method === 'upi') {
        fundAccountPayload.vpa = { address: request.payout_details.upi_id };
      } else {
        fundAccountPayload.bank_account = { 
          name: request.payout_details.account_name, 
          ifsc: request.payout_details.ifsc_code, 
          account_number: request.payout_details.account_number 
        };
      }
      
      const fundRes = await axios.post('https://api.razorpay.com/v1/fund_accounts', fundAccountPayload, {
        headers: { 'Authorization': authHeader }
      });

      // 3. Execute Payout
      const amountInPaise = Math.round(withdrawAmount * 100);
      const payoutRes = await axios.post('https://api.razorpay.com/v1/payouts', {
        account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER, 
        fund_account_id: fundRes.data.id, 
        amount: amountInPaise, 
        currency: "INR", 
        mode: request.payout_method === 'upi' ? "UPI" : "IMPS", 
        purpose: "payout", 
        queue_if_low_balance: true, 
        reference_id: request._id.toString(),
        notes: { platform: "Flasho", payout_type: "worker" }
      }, {
        headers: { 'Authorization': authHeader }
      });

      console.log(`[RAZORPAY INSTANT] Payout Executed! ID: ${payoutRes.data.id}`);

      // EXACT 2-DECIMAL DEDUCTION
      worker.wallet_balance = Number((worker.wallet_balance - withdrawAmount).toFixed(2));
      await worker.save();
      request.status = 'approved';
      await request.save();

      return res.status(200).json({ message: "Withdrawal successful! Funds transferred to your account.", new_balance: worker.wallet_balance });
    } catch (payoutErr) {
      console.error("[RAZORPAY ERROR]", payoutErr.response?.data || payoutErr.message);
      request.status = 'rejected';
      await request.save();
      
      // Provides the exact error from Razorpay (e.g., "Invalid IFSC code")
      const errorDesc = payoutErr.response?.data?.error?.description || payoutErr.message || "Please check your bank/UPI details.";
      return res.status(400).json({ error: "Bank Transfer Failed: " + errorDesc });
    }
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};