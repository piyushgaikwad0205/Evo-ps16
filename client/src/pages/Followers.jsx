import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getFollowersAction } from "../redux/actions/userActions";
import PublicProfileCard from "../components/profile/PublicProfileCard";
import CommonLoading from "../components/loader/CommonLoading";
import { useTheme } from "../contexts/ThemeContext";
import noFollow from "../assets/nofollow.jpg";

const Followers = () => {
    const dispatch = useDispatch();
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);
    const followers = useSelector((state) => state.user?.followers);

    useEffect(() => {
        const fetchFollowers = async () => {
            setLoading(true);
            await dispatch(getFollowersAction());
            setLoading(false);
        };

        fetchFollowers();
    }, [dispatch]);

    return (
        <div className={`main-section border ${isDarkMode ? 'bg-dark-bg border-white/10' : 'bg-white border-gray-200'}`}>
            {loading ? (
                <div className="flex items-center justify-center h-screen">
                    <CommonLoading />
                </div>
            ) : (
                <div>
                    <div className={`border-b py-4 px-4 ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                        <h2 className={`font-semibold text-center text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                            People following you ({followers?.length || 0})
                        </h2>
                    </div>
                    {followers?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center px-3 py-3">
                            {followers.map((user) => (
                                <PublicProfileCard key={user._id} user={user} isFollowerList={true} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center flex justify-center items-center flex-col py-8">
                            <p className={`py-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                You don't have any followers yet.
                            </p>
                            <img
                                src={noFollow}
                                alt="no followers"
                                className={`max-w-md ${isDarkMode ? 'opacity-80 invert' : ''}`}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Followers;
