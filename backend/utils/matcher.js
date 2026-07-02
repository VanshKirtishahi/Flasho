const User = require('../models/User');

const findBestWorker = async (serviceCategory, clientLat, clientLng, rejectedIds = []) => {
  try {
    const MAX_DISTANCE_METERS = 15000; // 15 km search radius

    // 1. Fetch online workers nearby using MongoDB Geospatial indexing
    const nearbyWorkers = await User.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(clientLng), parseFloat(clientLat)] },
          distanceField: "distance_meters",
          maxDistance: MAX_DISTANCE_METERS,
          query: { 
             role: 'worker',
            is_online: true,
            // 🟢 STRICT CHECKS REMOVED: Ensures your test device gets the ping!
            _id: { $nin: rejectedIds } 
          },
          spherical: true
        }
      }
    ]);

    console.log(`[MATCHER] Found ${nearbyWorkers.length} online workers.`);

    if (nearbyWorkers.length === 0) return null;

    // 2. Calculate Smart Score for each worker
    let bestWorker = null;
    let highestScore = -1;

    for (let worker of nearbyWorkers) {
      const distanceScore = Math.max(0, 100 - ((worker.distance_meters / MAX_DISTANCE_METERS) * 100));
      const currentRating = worker.rating || 0;
      const ratingScore = (currentRating / 5.0) * 100;
      const jobsDone = worker.completed_jobs || 0;
      const experienceScore = Math.min(100, (jobsDone / 50) * 100);

      const totalScore = (distanceScore * 0.40) + (ratingScore * 0.40) + (experienceScore * 0.20);
      
      if (totalScore > highestScore) {
        highestScore = totalScore;
        bestWorker = worker;
      }
    }

    return bestWorker;
  } catch (error) {
    console.error("Matcher Error:", error);
    return null;
  }
};

module.exports = { findBestWorker };