const cron = require('node-cron');
const axios = require('axios');

/**
 * Keep-Alive Cron Job
 * Prevents the server from sleeping on free hosting platforms
 * by making periodic HTTP requests to the health endpoint
 */

const HEALTH_ENDPOINT = process.env.SERVER_URL || 'http://localhost:4000';
const PING_INTERVAL = '*/8 * * * *'; // Every 8 minutes

/**
 * Ping the health endpoint to keep the server awake
 */
const pingHealthEndpoint = async () => {
    try {
        const response = await axios.get(`${HEALTH_ENDPOINT}/health`, {
            timeout: 10000, // 10 second timeout
            headers: {
                'User-Agent': 'Campus-Connect-KeepAlive/1.0'
            }
        });

        if (response.status === 200) {
            console.log(`[KEEP-ALIVE] ✓ Health check successful at ${new Date().toISOString()}`);
            console.log(`[KEEP-ALIVE] Server status: ${response.data.status}`);
        }
    } catch (error) {
        console.error(`[KEEP-ALIVE] ✗ Health check failed at ${new Date().toISOString()}`);
        if (error.response) {
            console.error(`[KEEP-ALIVE] Status: ${error.response.status}`);
        } else if (error.request) {
            console.error(`[KEEP-ALIVE] No response received`);
        } else {
            console.error(`[KEEP-ALIVE] Error: ${error.message}`);
        }
    }
};

/**
 * Setup keep-alive cron job
 */
const setupKeepAliveCron = () => {
    // Only run keep-alive in production or if explicitly enabled
    const isProduction = process.env.NODE_ENV === 'production';
    const keepAliveEnabled = process.env.ENABLE_KEEP_ALIVE === 'true';

    if (!isProduction && !keepAliveEnabled) {
        console.log('[KEEP-ALIVE] Skipped - Not in production mode');
        return;
    }

    // Schedule the cron job
    cron.schedule(PING_INTERVAL, pingHealthEndpoint);

    console.log(`[KEEP-ALIVE] ✓ Keep-alive cron job scheduled`);
    console.log(`[KEEP-ALIVE] Interval: Every 8 minutes`);
    console.log(`[KEEP-ALIVE] Target: ${HEALTH_ENDPOINT}/health`);

    // Run initial ping after 30 seconds
    setTimeout(() => {
        console.log('[KEEP-ALIVE] Running initial health check...');
        pingHealthEndpoint();
    }, 30000);
};

module.exports = { setupKeepAliveCron, pingHealthEndpoint };
