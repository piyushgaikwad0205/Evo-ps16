const Log = require("../../models/log.model");
const getCurrentContextData = require("../../utils/contextData");

/**
 * Saves log info to the database
 * @param req - request object
 * @param message {string} - log message
 * @param type {string} - log type (sign in, sign out, api requests)
 * @param level {string} - log level (error, warning, info)
 * @param user - optional user/admin object (for cases where req.user/req.admin is not set yet)
 */
const saveLogInfo = async (req, message, type, level, user = null) => {
  try {
    let context = null;
    if (req) {
      const { ip, country, city, browser, platform, os, device, deviceType } =
        getCurrentContextData(req);

      context = `IP: ${ip}, Country: ${country}, City: ${city}, Device Type: ${deviceType}, Browser: ${browser}, Platform: ${platform}, OS: ${os}, Device: ${device}`;
    }

    // Determine actor information from request or passed user
    let actor = null;
    let actorModel = null;

    // First check if user was explicitly passed
    if (user) {
      actor = user._id || user.id;
      // Determine if it's User or Admin based on the object structure
      if (user.role === 'superadmin' || user.role === 'admin') {
        actorModel = 'Admin';
      } else {
        actorModel = 'User';
      }
    }
    // Otherwise check request object
    else if (req) {
      if (req.user) {
        actor = req.user._id || req.user.id;
        actorModel = 'User';
      } else if (req.admin) {
        actor = req.admin._id || req.admin.id;
        actorModel = 'Admin';
      }
    }

    const log = new Log({
      email: req ? req.body.email : null,
      context,
      message,
      type,
      level,
      actor,
      actorModel,
    });

    await log.save();
  } catch (error) {
    console.error("Error saving log:", error);
  }
};

module.exports = { saveLogInfo };
