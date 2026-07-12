import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface DashboardStats {
  metrics: {
    totalActiveVehicles: number;
    availableVehicles: number;
    vehiclesInShop: number;
    activeTrips: number;
    pendingTrips: number;
    driversOnDuty: number;
    utilizationRatio: number;
  };
  recentActivities: {
    id: string;
    tripCode: string;
    time: string;
    type: string;
    vehicle: string;
    driver: string;
    status: string;
  }[];
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data.data as DashboardStats;
    },
    // Poll every 5 seconds for real-time feel
    refetchInterval: 5000,
  });
}
