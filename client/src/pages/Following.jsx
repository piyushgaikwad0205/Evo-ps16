import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getFollowingUsersAction } from "../redux/actions/userActions";
import PublicProfileCard from "../components/profile/PublicProfileCard";
import CommonLoading from "../components/loader/CommonLoading";
import { useTheme } from "../contexts/ThemeContext";
import noFollow from "../assets/nofollow.jpg";

const Following = () => {
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const followingUsers = useSelector((state) => state.user?.followingUsers);

  useEffect(() => {
    const fetchFollowingUsers = async () => {
      setLoading(true);
      await dispatch(getFollowingUsersAction());
      setLoading(false);
    };

    fetchFollowingUsers();
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
              People you're following ({followingUsers?.length || 0})
            </h2>
          </div>
          {followingUsers?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center px-3 py-3">
              {followingUsers.map((user) => (
                <PublicProfileCard key={user._id} user={user} />
              ))}
            </div>
          ) : (
            <div className="text-center flex justify-center items-center flex-col py-8">
              <p className={`py-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                You are not following anyone yet.
              </p>
              <img
                src={noFollow}
                alt="no following"
                className={`max-w-md ${isDarkMode ? 'opacity-80 invert' : ''}`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Following;
