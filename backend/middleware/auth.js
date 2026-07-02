const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');
const User = require('../models/User');
require('dotenv').config();

// 1. Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// 2. Initialize Supabase Admin (For React Web Panel)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No authorization header provided" });

    const token = authHeader.split(' ')[1]; 
    if (!token || token === 'undefined') return res.status(401).json({ error: "No token provided" });

    let authId = null;
    let phone = null;
    let email = null;

    // 🟢 TRY FIREBASE FIRST (For Mobile App OTP)
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      authId = decodedToken.uid;
      phone = decodedToken.phone_number;
    } catch (firebaseError) {
      
      // 🔵 IF FIREBASE FAILS, TRY SUPABASE (For React Admin Panel)
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        // If BOTH fail, reject the request
        console.warn(`🔒 Auth Denied: Invalid Token (Failed both Firebase & Supabase)`);
        return res.status(401).json({ error: "Invalid or expired token" });
      }
      
      authId = user.id;
      email = user.email;
    }

    req.authId = authId;
    req.phone = phone;
    req.email = email;

    // Find user in database
    const mongoUser = await User.findOne({ auth_id: authId });
    
    if (mongoUser) {
      req.mongoUser = mongoUser;
      if (mongoUser.is_blocked) return res.status(403).json({ error: "Your account is blocked." });
    }

    next();
  } catch (error) {
    console.warn(`🔒 Auth Middleware Error: ${error.message}`);
    return res.status(500).json({ error: "Internal Auth Error" });
  }
};

module.exports = authMiddleware;