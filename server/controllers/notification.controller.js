const DeviceToken = require('../models/deviceToken.model');
const notificationService = require('../services/notification.service');
const UAParser = require('ua-parser-js');
const Notification = require('../models/notification.model');

/**
 * Register or update device token
 */
exports.registerToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    // Parse user agent for device info
    const parser = new UAParser(req.headers['user-agent']);
    const deviceInfo = {
      browser: parser.getBrowser().name,
      os: parser.getOS().name,
      device: parser.getDevice().type || 'desktop',
      userAgent: req.headers['user-agent']
    };

    // Check if token already exists
    let deviceToken = await DeviceToken.findOne({ token });

    if (deviceToken) {
      // Update existing token
      deviceToken.user = userId;
      deviceToken.deviceInfo = deviceInfo;
      deviceToken.isActive = true;
      deviceToken.lastUsed = new Date();
      await deviceToken.save();
    } else {
      // Create new token
      deviceToken = await DeviceToken.create({
        user: userId,
        token,
        deviceInfo,
        isActive: true
      });
    }

    res.status(200).json({
      success: true,
      message: 'Device token registered successfully',
      data: {
        tokenId: deviceToken._id
      }
    });
  } catch (error) {
    console.error('Error registering device token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register device token',
      error: error.message
    });
  }
};

/**
 * Remove device token
 */
exports.removeToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    await DeviceToken.findOneAndUpdate(
      { token, user: userId },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: 'Device token removed successfully'
    });
  } catch (error) {
    console.error('Error removing device token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove device token',
      error: error.message
    });
  }
};

/**
 * Get user's active devices
 */
exports.getUserDevices = async (req, res) => {
  try {
    const userId = req.user.id;

    const devices = await DeviceToken.find({
      user: userId,
      isActive: true
    }).select('deviceInfo lastUsed createdAt');

    res.status(200).json({
      success: true,
      data: {
        devices,
        count: devices.length
      }
    });
  } catch (error) {
    console.error('Error fetching user devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch devices',
      error: error.message
    });
  }
};

/**
 * Send test notification to current user
 */
exports.sendTestNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, body, clickAction } = req.body;

    const notification = {
      title: title || 'Test Notification',
      body: body || 'This is a test notification from Campus Connect'
    };

    const data = {
      type: 'test',
      clickAction: clickAction || '/home'
    };

    const result = await notificationService.sendToUser(userId, notification, data);

    res.status(200).json({
      success: true,
      message: 'Test notification sent',
      data: result
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    });
  }
};

/**
 * Send notification to specific user (Admin only)
 */
exports.sendToUser = async (req, res) => {
  try {
    const { userId, notification, data } = req.body;

    if (!userId || !notification) {
      return res.status(400).json({
        success: false,
        message: 'userId and notification are required'
      });
    }

    const result = await notificationService.sendToUser(userId, notification, data);

    res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
};

/**
 * Send notification to multiple users (Admin only)
 */
exports.sendToMultipleUsers = async (req, res) => {
  try {
    const { userIds, notification, data } = req.body;

    if (!userIds || !Array.isArray(userIds) || !notification) {
      return res.status(400).json({
        success: false,
        message: 'userIds (array) and notification are required'
      });
    }

    const result = await notificationService.sendToMultipleUsers(userIds, notification, data);

    res.status(200).json({
      success: true,
      message: 'Notifications sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notifications',
      error: error.message
    });
  }
};

/**
 * Send notification to topic (Admin only)
 */
exports.sendToTopic = async (req, res) => {
  try {
    const { topic, notification, data } = req.body;

    if (!topic || !notification) {
      return res.status(400).json({
        success: false,
        message: 'topic and notification are required'
      });
    }

    const result = await notificationService.sendToTopic(topic, notification, data);

    res.status(200).json({
      success: true,
      message: 'Notification sent to topic successfully',
      data: result
    });
  } catch (error) {
    console.error('Error sending notification to topic:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification to topic',
      error: error.message
    });
  }
};

/**
 * Cleanup old inactive tokens (Admin/Cron job)
 */
exports.cleanupOldTokens = async (req, res) => {
  try {
    const daysOld = req.query.days || 90;
    const result = await DeviceToken.cleanupOldTokens(daysOld);

    res.status(200).json({
      success: true,
      message: `Cleaned up old tokens`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Error cleaning up tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup tokens',
      error: error.message
    });
  }
};

/**
 * Create system notification (Admin)
 */
exports.createSystemNotification = async (req, res) => {
  try {
    const { title, message, targetAudience, expiresAt } = req.body;
    // req.adminId should be set by requireAdminAuth
    const adminId = req.adminId || (req.user ? req.user.id : null);

    const notification = await Notification.create({
      title,
      message,
      targetAudience: targetAudience || 'all',
      expiresAt,
      createdBy: adminId
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating system notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};

/**
 * List system notifications (Admin)
 */
exports.listSystemNotifications = async (req, res) => {
  try {
    const admin = req.admin;
    let query = { isActive: true };

    // If it's a regular college admin, filter relevant notifications
    if (admin && admin.role !== 'superadmin') {
      const collegeId = admin.college;
      query = {
        isActive: true,
        $or: [
          { targetAudience: 'all' }, // Global
          { targetAudience: 'admins' }, // All Admins
          {
            targetAudience: { $in: ['college', 'college_admins'] },
            targetCollege: collegeId
          }
        ]
      };
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error listing system notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list notifications',
      error: error.message
    });
  }
};

/**
 * Delete system notification (Admin)
 */
exports.deleteSystemNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

const UserNotification = require('../models/userNotification.model');

// ... (existing exports)

/**
 * Get user notifications
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await UserNotification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'name avatar username')
      .lean();

    const unreadCount = await UserNotification.countDocuments({ recipient: userId, isRead: false });

    res.status(200).json({
      success: true,
      data: notifications, // Return array directly usually, or wrapped
      notifications: notifications, // For backward compatibility if needed
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

/**
 * Delete notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await UserNotification.findOneAndDelete({ _id: id, recipient: userId });

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

/**
 * Mark notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await UserNotification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { isRead: true }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await UserNotification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ success: true, message: 'All marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// Helper to create notification (internal use)
exports.createUserNotification = async (data) => {
  try {
    return await UserNotification.create(data);
  } catch (e) {
    console.error('Error creating notification:', e);
  }
};