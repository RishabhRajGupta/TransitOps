"use client";

import React, { useEffect } from 'react';
import { useDashboardStats } from '../../../hooks/use-dashboard';
import '../dashboard.css';

export default function FleetManagerDashboard() {
  const { data, isLoading } = useDashboardStats();

  useEffect(() => {
    // Dark mode body fix since layout might have light bg
    document.body.style.backgroundColor = '#121212';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  const metrics = data?.metrics || {
    totalActiveVehicles: 0,
    availableVehicles: 0,
    vehiclesInShop: 0,
    activeTrips: 0,
    pendingTrips: 0,
    driversOnDuty: 0,
    utilizationRatio: 0,
  };
  
  const recentActivities = data?.recentActivities || [];

  // Derived metrics for Vehicle Status bars
  const totalVehicles = metrics.totalActiveVehicles || 1; // Prevent div by 0
  const availPct = Math.min((metrics.availableVehicles / totalVehicles) * 100, 100);
  const onTripPct = Math.min((metrics.activeTrips / totalVehicles) * 100, 100);
  const shopPct = Math.min((metrics.vehiclesInShop / totalVehicles) * 100, 100);
  const retiredPct = 0; // Keeping simple for now

  return (
    <div className="dashboard-dark-page">
      {/* Filters (Visual only for matching reference) */}
      <div className="dashboard-filters">
        <div className="filter-group">
          <label>Filters</label>
          <select className="filter-select">
            <option>Vehicle Type: All</option>
          </select>
        </div>
        <div className="filter-group">
          <label>&nbsp;</label>
          <select className="filter-select">
            <option>Status: All</option>
          </select>
        </div>
        <div className="filter-group">
          <label>&nbsp;</label>
          <select className="filter-select">
            <option>Region: All</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-kpi-grid">
        <div className="kpi-card border-blue">
          <span className="kpi-label">Active Vehicles</span>
          <span className="kpi-value">{metrics.totalActiveVehicles}</span>
        </div>
        <div className="kpi-card border-green">
          <span className="kpi-label">Available Vehicles</span>
          <span className="kpi-value">{metrics.availableVehicles}</span>
        </div>
        <div className="kpi-card border-orange">
          <span className="kpi-label">Vehicles in Maintenance</span>
          <span className="kpi-value">{metrics.vehiclesInShop}</span>
        </div>
        <div className="kpi-card border-blue">
          <span className="kpi-label">Active Trips</span>
          <span className="kpi-value">{metrics.activeTrips}</span>
        </div>
        <div className="kpi-card border-blue">
          <span className="kpi-label">Pending Trips</span>
          <span className="kpi-value">{metrics.pendingTrips}</span>
        </div>
        <div className="kpi-card border-blue">
          <span className="kpi-label">Drivers on Duty</span>
          <span className="kpi-value">{metrics.driversOnDuty}</span>
        </div>
        <div className="kpi-card border-green">
          <span className="kpi-label">Fleet Utilization</span>
          <span className="kpi-value">{metrics.utilizationRatio}%</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-main-grid">
        {/* Left: Recent Trips Table */}
        <div>
          <h2 className="section-title">Recent Trips {isLoading && <span style={{ textTransform: 'none', marginLeft: '10px', fontSize: '12px' }}>(Syncing...)</span>}</h2>
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Trip</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map(act => (
                  <tr key={act.id}>
                    <td className="trip-code">{act.tripCode}</td>
                    <td>{act.vehicle}</td>
                    <td>{act.driver}</td>
                    <td>
                      <span className={`status-pill ${act.status.toLowerCase()}`}>
                        {act.status}
                      </span>
                    </td>
                    <td>{act.time}</td>
                  </tr>
                ))}
                {recentActivities.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>No trips found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Vehicle Status */}
        <div>
          <h2 className="section-title">Vehicle Status</h2>
          <div className="vehicle-status-list">
            
            <div className="v-status-item">
              <span className="v-status-label">Available</span>
              <div className="v-status-bar-container">
                <div className="v-status-bar-fill available" style={{ width: `${availPct}%` }}></div>
              </div>
            </div>

            <div className="v-status-item">
              <span className="v-status-label">On Trip</span>
              <div className="v-status-bar-container">
                <div className="v-status-bar-fill on-trip" style={{ width: `${onTripPct}%` }}></div>
              </div>
            </div>

            <div className="v-status-item">
              <span className="v-status-label">In Shop</span>
              <div className="v-status-bar-container">
                <div className="v-status-bar-fill in-shop" style={{ width: `${shopPct}%` }}></div>
              </div>
            </div>

            <div className="v-status-item">
              <span className="v-status-label">Retired</span>
              <div className="v-status-bar-container">
                <div className="v-status-bar-fill retired" style={{ width: `${retiredPct}%` }}></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
