
const redis = require('redis');


const client = redis.createClient({
    url: 'redis://192.168.1.15'
});


(async () => {
    try {
        await client.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Could not connect to Redis', err);
    }
})();


client.on('error', (err) => {
    console.error('Redis error:', err);
});


module.exports = client;