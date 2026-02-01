import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getStoryFeed } from '../../redux/api/storyAPI';
import { HiPlus } from 'react-icons/hi';
import StoryViewer from './StoryViewer';
import CreateStory from './CreateStory';

const StoryFeed = () => {
    const { userData } = useSelector((state) => state.auth);
    const [stories, setStories] = useState([]);
    const [groupedStories, setGroupedStories] = useState({});
    const [loading, setLoading] = useState(true);
    const [viewingUser, setViewingUser] = useState(null); // User ID whose stories we are viewing
    const [showCreate, setShowCreate] = useState(false);

    const fetchStories = async () => {
        try {
            const { data } = await getStoryFeed();
            setStories(data);

            // Group by user
            const grouped = {};
            data.forEach(story => {
                const uid = story.user._id;
                if (!grouped[uid]) {
                    grouped[uid] = {
                        user: story.user,
                        stories: []
                    };
                }
                grouped[uid].stories.push(story);
            });
            setGroupedStories(grouped);
        } catch (error) {
            console.error("Failed to fetch stories", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const handleUserClick = (userId) => {
        setViewingUser(userId);
    };

    const myStories = groupedStories[userData?._id]?.stories || [];
    const otherUsers = Object.values(groupedStories).filter(g => g.user._id !== userData?._id);

    return (
        <div
            className="w-full overflow-x-auto py-2 scrollbar-hide"
            style={{ touchAction: 'pan-x pan-y' }}
        >
            <div className="flex space-x-4 min-w-max px-4">
                {/* My Story / Create */}
                <div className="flex flex-col items-center space-y-1 cursor-pointer" onClick={() => myStories.length > 0 ? handleUserClick(userData._id) : setShowCreate(true)}>
                    <div className="relative">
                        <div className={`w-16 h-16 rounded-full p-[2px] ${myStories.length > 0 ? 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-600' : ''}`}>
                            <div className="bg-white dark:bg-black rounded-full p-[2px] w-full h-full">
                                <img
                                    src={userData?.avatar || "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg"}
                                    alt="My Story"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                        </div>
                        {myStories.length === 0 && (
                            <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 border-2 border-white dark:border-black">
                                <HiPlus className="w-3 h-3" />
                            </div>
                        )}
                    </div>
                    <span className="text-xs font-normal text-gray-900 dark:text-gray-200">Your Story</span>
                </div>

                {/* Other Users */}
                {otherUsers.map(({ user, stories }) => {
                    const allViewed = stories.every(s => s.viewers.some(v => v.user === userData?._id));
                    return (
                        <div key={user._id} className="flex flex-col items-center space-y-1 cursor-pointer" onClick={() => handleUserClick(user._id)}>
                            <div className={`w-16 h-16 rounded-full p-[2px] ${allViewed ? 'bg-gray-300 dark:bg-gray-700' : 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-600'}`}>
                                <div className="bg-white dark:bg-black rounded-full p-[2px] w-full h-full">
                                    <img
                                        src={user.avatar || "https://raw.githubusercontent.com/nz-m/public-files/main/dp.jpg"}
                                        alt={user.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                            </div>
                            <span className="text-xs font-normal text-gray-900 dark:text-gray-200 w-16 truncate text-center">{user.name.split(' ')[0]}</span>
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            {showCreate && <CreateStory onClose={() => setShowCreate(false)} onCreated={fetchStories} />}
            {viewingUser && (
                <StoryViewer
                    stories={groupedStories[viewingUser].stories}
                    user={groupedStories[viewingUser].user}
                    onClose={() => setViewingUser(null)}
                    currentUserId={userData?._id}
                />
            )}
        </div>
    );
};

export default StoryFeed;
