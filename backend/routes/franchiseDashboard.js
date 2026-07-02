const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Booking = require('../models/Booking'); 
const Franchise = require('../models/Franchise');
const authMiddleware = require('../middleware/auth');
const NotificationService = require('../services/NotificationService');

// 1. GET METRICS
router.get('/metrics', authMiddleware, async (req, res) => {
  try {
    const owner = req.mongoUser;
    const fId = owner.franchise_id;
    if (!fId && owner.role !== 'super_admin') return res.status(403).json({ error: "No franchise assigned." });

    const financialStats = await Transaction.aggregate([
      { $match: { franchise_id: fId, status: 'completed' } },
      { $group: { _id: null, totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } }, totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } } } }
    ]);
    const income = financialStats.length > 0 ? Number(financialStats[0].totalIncome.toFixed(2)) : 0;
    const expense = financialStats.length > 0 ? Number(financialStats[0].totalExpense.toFixed(2)) : 0;

    const activeWorkers = await User.countDocuments({ 
      $or: [{ franchise_id: fId }, { agency_id: owner.agency_id }], role: 'worker', is_active: true, verification_status: 'approved' 
    });

    const franchiseWorkerIds = await User.distinct('_id', {
      $or: [{ franchise_id: fId }, { agency_id: owner.agency_id }], role: 'worker'
    });

    const activeTasks = await Booking.countDocuments({ worker_id: { $in: franchiseWorkerIds }, status: { $in: ['assigned', 'in_progress'] } });

    res.status(200).json({ net_revenue: Number((income - expense).toFixed(2)), total_income: income, total_expense: expense, active_workers: activeWorkers, active_tasks: activeTasks });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// 🟢 CREATE TRANSACTION (PROCESS PAYOUT)
// ==========================================
router.post('/transactions', authMiddleware, async (req, res) => {
  try {
    // 1. Ensure we grab the user_id from the frontend request
    const { amount, category, type, description, user_id } = req.body; 
    const recordType = type === 'debit' ? 'expense' : type;
    const exactAmount = Number(Number(amount).toFixed(2));

    // 2. Create the Receipt
    const newTxn = new Transaction({
      franchise_id: req.mongoUser.franchise_id,
      amount: exactAmount,
      type: recordType,
      category: category,
      description: description,
      user_id: user_id || null, 
      status: 'completed'
    });
    await newTxn.save();

    // 3. 🟢 GUARANTEED ADDITION TO WORKER'S WITHDRAWABLE WALLET
    if (category === 'payout' && user_id) {
      const worker = await User.findById(user_id);
      if (worker) {
        const oldBalance = worker.wallet_balance || 0;
        // We ADD the money so the worker can now withdraw it to their bank!
        worker.wallet_balance = Number((oldBalance + exactAmount).toFixed(2));
        await worker.save();
        
        console.log(`✅ [PAYOUT SUCCESS] Transferred ₹${exactAmount} into ${worker.full_name}'s app wallet. New Balance: ₹${worker.wallet_balance}`);
      }
    }

    res.status(201).json({ message: "Transaction created successfully", transaction: newTxn });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

router.get('/transactions/all', authMiddleware, async (req, res) => {
  try { res.status(200).json(await Transaction.find({ franchise_id: req.mongoUser.franchise_id }).sort({ transaction_date: -1 })); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

// CREATE TRANSACTION
router.post('/transactions', authMiddleware, async (req, res) => {
  try {
    const { amount, category, type, description } = req.body;
    const recordType = type === 'debit' ? 'expense' : type;
    const exactAmount = Number(Number(amount).toFixed(2));

    const newTxn = new Transaction({
      franchise_id: req.mongoUser.franchise_id,
      amount: exactAmount,
      type: recordType,
      category: category,
      description: description,
      user_id: req.body.user_id || null, 
      status: 'completed'
    });
    await newTxn.save();

    if (category === 'payout' && req.body.user_id) {
      const worker = await User.findById(req.body.user_id);
      if (worker) {
        worker.wallet_balance = Math.max(0, Number((worker.wallet_balance - exactAmount).toFixed(2)));
        await worker.save();
      }
    }

    res.status(201).json({ message: "Transaction created successfully", transaction: newTxn });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 🟢 3. GET WORKERS (EXACT 2-DECIMAL CALCULATION)
router.get('/workers', authMiddleware, async (req, res) => {
  try {
    const owner = req.mongoUser;
    const workers = await User.find({ $or: [{ franchise_id: owner.franchise_id }, { agency_id: owner.agency_id }], role: 'worker' }).lean(); 

    for (let worker of workers) {
      const completedJobs = await Booking.find({ worker_id: worker._id, status: 'completed' });
      let totalGenerated = 0;
      for (let job of completedJobs) totalGenerated += (Number(job.price) || 0);
      
      const totalEarned = Number((totalGenerated * 0.75).toFixed(2));

      const pastPayouts = await Transaction.find({
        franchise_id: owner.franchise_id, type: 'expense', category: 'payout',
        $or: [{ user_id: worker._id }, { description: new RegExp(worker.full_name, 'i') }]
      });
      
      let totalPaidOut = 0;
      for (let txn of pastPayouts) totalPaidOut += (Number(txn.amount) || 0);

      let trueBalance = Number((totalEarned - totalPaidOut).toFixed(2));
      worker.wallet_balance = trueBalance > 0 ? trueBalance : 0; 
    }
    res.status(200).json(workers);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 4. GET JOBS
router.get('/jobs', authMiddleware, async (req, res) => {
  try {
    const franchiseWorkerIds = await User.distinct('_id', { $or: [{ franchise_id: req.mongoUser.franchise_id }, { agency_id: req.mongoUser.agency_id }], role: 'worker' });
    const jobs = await Booking.find({ worker_id: { $in: franchiseWorkerIds } }).populate('user_id', 'full_name').populate('worker_id', 'full_name').sort({ scheduled_date: -1 });
    res.status(200).json(jobs);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 5. SETTINGS
router.get('/settings', authMiddleware, async (req, res) => {
  try { res.status(200).json({ user: req.mongoUser, franchise: await Franchise.findById(req.mongoUser.franchise_id) || {} }); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/settings', authMiddleware, async (req, res) => {
  try {
    const { branch_name, location_address, phone } = req.body;
    if (branch_name || location_address) await Franchise.findByIdAndUpdate(req.mongoUser.franchise_id, { $set: { ...(branch_name && { name: branch_name }), ...(location_address && { location_address: location_address }) } });
    if (phone) await User.findByIdAndUpdate(req.mongoUser._id, { $set: { phone: phone } });
    res.status(200).json({ message: "Settings updated" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 🟢 6. GET WORKER PERFORMANCE
router.get('/workers/:id/performance', authMiddleware, async (req, res) => {
  try {
    const workerId = req.params.id;
    const completedJobs = await Booking.find({ worker_id: workerId, status: 'completed' });
    
    let totalGenerated = 0;
    for (let job of completedJobs) totalGenerated += (Number(job.price) || 0);
    const totalEarnings = Number((totalGenerated * 0.75).toFixed(2));

    const currentJob = await Booking.findOne({ worker_id: workerId, status: { $in: ['assigned', 'in_progress'] } }).populate('user_id', 'full_name');
    res.status(200).json({ total_earnings: totalEarnings, current_job: currentJob || null });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/workers/:id/block', authMiddleware, async (req, res) => {
    try {
        const { is_blocked } = req.body;
        const worker = await User.findByIdAndUpdate(req.params.id, { is_blocked }, { new: true });
        res.status(200).json(worker);
    } catch (error) { res.status(500).json({ error: "Failed to update block status" }); }
});

// 🟢 8. DIRECT WITHDRAW TO APP WALLET
router.post('/workers/:id/withdraw', authMiddleware, async (req, res) => {
  try {
    const worker = await User.findById(req.params.id);
    const amount = Number(Number(req.body.amount).toFixed(2));
    if (!worker) return res.status(404).json({ error: "Worker not found" });

    worker.wallet_balance = Number(((worker.wallet_balance || 0) + amount).toFixed(2));
    await worker.save();

    await new Transaction({ 
      franchise_id: req.mongoUser.franchise_id, user_id: worker._id,
      amount: amount, type: 'expense', category: 'payout', 
      description: `Payout to ${worker.full_name}`, status: 'completed' 
    }).save();

    await NotificationService.sendToUser(
      worker._id, "Funds Settled 💰", `₹${amount.toFixed(2)} has been approved by your Franchise. You can now withdraw it!`,
      { type: 'payout_received', amount: amount }
    );
    res.status(200).json({ message: "Payout approved and sent to worker's app wallet." });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/workers/:id/approve', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const worker = await User.findById(req.params.id);
    if (!worker) return res.status(404).json({ error: "Professional not found." });

    worker.verification_status = 'approved';
    worker.is_verified = true;
    await worker.save();
    res.status(200).json({ message: "Professional approved and granted platform access.", worker });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 🟢 BULK PAYOUT
router.post('/financials/bulk-payout', authMiddleware, async (req, res) => {
  try {
    const owner = req.mongoUser;
    const { payouts } = req.body; 
    let totalPaid = 0;

    for (let payout of payouts) {
      const worker = await User.findById(payout.id);
      if (!worker) continue;

      const exactPayout = Number(Number(payout.amount).toFixed(2));

      const newTxn = new Transaction({
        franchise_id: owner.franchise_id, user_id: worker._id, amount: exactPayout,
        type: 'expense', category: 'payout', description: `Bulk Payout: ${worker.full_name}`, status: 'completed'
      });
      await newTxn.save();

      worker.wallet_balance = Number(((worker.wallet_balance || 0) + exactPayout).toFixed(2));
      await worker.save();
      totalPaid += exactPayout;
    }
    res.status(200).json({ message: `Successfully paid workers.`, total_paid: Number(totalPaid.toFixed(2)) });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

/// 🟢 TRUE EARNINGS SYNC (Safeguarded)
router.post('/financials/sync-past-earnings', authMiddleware, async (req, res) => {
  try {
    // We NO LONGER overwrite worker.wallet_balance here!
    // Wallet Balance is exclusively for "Real cash ready to withdraw". 
    res.status(200).json({ message: "Earnings calculation is now handled dynamically! No sync required." });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

router.get('/wallet', authMiddleware, async (req, res) => {
  try {
    const owner = req.mongoUser;
    if (!owner.agency_id) return res.status(400).json({ error: "No agency linked." });
    
    const Agency = require('../models/Agency');
    const agency = await Agency.findById(owner.agency_id);
    
    res.status(200).json({ wallet_balance: agency ? agency.wallet_balance : 0 });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;