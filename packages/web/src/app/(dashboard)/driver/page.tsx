"use client";

import React from 'react';
import { Clock, ArrowUpRight, Truck, Milestone } from 'lucide-react';
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
          <circle className="gauge-track" cx="45" cy="45" r={radius} strokeWidth={strokeWidth} />
          <circle 
            className={`gauge-fill ${colorClass}`} 
            cx="45" cy="45" r={radius} 
            strokeWidth={strokeWidth} 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 45 45)"
          />
        </svg>
        <div className="gauge-value">{value}{symbol}</div>
      </div>
      <div className="gauge-info">
        <span className="gauge-label">{label}</span>
      </div>
    </div>
  );
};

export default function DriverDashboard() {
  const myTrips = [
    { id: '1', time: '11:34:00', dest: 'Warehouse A', vehicle: 'Van-05 (TX-9901)', status: 'Dispatched' },
    { id: '2', time: 'Yesterday', dest: 'Port Terminal', vehicle: 'Van-05 (TX-9901)', status: 'Completed' },
  ];

  return (
    <div className="page-container" style={{ padding: 0 }}>
      <div className="page-title-area flex-between">
        <div>
          <h1 className="page-title">Operator Dashboard</h1>
          <p className="page-subtitle">Your active trips and assigned vehicle telemetry.</p>
        </div>
        <div className="dashboard-date-badge">
          <Clock size={16} />
          <span>Last updated: Just now</span>
        </div>
      </div>

      <div className="grid-5 gauge-grid">
        <RadialGauge value={1} label="Active Trips" colorClass="blue" max={5} />
        <RadialGauge value={98} label="Safety Score" colorClass="green" max={100} />
      </div>

      <div className="dashboard-layout-main">
        <div className="dashboard-events-section table-container" style={{ gridColumn: 'span 2' }}>
          <div className="section-header flex-between">
            <h2>My Recent Trips</h2>
            <button className="btn btn-secondary btn-sm flex-center">
              <span>View All</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Destination</th>
                <th>Assigned Vehicle</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myTrips.map((trip) => (
                <tr key={trip.id}>
                  <td className="timestamp-cell">{trip.time}</td>
                  <td><strong>{trip.dest}</strong></td>
                  <td><code>{trip.vehicle}</code></td>
                  <td>
                    <span className={`badge ${
                      trip.status === 'Dispatched' ? 'badge-info' : 'badge-success'
                    }`}>{trip.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
