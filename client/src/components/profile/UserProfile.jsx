import { useEffect, useState, memo, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PostOnProfile from "../post/PostOnProfile";
import OwnProfileCard from "./OwnProfileCard";
import CommonLoading from "../loader/CommonLoading";
import AppliedEvents from "./AppliedEvents";
import NoPost from "../../assets/nopost.jpg";
import { API } from "../../redux/api/utils";
import eventService from "../../services/eventService";
import { BsGrid3X3, BsPeople, BsCalendarEvent } from "react-icons/bs";
import { useUserProfile } from "../../hooks/useApi";
import useAppStore from "../../store/useAppStore";

const UserProfile = ({ userData }) => {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth?.userData);
  const { accessToken } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();

  // Zustand Store
  const { profileData } = useAppStore();
  const cachedUser = profileData[userData._id];

  // React Query Hook for user profile
  const { data: fetchedUser, isLoading: isUserLoading } = useUserProfile(userData._id);

  // Use cached data first, then fresh data
  const user = fetchedUser || cachedUser;
  const posts = user?.posts;

  const [activeTab, setActiveTab] = useState("posts");

  // React Query for clubs (only fetch when clubs tab is active)
  const { data: clubs = [], isLoading: clubsLoading, refetch: refetchClubs } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const res = await API.get("/clubs");
      return res.data || [];
    },
    enabled: activeTab === 'clubs', // Only fetch when needed
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });

  // React Query for event registrations (only fetch when events tab is active)
  const { data: registrations = [] } = useQuery({
    queryKey: ['event-registrations'],
    queryFn: async () => {
      if (!accessToken) return [];
      return await eventService.getUserRegistrations(accessToken);
    },
    enabled: activeTab === 'events' && !!accessToken,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  });

  const registrationsCount = registrations.length;
  const statusCounts = useMemo(() => {
    return registrations.reduce((acc, reg) => {
      acc[reg.status] = (acc[reg.status] || 0) + 1;
      return acc;
    }, { pending: 0, approved: 0, rejected: 0 });
  }, [registrations]);

  // Pull to refresh disabled for better mobile experience
  // Users can use browser's native refresh if needed

  const MemoizedPostOnProfile = memo(PostOnProfile);

  const postToShow = useMemo(() => {
    return posts?.map((post) => (
      <MemoizedPostOnProfile key={post._id} post={post} />
    ));
  }, [posts]);

  return (
    <div className="min-h-screen dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      {(!user && isUserLoading) ? (
        <div className="flex justify-center items-center h-screen">
          <CommonLoading />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto pt-0">
          <OwnProfileCard user={user} />

          {/* Instagram-style Tabs */}
          <div className="border-t border-gray-200 dark:border-white/10">
            <div className="flex justify-center gap-8 md:gap-16">
              <button
                className={`flex items-center gap-2 py-4 text-xs md:text-sm font-semibold tracking-widest uppercase transition-colors border-t-2 -mt-px ${activeTab === "posts"
                  ? "border-black dark:border-white text-black dark:text-white"
                  : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                onClick={() => setActiveTab("posts")}
              >
                <BsGrid3X3 size={12} className="md:w-3 md:h-3" />
                <span className="hidden md:inline">Posts</span>
              </button>

              <button
                className={`flex items-center gap-2 py-4 text-xs md:text-sm font-semibold tracking-widest uppercase transition-colors border-t-2 -mt-px ${activeTab === "clubs"
                  ? "border-black dark:border-white text-black dark:text-white"
                  : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                onClick={() => setActiveTab("clubs")}
              >
                <BsPeople size={14} className="md:w-3.5 md:h-3.5" />
                <span className="hidden md:inline">Clubs</span>
              </button>

              <button
                className={`flex items-center gap-2 py-4 text-xs md:text-sm font-semibold tracking-widest uppercase transition-colors border-t-2 -mt-px ${activeTab === "events"
                  ? "border-black dark:border-white text-black dark:text-white"
                  : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                onClick={() => setActiveTab("events")}
              >
                <BsCalendarEvent size={12} className="md:w-3 md:h-3" />
                <span className="hidden md:inline">Events</span>
              </button>


            </div>
          </div>

          {activeTab === "posts" ? (
            postToShow?.length === 0 ? (
              <div className="text-center text-gray-700 dark:text-gray-400 flex justify-center items-center flex-col py-12 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                <p className="font-semibold text-lg mb-4">
                  You haven't posted anything yet
                </p>
                <img className="w-64 opacity-75 dark:opacity-60 dark:invert rounded-2xl" src={NoPost} alt="no post" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 md:gap-4">
                {postToShow}
              </div>
            )
          ) : activeTab === "clubs" ? (
            <div className="">
              {clubsLoading ? (
                <div className="flex justify-center py-12">
                  <CommonLoading />
                </div>
              ) : clubs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                  No clubs available.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clubs.map((club) => {
                    const isMember = club.members?.some?.((m) => (m._id || m).toString() === (authUser._id || authUser.id));
                    return (
                      <div key={club._id} className="group relative overflow-hidden rounded-3xl border border-gray-100 dark:border-white/10 bg-white dark:bg-black/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <div className="p-5">
                          <div className="flex items-center gap-4">
                            {club.banner ? (
                              <img src={club.banner} alt={club.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/10" />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 dark:text-white truncate">{club.name}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{club.members?.length || 0} members</p>
                            </div>
                          </div>

                          <div className="mt-5 flex items-center justify-between gap-3">
                            <a
                              href={`/clubs/${club._id}`}
                              className="flex-1 text-center py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                              View Details
                            </a>
                            {isMember ? (
                              <button
                                onClick={async () => {
                                  await API.post(`/clubs/${club._id}/leave`);
                                  refetchClubs();
                                }}
                                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                Leave
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  await API.post(`/clubs/${club._id}/join`);
                                  refetchClubs();
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/20"
                              >
                                Join
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === "events" ? (
            <AppliedEvents />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
