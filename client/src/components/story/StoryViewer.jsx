import React, { useState, useEffect, useRef } from 'react';
import { viewStory, reactToStory, deleteStory } from '../../redux/api/storyAPI';
import { MESSAGES_API } from '../../redux/api/utils';
import { HiX, HiTrash, HiEye, HiHeart, HiPaperAirplane } from 'react-icons/hi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const StoryViewer = ({ stories, user, onClose, currentUserId }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const [replyText, setReplyText] = useState('');
    const [showViewers, setShowViewers] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [sendingMsg, setSendingMsg] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);
    const story = stories[currentIndex];
    const isOwner = user._id === currentUserId;
    const videoRef = useRef(null);

    // Reset buffering state on slide change
    useEffect(() => {
        setIsBuffering(true);
    }, [currentIndex]);

    // Mark as viewed
    useEffect(() => {
        if (story && !isOwner) {
            const viewed = story.viewers.some(v => v.user === currentUserId);
            if (!viewed) {
                viewStory(story._id).catch(err => {
                    console.error('Error marking story as viewed:', err);
                });
            }
        }
    }, [story, isOwner, currentUserId]);

    // Auto advance
    useEffect(() => {
        if (paused || isBuffering) return;
        setProgress(0);

        const duration = story.type === 'video' ? (videoRef.current?.duration * 1000 || 15000) : 5000;
        const interval = 50;
        const step = 100 / (duration / interval);

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    handleNext();
                    return 100;
                }
                return prev + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [currentIndex, paused, isBuffering, story]);

    const handleNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setProgress(0);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setProgress(0);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Delete this story?")) {
            try {
                await deleteStory(story._id);
                // Refresh the feed by closing and letting parent component refresh
                onClose();
                // Trigger a page reload to refresh the story feed
                window.location.reload();
            } catch (error) {
                console.error("Failed to delete story:", error);
                alert("Failed to delete story. Please try again.");
            }
        }
    };

    const handleReaction = async (emoji) => {
        setIsLiked(true);
        setTimeout(() => setIsLiked(false), 300);
        await reactToStory(story._id, emoji);
        // Show feedback
    };

    const handleSendMessage = async () => {
        if (!replyText.trim()) return;
        setSendingMsg(true);
        try {
            // 1. Get/Create Conversation
            const { data: convo } = await MESSAGES_API.post('/dm', { targetUserId: user._id });
            // 2. Send Message
            await MESSAGES_API.post(`/conversations/${convo._id}/messages`, {
                content: replyText,
                type: 'text',
                timestamp: new Date().toISOString()
            });
            setReplyText('');
            alert("Message sent!");
            setPaused(false);
        } catch (error) {
            console.error("Failed to send message:", error);
            alert("Failed to send message.");
        } finally {
            setSendingMsg(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            {/* Mobile-like container */}
            <div className="relative w-full max-w-md h-full md:h-[90vh] bg-gray-900 md:rounded-xl overflow-hidden flex flex-col">

                {/* Progress Bars */}
                <div className="absolute top-2 left-0 right-0 flex gap-1 px-2 z-20">
                    {stories.map((s, i) => (
                        <div key={s._id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-linear"
                                style={{
                                    width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-4 z-20 text-white">
                    <div className="flex items-center gap-2">
                        <img src={user.avatar || "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg"} alt={user.name} className="w-8 h-8 rounded-full border border-white" />
                        <span className="font-medium text-sm">{user.name}</span>
                        <span className="text-xs opacity-70">{dayjs(story.createdAt).fromNow(true)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {isOwner && (
                            <button onClick={() => { setShowViewers(true); setPaused(true); }}>
                                <HiEye className="w-5 h-5" /> {story.viewers.length}
                            </button>
                        )}
                        {isOwner && <button onClick={handleDelete}><HiTrash className="w-5 h-5" /></button>}
                        <button onClick={onClose}><HiX className="w-6 h-6" /></button>
                    </div>
                </div>

                {/* Content */}
                <div
                    className="flex-1 relative bg-black flex items-center justify-center"
                    onMouseDown={() => setPaused(true)}
                    onMouseUp={() => setPaused(false)}
                    onTouchStart={() => setPaused(true)}
                    onTouchEnd={() => setPaused(false)}
                >
                    {/* Loading Spinner */}
                    {isBuffering && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                    )}

                    {/* Tap zones */}
                    <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
                    <div className="absolute inset-y-0 right-0 w-1/3 z-10" onClick={(e) => { e.stopPropagation(); handleNext(); }} />

                    {story.type === 'text' ? (
                        <div
                            className="w-full h-full flex items-center justify-center p-8 text-center"
                            style={{ backgroundColor: story.background }}
                        >
                            <p className="text-white text-2xl font-bold">{story.text}</p>
                            {/* Text stories load instantly, so turn off buffering immediately */}
                            <img
                                src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                                className="hidden"
                                onLoad={() => setIsBuffering(false)}
                            />
                        </div>
                    ) : story.type === 'video' ? (
                        <video
                            ref={videoRef}
                            src={story.fileUrl}
                            className="w-full h-full object-contain"
                            autoPlay
                            muted={false}
                            playsInline
                            crossOrigin="anonymous"
                            preload="metadata"
                            onEnded={handleNext}
                            onLoadStart={() => setIsBuffering(true)}
                            onWaiting={() => setIsBuffering(true)}
                            onCanPlay={() => setIsBuffering(false)}
                            onPlaying={() => setIsBuffering(false)}
                        />
                    ) : (
                        <img
                            src={story.fileUrl}
                            alt="Story"
                            className="w-full h-full object-contain"
                            onLoad={() => setIsBuffering(false)}
                        />
                    )}
                </div>

                {/* Footer / Reply */}
                {!isOwner && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20">
                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                placeholder="Send message..."
                                className="flex-1 bg-transparent border border-white/50 rounded-full px-4 py-2 text-white placeholder-white/70 outline-none focus:border-white transition-colors"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onFocus={() => setPaused(true)}
                                onBlur={() => !replyText && setPaused(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSendMessage();
                                }}
                            />
                            {replyText.trim() ? (
                                <button
                                    className="text-white p-2 hover:scale-110 transition disabled:opacity-50"
                                    onClick={handleSendMessage}
                                    disabled={sendingMsg}
                                >
                                    <HiPaperAirplane className="w-6 h-6 rotate-90" />
                                </button>
                            ) : (
                                <button
                                    className={`text-white p-2 transition-transform duration-300 ${isLiked ? 'scale-150' : 'hover:scale-110'}`}
                                    onClick={() => handleReaction('❤️')}
                                >
                                    <HiHeart className={`w-6 h-6 ${isLiked ? 'text-red-600' : 'text-red-500'}`} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Viewers Modal */}
            {
                showViewers && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                        <div className="bg-gray-900 w-full max-w-md h-full md:h-[90vh] md:rounded-xl overflow-hidden flex flex-col pointer-events-auto shadow-2xl">
                            <div className="flex justify-between items-center p-4 border-b border-gray-800 text-white bg-gray-900">
                                <h3 className="font-bold text-lg">Viewers ({story.viewers.length})</h3>
                                <button onClick={() => { setShowViewers(false); setPaused(false); }}><HiX className="w-6 h-6" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
                                {story.viewers.map((v, i) => (
                                    <div key={i} className="flex items-center gap-3 text-white">
                                        <img src={v.user?.avatar || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-full object-cover border border-gray-700" />
                                        <div>
                                            <p className="font-medium text-sm">{v.user?.name || "Unknown User"}</p>
                                            <p className="text-xs text-gray-400">{dayjs(v.viewedAt).fromNow()}</p>
                                        </div>
                                        {/* Show reaction if any */}
                                        {story.reactions?.find(r => (r.user?._id || r.user) === (v.user?._id || v.user)) && (
                                            <span className="ml-auto text-xl">{story.reactions.find(r => (r.user?._id || r.user) === (v.user?._id || v.user)).emoji}</span>
                                        )}
                                    </div>
                                ))}
                                {story.viewers.length === 0 && <p className="text-gray-500 text-center mt-10">No views yet</p>}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default StoryViewer;
