"use client";

import React from 'react';
import { Clock, ArrowUpRight, TrendingUp } from 'lucide-react';
import '../dashboard.css';

const RadialGauge = ({ value, label, colorClass, max = 100, symbol = '' }: { value: number, label: string, colorClass: string, max?: number, symbol?: string }) => {
  const radius = 38;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(value, max) / max) * circumference;

  return (
    <div className="gauge-card card">
      <div className="gauge-svg-container">
        <svg className="gauge-svg" width="90" height="90" viewBox="0 0 90 90">
          <circle 
            className="gauge-track" 
            cx="45" 
            cy="45" 
            r={radius} 
            strokeWidth={strokeWidth} 
          />
          <circle 
            className={`gauge-fill ${colorClass}`} 
            cx="45" 
            cy="45" 
            r={radius} 
            strokeWidth={strokeWidth} 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 45 45)"
          />
        </svg>
        <div className="gauge-value">
          {value}{symbol}
        </div>
      </div>
      <div className="gauge-info">
        <span className="gauge-label">{label}</span>
      </div>
    </div>
  );
};

export default function FleetManagerDashboard() {
  const recentActivities = [
    { id: '1', time: '11:34:00', type: 'Trip Dispatched', vehicle: 'Van-05 (TX-9901)', driver: 'Alex Mercer', status: 'Dispatched' },
    { id: '2', time: '11:12:15', type: 'Trip Completed', vehicle: 'Truck-02 (TX-8832)', driver: 'Sarah Connor', status: 'Completed' },
    { id: '3', time: '10:45:00', type: 'Maintenance Oil Change', vehicle: 'Sedan-01 (TX-7751)', driver: 'N/A', status: 'In Shop' },
    { id: '4', time: '10:15:30', type: 'Trip Draft Initiated', vehicle: 'Truck-04 (TX-5520)', driver: 'Stanley Cooper', status: 'Draft' },
    { id: '5', time: '09:30:12', type: 'Driver License Verified', vehicle: 'N/A', driver: 'Harsh Patel', status: 'Completed' },
  ];

  return (
    <div className="page-container" style={{ padding: 0 }}>
      {/* Title Header */}
      <div className="page-title-area flex-between">
        <div>
          <h1 className="page-title">Fleet Telemetry Dashboard</h1>
          <p className="page-subtitle">Real-time KPIs, trip status, driver logs, and fleet maintenance metrics.</p>
        </div>
        <div className="dashboard-date-badge">
          <Clock size={16} />
          <span>Last updated: Just now</span>
        </div>
      </div>

      {/* SVG Radial Metric Gauges Grid */}
      <div className="grid-5 gauge-grid">
        <RadialGauge value={14} label="Active Fleet Vehicles" colorClass="orange" max={20} />
        <RadialGauge value={4} label="Available Vehicles" colorClass="green" max={20} />
        <RadialGauge value={2} label="Vehicles In Shop" colorClass="red" max={10} />
        <RadialGauge value={8} label="Active & Pending Trips" colorClass="blue" max={15} />
        <RadialGauge value={85} label="Fleet Utilization Ratio" colorClass="amber" symbol="%" />
      </div>

      {/* Main Content Grid: Table + Side Diagnostics */}
      <div className="dashboard-layout-main">
        
        {/* Left Column: Recent events table */}
        <div className="dashboard-events-section table-container">
          <div className="section-header flex-between">
            <h2>Live Operational Log</h2>
            <button className="btn btn-secondary btn-sm flex-center">
              <span>Inspect History</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operation Event</th>
                <th>Vehicle Asset</th>
                <th>Assigned Driver</th>
                <th>Lifecycle Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((act) => (
                <tr key={act.id}>
                  <td className="timestamp-cell">{act.time}</td>
                  <td className="event-cell">
                    <strong>{act.type}</strong>
                  </td>
                  <td><code>{act.vehicle}</code></td>
                  <td>{act.driver}</td>
                  <td>
                    <span className={`badge ${
                      act.status === 'Dispatched' ? 'badge-info' :
                      act.status === 'Completed' ? 'badge-success' :
                      act.status === 'In Shop' ? 'badge-danger' :
                      act.status === 'Draft' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {act.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column: Diagnostics Progress Widget */}
        <div className="dashboard-side-diagnostics card">
          <div className="diagnostics-header">
            <h3>Fleet Status Analytics</h3>
            <span className="diagnostics-sub">Key system diagnostic parameters compiled globally.</span>
          </div>

          <div className="diagnostics-metrics-list">
            
            <div className="progress-metric-item">
              <div className="flex-between metric-label-row">
                <span className="metric-name">Average Fuel Efficiency</span>
                <span className="metric-val">82% (12km/L)</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill green" style={{ width: '82%' }}></div>
              </div>
            </div>

            <div className="progress-metric-item">
              <div className="flex-between metric-label-row">
                <span className="metric-name">Driver Safety Compliance</span>
                <span className="metric-val">95% (Avg Score)</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill green" style={{ width: '95%' }}></div>
              </div>
            </div>

            <div className="progress-metric-item">
              <div className="flex-between metric-label-row">
                <span className="metric-name">Trip Schedule Adherence</span>
                <span className="metric-val">90.2%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill orange" style={{ width: '90.2%' }}></div>
              </div>
            </div>

            <div className="progress-metric-item">
              <div className="flex-between metric-label-row">
                <span className="metric-name">Active Maintenance Load</span>
                <span className="metric-val">10%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill green" style={{ width: '10%' }}></div>
              </div>
            </div>

          </div>

          <div className="diagnostics-summary-card">
            <div className="flex-center summary-icon-wrapper">
              <TrendingUp size={20} className="summary-trend-icon" />
            </div>
            <div className="summary-desc-wrapper">
              <strong>Transit Parameters Optimal</strong>
              <p>No expired licenses or pending critical maintenance.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
