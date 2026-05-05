import { API_V1 } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface UseUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  branchId?: string;
  search?: string;
}

export function useUsers(params: UseUsersParams = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await axios.get(`${API_V1}/users`, { params });
      return response.data;
    },
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const response = await axios.put(`${API_V1}/users/${userId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

interface InviteUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  branchId: string;
  phone?: string;
}

export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: InviteUserPayload) => {
      const response = await axios.post(`${API_V1}/users/invite`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await fetch(`${API_V1}/branches?page=1&limit=100`, { credentials: 'include' });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load branches");
      }
      
      const list = Array.isArray(data) ? data
        : Array.isArray(data?.data) ? data.data
        : Array.isArray(data?.data?.data) ? data.data.data
        : Array.isArray(data?.data?.content) ? data.data.content
        : Array.isArray(data?.data?.items) ? data.data.items
        : Array.isArray(data?.content) ? data.content
        : Array.isArray(data?.items) ? data.items
        : Array.isArray(data?.branches) ? data.branches
        : [];
        
      return list;
    }
  });
}
