const express = require('express');
const router = express.Router();
const NotificationService = require('../services/NotificationService');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Agency = require('../models/Agency');

// ==========================================
// 🟢 FINANCIAL SETTLEMENTS ROUTES
// ==========================================

// 1. Fetch pending Individual Workers
router.get('/settlements/workers', authMiddleware, async (req, res) => {
  try {
    // Finds workers who have a wallet balance greater than 0
    const pendingWorkers = await User.find({ 
      role: 'worker', 
      wallet_balance: { $gt: 0 } 
    })
    .select('full_name email phone completed_jobs wallet_balance')
    .sort({ wallet_balance: -1 }); // Sort by largest payout first

    res.status(200).json(pendingWorkers);
  } catch (error) {
    console.error("Worker Settlement Fetch Error:", error);
    res.status(500).json({ error: "Failed to load worker settlements" });
  }
});

// 2. Fetch pending Agencies
router.get('/settlements/agencies', authMiddleware, async (req, res) => {
  try {
    // Assumes Agency schema has a wallet_balance or pending_payout field
    const pendingAgencies = await Agency.find({ 
      wallet_balance: { $gt: 0 } 
    })
    .select('name email phone completed_jobs wallet_balance')
    .sort({ wallet_balance: -1 });

    res.status(200).json(pendingAgencies);
  } catch (error) {
    console.error("Agency Settlement Fetch Error:", error);
    res.status(500).json({ error: "Failed to load agency settlements" });
  }
});

// 3. Process Payout (Mark as Settled)
router.post('/settlements/process', authMiddleware, async (req, res) => {
  try {
    const { targetId, type, amount } = req.body;

    if (!targetId || !type) {
      return res.status(400).json({ error: "Missing required payout parameters" });
    }

    if (type === 'workers') {
      // Find the worker and safely reset their balance to 0
      const worker = await User.findById(targetId);
      if (!worker) return res.status(404).json({ error: "Worker not found" });
      
      worker.wallet_balance = 0;
      await worker.save();
      
      // Optional: Push Notification to Worker
      // await NotificationService.sendToUser(targetId, "Payout Processed! 💸", `₹${amount} has been successfully transferred to your bank account.`);
      
    } else if (type === 'agencies') {
      const agency = await Agency.findById(targetId);
      if (!agency) return res.status(404).json({ error: "Agency not found" });
      
      agency.wallet_balance = 0;
      await agency.save();
    } else {
      return res.status(400).json({ error: "Invalid settlement type" });
    }

    res.status(200).json({ message: "Payout marked as settled successfully." });
  } catch (error) {
    console.error("Settlement Processing Error:", error);
    res.status(500).json({ error: "Failed to process settlement safely" });
  }
});

// 🟢 SEND MARKETING BROADCAST
router.post('/notifications/broadcast', authMiddleware, async (req, res) => {
  try {
    // Optional: Protect this route so only YOU can send broadcasts
    if (req.mongoUser.role !== 'super_admin') {
      return res.status(403).json({ error: "Only admins can send broadcasts" });
    }

    const { title, message, imageUrl, discountCode } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    // Call the new Broadcast function
    await NotificationService.sendBroadcastOffer(
      title, 
      message, 
      imageUrl, // e.g., "https://your-domain.com/diwali-banner.jpg"
      { discountCode: discountCode || null } // Pass the promo code invisibly
    );

    res.status(200).json({ message: "Broadcast sent successfully to all users!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;