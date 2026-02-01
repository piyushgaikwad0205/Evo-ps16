import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Configuration
 * Provides aggressive caching and stale-while-revalidate behavior
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Cache data for 5 minutes
            staleTime: 5 * 60 * 1000,

            // Keep unused data in cache for 10 minutes
            cacheTime: 10 * 60 * 1000,

            // Refetch on window focus (like Instagram)
            refetchOnWindowFocus: true,

            // Don't refetch on mount if data is fresh
            refetchOnMount: false,

            // Retry failed requests
            retry: 2,

            // Retry delay
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Keep previous data while fetching new data
            keepPreviousData: true,

            // Suspense mode disabled (we'll handle loading states)
            suspense: false,

            // Use error boundary
            useErrorBoundary: false,

            // Refetch interval (background updates)
            refetchInterval: false,

            // Refetch on reconnect
            refetchOnReconnect: true
        },
        mutations: {
            // Retry mutations once
            retry: 1,

            // Use error boundary for mutations
            useErrorBoundary: false
        }
    }
});

/**
 * Query Keys for consistent caching
 */
export const queryKeys = {
    // User
    currentUser: ['currentUser'],
    userProfile: (userId) => ['userProfile', userId],
    userPosts: (userId) => ['userPosts', userId],

    // Feed
    feed: (page = 1) => ['feed', page],

    // Posts
    post: (postId) => ['post', postId],
    postComments: (postId) => ['postComments', postId],

    // Communities
    communities: ['communities'],
    myCommunities: ['myCommunities'],
    community: (communityId) => ['community', communityId],
    communityPosts: (communityId) => ['communityPosts', communityId],

    // Clubs
    clubs: ['clubs'],
    myClubs: ['myClubs'],
    club: (clubId) => ['club', clubId],

    // Events
    events: ['events'],
    myEvents: ['myEvents'],
    event: (eventId) => ['event', eventId],

    // Surveys
    surveys: ['surveys'],
    survey: (surveyId) => ['survey', surveyId],

    // Messages
    conversations: ['conversations'],
    messages: (conversationId) => ['messages', conversationId],

    // Notifications
    notifications: ['notifications'],

    // Search
    search: (query) => ['search', query],

    // Followers/Following
    followers: (userId) => ['followers', userId],
    following: (userId) => ['following', userId],

    // Alumni
    alumni: ['alumni'],
    successStories: ['successStories'],

    // Connections
    connections: ['connections']
};

/**
 * Prefetch helper
 */
export const prefetchQuery = async (queryKey, queryFn) => {
    await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: 5 * 60 * 1000
    });
};

/**
 * Invalidate queries helper
 */
export const invalidateQueries = (queryKey) => {
    queryClient.invalidateQueries({ queryKey });
};

/**
 * Set query data helper
 */
export const setQueryData = (queryKey, data) => {
    queryClient.setQueryData(queryKey, data);
};

/**
 * Get cached query data
 */
export const getCachedData = (queryKey) => {
    return queryClient.getQueryData(queryKey);
};

/**
 * Remove query from cache
 */
export const removeQuery = (queryKey) => {
    queryClient.removeQueries({ queryKey });
};

/**
 * Clear all queries
 */
export const clearAllQueries = () => {
    queryClient.clear();
};
