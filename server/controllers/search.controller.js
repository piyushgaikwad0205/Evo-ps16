const Community = require("../models/community.model");
const User = require("../models/user.model");
const Post = require("../models/post.model");

const search = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const userId = req.userId;
    const communities = await Community.find({ members: userId }).distinct(
      "_id"
    );

    // Hashtag-aware search for posts in joined communities
    const isHashtag = searchQuery?.trim().startsWith("#");
    const normalizedTag = isHashtag
      ? searchQuery.trim().slice(1).toLowerCase()
      : null;

    // User search: support name, username, and email queries
    const q = String(searchQuery || '').trim();
    const isEmailLike = q.includes('@');
    const usernamePrefix = q.startsWith('@') ? q.slice(1) : null;
    const userFilter = usernamePrefix
      ? { username: { $regex: `^${usernamePrefix}`, $options: 'i' } }
      : isEmailLike
        ? { email: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
        : { $or: [
            { name: { $regex: q, $options: 'i' } },
            { username: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
          ] };

    const [users, posts, joinedCommunity, community] = await Promise.all([
      User.find(userFilter)
        .select("_id name email avatar username lastLoginAt")
        .limit(20)
        .lean()
        .then(list => {
          const now = Date.now();
          return list.map(u => ({
            ...u,
            isOnline: u.lastLoginAt ? (now - new Date(u.lastLoginAt).getTime()) <= 5 * 60 * 1000 : false
          }));
        }),
      isHashtag
        ? Post.find({ community: { $in: communities }, hashtags: normalizedTag })
        : Post.find({
            community: { $in: communities },
            $text: { $search: searchQuery },
          })
        .select("_id content")
        .populate("user", "name avatar")
        .populate("community", "name")
        .lean()
        .exec(),
      Community.findOne({
        $text: { $search: searchQuery },
        members: { $in: userId },
      }).select("_id name description banner members"),
      Community.findOne({
        $text: { $search: searchQuery },
        members: { $nin: userId },
      }).select("_id name description banner members"),
    ]);

    posts.forEach((post) => {
      if (post.content.length > 30) {
        post.content = post.content.substring(0, 30) + "...";
      }
    });

    // If query starts with '@', suggest users by username prefix as well
    let usernameSuggestions = [];
    if (searchQuery?.trim().startsWith("@")) {
      const uname = searchQuery.trim().slice(1).toLowerCase();
      if (uname.length >= 2) {
        usernameSuggestions = await User.find({
          username: { $regex: `^${uname}`, $options: "i" },
        })
          .select("_id name avatar username")
          .limit(10)
          .lean();
      }
    }

    res.status(200).json({ posts, users, community, joinedCommunity, usernameSuggestions });
  } catch (error) {
    res.status(500).json({ message: "An error occurred" });
  }
};

module.exports = search;
