import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Vehicle, CreateVehicleInput } from '@transitops/shared/schemas/vehicle.schema';

export function useVehicles(filters?: { search?: string; type?: string; status?: string }) {
  return useQuery({
    queryKey: ['vehicles', filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (filters?.search) searchParams.set('search', filters.search);
      if (filters?.type) searchParams.set('type', filters.type);
      if (filters?.status) searchParams.set('status', filters.status);
      
      const res = await api.get(`/vehicles?${searchParams.toString()}`);
      return res.data.vehicles as Vehicle[];
    },
    refetchInterval: 30_000, // as per SDD
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateVehicleInput) => {
      const res = await api.post('/vehicles', data);
      return res.data.vehicle as Vehicle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useRetireVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/vehicles/${id}/retire`);
      return res.data.vehicle as Vehicle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
