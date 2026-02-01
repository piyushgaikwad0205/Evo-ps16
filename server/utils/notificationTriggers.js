const notificationService = require('../services/notification.service');

/**
 * Helper functions to automatically trigger notifications for various events
 */

/**
 * Send notification when user creates a new post
 */
exports.notifyNewPost = async (post, author) => {
    try {
        // Get author's followers
        const User = require('../models/user.model');
        const followers = await User.findById(author._id)
            .select('followers')
            .populate('followers', '_id');

        if (!followers || followers.followers.length === 0) {
            return;
        }

        const followerIds = followers.followers.map(f => f._id.toString());

        const notification = {
            title: `${author.name} posted something new`,
            body: post.content ? post.content.substring(0, 100) : 'Check out the new post!',
            icon: author.avatar || '/icons/icon-192.png'
        };

        const data = {
            type: 'new_post',
            postId: post._id.toString(),
            authorId: author._id.toString(),
            clickAction: `/post/${post._id}`
        };

        await notificationService.sendToMultipleUsers(followerIds, notification, data);
        console.log(`Sent new post notification to ${followerIds.length} followers`);
    } catch (error) {
        console.error('Error sending new post notification:', error);
    }
};

/**
 * Send notification when someone likes a post
 */
exports.notifyPostLike = async (post, liker) => {
    try {
        // Don't notify if user likes their own post
        if (post.author.toString() === liker._id.toString()) {
            return;
        }

        const notification = {
            title: `${liker.name} liked your post`,
            body: post.content ? post.content.substring(0, 100) : 'Someone liked your post!',
            icon: liker.avatar || '/icons/icon-192.png'
        };

        const data = {
            type: 'post_like',
            postId: post._id.toString(),
            likerId: liker._id.toString(),
            clickAction: `/post/${post._id}`
        };

        await notificationService.sendToUser(post.author.toString(), notification, data);
    } catch (error) {
        console.error('Error sending post like notification:', error);
    }
};

/**
 * Send notification when someone comments on a post
 */
exports.notifyPostComment = async (post, commenter, comment) => {
    try {
        // Don't notify if user comments on their own post
        if (post.author.toString() === commenter._id.toString()) {
            return;
        }

        const notification = {
            title: `${commenter.name} commented on your post`,
            body: comment.content ? comment.content.substring(0, 100) : 'New comment on your post!',
            icon: commenter.avatar || '/icons/icon-192.png'
        };

        const data = {
            type: 'post_comment',
            postId: post._id.toString(),
            commenterId: commenter._id.toString(),
            commentId: comment._id.toString(),
            clickAction: `/post/${post._id}`
        };

        await notificationService.sendToUser(post.author.toString(), notification, data);
    } catch (error) {
        console.error('Error sending post comment notification:', error);
    }
};

/**
 * Send notification for new message
 */
exports.notifyNewMessage = async (message, sender, recipient) => {
    try {
        // Don't notify if sender and recipient are the same
        if (sender._id.toString() === recipient._id.toString()) {
            return;
        }

        const notification = {
            title: `New message from ${sender.name}`,
            body: message.content ? message.content.substring(0, 100) : 'You have a new message',
            icon: sender.avatar || '/icons/icon-192.png',
            requireInteraction: true
        };

        const data = {
            type: 'new_message',
            senderId: sender._id.toString(),
            messageId: message._id.toString(),
            conversationId: message.conversation?.toString(),
            clickAction: `/messages?conversation=${message.conversation}`
        };

        await notificationService.sendToUser(recipient._id.toString(), notification, data);
    } catch (error) {
        console.error('Error sending new message notification:', error);
    }
};

/**
 * Send notification when someone follows you
 */
exports.notifyNewFollower = async (follower, followedUser) => {
    try {
        const notification = {
            title: `${follower.name} started following you`,
            body: `${follower.name} is now following you on Campus Connect`,
            icon: follower.avatar || '/icons/icon-192.png'
        };

        const data = {
            type: 'new_follower',
            followerId: follower._id.toString(),
            clickAction: `/user/${follower._id}`
        };

        await notificationService.sendToUser(followedUser._id.toString(), notification, data);
    } catch (error) {
        console.error('Error sending new follower notification:', error);
    }
};

/**
 * Send notification for event reminder
 */
exports.notifyEventReminder = async (event, attendees) => {
    try {
        const attendeeIds = attendees.map(a => a._id.toString());

        const notification = {
            title: `Reminder: ${event.title}`,
            body: `Event starts soon! ${event.description?.substring(0, 100)}`,
            icon: event.image || '/icons/icon-192.png',
            requireInteraction: true
        };

        const data = {
            type: 'event_reminder',
            eventId: event._id.toString(),
            clickAction: `/events/${event._id}`
        };

        await notificationService.sendToMultipleUsers(attendeeIds, notification, data);
    } catch (error) {
        console.error('Error sending event reminder notification:', error);
    }
};

/**
 * Send notification for club announcement
 */
exports.notifyClubAnnouncement = async (club, announcement, members) => {
    try {
        const memberIds = members.map(m => m._id.toString());

        const notification = {
            title: `${club.name}: New Announcement`,
            body: announcement.content ? announcement.content.substring(0, 100) : 'New announcement from your club',
            icon: club.banner || '/icons/icon-192.png'
        };

        const data = {
            type: 'club_announcement',
            clubId: club._id.toString(),
            announcementId: announcement._id.toString(),
            clickAction: `/clubs/${club._id}`
        };

        await notificationService.sendToMultipleUsers(memberIds, notification, data);
    } catch (error) {
        console.error('Error sending club announcement notification:', error);
    }
};

/**
 * Send notification for survey response request
 */
exports.notifySurveyRequest = async (survey, creator, targetUsers) => {
    try {
        const userIds = targetUsers.map(u => u._id.toString());

        const notification = {
            title: `New Survey: ${survey.title}`,
            body: survey.description ? survey.description.substring(0, 100) : 'Please take a moment to respond',
            icon: creator.avatar || '/icons/icon-192.png'
        };

        const data = {
            type: 'survey_request',
            surveyId: survey._id.toString(),
            creatorId: creator._id.toString(),
            clickAction: `/surveys/${survey._id}`
        };

        await notificationService.sendToMultipleUsers(userIds, notification, data);
    } catch (error) {
        console.error('Error sending survey request notification:', error);
    }
};

/**
 * Send notification for collaboration request
 */
exports.notifyCollabRequest = async (collab, requester, recipient) => {
    try {
        const notification = {
            title: `Collaboration Request from ${requester.name}`,
            body: collab.description ? collab.description.substring(0, 100) : 'New collaboration opportunity',
            icon: requester.avatar || '/icons/icon-192.png',
            requireInteraction: true
        };

        const data = {
            type: 'collab_request',
            collabId: collab._id.toString(),
            requesterId: requester._id.toString(),
            clickAction: `/collabs/${collab._id}`
        };

        await notificationService.sendToUser(recipient._id.toString(), notification, data);
    } catch (error) {
        console.error('Error sending collab request notification:', error);
    }
};
