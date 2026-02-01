const User = require("../models/user.model");
const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const Relationship = require("../models/relationship.model");
const Story = require("../models/story.model");
const Message = require("../models/message.model");
const Conversation = require("../models/conversation.model");
const Notification = require("../models/notification.model");
const Community = require("../models/community.model");
const Club = require("../models/club.model");
const Survey = require("../models/survey.model");
const Department = require("../models/department.model");
const Class = require("../models/class.model");
const HOD = require("../models/hod.model");
const Teacher = require("../models/teacher.model");
const Staff = require("../models/staff.model");
const Event = require("../models/event.model");

/**
 * Get all users with pagination and filtering
 * @route GET /admin/users
 */
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 100, role, status, search } = req.query;

        const query = {};

        // Filter by role
        if (role) query.role = role;

        // Filter by status
        if (status) query.status = status;

        // Search by name or email
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Enforce College Isolation
        if (req.collegeId) {
            query.collegeId = req.collegeId;
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: "Error fetching users" });
    }
};

/**
 * Get single user details
 * @route GET /admin/users/:id
 */
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password').lean();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Enforce College Isolation
        if (req.collegeId && user.collegeId && user.collegeId.toString() !== req.collegeId.toString()) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get additional stats
        const [postCount, followerCount, followingCount] = await Promise.all([
            Post.countDocuments({ user: user._id }),
            Relationship.countDocuments({ following: user._id }),
            Relationship.countDocuments({ follower: user._id })
        ]);

        res.json({
            ...user,
            stats: {
                posts: postCount,
                followers: followerCount,
                following: followingCount
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: "Error fetching user" });
    }
};

/**
 * Update user details
 * @route PATCH /admin/users/:id
 */
const updateUser = async (req, res) => {
    try {
        const { name, email, role, bio, location } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Enforce College Isolation
        if (req.collegeId && user.collegeId && user.collegeId.toString() !== req.collegeId.toString()) {
            return res.status(403).json({ message: "Access denied. User belongs to another college." });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (bio !== undefined) user.bio = bio;
        if (location !== undefined) user.location = location;

        await user.save();

        res.json({ message: "User updated successfully", user: user.toObject({ getters: true, virtuals: false }) });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: "Error updating user" });
    }
};

/**
 * Suspend or activate user
 * @route PATCH /admin/users/:id/suspend
 */
const suspendUser = async (req, res) => {
    try {
        const { suspended } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Enforce College Isolation
        if (req.collegeId && user.collegeId && user.collegeId.toString() !== req.collegeId.toString()) {
            return res.status(403).json({ message: "Access denied. User belongs to another college." });
        }

        user.status = suspended ? 'suspended' : 'active';
        await user.save();

        res.json({
            message: `User ${suspended ? 'suspended' : 'activated'} successfully`,
            user: { _id: user._id, status: user.status }
        });
    } catch (error) {
        console.error('Error suspending user:', error);
        res.status(500).json({ message: "Error updating user status" });
    }
};

/**
 * Delete user and all related data (CASCADE DELETE)
 * @route DELETE /admin/users/:id
 */
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Enforce College Isolation
        if (req.collegeId && user.collegeId && user.collegeId.toString() !== req.collegeId.toString()) {
            return res.status(403).json({ message: "Access denied. User belongs to another college." });
        }

        console.log(`[ADMIN] Starting cascade deletion for user: ${user.email} (${userId})`);

        // CASCADE DELETE - Delete all related data
        const deletionPromises = [
            // 1. Delete all posts by this user
            Post.deleteMany({ user: userId }),

            // 2. Delete all comments by this user
            Comment.deleteMany({ user: userId }),

            // 3. Delete all relationships (follower/following)
            Relationship.deleteMany({ $or: [{ follower: userId }, { following: userId }] }),

            // 4. Delete all stories by this user
            Story.deleteMany({ user: userId }),

            // 5. Delete all messages sent by this user
            Message.deleteMany({ sender: userId }),

            // 6. Delete all notifications related to this user
            Notification.deleteMany({ $or: [{ user: userId }, { sender: userId }] }),

            // 7. Remove user from community members
            Community.updateMany(
                { members: userId },
                { $pull: { members: userId } }
            ),

            // 8. Remove user from conversations
            Conversation.updateMany(
                { participants: userId },
                { $pull: { participants: userId } }
            ),

            // 9. Update User model - remove from followers/following arrays
            User.updateMany(
                { $or: [{ followers: userId }, { following: userId }] },
                { $pull: { followers: userId, following: userId } }
            ),

            // 10. Remove user from saved posts
            User.updateMany(
                { savedPosts: { $in: await Post.find({ user: userId }).distinct('_id') } },
                { $pull: { savedPosts: { $in: await Post.find({ user: userId }).distinct('_id') } } }
            )
        ];

        // Execute all deletions in parallel
        const results = await Promise.allSettled(deletionPromises);

        // Log results
        const deletionStats = {
            posts: results[0].status === 'fulfilled' ? results[0].value.deletedCount : 0,
            comments: results[1].status === 'fulfilled' ? results[1].value.deletedCount : 0,
            relationships: results[2].status === 'fulfilled' ? results[2].value.deletedCount : 0,
            stories: results[3].status === 'fulfilled' ? results[3].value.deletedCount : 0,
            messages: results[4].status === 'fulfilled' ? results[4].value.deletedCount : 0,
            notifications: results[5].status === 'fulfilled' ? results[5].value.deletedCount : 0,
            communitiesUpdated: results[6].status === 'fulfilled' ? results[6].value.modifiedCount : 0,
            conversationsUpdated: results[7].status === 'fulfilled' ? results[7].value.modifiedCount : 0,
            usersUpdated: results[8].status === 'fulfilled' ? results[8].value.modifiedCount : 0,
        };

        console.log('[ADMIN] Deletion stats:', deletionStats);

        // Finally, delete the user
        await User.findByIdAndDelete(userId);

        console.log(`[ADMIN] User ${user.email} and all related data deleted successfully`);

        res.json({
            message: "User and all related data deleted successfully",
            deletionStats
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: "Error deleting user: " + error.message });
    }
};

/**
 * Get user statistics for dashboard
 * @route GET /admin/stats
 */
const getUserStats = async (req, res) => {
    try {
        const query = {};
        if (req.collegeId) {
            query.collegeId = req.collegeId;
        }

        const [
            totalUsers,
            activeUsers,
            suspendedUsers,
            totalPosts,
            totalCommunities,
            totalStories,
            totalClubs,
            totalSurveys,
            totalDepartments,
            totalClasses,
            totalHODs,
            totalTeachers,
            totalStaff,
            totalEvents
        ] = await Promise.all([
            User.countDocuments(query),
            User.countDocuments({ ...query, status: { $ne: 'suspended' } }),
            User.countDocuments({ ...query, status: 'suspended' }),
            Post.countDocuments(), // Posts might not have collegeId.
            Community.countDocuments(query),
            Story.countDocuments(), // Stories
            Club.countDocuments(query),
            Survey.countDocuments(query),
            Department.countDocuments(query),
            Class.countDocuments(query),
            HOD.countDocuments(query),
            Teacher.countDocuments(query),
            Staff.countDocuments(query),
            Event.countDocuments(query)
        ]);

        // Get user growth (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newUsers = await User.countDocuments({
            ...query,
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get users by role
        const usersByRole = await User.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            totalUsers,
            activeUsers,
            suspendedUsers,
            newUsersLast30Days: newUsers,
            totalPosts,
            totalCommunities,
            totalStories,
            totalClubs,
            totalSurveys,
            totalDepartments,
            totalClasses,
            totalHODs,
            totalTeachers,
            totalStaff,
            totalEvents,
            usersByRole: usersByRole.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: "Error fetching statistics" });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    suspendUser,
    deleteUser,
    getUserStats
};
