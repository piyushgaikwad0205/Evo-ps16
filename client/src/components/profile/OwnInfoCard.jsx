const OwnInfoCard = ({ user }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';

  return (
    <div className={`rounded-3xl p-6 space-y-4 mb-6 transition-all duration-300 ${isDarkMode
      ? 'bg-black/20 backdrop-blur-xl border border-white/10'
      : 'bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl'
      }`}>
      <div className="flex flex-wrap items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile Summary</h3>
        <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
          Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
          <div className={`text-xs font-medium uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Total Posts</div>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.totalPosts}</div>
        </div>
        <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
          <div className={`text-xs font-medium uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Communities</div>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.totalCommunities}</div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {user.totalPosts > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Posts in Communities</div>
            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {user.totalPosts} in {user.totalPostCommunities}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Followers</div>
          <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {user.followers?.length ?? 0}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Following</div>
          <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {user.following?.length ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnInfoCard;
