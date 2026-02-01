const dayjs = require("dayjs");
const Story = require("../models/story.model");
const Highlight = require("../models/highlight.model");
const Relationship = require("../models/relationship.model");
const User = require("../models/user.model");

const STORY_TTL_HOURS = 24;

const createTextStory = async (req, res) => {
  try {
    const { text = "", background = "#000000" } = req.body;
    const expiresAt = dayjs().add(STORY_TTL_HOURS, "hour").toDate();

    const story = await Story.create({
      user: req.userId,
      type: "text",
      text,
      background,
      expiresAt,
      privacy: req.body.privacy || "public",
      poll: req.body.poll || null,
      link: req.body.link || null,
      tags: req.body.tags || [],
      mentions: req.body.mentions || [],
      location: req.body.location || null,
    });

    res.status(201).json(story);
  } catch (err) {
    console.error('Error creating text story:', err);
    res.status(500).json({ message: "Error creating story" });
  }
};

const createMediaStory = async (req, res) => {
  try {
    const { fileUrl, fileType } = req;
    if (!fileUrl || !fileType) {
      return res.status(400).json({ message: "No media uploaded" });
    }
    const type = fileType === "image" ? "image" : "video";
    const expiresAt = dayjs().add(STORY_TTL_HOURS, "hour").toDate();

    const story = await Story.create({
      user: req.userId,
      type,
      fileUrl,
      fileType,
      expiresAt,
      privacy: req.body.privacy || "public",
      poll: req.body.poll || null,
      link: req.body.link || null,
      tags: req.body.tags || [],
      mentions: req.body.mentions || [],
      location: req.body.location || null,
    });
    res.status(201).json(story);
  } catch (err) {
    console.error('Error creating media story:', err);
    res.status(500).json({ message: "Error creating story" });
  }
};

const getFollowingStories = async (req, res) => {
  try {
    const userId = req.userId;

    // Get users that current user follows
    const followingDocs = await Relationship.find({ follower: userId }).select("following");
    const followingIds = followingDocs.map((r) => r.following.toString());

    const now = new Date();

    // Fetch stories from followed users + own stories
    const stories = await Story.find({
      user: { $in: [...followingIds, userId] },
      expiresAt: { $gt: now },
    })
      .sort({ createdAt: -1 })
      .populate("user", "name avatar")
      .populate("viewers.user", "name avatar")
      .populate("reactions.user", "name avatar")
      .lean();

    // Filter by privacy settings
    const filtered = stories.filter(s => {
      const storyUserId = s.user._id.toString();

      // Always show own stories
      if (storyUserId === userId) return true;

      // Check if current user follows the story owner
      const isFollowing = followingIds.includes(storyUserId);

      // Privacy filtering
      if (s.privacy === 'public') return true;
      if (s.privacy === 'followers' && isFollowing) return true;
      // TODO: Implement close_friends and club_members logic
      if (s.privacy === 'close_friends') return false; // Not implemented yet
      if (s.privacy === 'club_members') return false; // Not implemented yet

      return false;
    });

    res.json(filtered);
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.status(500).json({ message: "Error fetching stories" });
  }
};

const markViewed = async (req, res) => {
  try {
    const { id } = req.params;
    const story = await Story.findById(id);
    if (!story) return res.status(404).json({ message: "Story not found" });

    const alreadyViewed = story.viewers.find(
      (v) => String(v.user) === String(req.userId)
    );
    if (!alreadyViewed) {
      story.viewers.push({ user: req.userId, viewedAt: new Date() });
      await story.save();

      // Populate and return the updated story
      const updatedStory = await Story.findById(id)
        .populate("user", "name avatar")
        .populate("viewers.user", "name avatar")
        .populate("reactions.user", "name avatar");

      return res.json({ message: "Viewed", story: updatedStory });
    }
    res.json({ message: "Already viewed" });
  } catch (err) {
    console.error('Error marking viewed:', err);
    res.status(500).json({ message: "Error marking viewed" });
  }
};

const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const story = await Story.findById(id);
    if (!story) return res.status(404).json({ message: "Story not found" });
    if (String(story.user) !== String(req.userId))
      return res.status(403).json({ message: "Unauthorized" });
    await story.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error('Error deleting story:', err);
    res.status(500).json({ message: "Error deleting story" });
  }
};

const createHighlight = async (req, res) => {
  try {
    const { title, storyIds = [], coverStory = null } = req.body;
    const highlight = await Highlight.create({
      user: req.userId,
      title,
      stories: storyIds,
      coverStory: coverStory || storyIds[0] || null,
    });
    res.status(201).json(highlight);
  } catch (err) {
    console.error('Error creating highlight:', err);
    res.status(500).json({ message: "Error creating highlight" });
  }
};

const getHighlights = async (req, res) => {
  try {
    const { userId } = req.params;
    const highlights = await Highlight.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({ path: "coverStory", populate: { path: "user", select: "name avatar" } })
      .lean();
    res.json(highlights);
  } catch (err) {
    console.error('Error fetching highlights:', err);
    res.status(500).json({ message: "Error fetching highlights" });
  }
};

const updateHighlight = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, storyIds, coverStory } = req.body;
    const highlight = await Highlight.findById(id);
    if (!highlight) return res.status(404).json({ message: "Highlight not found" });
    if (String(highlight.user) !== String(req.userId))
      return res.status(403).json({ message: "Unauthorized" });
    if (title !== undefined) highlight.title = title;
    if (Array.isArray(storyIds)) highlight.stories = storyIds;
    if (coverStory !== undefined) highlight.coverStory = coverStory;
    await highlight.save();
    res.json(highlight);
  } catch (err) {
    console.error('Error updating highlight:', err);
    res.status(500).json({ message: "Error updating highlight" });
  }
};

const deleteHighlight = async (req, res) => {
  try {
    const { id } = req.params;
    const highlight = await Highlight.findById(id);
    if (!highlight) return res.status(404).json({ message: "Highlight not found" });
    if (String(highlight.user) !== String(req.userId))
      return res.status(403).json({ message: "Unauthorized" });
    await highlight.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error('Error deleting highlight:', err);
    res.status(500).json({ message: "Error deleting highlight" });
  }
};

const reactToStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ message: "Emoji is required" });
    }

    const story = await Story.findById(id);
    if (!story) return res.status(404).json({ message: "Story not found" });

    // Remove previous reaction from this user if exists
    story.reactions = story.reactions.filter(
      (r) => String(r.user) !== String(req.userId)
    );

    // Add new reaction
    story.reactions.push({ user: req.userId, emoji, createdAt: new Date() });
    await story.save();

    // Populate and return the updated story
    const updatedStory = await Story.findById(id)
      .populate("user", "name avatar")
      .populate("viewers.user", "name avatar")
      .populate("reactions.user", "name avatar");

    res.json({ message: "Reacted", story: updatedStory });
  } catch (err) {
    console.error('Error reacting to story:', err);
    res.status(500).json({ message: "Error reacting" });
  }
};

const votePoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { optionIndex } = req.body;
    const story = await Story.findById(id);
    if (!story || !story.poll) return res.status(404).json({ message: "Poll not found" });

    // Remove previous vote if any
    story.poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(v => String(v) !== String(req.userId));
    });

    if (story.poll.options[optionIndex]) {
      story.poll.options[optionIndex].votes.push(req.userId);
    }

    await story.save();
    res.json(story.poll);
  } catch (err) {
    console.error('Error voting on poll:', err);
    res.status(500).json({ message: "Error voting" });
  }
};

module.exports = {
  createTextStory,
  createMediaStory,
  getFollowingStories,
  markViewed,
  deleteStory,
  createHighlight,
  getHighlights,
  updateHighlight,
  deleteHighlight,
  reactToStory,
  votePoll,
};
