import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys, queryClient } from '../config/queryClient';
import axios from 'axios';
import useAppStore from '../store/useAppStore';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// Get auth token
const getAuthToken = () => {
    const profile = localStorage.getItem('profile');
    if (!profile) return null;
    const { accessToken } = JSON.parse(profile);
    return accessToken;
};

// Axios instance with auth
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ============================================
// FEED HOOKS
// ============================================

/**
 * Fetch feed with infinite scroll
 */
/**
 * Fetch feed with infinite scroll
 */
export const useFeed = (feedType = "following", collegeId = null) => {

    return useInfiniteQuery({
        queryKey: ['feed', feedType, collegeId],
        queryFn: async ({ pageParam = 0 }) => {
            const limit = 10;
            let url = `/posts?limit=${limit}&skip=${pageParam}&type=${feedType}`;
            if (collegeId) {
                url += `&collegeId=${collegeId}`;
            }
            const { data } = await api.get(url);

            // Ensure we always return a valid structure
            return {
                posts: Array.isArray(data?.formattedPosts) ? data.formattedPosts : [],
                totalPosts: typeof data?.totalPosts === 'number' ? data.totalPosts : 0,
                nextSkip: pageParam + limit
            };
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            // If no last page or invalid structure, no next page
            if (!lastPage || !lastPage.posts) {
                return undefined;
            }

            // If we have no posts, no next page
            if (!Array.isArray(lastPage.posts) || lastPage.posts.length === 0) {
                return undefined;
            }

            // If we've fetched all posts, no next page
            if (lastPage.nextSkip >= lastPage.totalPosts) {
                return undefined;
            }

            // Return the next skip value
            return lastPage.nextSkip;
        },
        enabled: true,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000, // Updated from cacheTime (deprecated in newer versions)
        refetchOnWindowFocus: false,
        retry: 2
    });
};

/**
 * Fetch list of colleges
 */
export const useColleges = () => {
    return useQuery({
        queryKey: ['colleges'],
        queryFn: async () => {
            const { data } = await api.get('/colleges');
            return data || [];
        },
        staleTime: 60 * 60 * 1000 // Cache for 1 hour
    });
};

/**
 * Prefetch feed (call on app load or hover)
 */
export const usePrefetchFeed = () => {
    return () => {
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
    };
};

// ============================================
// USER PROFILE HOOKS
// ============================================

/**
 * Fetch user profile
 */
export const useUserProfile = (userId) => {
    const { setProfileData } = useAppStore();

    return useQuery({
        queryKey: queryKeys.userProfile(userId),
        queryFn: async () => {
            const { data } = await api.get(`/users/${userId}`);
            return data;
        },
        enabled: !!userId,
        onSuccess: (data) => {
            setProfileData(userId, data);
        },
        staleTime: 10 * 60 * 1000
    });
};

/**
 * Fetch user posts
 */
export const useUserPosts = (userId) => {
    const { setProfilePosts } = useAppStore();

    return useQuery({
        queryKey: queryKeys.userPosts(userId),
        queryFn: async () => {
            const { data } = await api.get(`/users/${userId}/posts`);
            return data;
        },
        enabled: !!userId,
        onSuccess: (data) => {
            setProfilePosts(userId, data.posts || []);
        },
        staleTime: 5 * 60 * 1000
    });
};

/**
 * Prefetch user profile (call on hover)
 */
export const usePrefetchUserProfile = () => {
    return (userId) => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.userProfile(userId),
            queryFn: async () => {
                const { data } = await api.get(`/users/${userId}`);
                return data;
            },
            staleTime: 10 * 60 * 1000
        });
    };
};

// ============================================
// COMMUNITIES HOOKS
// ============================================

/**
 * Fetch all communities
 */
export const useCommunities = () => {
    const { setCommunities, isCommunitiesStale } = useAppStore();

    return useQuery({
        queryKey: queryKeys.communities,
        queryFn: async () => {
            const { data } = await api.get('/communities');
            return data;
        },
        enabled: isCommunitiesStale(),
        onSuccess: (data) => {
            setCommunities(data.communities || []);
        },
        staleTime: 10 * 60 * 1000
    });
};

/**
 * Fetch my communities
 */
export const useMyCommunities = () => {
    const { setMyCommunities } = useAppStore();

    return useQuery({
        queryKey: queryKeys.myCommunities,
        queryFn: async () => {
            const { data } = await api.get('/communities/my');
            return data;
        },
        onSuccess: (data) => {
            setMyCommunities(data.communities || []);
        },
        staleTime: 10 * 60 * 1000
    });
};

// ============================================
// CLUBS HOOKS
// ============================================

/**
 * Fetch all clubs
 */
export const useClubs = () => {
    const { setClubs, isClubsStale } = useAppStore();

    return useQuery({
        queryKey: queryKeys.clubs,
        queryFn: async () => {
            const { data } = await api.get('/clubs');
            return data;
        },
        enabled: isClubsStale(),
        onSuccess: (data) => {
            setClubs(data.clubs || []);
        },
        staleTime: 10 * 60 * 1000
    });
};

// ============================================
// MESSAGES HOOKS
// ============================================

/**
 * Fetch conversations
 */
export const useConversations = () => {
    const { setConversations } = useAppStore();

    return useQuery({
        queryKey: queryKeys.conversations,
        queryFn: async () => {
            const { data } = await api.get('/messages/conversations');
            return data;
        },
        onSuccess: (data) => {
            setConversations(data.conversations || []);
        },
        staleTime: 2 * 60 * 1000,
        refetchInterval: 30000 // Refetch every 30 seconds
    });
};

/**
 * Fetch messages for a conversation
 */
export const useMessages = (conversationId) => {
    const { setMessages } = useAppStore();

    return useQuery({
        queryKey: queryKeys.messages(conversationId),
        queryFn: async () => {
            const { data } = await api.get(`/messages/${conversationId}`);
            return data;
        },
        enabled: !!conversationId,
        onSuccess: (data) => {
            setMessages(conversationId, data.messages || []);
        },
        staleTime: 1 * 60 * 1000,
        refetchInterval: 5000 // Refetch every 5 seconds for real-time feel
    });
};

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create post mutation
 */
export const useCreatePost = () => {
    const { feedPosts, setFeedPosts } = useAppStore();

    return useMutation({
        mutationFn: async (postData) => {
            const { data } = await api.post('/posts', postData);
            return data;
        },
        onSuccess: (newPost) => {
            // Optimistically add to feed
            setFeedPosts([newPost, ...feedPosts]);

            // Invalidate feed query
            queryClient.invalidateQueries({ queryKey: ['feed'] });
        }
    });
};

/**
 * Like post mutation
 */
export const useLikePost = () => {
    const { updateFeedPost, updateProfilePost } = useAppStore();

    return useMutation({
        mutationFn: async (postId) => {
            const { data } = await api.post(`/posts/${postId}/like`);
            return data;
        },
        onMutate: async (postId) => {
            // Optimistic update
            updateFeedPost(postId, {
                isLiked: true,
                likesCount: (prev) => prev + 1
            });
        },
        onError: (error, postId) => {
            // Revert on error
            updateFeedPost(postId, {
                isLiked: false,
                likesCount: (prev) => prev - 1
            });
        }
    });
};

/**
 * Delete post mutation
 */
export const useDeletePost = () => {
    const { removeFeedPost } = useAppStore();

    return useMutation({
        mutationFn: async (postId) => {
            await api.delete(`/posts/${postId}`);
            return postId;
        },
        onSuccess: (postId) => {
            removeFeedPost(postId);
            queryClient.invalidateQueries({ queryKey: ['feed'] });
        }
    });
};

// ============================================
// SEARCH HOOKS
// ============================================

/**
 * Search with debouncing
 */
export const useSearch = (query, enabled = true) => {
    const { setSearchResults } = useAppStore();

    return useQuery({
        queryKey: queryKeys.search(query),
        queryFn: async () => {
            const { data } = await api.get(`/search?q=${query}`);
            return data;
        },
        enabled: enabled && (query?.length > 2),
        onSuccess: (data) => {
            setSearchResults(data);
        },
        staleTime: 5 * 60 * 1000
    });
};

// ============================================
// ALUMNI HOOKS
// ============================================

/**
 * Fetch alumni directory
 */
export const useAlumniDirectory = (search = '') => {
    return useQuery({
        queryKey: ['alumni', search],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            params.append('limit', 12);
            const { data } = await api.get(`/alumni/directory?${params}`);
            return data.alumni || [];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes cache
        keepPreviousData: true
    });
};

/**
 * Fetch success stories
 */
export const useSuccessStories = (search = '') => {
    return useQuery({
        queryKey: ['stories', search],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            params.append('limit', 10);
            const { data } = await api.get(`/success-stories?${params}`);
            return data.stories || [];
        },
        staleTime: 10 * 60 * 1000,
        keepPreviousData: true
    });
};

// ============================================
// COLLABS HOOKS
// ============================================

/**
 * Fetch collaborations
 */
export const useCollabs = () => {
    return useQuery({
        queryKey: ['collabs'],
        queryFn: async () => {
            const { data } = await api.get('/collabs');
            return data || [];
        },
        staleTime: 5 * 60 * 1000
    });
};

/**
 * Interest in collab mutation
 */
export const useInterestCollab = () => {
    return useMutation({
        mutationFn: async (collabId) => {
            const { data } = await api.post(`/collabs/${collabId}/interest`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collabs'] });
        }
    });
};

// ============================================
// SURVEYS HOOKS
// ============================================

/**
 * Fetch surveys
 */
export const useSurveys = (params = {}) => {
    return useQuery({
        queryKey: ['surveys', params],
        queryFn: async () => {
            // Flatten params or pass as is?
            // api.get supports params object.
            // But we need to ensure keys are stable.
            const { data } = await api.get('/surveys', { params });
            return data;
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: (previousData) => previousData, // keepPreviousData is deprecated in v5, use placeholderData
    });
};
