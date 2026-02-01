import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Global App Store using Zustand
 * Provides instant access to cached data across all components
 */
const useAppStore = create(
    persist(
        (set, get) => ({
            // ============================================
            // USER STATE
            // ============================================
            currentUser: null,
            userProfile: null,

            setCurrentUser: (user) => set({ currentUser: user }),
            setUserProfile: (profile) => set({ userProfile: profile }),

            clearUser: () => set({
                currentUser: null,
                userProfile: null
            }),

            // ============================================
            // FEED STATE (Home Page)
            // ============================================
            feedPosts: [],
            feedPage: 1,
            feedHasMore: true,
            feedLastFetch: null,

            setFeedPosts: (posts) => set({
                feedPosts: posts,
                feedLastFetch: Date.now()
            }),

            appendFeedPosts: (newPosts) => set((state) => ({
                feedPosts: [...state.feedPosts, ...newPosts],
                feedPage: state.feedPage + 1,
                feedLastFetch: Date.now()
            })),

            updateFeedPost: (postId, updates) => set((state) => ({
                feedPosts: state.feedPosts.map(post =>
                    post._id === postId ? { ...post, ...updates } : post
                )
            })),

            removeFeedPost: (postId) => set((state) => ({
                feedPosts: state.feedPosts.filter(post => post._id !== postId)
            })),

            setFeedHasMore: (hasMore) => set({ feedHasMore: hasMore }),

            resetFeed: () => set({
                feedPosts: [],
                feedPage: 1,
                feedHasMore: true,
                feedLastFetch: null
            }),

            // ============================================
            // PROFILE STATE
            // ============================================
            profilePosts: {},
            profileData: {},

            setProfilePosts: (userId, posts) => set((state) => ({
                profilePosts: {
                    ...state.profilePosts,
                    [userId]: posts
                }
            })),

            setProfileData: (userId, data) => set((state) => ({
                profileData: {
                    ...state.profileData,
                    [userId]: data
                }
            })),

            updateProfilePost: (userId, postId, updates) => set((state) => ({
                profilePosts: {
                    ...state.profilePosts,
                    [userId]: state.profilePosts[userId]?.map(post =>
                        post._id === postId ? { ...post, ...updates } : post
                    ) || []
                }
            })),

            // ============================================
            // COMMUNITIES STATE
            // ============================================
            communities: [],
            myCommunities: [],
            communitiesLastFetch: null,

            setCommunities: (communities) => set({
                communities,
                communitiesLastFetch: Date.now()
            }),

            setMyCommunities: (communities) => set({ myCommunities: communities }),

            updateCommunity: (communityId, updates) => set((state) => ({
                communities: state.communities.map(c =>
                    c._id === communityId ? { ...c, ...updates } : c
                )
            })),

            // ============================================
            // CLUBS STATE
            // ============================================
            clubs: [],
            myClubs: [],
            clubsLastFetch: null,

            setClubs: (clubs) => set({
                clubs,
                clubsLastFetch: Date.now()
            }),

            setMyClubs: (clubs) => set({ myClubs: clubs }),

            // ============================================
            // EVENTS STATE
            // ============================================
            events: [],
            myEvents: [],
            eventsLastFetch: null,

            setEvents: (events) => set({
                events,
                eventsLastFetch: Date.now()
            }),

            setMyEvents: (events) => set({ myEvents: events }),

            // ============================================
            // SURVEYS STATE
            // ============================================
            surveys: [],
            surveysLastFetch: null,

            setSurveys: (surveys) => set({
                surveys,
                surveysLastFetch: Date.now()
            }),

            // ============================================
            // MESSAGES STATE
            // ============================================
            conversations: [],
            activeConversation: null,
            messages: {},

            setConversations: (conversations) => set({ conversations }),

            setActiveConversation: (conversation) => set({
                activeConversation: conversation
            }),

            setMessages: (conversationId, messages) => set((state) => ({
                messages: {
                    ...state.messages,
                    [conversationId]: messages
                }
            })),

            addMessage: (conversationId, message) => set((state) => ({
                messages: {
                    ...state.messages,
                    [conversationId]: [
                        ...(state.messages[conversationId] || []),
                        message
                    ]
                }
            })),

            // ============================================
            // NOTIFICATIONS STATE
            // ============================================
            notifications: [],
            unreadCount: 0,

            setNotifications: (notifications) => set({ notifications }),

            setUnreadCount: (count) => set({ unreadCount: count }),

            markNotificationAsRead: (notificationId) => set((state) => ({
                notifications: state.notifications.map(n =>
                    n._id === notificationId ? { ...n, read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            })),

            // ============================================
            // SEARCH STATE
            // ============================================
            searchResults: {
                users: [],
                posts: [],
                communities: [],
                clubs: []
            },
            recentSearches: [],

            setSearchResults: (results) => set({ searchResults: results }),

            addRecentSearch: (query) => set((state) => ({
                recentSearches: [
                    query,
                    ...state.recentSearches.filter(q => q !== query)
                ].slice(0, 10)
            })),

            clearRecentSearches: () => set({ recentSearches: [] }),

            // ============================================
            // AI CHAT STATE
            // ============================================
            aiMessages: [],
            aiChatHistory: [],
            aiThreadId: null,

            setAiMessages: (messages) => set({ aiMessages: messages }),
            addAiMessage: (message) => set((state) => ({ aiMessages: [...state.aiMessages, message] })),
            setAiChatHistory: (history) => set({ aiChatHistory: history }),
            addToAiChatHistory: (chat) => set((state) => ({ aiChatHistory: [...state.aiChatHistory, chat] })),
            setAiThreadId: (id) => set({ aiThreadId: id }),
            removeFromAiChatHistory: (id) => set((state) => ({
                aiChatHistory: state.aiChatHistory.filter(c => c.id !== id)
            })),
            clearAiChat: () => set({ aiMessages: [], aiThreadId: null }),

            // ============================================
            // UI STATE
            // ============================================
            isLeftbarOpen: false,
            isRightbarOpen: true,

            toggleLeftbar: () => set((state) => ({
                isLeftbarOpen: !state.isLeftbarOpen
            })),

            setLeftbarOpen: (isOpen) => set({ isLeftbarOpen: isOpen }),

            toggleRightbar: () => set((state) => ({
                isRightbarOpen: !state.isRightbarOpen
            })),

            // ============================================
            // CACHE HELPERS
            // ============================================
            isFeedStale: () => {
                const { feedLastFetch } = get();
                if (!feedLastFetch) return true;
                const STALE_TIME = 5 * 60 * 1000; // 5 minutes
                return Date.now() - feedLastFetch > STALE_TIME;
            },

            isCommunitiesStale: () => {
                const { communitiesLastFetch } = get();
                if (!communitiesLastFetch) return true;
                const STALE_TIME = 10 * 60 * 1000; // 10 minutes
                return Date.now() - communitiesLastFetch > STALE_TIME;
            },

            isClubsStale: () => {
                const { clubsLastFetch } = get();
                if (!clubsLastFetch) return true;
                const STALE_TIME = 10 * 60 * 1000; // 10 minutes
                return Date.now() - clubsLastFetch > STALE_TIME;
            },

            // ============================================
            // CLEAR ALL DATA (Logout)
            // ============================================
            clearAllData: () => set({
                currentUser: null,
                userProfile: null,
                feedPosts: [],
                feedPage: 1,
                feedHasMore: true,
                feedLastFetch: null,
                profilePosts: {},
                profileData: {},
                communities: [],
                myCommunities: [],
                communitiesLastFetch: null,
                clubs: [],
                myClubs: [],
                clubsLastFetch: null,
                events: [],
                myEvents: [],
                eventsLastFetch: null,
                surveys: [],
                surveysLastFetch: null,
                conversations: [],
                activeConversation: null,
                messages: {},
                notifications: [],
                unreadCount: 0,
                searchResults: {
                    users: [],
                    posts: [],
                    communities: [],
                    clubs: []
                },
                recentSearches: []
            })
        }),
        {
            name: 'campus-connect-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist essential data
                currentUser: state.currentUser,
                feedPosts: state.feedPosts.slice(0, 20), // Keep only first 20 posts
                recentSearches: state.recentSearches
            })
        }
    )
);

export default useAppStore;
