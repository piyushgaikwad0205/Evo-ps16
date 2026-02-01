const Survey = require("../models/survey.model");
const User = require("../models/user.model");
const { saveLogInfo } = require("../middlewares/logger/logInfo");
const nodemailer = require("nodemailer");

/**
 * Create a new survey (Admin only)
 */
const createSurvey = async (req, res) => {
  try {
    // Check if user is admin
    if (req.userRole !== "admin") {
      return res.status(403).json({
        message: "Only administrators can create surveys"
      });
    }

    const {
      title,
      description,
      questions,
      targetAudience,
      targetCriteria,
      endDate,
      isAnonymous,
      maxResponses,
      allowMultipleResponses,
      sendEmailNotification,
      tags
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required"
      });
    }

    // Validate questions format
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "At least one question is required" });
    }

    // Add order to questions if not provided
    // Add order to questions if not provided
    const processedQuestions = questions.map((q, index) => ({
      ...q,
      order: q.order || index + 1
    }));

    const userId = req.userId;
    const user = await User.findById(userId).select("collegeId");

    if (!user || (!user.collegeId && req.userRole !== 'superadmin')) {
      // Assuming superadmin might want to create global surveys, but for now enforcing college. 
      // If superadmin has no college, this might block. Let's assume strict college isolation for now.
      return res.status(403).json({ message: "You must be associated with a college to create a survey." });
    }

    const newSurvey = new Survey({
      title,
      description,
      questions: processedQuestions,
      createdBy: req.userId,
      collegeId: user.collegeId,
      targetAudience,
      targetCriteria: targetCriteria || {},
      endDate: endDate ? new Date(endDate) : undefined, // Let the schema handle the default
      isAnonymous: isAnonymous === true,
      maxResponses: maxResponses ? parseInt(maxResponses) : null,
      allowMultipleResponses: allowMultipleResponses === true,
      sendEmailNotification: sendEmailNotification !== false,
      tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map(t => t.trim()) : [],
      status: "active"  // Change default status to "active" so surveys are visible to users immediately
    });

    await newSurvey.save();

    await saveLogInfo(
      req,
      `New survey created by admin: ${title}`,
      "survey_creation",
      "info"
    );

    res.status(201).json({
      message: "Survey created successfully",
      survey: newSurvey
    });
  } catch (error) {
    console.error("Error creating survey:", error);
    res.status(500).json({ message: "Error creating survey" });
  }
};

/**
 * Get all surveys with filters
 */
const getSurveys = async (req, res) => {
  try {
    const {
      status,
      targetAudience,
      createdBy,
      page = 1,
      limit = 10,
      includeResponses = false
    } = req.query;

    // Build filter
    const filter = {};

    // For non-admin users, only show active surveys
    if (req.userRole !== "admin") {
      filter.status = "active";
    } else if (status && status !== "all") {
      filter.status = status;
    }

    if (targetAudience && targetAudience !== "all") {
      filter.targetAudience = targetAudience;
    }

    if (createdBy) {
      filter.createdBy = createdBy;
    }

    const userId = req.userId;
    const user = await User.findById(userId).select("collegeId");

    if (user && user.collegeId) {
      filter.collegeId = user.collegeId;
    } else {
      // If user has no collegeId, return empty or handle based on policy. 
      // For general users, return empty.
      return res.status(200).json({ surveys: [], pagination: {} });
    }

    // For non-admin users, only show active surveys that haven't ended
    if (req.userRole !== "admin") {
      filter.status = "active";
      filter.endDate = { $gte: new Date() };
    }

    const skip = (page - 1) * limit;

    let query = Survey.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Include responses only if requested and user is admin
    if (includeResponses === "true" && req.userRole === "admin") {
      query = query.populate("responses.respondent", "name email");
    } else {
      // Exclude responses for regular users
      query = query.select("-responses");
    }

    const [surveys, total] = await Promise.all([
      query.lean(),
      Survey.countDocuments(filter)
    ]);

    // Add response count to each survey
    const surveysWithStats = surveys.map(survey => ({
      ...survey,
      responseCount: survey.responses ? survey.responses.length : 0
    }));

    res.status(200).json({
      surveys: surveysWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalSurveys: total,
        hasNext: skip + surveys.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching surveys:", error);
    res.status(500).json({ message: "Error fetching surveys" });
  }
};

/**
 * Get single survey by ID
 */
const getSurveyById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeResponses = false } = req.query;

    // First get the survey to check permissions
    const survey = await Survey.findById(id).populate("createdBy", "name email");

    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    // Check if user can access this survey
    if (survey.status !== "active" &&
      req.userRole !== "admin" &&
      survey.createdBy._id.toString() !== req.userId) {
      return res.status(403).json({ message: "Survey not accessible" });
    }

    const userId = req.userId;
    const user = await User.findById(userId).select("collegeId");

    if (!user.collegeId || (survey.collegeId && survey.collegeId.toString() !== user.collegeId.toString())) {
      return res.status(403).json({ message: "Access denied. Survey belongs to another college." });
    }

    // Always fetch with responses internally to compute flags correctly
    let internalSurvey = await Survey.findById(id)
      .populate("createdBy", "name email")
      .populate("responses.respondent", "name email graduationYear department");

    // Compute flags safely
    const hasResponded = (internalSurvey.responses || []).some(
      r => r.respondent && r.respondent._id && r.respondent._id.toString() === req.userId
    );

    const canRespond = internalSurvey.canUserRespond(req.userId);
    const responseCount = internalSurvey.responses ? internalSurvey.responses.length : 0;

    // Prepare response survey based on permissions (strip responses for regular users)
    let surveyPayload = internalSurvey.toObject();
    if (!(includeResponses === "true" && (req.userRole === "admin" || req.userId === internalSurvey.createdBy._id.toString()))) {
      delete surveyPayload.responses;
    }

    res.status(200).json({
      ...surveyPayload,
      canRespond,
      hasResponded,
      responseCount
    });
  } catch (error) {
    console.error("Error fetching survey:", error);
    res.status(500).json({ message: "Error fetching survey" });
  }
};

/**
 * Submit survey response
 */
const submitSurveyResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Answers are required" });
    }

    const survey = await Survey.findById(id);
    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    // Check if user can respond
    if (!survey.canUserRespond(req.userId)) {
      return res.status(400).json({
        message: "You cannot respond to this survey at this time"
      });
    }

    // Validate answers against questions
    const questionIds = survey.questions.map(q => q._id.toString());
    const requiredQuestions = survey.questions.filter(q => q.required);

    // Check all required questions are answered
    for (const requiredQ of requiredQuestions) {
      const answer = answers.find(a => a.questionId === requiredQ._id.toString());
      if (!answer || !answer.answer ||
        (typeof answer.answer === 'string' && answer.answer.trim() === '')) {
        return res.status(400).json({
          message: `Question "${requiredQ.questionText}" is required`
        });
      }
    }

    // Validate each answer
    for (const answer of answers) {
      const question = survey.questions.find(q => q._id.toString() === answer.questionId);
      if (!question) {
        return res.status(400).json({
          message: `Invalid question ID: ${answer.questionId}`
        });
      }

      // Validate answer format based on question type
      if (question.type === 'multiple_choice' && question.options.length > 0) {
        if (!question.options.includes(answer.answer)) {
          return res.status(400).json({
            message: `Invalid option for question: ${question.questionText}`
          });
        }
      }

      if (question.type === 'rating') {
        const rating = parseInt(answer.answer);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          return res.status(400).json({
            message: `Rating must be between 1 and 5 for question: ${question.questionText}`
          });
        }
      }
    }

    // Create response object
    const newResponse = {
      respondent: survey.isAnonymous ? null : req.userId,
      answers,
      submittedAt: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress
    };

    survey.responses.push(newResponse);
    await survey.save();

    await saveLogInfo(
      req,
      `Survey response submitted: ${survey.title}`,
      "survey_response",
      "info"
    );

    res.status(201).json({
      message: "Survey response submitted successfully",
      responseId: newResponse._id
    });
  } catch (error) {
    console.error("Error submitting survey response:", error);
    res.status(500).json({ message: "Error submitting survey response" });
  }
};

/**
 * Update survey (Admin/Creator only)
 */
const updateSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const survey = await Survey.findById(id);
    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    // Only creator or admin can update
    if (survey.createdBy.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to update this survey" });
    }

    // Don't allow updating if survey has responses and is active
    if (survey.responses.length > 0 && survey.status === "active") {
      return res.status(400).json({
        message: "Cannot update survey with existing responses. Close the survey first."
      });
    }

    // Handle tags
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(t => t.trim());
    }

    // Process questions if provided
    if (updateData.questions) {
      updateData.questions = updateData.questions.map((q, index) => ({
        ...q,
        order: q.order || index + 1
      }));
    }

    const updatedSurvey = await Survey.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate("createdBy", "name email");

    await saveLogInfo(
      req,
      `Survey updated: ${updatedSurvey.title}`,
      "survey_update",
      "info"
    );

    res.status(200).json({
      message: "Survey updated successfully",
      survey: updatedSurvey
    });
  } catch (error) {
    console.error("Error updating survey:", error);
    res.status(500).json({ message: "Error updating survey" });
  }
};

/**
 * Delete survey (Admin/Creator only)
 */
const deleteSurvey = async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findById(id);
    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    // Only creator or admin can delete
    if (survey.createdBy.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this survey" });
    }

    await Survey.findByIdAndDelete(id);

    await saveLogInfo(
      req,
      `Survey deleted: ${survey.title}`,
      "survey_deletion",
      "info"
    );

    res.status(200).json({ message: "Survey deleted successfully" });
  } catch (error) {
    console.error("Error deleting survey:", error);
    res.status(500).json({ message: "Error deleting survey" });
  }
};

/**
 * Activate/Deactivate survey (Admin/Creator only)
 */
const updateSurveyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["draft", "active", "paused", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const survey = await Survey.findById(id);
    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    // Only creator or admin can update status
    if (survey.createdBy.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to update survey status" });
    }

    survey.status = status;
    await survey.save();

    // Send email notifications if survey is activated
    if (status === "active" && survey.sendEmailNotification) {
      // This would be implemented separately with proper email queue
      // For now, just log the action
      await saveLogInfo(
        req,
        `Survey activated and notifications should be sent: ${survey.title}`,
        "survey_activation",
        "info"
      );
    }

    await saveLogInfo(
      req,
      `Survey status updated: ${survey.title} - ${status}`,
      "survey_status_update",
      "info"
    );

    res.status(200).json({
      message: `Survey ${status} successfully`,
      survey
    });
  } catch (error) {
    console.error("Error updating survey status:", error);
    res.status(500).json({ message: "Error updating survey status" });
  }
};

/**
 * Get survey analytics (Admin/Creator only)
 */
const getSurveyAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findById(id)
      .populate("responses.respondent", "graduationYear department role");

    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    // Only creator or admin can view analytics
    if (survey.createdBy.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to view survey analytics" });
    }

    // Calculate analytics
    const analytics = {
      totalResponses: survey.responses.length,
      responseRate: survey.maxResponses ?
        (survey.responses.length / survey.maxResponses * 100).toFixed(2) + '%' : 'N/A',

      demographics: {
        byGraduationYear: {},
        byDepartment: {},
        byRole: {}
      },

      questionAnalytics: survey.questions.map(question => {
        const questionResponses = survey.responses
          .map(r => r.answers.find(a => a.questionId.toString() === question._id.toString()))
          .filter(Boolean);

        const analytics = {
          questionId: question._id,
          questionText: question.questionText,
          type: question.type,
          totalResponses: questionResponses.length,
          responseRate: ((questionResponses.length / survey.responses.length) * 100).toFixed(2) + '%'
        };

        if (question.type === 'multiple_choice') {
          analytics.optionCounts = {};
          question.options.forEach(option => {
            analytics.optionCounts[option] = questionResponses
              .filter(r => r.answer === option).length;
          });
        } else if (question.type === 'rating') {
          const ratings = questionResponses.map(r => parseInt(r.answer)).filter(r => !isNaN(r));
          analytics.averageRating = ratings.length > 0 ?
            (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(2) : 0;
          analytics.ratingCounts = {};
          for (let i = 1; i <= 5; i++) {
            analytics.ratingCounts[i] = ratings.filter(r => r === i).length;
          }
        }

        return analytics;
      })
    };

    // Demographics analysis
    survey.responses.forEach(response => {
      if (response.respondent) {
        const respondent = response.respondent;

        if (respondent.graduationYear) {
          analytics.demographics.byGraduationYear[respondent.graduationYear] =
            (analytics.demographics.byGraduationYear[respondent.graduationYear] || 0) + 1;
        }

        if (respondent.department) {
          analytics.demographics.byDepartment[respondent.department] =
            (analytics.demographics.byDepartment[respondent.department] || 0) + 1;
        }

        if (respondent.role) {
          analytics.demographics.byRole[respondent.role] =
            (analytics.demographics.byRole[respondent.role] || 0) + 1;
        }
      }
    });

    res.status(200).json(analytics);
  } catch (error) {
    console.error("Error fetching survey analytics:", error);
    res.status(500).json({ message: "Error fetching survey analytics" });
  }
};

module.exports = {
  createSurvey,
  getSurveys,
  getSurveyById,
  submitSurveyResponse,
  updateSurvey,
  deleteSurvey,
  updateSurveyStatus,
  getSurveyAnalytics
};