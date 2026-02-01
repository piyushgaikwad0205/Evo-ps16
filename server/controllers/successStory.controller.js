const SuccessStory = require("../models/successStory.model");
const User = require("../models/user.model");
const { saveLogInfo } = require("../middlewares/logger/logInfo");

/**
 * Create a new success story (Alumni only)
 */
const createSuccessStory = async (req, res) => {
  try {
    // Check if user is alumni
    if (req.userRole !== "alumni") {
      return res.status(403).json({ 
        message: "Only alumni can submit success stories" 
      });
    }

    const {
      title,
      description,
      category,
      tags,
      companyName,
      achievementYear
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ 
        message: "Title and description are required" 
      });
    }

    // Handle media uploads
    const media = req.files ? req.files.map(file => 
      `${req.protocol}://${req.get("host")}/assets/userFiles/${file.filename}`
    ) : [];

    const newStory = new SuccessStory({
      title,
      description,
      author: req.userId,
      category,
      media,
      tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map(t => t.trim()) : [],
      companyName,
      achievementYear: achievementYear ? parseInt(achievementYear) : null,
      status: "approved" // Auto-approve alumni submissions
    });

    await newStory.save();

    await saveLogInfo(
      req,
      `New success story submitted by alumni: ${title}`,
      "success_story_creation",
      "info"
    );

    res.status(201).json({
      message: "Success story published successfully",
      story: newStory
    });
  } catch (error) {
    console.error("Error creating success story:", error);
    res.status(500).json({ message: "Error creating success story" });
  }
};

/**
 * Get all approved success stories with pagination (Public)
 */
const getSuccessStories = async (req, res) => {
  try {
    const {
      category,
      featured,
      author,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    // Build filter object - only show approved stories to public
    const filter = { status: "approved" };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (featured === "true") {
      filter.featured = true;
    }

    if (author) {
      filter.author = author;
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { companyName: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [stories, total] = await Promise.all([
      SuccessStory.find(filter)
        .populate("author", "name avatar graduationYear department currentEmployer position")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      SuccessStory.countDocuments(filter)
    ]);

    res.status(200).json({
      stories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalStories: total,
        hasNext: skip + stories.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching success stories:", error);
    res.status(500).json({ message: "Error fetching success stories" });
  }
};

/**
 * Get pending success stories for admin moderation
 */
const getPendingStories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10
    } = req.query;

    const skip = (page - 1) * limit;

    const [stories, total] = await Promise.all([
      SuccessStory.find({ status: "pending" })
        .populate("author", "name avatar graduationYear department currentEmployer position email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      SuccessStory.countDocuments({ status: "pending" })
    ]);

    res.status(200).json({
      stories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalStories: total,
        hasNext: skip + stories.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching pending stories:", error);
    res.status(500).json({ message: "Error fetching pending stories" });
  }
};

/**
 * Get a single success story by ID
 */
const getSuccessStoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const story = await SuccessStory.findById(id)
      .populate("author", "name avatar graduationYear department currentEmployer position")
      .populate("comments.user", "name avatar");

    if (!story) {
      return res.status(404).json({ message: "Success story not found" });
    }

    // Only show approved stories unless user is author or admin
    if (story.status !== "approved" && 
        story.author._id.toString() !== req.userId && 
        req.userRole !== "admin") {
      return res.status(403).json({ message: "Story not available" });
    }

    // Increment view count
    await SuccessStory.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.status(200).json(story);
  } catch (error) {
    console.error("Error fetching success story:", error);
    res.status(500).json({ message: "Error fetching success story" });
  }
};

/**
 * Get user's own success stories (including pending)
 */
const getUserStories = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10
    } = req.query;

    const filter = { author: req.userId };

    if (status && status !== "all") {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [stories, total] = await Promise.all([
      SuccessStory.find(filter)
        .populate("author", "name avatar graduationYear department currentEmployer position")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      SuccessStory.countDocuments(filter)
    ]);

    res.status(200).json({
      stories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalStories: total,
        hasNext: skip + stories.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching user stories:", error);
    res.status(500).json({ message: "Error fetching user stories" });
  }
};

/**
 * Update success story (author only)
 */
const updateSuccessStory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const story = await SuccessStory.findById(id);
    if (!story) {
      return res.status(404).json({ message: "Success story not found" });
    }

    // Only author can update (and admins for moderation)
    if (story.author.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to update this story" });
    }

    // Handle tags
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(t => t.trim());
    }

    // Handle new media uploads
    if (req.files && req.files.length > 0) {
      const newMedia = req.files.map(file => 
        `${req.protocol}://${req.get("host")}/assets/userFiles/${file.filename}`
      );
      updateData.media = [...(story.media || []), ...newMedia];
    }

    // If content is updated, reset to pending for re-approval
    if (updateData.title || updateData.description) {
      updateData.status = "pending";
      updateData.featured = false;
    }

    const updatedStory = await SuccessStory.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate("author", "name avatar graduationYear department currentEmployer");

    await saveLogInfo(
      req,
      `Success story updated: ${updatedStory.title}`,
      "success_story_update",
      "info"
    );

    res.status(200).json({
      message: "Success story updated successfully",
      story: updatedStory
    });
  } catch (error) {
    console.error("Error updating success story:", error);
    res.status(500).json({ message: "Error updating success story" });
  }
};

/**
 * Delete success story (author or admin)
 */
const deleteSuccessStory = async (req, res) => {
  try {
    const { id } = req.params;

    const story = await SuccessStory.findById(id);
    if (!story) {
      return res.status(404).json({ message: "Success story not found" });
    }

    // Only author or admin can delete
    if (story.author.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this story" });
    }

    await SuccessStory.findByIdAndDelete(id);

    await saveLogInfo(
      req,
      `Success story deleted: ${story.title}`,
      "success_story_deletion",
      "info"
    );

    res.status(200).json({ message: "Success story deleted successfully" });
  } catch (error) {
    console.error("Error deleting success story:", error);
    res.status(500).json({ message: "Error deleting success story" });
  }
};

/**
 * Like/Unlike success story
 */
const toggleLikeStory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const story = await SuccessStory.findById(id);
    if (!story) {
      return res.status(404).json({ message: "Success story not found" });
    }

    const isLiked = story.likes.includes(userId);

    if (isLiked) {
      story.likes.pull(userId);
    } else {
      story.likes.push(userId);
    }

    await story.save();

    // Broadcast real-time like notification to story author (if not liker)
    try {
      if (story.author && story.author.toString() !== userId) {
        const clients = req.app.get('sseClients');
        clients.broadcastToUser(String(story.author), {
          type: 'story_like',
          storyId: String(story._id),
          likerId: String(userId),
          liked: !isLiked,
          likesCount: story.likes.length,
        });
      }
    } catch {}

    res.status(200).json({
      message: isLiked ? "Story unliked" : "Story liked",
      likesCount: story.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error("Error toggling story like:", error);
    res.status(500).json({ message: "Error updating story like" });
  }
};

/**
 * Add comment to success story
 */
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const story = await SuccessStory.findById(id);
    if (!story) {
      return res.status(404).json({ message: "Success story not found" });
    }

    const newComment = {
      user: req.userId,
      text: text.trim(),
      createdAt: new Date()
    };

    story.comments.push(newComment);
    await story.save();

    // Populate the user data for the response
    await story.populate("comments.user", "name avatar");

    const addedComment = story.comments[story.comments.length - 1];

    res.status(201).json({
      message: "Comment added successfully",
      comment: addedComment
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
};

/**
 * Moderate success story (Admin only)
 */
const moderateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, featured } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const story = await SuccessStory.findByIdAndUpdate(
      id,
      { 
        status,
        featured: featured === true && status === "approved" ? true : false
      },
      { new: true }
    ).populate("author", "name email");

    if (!story) {
      return res.status(404).json({ message: "Success story not found" });
    }

    await saveLogInfo(
      req,
      `Success story moderated: ${story.title} - ${status}`,
      "success_story_moderation",
      "info"
    );

    res.status(200).json({
      message: `Story ${status} successfully`,
      story
    });
  } catch (error) {
    console.error("Error moderating story:", error);
    res.status(500).json({ message: "Error moderating story" });
  }
};

/**
 * Get stories for moderation (Admin only)
 */
const getStoriesForModeration = async (req, res) => {
  try {
    const { status = "pending", page = 1, limit = 10 } = req.query;

    const filter = { status };
    const skip = (page - 1) * limit;

    const [stories, total] = await Promise.all([
      SuccessStory.find(filter)
        .populate("author", "name email avatar graduationYear department")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      SuccessStory.countDocuments(filter)
    ]);

    res.status(200).json({
      stories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalStories: total,
        hasNext: skip + stories.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching stories for moderation:", error);
    res.status(500).json({ message: "Error fetching stories for moderation" });
  }
};

module.exports = {
  createSuccessStory,
  getSuccessStories,
  getPendingStories,
  getUserStories,
  getSuccessStoryById,
  updateSuccessStory,
  deleteSuccessStory,
  toggleLikeStory,
  addComment,
  moderateStory,
  getStoriesForModeration
};