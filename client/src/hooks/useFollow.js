import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from '../redux/api/utils';

export const useCheckFollowStatus = (targetUserId) => {
    return useQuery({
        queryKey: ['followStatus', targetUserId],
        queryFn: async () => {
            const { data } = await API.get(`/follows/status/${targetUserId}`);
            return data;
        },
        enabled: !!targetUserId,
        staleTime: 0 // Always fresh
    });
};

export const useFollowUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (targetUserId) => {
            const { data } = await API.post('/follows/follow', { targetUserId });
            return data;
        },
        onSuccess: (_, targetUserId) => {
            queryClient.invalidateQueries({ queryKey: ['followStatus', targetUserId] });
            queryClient.invalidateQueries({ queryKey: ['userProfile', targetUserId] });
        }
    });
};

export const useUnfollowUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (targetUserId) => {
            const { data } = await API.delete(`/follows/unfollow/${targetUserId}`);
            return data;
        },
        onSuccess: (_, targetUserId) => {
            queryClient.invalidateQueries({ queryKey: ['followStatus', targetUserId] });
            queryClient.invalidateQueries({ queryKey: ['userProfile', targetUserId] });
        }
    });
};

export const useRemoveFollower = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (targetUserId) => {
            const { data } = await API.delete(`/follows/remove-follower/${targetUserId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['followers'] });
        }
    });
};

export const useFollowRequests = () => {
    return useQuery({
        queryKey: ['followRequests'],
        queryFn: async () => {
            const { data } = await API.get('/follows/requests');
            return data.requests;
        },
        refetchInterval: 5000 // Poll every 5 seconds for real-time updates
    });
};

export const useRespondToRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ requestId, action }) => {
            const { data } = await API.post(`/follows/requests/${requestId}`, { action });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['followRequests'] });
            queryClient.invalidateQueries({ queryKey: ['followers'] });
        }
    });
};
