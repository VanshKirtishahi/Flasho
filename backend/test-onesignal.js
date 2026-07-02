const axios = require('axios');
require('dotenv').config();

// 🔴 PASTE YOUR MONGODB ID HERE (From the OneSignal Dashboard's "External ID" column)
const TARGET_MONGO_ID = "6a04843c0b7bf663dabef818"; 

async function testTargetedPush() {
  console.log(`\n🚀 Attempting to send push to specific user: ${TARGET_MONGO_ID}`);

  try {
    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id: process.env.ONESIGNAL_APP_ID,
        include_external_user_ids: [TARGET_MONGO_ID], // 🟢 Targeting the specific user
        headings: { en: "Targeted Push Success! ✅" },
        contents: { en: "The link between MongoDB and OneSignal is working perfectly." }
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
        }
      }
    );

    console.log("✅ REQUEST ACCEPTED BY ONESIGNAL.");
    console.log("Response Data:", response.data);
    
    if (response.data.errors) {
      console.log("\n🔴 ERROR: OneSignal accepted it, but couldn't find the user.");
    } else {
      console.log("\n🟢 SUCCESS! Your phone should vibrate right now.");
    }

  } catch (error) {
    console.log("\n🔴 FATAL ERROR:");
    console.error(error.response?.data || error.message);
  }
}

testTargetedPush();