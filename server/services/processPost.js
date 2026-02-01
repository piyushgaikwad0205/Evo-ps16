const { saveLogInfo } = require("../middlewares/logger/logInfo");
const createCategoryFilterService = require("./categoryFilterService");
const Config = require("../models/config.model");

/**
 * @param next - confirmPost (/middlewares/post/confirmPost.js)
 */
const processPost = async (req, res, next) => {
  const { content, communityName } = req.body;

  try {
    const { serviceProvider, timeout } = await getSystemPreferences();

    // If category filtering is disabled, skip it
    if (serviceProvider === "disabled") {
      req.failedDetection = false;
      return next();
    }

    // If content is empty or communityName is missing, skip category filtering
    if (!content || !communityName) {
      console.warn('Skipping category filtering: missing content or communityName');
      req.failedDetection = false;
      return next();
    }

    const categoryFilterService = createCategoryFilterService(serviceProvider);

    const categories = await categoryFilterService.getCategories(
      content,
      timeout
    );

    if (Object.keys(categories).length > 0) {
      const recommendedCommunity = Object.keys(categories)[0];

      if (recommendedCommunity !== communityName) {
        const type = "categoryMismatch";
        const info = {
          community: communityName,
          recommendedCommunity,
        };

        return res.status(403).json({ type, info });
      } else {
        req.failedDetection = false;
        next();
      }
    } else {
      req.failedDetection = true;
      next();
    }
  } catch (error) {
    // Log the error but don't block post creation
    const errorMessage = `Error processing post: ${error.message}`;
    console.error('processPost error:', errorMessage, error.stack);
    await saveLogInfo(null, errorMessage, 'processPost', "error");

    // Allow the post to proceed instead of returning 500
    req.failedDetection = false;
    next();
  }
};

const getSystemPreferences = async () => {
  try {
    const config = await Config.findOne({}, { _id: 0, __v: 0 });

    if (!config) {
      return {
        serviceProvider: "disabled",
        timeout: 10000,
      };
    }

    const {
      categoryFilteringServiceProvider: serviceProvider = "disabled",
      categoryFilteringRequestTimeout: timeout = 10000,
    } = config;

    return {
      serviceProvider,
      timeout,
    };
  } catch (error) {
    return {
      serviceProvider: "disabled",
      timeout: 10000,
    };
  }
};

module.exports = processPost;
