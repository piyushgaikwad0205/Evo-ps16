import { useCallback } from 'react';
import { queryClient, queryKeys } from '../config/queryClient';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const getAuthToken = () => {
    const profile = localStorage.getItem('profile');
    if (!profile) return null;
    const { accessToken } = JSON.parse(profile);
    return accessToken;
};

const api = axios.create({
    baseURL: API_URL
});

api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Hook for prefetching data on hover or background
 */
export const usePrefetch = () => {
    // Prefetch user profile
    const prefetchUserProfile = useCallback((userId) => {
        if (!userId) return;

        queryClient.prefetchQuery({
            queryKey: queryKeys.userProfile(userId),
            queryFn: async () => {
                const { data } = await api.get(`/users/${userId}`);
                return data;
            },
            staleTime: 10 * 60 * 1000
        });
    }, []);

    // Prefetch user posts
    const prefetchUserPosts = useCallback((userId) => {
        if (!userId) return;

        queryClient.prefetchQuery({
            queryKey: queryKeys.userPosts(userId),
            queryFn: async () => {
                const { data } = await api.get(`/users/${userId}/posts`);
                return data;
            },
            staleTime: 5 * 60 * 1000
        });
    }, []);

    // Prefetch feed
    const prefetchFeed = useCallback(() => {
        const token = getAuthToken();
        if (!token) return; // Don't prefetch if not authenticated

        queryClient.prefetchInfiniteQuery({
            queryKey: ['feed'],
            queryFn: async () => {
                const { data } = await api.get('/posts?limit=10&skip=0');
                return {
                    posts: data?.formattedPosts || [],
                    totalPosts: data?.totalPosts || 0,
                    nextSkip: 10
                };
            },
            initialPageParam: 0,
            staleTime: 5 * 60 * 1000
        });
    }, []);

    // Prefetch communities
    const prefetchCommunities = useCallback(() => {
        const token = getAuthToken();
        if (!token) return; // Don't prefetch if not authenticated

        queryClient.prefetchQuery({
            queryKey: queryKeys.communities,
            queryFn: async () => {
                const { data } = await api.get('/communities');
                return data;
            },
            staleTime: 10 * 60 * 1000
        });
    }, []);

    // Prefetch clubs
    const prefetchClubs = useCallback(() => {
        const token = getAuthToken();
        if (!token) return; // Don't prefetch if not authenticated

        queryClient.prefetchQuery({
            queryKey: queryKeys.clubs,
            queryFn: async () => {
                const { data } = await api.get('/clubs');
                return data;
            },
            staleTime: 10 * 60 * 1000
        });
    }, []);

    // Prefetch messages
    const prefetchMessages = useCallback(() => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.conversations,
            queryFn: async () => {
                const { data } = await api.get('/messages/conversations');
                return data;
            },
            staleTime: 2 * 60 * 1000
        });
    }, []);

    // Prefetch post details
    const prefetchPost = useCallback((postId) => {
        if (!postId) return;

        queryClient.prefetchQuery({
            queryKey: queryKeys.post(postId),
            queryFn: async () => {
                const { data } = await api.get(`/posts/${postId}`);
                return data;
            },
            staleTime: 5 * 60 * 1000
        });
    }, []);

    // Prefetch community details
    const prefetchCommunity = useCallback((communityId) => {
        if (!communityId) return;

        queryClient.prefetchQuery({
            queryKey: queryKeys.community(communityId),
            queryFn: async () => {
                const { data } = await api.get(`/communities/${communityId}`);
                return data;
            },
            staleTime: 10 * 60 * 1000
        });
    }, []);

    // Prefetch club details
    const prefetchClub = useCallback((clubId) => {
        if (!clubId) return;

        queryClient.prefetchQuery({
            queryKey: queryKeys.club(clubId),
            queryFn: async () => {
                const { data } = await api.get(`/clubs/${clubId}`);
                return data;
            },
            staleTime: 10 * 60 * 1000
        });
    }, []);

    // Prefetch all common routes (call on app init)
    const prefetchCommonRoutes = useCallback(() => {
        prefetchFeed();
        prefetchCommunities();
        prefetchClubs();
    }, [prefetchFeed, prefetchCommunities, prefetchClubs]);

    return {
        prefetchUserProfile,
        prefetchUserPosts,
        prefetchFeed,
        prefetchCommunities,
        prefetchClubs,
        prefetchMessages,
        prefetchPost,
        prefetchCommunity,
        prefetchClub,
        prefetchCommonRoutes
    };
};

/**
 * Hook for link hover prefetching
 */
export const useLinkPrefetch = () => {
    const {
        prefetchUserProfile,
        prefetchUserPosts,
        prefetchPost,
        prefetchCommunity,
        prefetchClub
    } = usePrefetch();

    const handleLinkHover = useCallback((type, id) => {
        switch (type) {
            case 'user':
            case 'profile':
                prefetchUserProfile(id);
                prefetchUserPosts(id);
                break;
            case 'post':
                prefetchPost(id);
                break;
            case 'community':
                prefetchCommunity(id);
                break;
            case 'club':
                prefetchClub(id);
                break;
            default:
                break;
        }
    }, [prefetchUserProfile, prefetchUserPosts, prefetchPost, prefetchCommunity, prefetchClub]);

    return { handleLinkHover };
};
