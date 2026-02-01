import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { X, Trash2 } from 'lucide-react';
import CommentForm from '../form/CommentForm';
import { getPostAction, deleteCommentAction } from '../../redux/actions/postActions';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const CommentsModal = ({ isOpen, onClose, post }) => {
    const dispatch = useDispatch();
    const { post: currentPost } = useSelector((state) => state.posts);
    const userData = useSelector((state) => state.auth?.userData);

    useEffect(() => {
        if (isOpen && post._id) {
            dispatch(getPostAction(post._id));
        }
    }, [isOpen, post._id, dispatch]);

    const displayPost = (currentPost && currentPost._id === post._id) ? currentPost : post;
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute inset-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex flex-col overflow-hidden rounded-3xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-center p-4 border-b border-gray-100 dark:border-gray-800 relative shrink-0">
                        <h3 className="font-bold text-lg dark:text-white">Comments</h3>
                        <button
                            onClick={onClose}
                            className="absolute right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full dark:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {displayPost.comments && displayPost.comments.length > 0 ? (
                            [...displayPost.comments]
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .map((comment) => {
                                    if (!comment.user) return null;
                                    return (
                                        <div key={comment._id} className="flex gap-3">
                                            <Link to={`/user/${comment.user._id}`}>
                                                <img
                                                    src={comment.user.avatar || "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg"}
                                                    alt={comment.user.name}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            </Link>
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2">
                                                    <Link to={`/user/${comment.user._id}`} className="font-semibold text-sm hover:underline dark:text-white">
                                                        {comment.user.name}
                                                    </Link>
                                                    <span className="text-xs text-gray-500">
                                                        {(() => {
                                                            const date = dayjs(comment.createdAt);
                                                            const now = dayjs();
                                                            const diffSeconds = now.diff(date, 'second');
                                                            const diffMinutes = now.diff(date, 'minute');
                                                            const diffHours = now.diff(date, 'hour');
                                                            const diffDays = now.diff(date, 'day');
                                                            const diffWeeks = now.diff(date, 'week');

                                                            if (diffSeconds < 60) return `${Math.max(0, diffSeconds)}s`;
                                                            if (diffMinutes < 60) return `${diffMinutes}m`;
                                                            if (diffHours < 24) return `${diffHours}h`;
                                                            if (diffDays < 7) return `${diffDays}d`;
                                                            return `${diffWeeks}w`;
                                                        })()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">
                                                    {comment.content}
                                                </p>
                                            </div>
                                            {userData?._id === comment.user._id && (
                                                <button
                                                    onClick={() => dispatch(deleteCommentAction(displayPost._id, comment._id))}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1 self-start"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <p>No comments yet.</p>
                                <p className="text-sm">Start the conversation.</p>
                            </div>
                        )}
                    </div>

                    {/* Comment Form */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-black">
                        <CommentForm postId={post._id} communityId={post.community?._id || post.community} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CommentsModal;
