const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const Token = require("../models/token.model");
const Post = require("../models/post.model");
const Community = require("../models/community.model");
const UserPreference = require("../models/preference.model");
const formatCreatedAt = require("../utils/timeConverter");
const { verifyContextData, types } = require("./auth.controller");
const { saveLogInfo } = require("../middlewares/logger/logInfo");
const duration = require("dayjs/plugin/duration");
const dayjs = require("dayjs");
const { constructImageUrl } = require("../utils/imageUtils");
dayjs.extend(duration);

const LOG_TYPE = {
  SIGN_IN: "sign in",
  LOGOUT: "logout",
};

const LEVEL = {
  INFO: "info",
  ERROR: "error",
  WARN: "warn",
};

const MESSAGE = {
  SIGN_IN_ATTEMPT: "User attempting to sign in",
  SIGN_IN_ERROR: "Error occurred while signing in user: ",
  INCORRECT_EMAIL: "Incorrect email",
  INCORRECT_PASSWORD: "Incorrect password",
  DEVICE_BLOCKED: "Sign in attempt from blocked device",
  CONTEXT_DATA_VERIFY_ERROR: "Context data verification failed",
  MULTIPLE_ATTEMPT_WITHOUT_VERIFY:
    "Multiple sign in attempts detected without verifying identity.",
  LOGOUT_SUCCESS: "User has logged out successfully",
};

const signin = async (req, res, next) => {
  saveLogInfo(
    req,
    "User attempting to sign in",
    LOG_TYPE.SIGN_IN,
    LEVEL.INFO
  ).catch(console.error);

  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({
      email: { $eq: String(email).trim().toLowerCase() },
    });
    if (!existingUser) {
      saveLogInfo(

        req,
        MESSAGE.INCORRECT_PASSWORD,
        LOG_TYPE.SIGN_IN,
        LEVEL.ERROR
      ).catch(console.error);

      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isContextAuthEnabled = await UserPreference.findOne({
      user: existingUser._id,
      enableContextBasedAuth: true,
    });

    if (isContextAuthEnabled) {
      const contextDataResult = await verifyContextData(req, existingUser);

      if (contextDataResult === types.BLOCKED) {
        saveLogInfo(
          req,
          MESSAGE.DEVICE_BLOCKED,
          LOG_TYPE.SIGN_IN,
          LEVEL.WARN
        ).catch(console.error);

        return res.status(401).json({
          message:
            "You've been blocked due to suspicious login activity. Please contact support for assistance.",
        });
      }

      if (
        contextDataResult === types.NO_CONTEXT_DATA ||
        contextDataResult === types.ERROR
      ) {
        saveLogInfo(
          req,
          MESSAGE.CONTEXT_DATA_VERIFY_ERROR,
          LOG_TYPE.SIGN_IN,
          LEVEL.ERROR
        ).catch(console.error);

        return res.status(500).json({
          message: "Error occurred while verifying context data",
        });
      }

      if (contextDataResult === types.SUSPICIOUS) {
        saveLogInfo(
          req,
          MESSAGE.MULTIPLE_ATTEMPT_WITHOUT_VERIFY,
          LOG_TYPE.SIGN_IN,
          LEVEL.WARN
        ).catch(console.error);

        return res.status(401).json({
          message: `You've temporarily been blocked due to suspicious login activity. We have already sent a verification email to your registered email address. 
          Please follow the instructions in the email to verify your identity and gain access to your account.

          Please note that repeated attempts to log in without verifying your identity will result in this device being permanently blocked from accessing your account.
          
          Thank you for your cooperation`,
        });
      }

      if (contextDataResult.mismatchedProps) {
        const mismatchedProps = contextDataResult.mismatchedProps;
        const currentContextData = contextDataResult.currentContextData;
        if (
          mismatchedProps.some((prop) =>
            [
              "ip",
              "country",
              "city",
              "device",
              "deviceType",
              "os",
              "platform",
              "browser",
            ].includes(prop)
          )
        ) {
          req.mismatchedProps = mismatchedProps;
          req.currentContextData = currentContextData;
          req.user = existingUser;
          return next();
        }
      }
    }

    const payload = {
      id: existingUser._id,
      email: existingUser.email,
    };

    const accessToken = jwt.sign(
      payload,
      process.env.SECRET || "dev_secret_change_me",
      {
        expiresIn: "6h",
      }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_SECRET || "dev_refresh_secret_change_me",
      {
        expiresIn: "7d",
      }
    );

    const newRefreshToken = new Token({
      user: existingUser._id,
      refreshToken,
      accessToken,
    });
    await newRefreshToken.save();

    // Update login streak
    try {
      const today = new Date();
      const last = existingUser.lastLoginAt ? new Date(existingUser.lastLoginAt) : null;

      if (!last) {
        // First time login
        existingUser.loginStreakCount = 1;
        existingUser.lastLoginAt = today;
      } else {
        const lastLoginTime = new Date(last);

        // Check if it's a new calendar day
        const lastLoginDate = lastLoginTime.toDateString();
        const todayDate = today.toDateString();

        if (lastLoginDate !== todayDate) {
          // It's a new day, check if it's consecutive
          const timeDiff = today.getTime() - lastLoginTime.getTime();
          const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

          if (daysDiff === 1) {
            // Consecutive day - increment streak
            existingUser.loginStreakCount = (existingUser.loginStreakCount || 0) + 1;
            console.log('Streak incremented to:', existingUser.loginStreakCount);
          } else if (daysDiff > 1) {
            // Gap of more than 1 day - reset streak
            existingUser.loginStreakCount = 1;
            console.log('Streak reset to 1 (gap of', daysDiff, 'days)');
          }
          // If daysDiff === 0, it's the same day, don't update

          existingUser.lastLoginAt = today;
        }
        // If same day, don't update anything
      }

      await existingUser.save();
      console.log('Final streak count:', existingUser.loginStreakCount);
    } catch (err) {
      console.error('Login streak update error:', err);
    }

    res.status(200).json({
      accessToken,
      refreshToken,
      accessTokenUpdatedAt: new Date().toLocaleString(),
      user: {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        avatar: existingUser.avatar,
        uploadPermission: existingUser.uploadPermission,
        loginStreakCount: existingUser.loginStreakCount,
        blockedUsers: existingUser.blockedUsers || [],
      },
    });
  } catch (err) {
    console.error("Sign in error:", err); // Added for debugging
    saveLogInfo(
      req,
      MESSAGE.SIGN_IN_ERROR + err.message,
      LOG_TYPE.SIGN_IN,
      LEVEL.ERROR
    ).catch(console.error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

/**
 * Retrieves a user's profile information, including their total number of posts,
 * the number of communities they are in, the number of communities they have posted in,
 * and their duration on the platform.

 * @param req - Express request object
 * @param res - Express response object
 * @param {Function} next - Express next function
 */
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();

    const totalPosts = await Post.countDocuments({ user: user._id });

    const communities = await Community.find({ members: user._id });
    const totalCommunities = communities.length;

    const postCommunities = await Post.find({ user: user._id }).distinct(
      "community"
    );
    const totalPostCommunities = postCommunities.length;

    const createdAt = dayjs(user.createdAt);
    const now = dayjs();
    const durationObj = dayjs.duration(now.diff(createdAt));
    const durationMinutes = durationObj.asMinutes();
    const durationHours = durationObj.asHours();
    const durationDays = durationObj.asDays();

    user.totalPosts = totalPosts;
    user.totalCommunities = totalCommunities;
    user.totalPostCommunities = totalPostCommunities;

    // Add total alumni connections count
    if (user.role === 'alumni') {
      const Connection = require("../models/connection.model");
      const connectionCount = await Connection.countDocuments({
        $or: [{ requester: user._id }, { recipient: user._id }],
        status: "accepted",
      });
      user.totalConnections = connectionCount;
    } else {
      // Also helpful for students to see how many connections they have
      const Connection = require("../models/connection.model");
      const connectionCount = await Connection.countDocuments({
        $or: [{ requester: user._id }, { recipient: user._id }],
        status: "accepted",
      });
      user.totalConnections = connectionCount;
    }

    user.duration = "";

    if (durationMinutes < 60) {
      user.duration = `${Math.floor(durationMinutes)} minutes`;
    } else if (durationHours < 24) {
      user.duration = `${Math.floor(durationHours)} hours`;
    } else if (durationDays < 365) {
      user.duration = `${Math.floor(durationDays)} days`;
    } else {
      const durationYears = Math.floor(durationDays / 365);
      user.duration = `${durationYears} years`;
    }
    const posts = await Post.find({ user: user._id })
      .populate("community", "name members")
      .limit(20)
      .lean()
      .sort({ createdAt: -1 });

    user.posts = posts.map((post) => ({
      ...post,
      isMember: post.community?.members
        .map((member) => member.toString())
        .includes(user._id.toString()),
      createdAt: formatCreatedAt(post.createdAt),
    }));

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * Adds a new user to the database with the given name, email, password, and avatar.
 *
 * @description If the email domain of the user's email is "mod.socialecho.com", the user will be
 * assigned the role of "moderator" by default, but not necessarily as a moderator of any community.
 * Otherwise, the user will be assigned the role of "general" user.
 *
 * @param {Object} req.file - The file attached to the request object (for avatar).
 * @param {string} req.body.isConsentGiven - Indicates whether the user has given consent to enable context based auth.
 * @param {Function} next - The next middleware function to call if consent is given by the user to enable context based auth.
 */
const addUser = async (req, res, next) => {
  console.log("=== SIGNUP REQUEST RECEIVED ===");
  console.log("Body:", req.body);
  console.log("File:", req.file);
  console.log("================================");
  
  let newUser;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  /**
   * @type {boolean} isConsentGiven
   */
  const isConsentGiven = req.body.isConsentGiven ? JSON.parse(req.body.isConsentGiven) : false;

  const defaultAvatar =
    "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg";

  // Use Cloudinary URL if available, otherwise fallback to local or default
  let fileUrl = defaultAvatar;
  if (req.avatarUrl) {
    // Cloudinary URL from avatarUpload middleware
    fileUrl = req.avatarUrl;
    console.log('Using Cloudinary avatar URL:', fileUrl);
  } else if (req.file?.filename) {
    // Fallback to local storage
    fileUrl = constructImageUrl(req, req.file.filename, "userAvatars");
    console.log('Using local avatar URL:', fileUrl);
  }

  const emailDomain = req.body.email.split("@")[1];

  // Strict College Verification: Check for .edu, .ac.in, or specific allowed domains
  // Allows mod.socialecho.com for moderators
  const allowedCollegeDomains = [".edu", ".ac.in", ".edu.in", ".edu.bd", ".edu.pk", ".edu.ng", ".edu.ph", ".edu.vn"];
  const isCollegeDomain = allowedCollegeDomains.some(domain => emailDomain.endsWith(domain));
  const isModeratorDomain = emailDomain === "mod.socialecho.com";

  if (!isCollegeDomain && !isModeratorDomain) {
    return res.status(403).json({
      message: "Access restricted: Please use a verified college email address (e.g., .edu, .ac.in) to register."
    });
  }

  const role = isModeratorDomain ? "moderator" : "general";

  let college;
  if (isCollegeDomain) {
    const College = require("../models/college.model");
    college = await College.findOne({ name: emailDomain });
    if (!college) {
      college = await College.create({
        name: emailDomain,
        code: emailDomain.toUpperCase().replace(/\./g, "-"),
        status: "approved"
      });
    }
  }

  newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    role: role,
    collegeId: college ? college._id : undefined,
    avatar: fileUrl,
    mobile: req.body.mobile || undefined,
    btid: req.body.btid,
    // Academic Details
    dateOfBirth: req.body.dateOfBirth || undefined,
    gender: req.body.gender || undefined,
    department: req.body.department || undefined,
    course: req.body.course || undefined,
    yearOfStudy: req.body.yearOfStudy || undefined,
    academicClass: req.body.academicClass || undefined,
    semester: req.body.semester || undefined,
    section: req.body.section || undefined,
    enrollmentNumber: req.body.enrollmentNumber || undefined,
    rollNumber: req.body.rollNumber || undefined,
    branchSpecification: req.body.branchSpecification || undefined,
    admissionType: req.body.admissionType || 'Regular',
    bloodGroup: req.body.bloodGroup || undefined,
    collegeId: req.body.collegeId || undefined,
  });

  try {
    await newUser.save();
    console.log("✓ User saved successfully:", newUser.email);
    
    if (newUser.isNew) {
      throw new Error("Failed to add user");
    }

    if (isConsentGiven === false) {
      res.status(201).json({
        message: "User added successfully",
      });
    } else {
      next();
    }
  } catch (err) {
    console.error("=== ADD USER ERROR ===");
    console.error("Error:", err);
    console.error("Error message:", err.message);
    if (err.errors) {
      console.error("Validation errors:", err.errors);
    }
    console.error("======================");
    
    res.status(400).json({
      message: "Failed to add user",
      error: err.message
    });
  }
};

const logout = async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1] ?? null;
    if (accessToken) {
      await Token.deleteOne({ accessToken });
      saveLogInfo(
        null,
        MESSAGE.LOGOUT_SUCCESS,
        LOG_TYPE.LOGOUT,
        LEVEL.INFO
      ).catch(console.error);
    }
    res.status(200).json({
      message: "Logout successful",
    });
  } catch (err) {
    saveLogInfo(null, err.message, LOG_TYPE.LOGOUT, LEVEL.ERROR).catch(console.error);
    res.status(500).json({
      message: "Internal server error. Please try again later.",
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const existingToken = await Token.findOne({
      refreshToken: { $eq: refreshToken },
    });
    if (!existingToken) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }
    const existingUser = await User.findById(existingToken.user);
    if (!existingUser) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const refreshTokenExpiresAt =
      jwt.decode(existingToken.refreshToken).exp * 1000;
    if (Date.now() >= refreshTokenExpiresAt) {
      await existingToken.deleteOne();
      return res.status(401).json({
        message: "Expired refresh token",
      });
    }

    const payload = {
      id: existingUser._id,
      email: existingUser.email,
    };

    const accessToken = jwt.sign(
      payload,
      process.env.SECRET || "dev_secret_change_me",
      {
        expiresIn: "6h",
      }
    );

    res.status(200).json({
      accessToken,
      refreshToken: existingToken.refreshToken,
      accessTokenUpdatedAt: new Date().toLocaleString(),
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * @route GET /users/moderator
 */
const getModProfile = async (req, res) => {
  try {
    const moderator = await User.findById(req.userId);
    if (!moderator) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const moderatorInfo = {
      ...moderator._doc,
    };
    delete moderatorInfo.password;
    moderatorInfo.createdAt = moderatorInfo.createdAt.toLocaleString();

    res.status(200).json({
      moderatorInfo,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * @route PUT /users/:id
 */
const updateInfo = async (req, res) => {
  try {
    console.log('Profile update request for user:', req.userId);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const user = await User.findById(req.userId);
    if (!user) {
      console.log('User not found:', req.userId);
      return res.status(404).json({
        message: "User not found",
      });
    }

    const { location, interests, bio, username } = req.body;

    // Update fields if provided
    if (typeof location !== 'undefined') {
      user.location = location;
      console.log('Updated location:', location);
    }
    if (typeof interests !== 'undefined') {
      user.interests = interests;
      console.log('Updated interests:', interests);
    }
    if (typeof bio !== 'undefined') {
      user.bio = bio;
      console.log('Updated bio:', bio);
    }

    // Allow updating college assignment
    if (req.body.collegeId) {
      user.collegeId = req.body.collegeId;
      console.log('Updated collegeId:', req.body.collegeId);
    }

    // Optional username update with validation
    if (typeof username === 'string') {
      const trimmed = String(username).trim().toLowerCase();
      if (trimmed) {
        if (!/^[a-zA-Z0-9_\.]{3,30}$/.test(trimmed)) {
          return res.status(400).json({ message: "Invalid username format" });
        }
        const exists = await User.findOne({ username: trimmed, _id: { $ne: user._id } }).lean();
        if (exists) {
          return res.status(409).json({ message: "Username already taken" });
        }
        user.username = trimmed;
        console.log('Updated username:', trimmed);
      } else {
        user.username = undefined;
        console.log('Cleared username');
      }
    }

    // Handle avatar file if provided
    if (req.avatarUrl) {
      // Cloudinary URL is set by the avatarUpload middleware
      user.avatar = req.avatarUrl;
      console.log('Updated avatar URL (Cloudinary):', req.avatarUrl);
    } else if (req.file && req.file.filename) {
      // Fallback for local storage (if Cloudinary is not configured)
      const avatarUrl = constructImageUrl(req, req.file.filename, "userAvatars");
      user.avatar = avatarUrl;
      console.log('Updated avatar URL (local):', avatarUrl);
    }

    console.log('User object before save:', {
      location: user.location,
      interests: user.interests,
      bio: user.bio,
      username: user.username,
      avatar: user.avatar
    });

    // Save the user
    await user.save();
    console.log('User saved successfully');

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      username: user.username,
      location: user.location,
      interests: user.interests,
      bio: user.bio,
    });

  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({
      message: "Error updating user info",
    });
  }
};

/**
 * Search users by name or email for autocomplete
 * @route GET /user/search?q=query
 */
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "Search query must be at least 2 characters" });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } }
      ]
    })
      .select('_id name email username avatar')
      .limit(10)
      .lean();

    res.status(200).json(users);
  } catch (err) {
    console.error('User search error:', err);
    res.status(500).json({ message: "Error searching users" });
  }
};

const getPublicUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("name email username avatar")
      .limit(10)
      .lean();
    res.status(200).json(users);
  } catch (err) {
    console.error("Get public users error:", err);
    res.status(500).json({ message: "Error fetching public users" });
  }
};

const getFollowers = async (req, res) => {
  try {
    const userId = req.userId || (req.user && req.user._id);
    if (!userId) {
      console.error("getFollowers: User ID not found in request");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).populate('followers', 'name username avatar role email');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.followers || []);
  } catch (err) {
    console.error("Get followers error:", err);
    res.status(500).json({ message: "Error fetching followers" });
  }
};

const getFollowing = async (req, res) => {
  try {
    const userId = req.userId || (req.user && req.user._id);
    if (!userId) {
      console.error("getFollowing: User ID not found in request");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).populate('following', 'name username avatar role email');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.following || []);
  } catch (err) {
    console.error("Get following error:", err);
    res.status(500).json({ message: "Error fetching following" });
  }
};

module.exports = {
  addUser,
  signin,
  logout,
  refreshToken,
  getModProfile,
  getUser,
  updateInfo,
  searchUsers,
  getPublicUsers,
  getFollowers,
  getFollowing,
};
