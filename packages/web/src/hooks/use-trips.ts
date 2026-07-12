import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Trip, CreateTripInput } from '@transitops/shared/schemas/trip.schema';

export function useTrips(filters?: { status?: string }) {
  return useQuery({
    queryKey: ['trips', filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (filters?.status) searchParams.set('status', filters.status);
      
      const res = await api.get(`/trips?${searchParams.toString()}`);
      return res.data.trips as (Trip & { vehicleName: string, vehicleRegistration: string, driverName: string })[];
    },
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateTripInput) => {
      const res = await api.post('/trips', data);
      return res.data.trip as Trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useUpdateTripStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await api.patch(`/trips/${id}/status`, { status });
      return res.data.trip as Trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}
