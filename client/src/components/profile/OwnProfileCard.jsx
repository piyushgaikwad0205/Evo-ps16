import { Link } from "react-router-dom";
import { CiEdit, CiLocationOn, CiSettings } from "react-icons/ci";
import { useState } from "react";
import ProfileUpdateModal from "../modals/ProfileUpdateModal";
import Tooltip from "../shared/Tooltip";
import { useTheme } from "../../contexts/ThemeContext";
import placeholder from "../../assets/placeholder.png";
import { useFollowRequests } from "../../hooks/useFollow";

const OwnProfileCard = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const { data: requests } = useFollowRequests();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={`mb-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Mobile Layout (< md) */}
      <div className="md:hidden px-4 pt-0">
        {/* Top Row: Avatar + Stats */}
        <div className="flex items-center mb-4">
          <div className="mr-6 flex-shrink-0">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-yellow-400 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur-sm"></div>
              <img
                className="relative h-20 w-20 rounded-2xl object-cover border-2 border-white dark:border-black bg-white dark:bg-black shadow-lg"
                src={(user.avatar && user.avatar.startsWith('http')) ? user.avatar : (user.avatar ? user.avatar : placeholder)}
                alt="Profile"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.src = placeholder;
                }}
              />

            </div>
          </div>

          {/* Stats */}
          {/* Stats - Grid Layout */}
          <div className="flex-1 grid grid-cols-2 gap-y-4 ml-4">
            {/* Top Left: Followers */}
            <Link to="/followers" className="flex flex-col items-center justify-center cursor-pointer group">
              <span className="font-bold text-lg group-hover:text-orange-500 transition-colors">{user.followers?.length || 0}</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Followers</span>
            </Link>

            {/* Top Right: Following */}
            <Link to="/following" className={`flex flex-col items-center justify-center cursor-pointer group border-l ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <span className="font-bold text-lg group-hover:text-orange-500 transition-colors">{user.following?.length || 0}</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Following</span>
            </Link>

            {/* Bottom Left: Connections */}
            <div className="flex flex-col items-center justify-center">
              <span className="font-bold text-lg">{user.totalConnections || 0}</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Connections</span>
            </div>

            {/* Bottom Right: Posts */}
            <div className={`flex flex-col items-center justify-center border-l ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <span className="font-bold text-lg">{user.totalPosts || 0}</span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Posts</span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mb-4">
          <div className="font-bold text-sm">{user.name}</div>
          <div className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>@{user.username}</div>
          {user.bio && (
            <p className={`text-sm whitespace-pre-wrap leading-tight mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {user.bio}
            </p>
          )}
          {user.location && (
            <div className={`flex items-center gap-1 text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <CiLocationOn />
              {user.location}
            </div>
          )}
          {user.interests && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {user.interests.split(",").map((interest, i) => (
                <span
                  key={i}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${isDarkMode
                    ? 'bg-white/10 text-gray-300'
                    : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {interest.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={handleOpenModal}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isDarkMode
              ? 'bg-white/10 text-white hover:bg-white/20'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
          >
            Edit profile
          </button>

          {requests?.length > 0 && (
            <Link
              to="/follow-requests"
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-colors relative ${isDarkMode
                ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
            >
              Requests
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
            </Link>
          )}

          <Link
            to="/devices-locations"
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-colors ${isDarkMode
              ? 'bg-white/10 text-white hover:bg-white/20'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
          >
            Devices
          </Link>
        </div>
      </div>

      {/* Desktop Layout (>= md) */}
      <div className="hidden md:flex gap-12 px-8 pt-0">
        {/* Left: Avatar */}
        <div className="w-1/3 flex justify-center pt-0">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-yellow-400 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur-sm"></div>
            <img
              className="relative h-40 w-40 rounded-2xl object-cover border-4 border-white dark:border-black bg-white dark:bg-black shadow-lg"
              src={(user.avatar && user.avatar.startsWith('http')) ? user.avatar : (user.avatar ? user.avatar : placeholder)}
              alt="Profile"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.src = placeholder;
              }}
            />

          </div>
        </div>

        {/* Right: Info */}
        <div className="w-2/3 flex flex-col gap-5">
          {/* Row 1: Name + Actions */}
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-normal">{user.name}</h2>
            <div className="flex gap-2 ml-4">
              <button
                onClick={handleOpenModal}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isDarkMode
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
              >
                Edit profile
              </button>

              {requests?.length > 0 && (
                <Link
                  to="/follow-requests"
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors relative flex items-center gap-1 ${isDarkMode
                    ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                >
                  Requests
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </Link>
              )}

              <Link
                to="/devices-locations"
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isDarkMode
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
              >
                Devices
              </Link>
            </div>
          </div>

          {/* Row 2: Stats */}
          <div className="flex gap-10 text-sm">
            <div><span className="font-bold">{user.totalPosts || 0}</span> posts</div>
            <Link to="/followers" className="cursor-pointer hover:opacity-70"><span className="font-bold">{user.followers?.length || 0}</span> followers</Link>
            <Link to="/following" className="cursor-pointer hover:opacity-70"><span className="font-bold">{user.following?.length || 0}</span> following</Link>
            <div><span className="font-bold">{user.totalConnections || 0}</span> connections</div>
          </div>

          {/* Row 3: Bio */}
          <div className="text-sm">
            <div className={`font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>@{user.username}</div>

            {/* Bio Content */}
            {user.bio && (
              <div className={`whitespace-pre-wrap mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {user.bio}
              </div>
            )}

            {/* Location */}
            {user.location && (
              <div className={`flex items-center gap-1 mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <CiLocationOn />
                <span>{user.location}</span>
              </div>
            )}

            {/* Interests (Highlights style) */}
            {user.interests && (
              <div className="flex flex-wrap gap-2 mt-3">
                {user.interests.split(",").map((interest, i) => (
                  <div
                    key={i}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${isDarkMode
                      ? 'bg-black border-gray-700 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                  >
                    {interest.trim()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Academic Details - Collapsible or subtle (Shared) */}
      {
        (user.btid || user.department || user.course) && (
          <div className={`mt-4 md:mt-8 mx-4 md:mx-8 p-4 rounded-xl border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
            <h3 className="text-sm font-bold mb-3 uppercase tracking-wider opacity-70">Academic Info</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {user.btid && <div><span className="opacity-60 block text-xs">BTID</span>{user.btid}</div>}
              {user.department && <div><span className="opacity-60 block text-xs">Dept</span>{user.department}</div>}
              {user.yearOfStudy && <div><span className="opacity-60 block text-xs">Year</span>{user.yearOfStudy}</div>}
              {user.section && <div><span className="opacity-60 block text-xs">Section</span>{user.section}</div>}
            </div>
          </div>
        )
      }

      <ProfileUpdateModal
        user={user}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div >
  );
};

export default OwnProfileCard;
