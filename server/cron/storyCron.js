const cron = require('node-cron');
const Story = require('../models/story.model');

/**
 * Cron job to delete expired stories
 * Runs every hour
 */
const setupStoryCronJobs = () => {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
        try {
            const now = new Date();
            const result = await Story.deleteMany({ expiresAt: { $lt: now } });
            if (result.deletedCount > 0) {
                console.log(`[CRON] Deleted ${result.deletedCount} expired stories`);
            }
        } catch (error) {
            console.error('[CRON] Error deleting expired stories:', error);
        }
    });

    console.log('[CRON] Story cleanup job scheduled (runs hourly)');
};

module.exports = { setupStoryCronJobs };
