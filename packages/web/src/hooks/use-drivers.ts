import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Driver, CreateDriverInput } from '@transitops/shared/schemas/driver.schema';

export function useDrivers(filters?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: ['drivers', filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (filters?.search) searchParams.set('search', filters.search);
      if (filters?.status) searchParams.set('status', filters.status);
      
      const res = await api.get(`/drivers?${searchParams.toString()}`);
      return res.data.drivers as Driver[];
    },
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateDriverInput) => {
      const res = await api.post('/drivers', data);
      return res.data.driver as Driver;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useUpdateDriverStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await api.patch(`/drivers/${id}/status`, { status });
      return res.data.driver as Driver;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/drivers/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}
