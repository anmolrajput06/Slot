// redisClient.js
const redis = require('redis');

// Create a Redis client
const client = redis.createClient({
    url: 'redis://192.168.1.15'
});

// Connect to Redis server
(async () => {
    try {
        await client.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Could not connect to Redis', err);
    }
})();

// Handle connection errors
client.on('error', (err) => {
    console.error('Redis error:', err);
});

// Export the Redis client
module.exports = client;