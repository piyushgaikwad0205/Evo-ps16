const Log = require("../models/log.model");
const dayjs = require("dayjs");
const formatCreatedAt = require("../utils/timeConverter");
const Admin = require("../models/admin.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AdminToken = require("../models/token.admin.model");
const Config = require("../models/config.model");
const Community = require("../models/community.model");
const User = require("../models/user.model");
const { createSurvey } = require("./survey.controller");
const Club = require("../models/club.model");
const nodemailer = require("nodemailer");
const AlumniRequest = require("../models/alumniRequest.model");
const { alumniApprovalHTML } = require("../utils/emailTemplates");
const crypto = require("crypto");

/**
 * @route GET /admin/logs
 */
const retrieveLogInfo = async (req, res) => {
  try {
    // Only sign in logs contain encrypted context data & email
    const [signInLogs, generalLogs] = await Promise.all([
      Log.find({ type: "sign in" }).sort({ createdAt: -1 }).limit(50),

      Log.find({ type: { $ne: "sign in" } })
        .sort({ createdAt: -1 })
        .limit(50),
    ]);

    const formattedSignInLogs = [];
    for (let i = 0; i < signInLogs.length; i++) {
      const { _id, email, context, message, type, level, timestamp } =
        signInLogs[i];
      const contextData = context.split(",");
      const formattedContext = {};

      for (let j = 0; j < contextData.length; j++) {
        const [key, value] = contextData[j].split(":");
        if (key === "IP") {
          formattedContext["IP Address"] = contextData[j]
            .split(":")
            .slice(1)
            .join(":");
        } else {
          formattedContext[key.trim()] = value.trim();
        }
      }

      formattedSignInLogs.push({
        _id,
        email,
        contextData: formattedContext,
        message,
        type,
        level,
        timestamp,
      });
    }
    const formattedGeneralLogs = generalLogs.map((log) => ({
      _id: log._id,
      email: log.email,
      message: log.message,
      type: log.type,
      level: log.level,
      timestamp: log.timestamp,
    }));

    const formattedLogs = [...formattedSignInLogs, ...formattedGeneralLogs]
      .map((log) => ({
        ...log,
        formattedTimestamp: formatCreatedAt(log.timestamp),
        relativeTimestamp: dayjs(log.timestamp).fromNow(),
      }))
      .sort((a, b) => b.timestamp - a.timestamp);

    res.status(200).json(formattedLogs);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @route DELETE /admin/logs
 */
const deleteLogInfo = async (req, res) => {
  try {
    await Log.deleteMany({});
    res.status(200).json({ message: "All logs deleted!" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

/**
 * @route POST /admin/signin
 */
const signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await Admin.findOne({
      username,
    }).populate("college", "name code logo").lean();

    if (!existingUser) {
      return res.status(404).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    const payload = {
      id: existingUser._id,
      username: existingUser.username,
    };

    const accessToken = jwt.sign(
      payload,
      process.env.SECRET || "dev_secret_change_me",
      {
        expiresIn: "6h",
      }
    );

    const newAdminToken = new AdminToken({
      user: existingUser._id,
      accessToken,
    });

    await newAdminToken.save();

    res.status(200).json({
      accessToken,
      accessTokenUpdatedAt: new Date().toLocaleString(),
      user: {
        _id: existingUser._id,
        username: existingUser.username,
        role: existingUser.role,
        college: existingUser.college,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

/**
 * @route GET /admin/preferences
 */
const retrieveServicePreference = async (req, res) => {
  try {
    const config = await Config.findOne({});

    if (!config) {
      const newConfig = new Config();
      await newConfig.save();
      return res.status(200).json(newConfig);
    }

    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving system preferences" });
  }
};

/**
 * @route PUT /admin/preferences
 */
const updateServicePreference = async (req, res) => {
  try {
    const {
      usePerspectiveAPI,
      categoryFilteringServiceProvider,
      categoryFilteringRequestTimeout,
    } = req.body;

    const config = await Config.findOneAndUpdate(
      {},
      {
        usePerspectiveAPI,
        categoryFilteringServiceProvider,
        categoryFilteringRequestTimeout,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: "Error updating system preferences" });
  }
};

const getCommunities = async (req, res) => {
  try {
    const communities = await Community.aggregate([
      {
        $project: {
          name: 1,
          banner: 1,
          description: 1,
          collegeId: 1,
          memberCount: { $size: { $ifNull: ["$members", []] } },
          moderatorCount: { $size: { $ifNull: ["$moderators", []] } },
        },
      },
      { $sort: { name: 1 } }
    ]);
    res.status(200).json(communities);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving communities" });
  }
};

const createCommunityAdmin = async (req, res) => {
  try {
    const { name, description = "", banner = "", collegeId } = req.body || {};

    // Global communities don't have collegeId
    // if (!collegeId) { ... } Removed per request

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Community name is required" });
    }
    const existing = await Community.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "Community already exists" });
    }
    const created = await Community.create({ name: name.trim(), description, banner, collegeId });
    return res.status(201).json(created);
  } catch (error) {
    console.error("Error creating community:", error);
    return res.status(500).json({ message: "Error creating community" });
  }
};

const deleteCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const existing = await Community.findById(communityId);
    if (!existing) return res.status(404).json({ message: "Community not found" });
    await Community.findByIdAndDelete(communityId);
    res.status(200).json({ message: "Community deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting community" });
  }
};

const getCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    // Fetch community details without the heavy members array
    const community = await Community.findById(communityId)
      .select("-members")
      .populate("moderators", "_id name email")
      .lean();

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Get counts efficiently
    const counts = await Community.aggregate([
      { $match: { _id: community._id } },
      { $project: { memberCount: { $size: { $ifNull: ["$members", []] } } } }
    ]);

    const memberCount = counts[0]?.memberCount || 0;
    const moderatorCount = community.moderators?.length || 0;

    const formattedCommunity = {
      ...community,
      memberCount,
      moderatorCount,
    };
    res.status(200).json(formattedCommunity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving community" });
  }
};

const getModerators = async (req, res) => {
  try {
    const moderators = await User.find({ role: "moderator" }).select(
      "_id name email"
    );
    res.status(200).json(moderators);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving moderators" });
  }
};
const addModerator = async (req, res) => {
  try {
    const { communityId, moderatorId } = req.query;
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    const existingModerator = community.moderators.find(
      (mod) => mod.toString() === moderatorId
    );
    if (existingModerator) {
      return res.status(400).json({ message: "Already a moderator" });
    }
    community.moderators.push(moderatorId);
    community.members.push(moderatorId);
    await community.save();
    res.status(200).json({ message: "Moderator added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error adding moderator" });
  }
};

const removeModerator = async (req, res) => {
  try {
    const { communityId, moderatorId } = req.query;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    const existingModerator = community.moderators.find(
      (mod) => mod.toString() === moderatorId
    );
    if (!existingModerator) {
      return res.status(400).json({ message: "Not a moderator" });
    }
    community.moderators = community.moderators.filter(
      (mod) => mod.toString() !== moderatorId
    );
    community.members = community.members.filter(
      (mod) => mod.toString() !== moderatorId
    );

    await community.save();
    res.status(200).json({ message: "Moderator removed" });
  } catch (error) {
    res.status(500).json({ message: "Error removing moderator" });
  }
};


/**
 * @route GET /admin/alumni
 * Get all alumni accounts
 */
const getAllAlumni = async (req, res) => {
  try {
    const query = { role: "alumni" };
    if (req.collegeId) {
      query.collegeId = req.collegeId;
    }

    const alumni = await User.find(query)
      .select("_id name email department graduationYear avatar uploadPermission")
      .sort({ createdAt: -1 });

    res.status(200).json(alumni);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving alumni accounts" });
  }
};

/**
 * @route PUT /admin/alumni/:id/upload-permission
 * Grant or revoke upload permission for an alumni
 */
const updateUploadPermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { uploadPermission } = req.body;

    const alumni = await User.findById(id);
    if (!alumni || alumni.role !== "alumni") {
      return res.status(404).json({ message: "Alumni not found" });
    }

    alumni.uploadPermission = uploadPermission;
    await alumni.save();

    res.status(200).json({
      message: `Upload permission ${uploadPermission ? "granted" : "revoked"} successfully`,
      uploadPermission: alumni.uploadPermission
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating upload permission" });
  }
};

const createAlumni = async (req, res) => {
  try {
    const {
      name, email, password, department = "", graduationYear = null, avatar = "",
      currentEmployer = "", position = "", industry = "", experience = "",
      linkedinUrl = "", githubUrl = "", skills = "", bio = "", location = "", interests = "",
      uploadPermission = false, requestId = null
    } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const hashed = await bcrypt.hash(password, 12);

    // Process skills if it's a string
    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
        ? skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      avatar,
      role: "alumni",
      department,
      graduationYear,
      currentEmployer,
      position,
      industry,
      experience,
      linkedinUrl,
      githubUrl,
      skills: skillsArray,
      bio,
      location,
      interests,
      uploadPermission: !!uploadPermission,
      isEmailVerified: true,
      alumniVerificationStatus: "verified",
      collegeId: req.collegeId || null,
    });

    // If this is tied to a pending request, mark it approved
    if (requestId) {
      await AlumniRequest.findByIdAndUpdate(requestId, { status: "approved", processedAt: new Date(), processedBy: req.adminId });
    }

    // Send credentials email
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
      });
      await transporter.sendMail({
        from: `Campus Connects <${process.env.EMAIL}>`,
        to: user.email,
        subject: "Your Alumni Account Credentials",
        html: alumniApprovalHTML(user.name, user.email, password),
      });
    } catch (mailErr) {
      console.error("Failed to send alumni approval email:", mailErr);
    }

    return res.status(201).json({ message: "Alumni created", user: { _id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    return res.status(500).json({ message: "Error creating alumni" });
  }
};

const deleteAlumni = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user || user.role !== "alumni") {
      return res.status(404).json({ message: "Alumni not found" });
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Alumni account deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting alumni" });
  }
};

/**
 * @route GET /admin/surveys
 * Get all surveys for admin management
 */
const getAllSurveys = async (req, res) => {
  try {
    const Survey = require("../models/survey.model");
    const surveys = await Survey.find({})
      .select("_id title description status targetAudience endDate responses")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    // Add response count to each survey
    const surveysWithStats = surveys.map(survey => ({
      ...survey.toObject(),
      responseCount: survey.responses ? survey.responses.length : 0
    }));

    res.status(200).json(surveysWithStats);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving surveys" });
  }
};

/**
 * @route PUT /admin/surveys/:id/status
 * Update survey status
 */
const updateSurveyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["draft", "active", "paused", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const Survey = require("../models/survey.model");
    const survey = await Survey.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    res.status(200).json({
      message: `Survey ${status} successfully`,
      survey
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating survey status" });
  }
};

// Wrapper function for creating surveys as admin
const createSurveyAsAdmin = async (req, res) => {
  // Set admin role and user ID for the survey controller
  req.userRole = "admin";
  req.userId = req.adminId; // This should be set by the adminAuth middleware

  // Call the survey controller's createSurvey function
  return await createSurvey(req, res);
};

const listAlumniRequests = async (req, res) => {
  try {
    const status = req.query.status || "pending";

    // Filter by college if restricted
    const query = { status };
    if (req.collegeId) {
      query.collegeId = req.collegeId;
    }

    const requests = await AlumniRequest.find(query).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving alumni requests" });
  }
};

const rejectAlumniRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await AlumniRequest.findById(id);
    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Pending request not found" });
    }
    request.status = "rejected";
    request.processedAt = new Date();
    request.processedBy = req.adminId;
    await request.save();
    return res.status(200).json({ message: "Request rejected" });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting request" });
  }
};

const approveAlumniRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await AlumniRequest.findById(id);
    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Pending request not found" });
    }

    // Generate a strong temporary password
    const tempPassword = crypto.randomBytes(8).toString("base64").replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);

    // Create alumni account
    const hashed = await bcrypt.hash(tempPassword, 12);
    const user = await User.create({
      name: request.name,
      email: String(request.email).trim().toLowerCase(),
      password: hashed,
      role: "alumni",
      avatar: request.avatar || "",
      department: request.department || "",
      graduationYear: request.graduationYear || null,
      currentEmployer: request.currentEmployer || "",
      position: request.position || "",
      industry: request.industry || "",
      experience: request.experience || "",
      linkedinUrl: request.linkedinUrl || "",
      githubUrl: request.githubUrl || "",
      skills: request.skills || [],
      bio: request.bio || "",
      location: request.location || "",
      interests: request.interests || "",
      isEmailVerified: true,
      alumniVerificationStatus: "verified",
      collegeId: request.collegeId || null,
    });

    // Mark request approved
    request.status = "approved";
    request.processedAt = new Date();
    request.processedBy = req.adminId;
    await request.save();

    // Email the credentials
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
      });
      await transporter.sendMail({
        from: `Campus Connects <${process.env.EMAIL}>`,
        to: user.email,
        subject: "Alumni Account Approved – Your Credentials",
        html: alumniApprovalHTML(user.name, user.email, tempPassword),
      });
    } catch (mailErr) {
      console.error("Failed to send alumni approval email:", mailErr);
    }

    return res.status(200).json({ message: "Request approved and account created", user: { _id: user._id, email: user.email } });
  } catch (error) {
    return res.status(500).json({ message: "Error approving request" });
  }
};

module.exports = {
  retrieveServicePreference,
  updateServicePreference,
  retrieveLogInfo,
  deleteLogInfo,
  signin,
  getCommunities,
  getCommunity,
  deleteCommunity,
  createCommunityAdmin,
  addModerator,
  removeModerator,
  getModerators,
  getAllAlumni,
  updateUploadPermission,
  deleteAlumni,
  createAlumni,
  getAllSurveys,
  updateSurveyStatus,
  createSurvey: createSurveyAsAdmin,
  listAlumniRequests,
  rejectAlumniRequest,
  approveAlumniRequest,
};
