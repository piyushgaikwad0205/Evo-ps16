const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const passport = require('passport');

// Middleware to check if user is authenticated
const authenticate = passport.authenticate('jwt', { session: false });

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};

// User routes
router.post('/register-token', authenticate, notificationController.registerToken);
router.post('/remove-token', authenticate, notificationController.removeToken);
router.get('/devices', authenticate, notificationController.getUserDevices);
router.post('/test', authenticate, notificationController.sendTestNotification);

// Admin routes
router.post('/send-to-user', authenticate, isAdmin, notificationController.sendToUser);
router.post('/send-to-multiple', authenticate, isAdmin, notificationController.sendToMultipleUsers);
router.post('/send-to-topic', authenticate, isAdmin, notificationController.sendToTopic);
router.delete('/cleanup', authenticate, isAdmin, notificationController.cleanupOldTokens);

module.exports = router;
