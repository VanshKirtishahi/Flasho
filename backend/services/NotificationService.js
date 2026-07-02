const axios = require('axios');

class NotificationService {
  static get apiClient() {
    return axios.create({
      baseURL: 'https://onesignal.com/api/v1/notifications',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
      }
    });
  }

  static async sendToUser(userId, title, message, payload = {}) {
    try {
      await this.apiClient.post('', {
        app_id: process.env.ONESIGNAL_APP_ID,
        include_external_user_ids: [userId.toString()],
        headings: { en: title },
        contents: { en: message },
        data: payload
      });
    } catch (error) {
      console.error('OneSignal Push Error:', error.response?.data || error.message);
    }
  }

  static async sendToMultipleUsers(userIds, title, message, payload = {}) {
    if (!userIds || userIds.length === 0) return;
    try {
      await this.apiClient.post('', {
        app_id: process.env.ONESIGNAL_APP_ID,
        include_external_user_ids: userIds.map(id => id.toString()),
        headings: { en: title },
        contents: { en: message },
        data: payload
      });
    } catch (error) {
      console.error('OneSignal Group Push Error:', error.response?.data || error.message);
    }
  }

  // 🟢 THE BULLETPROOF BROADCAST METHOD
  static async sendBroadcastOffer(title, message, imageUrl = null, customData = {}) {
    try {
      console.log("[PUSH] Preparing to blast broadcast offer to ALL users...");
      
      const payload = {
        app_id: process.env.ONESIGNAL_APP_ID,
        // 🟢 Targets all standard OneSignal segment names so no device is missed
        included_segments: ['Subscribed Users', 'Active Users', 'Total Subscriptions'], 
        target_channel: 'push', // Forces push notification delivery
        headings: { en: title },
        contents: { en: message },
        data: { type: 'marketing_offer', ...customData }
      };

      if (imageUrl) {
        payload.big_picture = imageUrl; // For Android rich push
        payload.ios_attachments = { "id1": imageUrl }; // For iOS rich push
      }

      const response = await this.apiClient.post('', payload);
      console.log('✅ Broadcast Success! OneSignal accepted the blast. ID:', response.data.id);
    } catch (error) {
      console.error('🔴 OneSignal Broadcast Error:', error.response?.data || error.message);
    }
  }
}

module.exports = NotificationService;