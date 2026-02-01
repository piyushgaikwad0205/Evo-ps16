const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);
const formatCreatedAt = require("../utils/timeConverter");

const Post = require("../models/post.model");
const Community = require("../models/community.model");
const Comment = require("../models/comment.model");
const Club = require("../models/club.model");
const User = require("../models/user.model");
const Relationship = require("../models/relationship.model");
const Report = require("../models/report.model");
const PendingPost = require("../models/pendingPost.model");
const { extractHashtags, extractMentionUsernames } = require("../utils/textParsing");
const fs = require("fs");
const { sendToTokens } = require("../services/fcm");
const { createUserNotification } = require("./notification.controller");

const createPost = async (req, res) => {
  try {
    const { communityId, clubId, content } = req.body;
    const { userId, file, fileUrl, fileType } = req;

    // Check if user is an alumni and has upload permission
    const user = await User.findById(userId);
    if (user.role === "alumni" && !user.uploadPermission) {
      if (file) {
        fs.unlink(`./assets/userFiles/${file.filename}`, (err) => {
          if (err) console.error(err);
        });
      }
      return res.status(403).json({
        message: "Access Denied: You don't have permission to upload content",
      });
    }

    // CLUB POST LOGIC
    if (clubId && clubId !== "null" && clubId !== "") {
      const club = await Club.findById(clubId).select("head coHead members");
      if (!club) {
        if (file) fs.unlink(`./assets/userFiles/${file.filename}`, () => { });
        return res.status(404).json({ message: "Club not found" });
      }

      const headId = club.head ? String(club.head) : null;
      const coHeadId = club.coHead ? String(club.coHead) : null;
      const currentUserId = String(userId);

      console.log('Club Post Attempt:', {
        clubId,
        userId: currentUserId,
        headId,
        coHeadId,
        isHead: headId === currentUserId,
        isCoHead: coHeadId === currentUserId
      });

      const isHead = headId === currentUserId;
      const isCoHead = coHeadId === currentUserId;

      // Strict Mode: Only Head or Co-Head can post in clubs
      if (!isHead && !isCoHead) {
        console.warn(`Access Denied for Club Post: User ${currentUserId} is not Head (${headId}) or CoHead (${coHeadId})`);

        if (file) fs.unlink(`./assets/userFiles/${file.filename}`, () => { });
        return res.status(403).json({
          message: "Only Club Head and Co-Head can create posts",
        });
      }
    }
    // COMMUNITY POST LOGIC (Only check if communityId is provided)
    else if (communityId && communityId !== "null" && communityId !== "") {
      const community = await Community.findById(communityId);
      if (!community) {
        if (file) fs.unlink(`./assets/userFiles/${file.filename}`, () => { });
        return res.status(404).json({ message: "Community not found" });
      }

      const isCommunityMember = community.members.some(m => m.toString() === userId);
      if (!isCommunityMember) {
        if (file) fs.unlink(`./assets/userFiles/${file.filename}`, () => { });
        return res.status(403).json({ message: "You must join this community to post" });
      }
    } else {
      if (file) fs.unlink(`./assets/userFiles/${file.filename}`, () => { });
      return res.status(400).json({ message: "Post must belong to a Community or a Club" });
    }

    const mentionUsernames = extractMentionUsernames(content);
    const mentionedUsers = mentionUsernames.length
      ? await User.find({ username: { $in: mentionUsernames } }).select("_id")
      : [];

    const newPost = new Post({
      user: userId,
      community: (communityId && communityId !== "null" && communityId !== "") ? communityId : undefined,
      content,
      fileUrl: fileUrl ? fileUrl : null,
      fileType: fileType ? fileType : null,
      hashtags: extractHashtags(content),
      mentions: mentionedUsers.map((u) => u._id),
      club: (clubId && clubId !== "null" && clubId !== "") ? clubId : undefined,
    });

    const savedPost = await newPost.save();
    const postId = savedPost._id;

    const post = await Post.findById(postId)
      .populate("user", "name avatar")
      .populate("community", "name")
      .lean();

    // Don't format createdAt here - let the client handle it
    // post.createdAt is already an ISO date string from MongoDB


    // Notify followers via FCM (optional basic broadcast)
    setImmediate(async () => {
      try {
        const followerIds = await User.find({ following: userId }).distinct("_id");
        if (followerIds.length) {
          const recipients = await User.find({ _id: { $in: followerIds } }).select("fcmTokens").lean();
          const tokens = recipients.flatMap((u) => u.fcmTokens || []).filter(Boolean).slice(0, 500);

          if (tokens.length) {
            const senderName = user.name || "Someone";
            await sendToTokens(
              tokens,
              { title: "Campus Connect", body: `${senderName} posted a new update` },
              { type: "post", id: String(postId), clickAction: `/post/${postId}` }
            );

            // Create in-app notifications for followers - limit to 100 to avoid performance hit on large following
            const someFollowers = followerIds.slice(0, 100);

            const notificationsToCreate = someFollowers.map(followerId => ({
              recipient: followerId,
              sender: userId,
              type: "post",
              message: `${senderName} posted a new update`,
              relatedId: postId,
              relatedModel: 'Post'
            }));

            if (notificationsToCreate.length > 0) {
              await Promise.allSettled(notificationsToCreate.map(n => createUserNotification(n)));
            }
            // We'll skip bulk DB insert for now to avoid massive overhead, or iterate
            // Ideally use a bulkWrite or separate service, but for now we focus on Push.
          }
        }
      } catch (error) {
        console.error("Error sending FCM notifications:", error);
      }
    });

    res.json(post);
  } catch (error) {
    console.error('Error creating post:', error.message, error.stack);
    res.status(500).json({
      message: "Error creating post",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const confirmPost = async (req, res) => {
  try {
    const { confirmationToken } = req.params;
    const userId = req.userId;
    const pendingPost = await PendingPost.findOne({
      confirmationToken: { $eq: confirmationToken },
      status: "pending",
      user: userId,
    });
    if (!pendingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    const { user, community, content, fileUrl, fileType } = pendingPost;
    const newPost = new Post({
      user,
      community,
      content,
      fileUrl,
      fileType,
    });

    await PendingPost.findOneAndDelete({
      confirmationToken: { $eq: confirmationToken },
    });
    const savedPost = await newPost.save();
    const postId = savedPost._id;

    const post = await Post.findById(postId)
      .populate("user", "name avatar")
      .populate("community", "name")
      .lean();

    post.createdAt = dayjs(post.createdAt).fromNow();

    res.json(post);
  } catch (error) {
    res.status(500).json({
      message: "Error publishing post",
    });
  }
};

const rejectPost = async (req, res) => {
  try {
    const { confirmationToken } = req.params;
    const userId = req.userId;
    const pendingPost = await PendingPost.findOne({
      confirmationToken: { $eq: confirmationToken },
      status: "pending",
      user: userId,
    });

    if (!pendingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    await pendingPost.remove();
    res.status(201).json({ message: "Post rejected" });
  } catch (error) {
    res.status(500).json({
      message: "Error rejecting post",
    });
  }
};

const clearPendingPosts = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== "moderator") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const date = new Date();
    date.setHours(date.getHours() - 1);

    await PendingPost.deleteMany({ createdAt: { $lte: date } });

    res.status(200).json({ message: "Pending posts cleared" });
  } catch (error) {
    res.status(500).json({
      message: "Error clearing pending posts",
    });
  }
};
const getPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await findPostById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // College Isolation Check for Club Posts
    if (post.club && post.club.collegeId) {
      const currentUser = req.user;
      if (
        !currentUser ||
        !currentUser.collegeId ||
        currentUser.collegeId.toString() !== post.club.collegeId.toString()
      ) {
        return res.status(403).json({ message: "Access denied. Post belongs to another college." });
      }
    }

    const comments = await findCommentsByPostId(postId);

    post.comments = formatComments(comments);
    post.dateTime = formatCreatedAt(post.createdAt);
    post.createdAt = dayjs(post.createdAt).fromNow();
    post.savedByCount = await countSavedPosts(postId);

    const report = await findReportByPostAndUser(postId, userId);
    post.isReported = !!report;

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({
      message: "Error getting post",
    });
  }
};

const findPostById = async (postId) =>
  await Post.findById(postId)
    .populate("user", "name avatar")
    .populate("community", "name")
    .populate("club", "name collegeId")
    .lean();

const findCommentsByPostId = async (postId) =>
  await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .populate("user", "name avatar")
    .lean();

const formatComments = (comments) => comments;

const countSavedPosts = async (postId) =>
  await User.countDocuments({ savedPosts: postId });

const findReportByPostAndUser = async (postId, userId) =>
  await Report.findOne({ post: postId, reportedBy: userId });

const getPosts = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 10, skip = 0, type = "following" } = req.query;

    let posts = [];
    let totalPosts = 0;

    if (type === "all") {
      // GLOBAL FEED: Show everything from everyone
      posts = await Post.find({})
        .sort({ createdAt: -1 })
        .populate("user", "name avatar collegeId")
        .populate("community", "name")
        .populate("club", "name collegeId")
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .lean();

      totalPosts = await Post.countDocuments({});

    } else if (type === "college") {
      // COLLEGE FEED: Show all posts from users in a specific college
      // If collegeId is passed in query, use it. Otherwise default to user's college.
      let targetCollegeId = req.query.collegeId;

      if (!targetCollegeId || targetCollegeId === 'undefined' || targetCollegeId === 'null') {
        const user = await User.findById(userId).select("collegeId");
        if (!user) return res.status(401).json({ message: "User not found" });
        targetCollegeId = user.collegeId;
      }

      if (!targetCollegeId) {
        posts = [];
        totalPosts = 0;
      } else {
        const collegeUserIds = await User.find({ collegeId: targetCollegeId }).distinct("_id");

        const query = {
          user: { $in: collegeUserIds }
        };

        posts = await Post.find(query)
          .sort({ createdAt: -1 })
          .populate("user", "name avatar collegeId")
          .populate("community", "name")
          .populate("club", "name collegeId")
          .skip(parseInt(skip))
          .limit(parseInt(limit))
          .lean();

        totalPosts = await Post.countDocuments(query);
      }
    } else {
      // FOLLOWING / MY FEED: Strict College + Relationship
      const user = await User.findById(userId).select("collegeId");
      if (!user) return res.status(401).json({ message: "User not found" });

      const userCollegeId = user.collegeId;

      // 1. Communities I am in
      const communities = await Community.find({ members: userId }).select("_id");
      const communityIds = communities.map(c => c._id);

      // 2. Clubs I am in
      const clubs = await Club.find({ members: userId }).select("_id");
      const clubIds = clubs.map(c => c._id);

      // 3. Users I follow
      const relationships = await Relationship.find({ follower: userId }).select("following");
      const followingIds = relationships.map(r => r.following);

      // Construct Match Query
      // We want posts where:
      // (Community IN myCommunities OR Club IN myClubs OR User IN myFollowing OR User == Me)
      // AND
      // (Post from My College) -> This part is tricky if Post doesn't have collegeId.
      // But we can filter by Authors in My College.

      // Let's find all users in my college first? No, too many.
      // Let's assume if I follow them, they are likely relevant.
      // BUT requirement is "college usser ko ussi colleges ke post dikhe".
      // This implies if I follow someone from another college, I shouldn't see their posts here?
      // Or maybe it just means "Default view is limited to my college".

      // To strictly enforce college, we need to filter candidates.
      // Efficient way:
      // Find followingIds that are in my college.
      // 4. Users I am connected with
      const Connection = require("../models/connection.model");
      const connections = await Connection.find({
        $or: [{ requester: userId }, { recipient: userId }],
        status: "accepted"
      });

      const connectedUserIds = connections.map(c =>
        c.requester.toString() === userId ? c.recipient : c.requester
      );

      // Combine relevant users
      const allRelevantUserIds = [...new Set([...followingIds, ...connectedUserIds])];

      // Filter relevant users to those in my college (Strict College Policy)
      const validRelevantUsers = await User.find({ _id: { $in: allRelevantUserIds }, collegeId: userCollegeId }).select("_id");
      const validRelevantUserIds = validRelevantUsers.map(u => u._id);

      const query = {
        $or: [
          { community: { $in: communityIds } }, // Posts in my communities
          { club: { $in: clubIds } },           // Posts in my clubs
          { user: { $in: validRelevantUserIds }, community: null, club: null }, // Personal posts from following/connections
          { user: userId } // My own posts
        ]
      };

      posts = await Post.find(query)
        .sort({ createdAt: -1 })
        .populate("user", "name avatar collegeId")
        .populate("community", "name")
        .populate("club", "name collegeId")
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .lean();

      // Post-fetch filter for strict college compliance if needed? 
      // The above query handles "Personal Posts" via validFollowingIds.
      // Club posts via clubIds (usually clubs are college specific).
      // Community posts are shown if member.

      totalPosts = await Post.countDocuments(query);
    }

    res.status(200).json({
      formattedPosts: posts,
      totalPosts,
    });
  } catch (error) {
    console.error("Get Posts Error:", error);
    res.status(500).json({
      message: "Error retrieving posts",
    });
  }
};

/**
 * Retrieves the posts for a given community, including the post information, the number of posts saved by each user,
 * the user who created it, and the community it belongs to.
 *
 * @route GET /posts/community/:communityId
 */
const getCommunityPosts = async (req, res) => {
  try {
    const communityId = req.params.communityId;
    const userId = req.userId;

    const { limit = 10, skip = 0 } = req.query;

    const isMember = await Community.findOne({
      _id: communityId,
      members: userId,
    });

    if (!isMember) {
      return res.status(401).json({
        message: "Unauthorized to view posts in this community",
      });
    }

    const posts = await Post.find({
      community: communityId,
    })
      .sort({
        createdAt: -1,
      })
      .populate("user", "name avatar")
      .populate("community", "name")
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    const formattedPosts = posts.map((post) => ({
      ...post,
      createdAt: dayjs(post.createdAt).fromNow(),
    }));

    const totalCommunityPosts = await Post.countDocuments({
      community: communityId,
    });

    res.status(200).json({
      formattedPosts,
      totalCommunityPosts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving posts",
    });
  }
};

/**
 * Retrieves posts for a given club. Club posts are visible to all authenticated users.
 * @route GET /posts/club/:clubId
 */
const getClubPosts = async (req, res) => {
  try {
    const clubId = req.params.clubId;
    const { limit = 10, skip = 0 } = req.query;
    const currentUser = req.user;

    // College Isolation Check
    const club = await Club.findById(clubId).select("collegeId");
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (
      currentUser &&
      currentUser.collegeId &&
      club.collegeId &&
      currentUser.collegeId.toString() !== club.collegeId.toString()
    ) {
      return res.status(403).json({
        message: "You can only view posts for clubs in your college",
      });
    }

    const posts = await Post.find({ club: clubId })
      .sort({ createdAt: -1 })
      .populate("user", "name avatar")
      .populate("community", "name")
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    const formattedPosts = posts.map((post) => ({
      ...post,
      createdAt: dayjs(post.createdAt).fromNow(),
    }));

    const totalClubPosts = await Post.countDocuments({ club: clubId });

    res.status(200).json({ formattedPosts, totalClubPosts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving posts" });
  }
};

/**
 * Retrieves the posts of the users that the current user is following in a given community
 *
 * @route GET /posts/:id/following
 */
const getFollowingUsersPosts = async (req, res) => {
  try {
    const communityId = req.params.id;
    const userId = req.userId;

    const following = await Relationship.find({
      follower: userId,
    });

    const followingIds = following.map(
      (relationship) => relationship.following
    );

    const posts = await Post.find({
      user: {
        $in: followingIds,
      },
      community: communityId,
    })
      .sort({
        createdAt: -1,
      })
      .populate("user", "name avatar")
      .populate("community", "name")
      .limit(20)
      .lean();

    const formattedPosts = posts.map((post) => ({
      ...post,
      createdAt: dayjs(post.createdAt).fromNow(),
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const id = req.params.id;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found. It may have been deleted already",
      });
    }

    // Allow delete if author or moderator/admin
    const requesterId = req.userId;
    const requesterRole = req.userRole;
    const isOwner = String(post.user) === String(requesterId);
    const isPrivileged = requesterRole === 'moderator' || requesterRole === 'admin';
    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }

    // Delete related comments first
    await Comment.deleteMany({ post: id });
    // Finally delete the post document
    await Post.deleteOne({ _id: id });

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error('Delete post error:', error?.message || error);
    return res.status(500).json({ message: "Error deleting post" });
  }
};

const populatePost = async (post) => {
  const savedByCount = await User.countDocuments({
    savedPosts: post._id,
  });

  return {
    ...post.toObject(),
    createdAt: dayjs(post.createdAt).fromNow(),
    savedByCount,
  };
};

/**
 * @param {string} req.params.id - The ID of the post to be liked.
 * @param {string} req.userId - The ID of the user liking the post.
 */
const likePost = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId;
    const updatedPost = await Post.findOneAndUpdate(
      {
        _id: id,
        likes: {
          $ne: userId,
        },
      },
      {
        $addToSet: {
          likes: userId,
        },
      },
      {
        new: true,
      }
    )
      .populate("user", "name avatar")
      .populate("community", "name");

    if (!updatedPost) {
      return res.status(404).json({
        message: "Post not found. It may have been deleted already",
      });
    }

    const formattedPost = await populatePost(updatedPost);

    // Notify post owner if it's not the same user
    if (String(updatedPost.user._id) !== String(userId)) {
      setImmediate(async () => {
        try {
          const sender = await User.findById(userId).select("name");
          const receiver = await User.findById(updatedPost.user._id).select("fcmTokens");

          const senderName = sender ? sender.name : "Someone";

          // Push Notification
          if (receiver && receiver.fcmTokens && receiver.fcmTokens.length > 0) {
            await sendToTokens(
              receiver.fcmTokens,
              { title: "New Like", body: `${senderName} liked your post` },
              { type: "post", id: String(id), clickAction: `/post/${id}` }
            );
          }

          // In-App Notification
          await createUserNotification({
            recipient: updatedPost.user._id,
            sender: userId,
            type: "like",
            message: `${senderName} liked your post`,
            relatedId: id,
            relatedModel: 'Post'
          });
        } catch (error) {
          console.error("Error sending like notification:", error);
        }
      });
    }

    res.status(200).json(formattedPost);
  } catch (error) {
    res.status(500).json({
      message: "Error liking post",
    });
  }
};

const unlikePost = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId;

    const updatedPost = await Post.findOneAndUpdate(
      {
        _id: id,
        likes: userId,
      },
      {
        $pull: {
          likes: userId,
        },
      },
      {
        new: true,
      }
    )
      .populate("user", "name avatar")
      .populate("community", "name");

    if (!updatedPost) {
      return res.status(404).json({
        message: "Post not found. It may have been deleted already",
      });
    }

    const formattedPost = await populatePost(updatedPost);

    res.status(200).json(formattedPost);
  } catch (error) {
    res.status(500).json({
      message: "Error unliking post",
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { content, postId } = req.body;
    const userId = req.userId;
    const mentionUsernames = extractMentionUsernames(content);
    const mentionedUsers = mentionUsernames.length
      ? await User.find({ username: { $in: mentionUsernames } }).select("_id")
      : [];
    const newComment = new Comment({
      user: userId,
      post: postId,
      content,
      hashtags: extractHashtags(content),
      mentions: mentionedUsers.map((u) => u._id),
    });
    await newComment.save();
    await Post.findOneAndUpdate(
      {
        _id: { $eq: postId },
      },
      {
        $addToSet: {
          comments: newComment._id,
        },
      }
    );
    res.status(200).json({
      message: "Comment added successfully",
    });

    // Notify post owner
    try {
      const post = await Post.findById(postId).select("user");
      if (post && String(post.user) !== String(userId)) {
        setImmediate(async () => {
          try {
            const sender = await User.findById(userId).select("name");
            const receiver = await User.findById(post.user).select("fcmTokens");
            const senderName = sender ? sender.name : "Someone";

            // Push Notification
            if (receiver && receiver.fcmTokens && receiver.fcmTokens.length > 0) {
              await sendToTokens(
                receiver.fcmTokens,
                { title: "New Comment", body: `${senderName} commented: ${content.substring(0, 50)}...` },
                { type: "post", id: String(postId), clickAction: `/post/${postId}` }
              );
            }

            // In-App Notification
            await createUserNotification({
              recipient: post.user,
              sender: userId,
              type: "comment",
              message: `${senderName} commented on your post`,
              relatedId: postId,
              relatedModel: 'Comment' // Or Post, depending on schema, usually we link to the Post
            });
          } catch (e) {
            console.error("Error sending comment notification", e);
          }
        });
      }
    } catch (e) { }
  } catch (error) {
    res.status(500).json({
      message: "Error adding comment",
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(commentId);

    await Post.findOneAndUpdate(
      { _id: id },
      { $pull: { comments: commentId } }
    );

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment" });
  }
};

const savePost = async (req, res) => {
  await saveOrUnsavePost(req, res, "$addToSet");
};

const unsavePost = async (req, res) => {
  await saveOrUnsavePost(req, res, "$pull");
};

/**
 * Saves or unsaves a post for a given user by updating the user's
 * savedPosts array in the database. Uses $addToSet or $pull operation based on the value of the operation parameter.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param {string} operation - The operation to perform, either "$addToSet" to save the post or "$pull" to unsave it.
 */
const saveOrUnsavePost = async (req, res, operation) => {
  try {
    /**
     * @type {string} id - The ID of the post to be saved or unsaved.
     */
    const id = req.params.id;
    const userId = req.userId;

    const update = {};
    update[operation === "$addToSet" ? "$addToSet" : "$pull"] = {
      savedPosts: id,
    };
    const updatedUserPost = await User.findOneAndUpdate(
      {
        _id: userId,
      },
      update,
      {
        new: true,
      }
    )
      .select("savedPosts")
      .populate({
        path: "savedPosts",
        populate: {
          path: "community",
          select: "name",
        },
      });

    if (!updatedUserPost) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const formattedPosts = updatedUserPost.savedPosts.map((post) => ({
      ...post.toObject(),
      createdAt: dayjs(post.createdAt).fromNow(),
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * @route GET /posts/saved
 */
const getSavedPosts = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /**
     * send the saved posts of the communities that the user is a member of only
     */
    const communityIds = await Community.find({ members: userId }).distinct(
      "_id"
    );
    const savedPosts = await Post.find({
      community: { $in: communityIds },
      _id: { $in: user.savedPosts },
    })
      .populate("user", "name avatar")
      .populate("community", "name");

    const formattedPosts = savedPosts.map((post) => ({
      ...post.toObject(),
      createdAt: dayjs(post.createdAt).fromNow(),
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * Retrieves up to 10 posts of the public user that are posted in the communities
 * that both the public user and the current user are members of.
 *
 * @route GET /posts/:publicUserId/userPosts
 *
 * @param req.userId - The id of the current user.
 *
 * @param {string} req.params.publicUserId - The id of the public user whose posts to retrieve.
 */
const getPublicPosts = async (req, res) => {
  try {
    const publicUserId = req.params.publicUserId;
    const currentUserId = req.userId;

    const isFollowing = await Relationship.exists({
      follower: currentUserId,
      following: publicUserId,
    });
    if (!isFollowing) {
      return null;
    }

    const commonCommunityIds = await Community.find({
      members: { $all: [currentUserId, publicUserId] },
    }).distinct("_id");

    const publicPosts = await Post.find({
      community: { $in: commonCommunityIds },
      user: publicUserId,
    })
      .populate("user", "_id name avatar")
      .populate("community", "_id name")
      .sort("-createdAt")
      .limit(10)
      .exec();

    const formattedPosts = publicPosts.map((post) => ({
      ...post.toObject(),
      createdAt: dayjs(post.createdAt).fromNow(),
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getPost,
  getPosts,
  createPost,
  getCommunityPosts,
  deletePost,
  rejectPost,
  clearPendingPosts,
  confirmPost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  savePost,
  unsavePost,
  getSavedPosts,
  getPublicPosts,
  getFollowingUsersPosts,
  getClubPosts,
};
