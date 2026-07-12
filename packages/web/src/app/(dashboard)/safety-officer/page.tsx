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

export default function SafetyOfficerDashboard() {
  const complianceAlerts = [
    { id: '1', issue: 'License expiring in 30 days', driver: 'Sarah Connor', severity: 'Medium' },
    { id: '2', issue: 'Speeding Violation reported', driver: 'Stanley Cooper', severity: 'High' },
  ];

  return (
    <div className="page-container" style={{ padding: 0 }}>
      <div className="page-title-area flex-between">
        <div>
          <h1 className="page-title">Safety & Compliance Dashboard</h1>
          <p className="page-subtitle">Monitor fleet compliance, driver safety scores, and validity of licenses.</p>
        </div>
        <div className="dashboard-date-badge">
          <Clock size={16} />
          <span>Last updated: Just now</span>
        </div>
      </div>

      <div className="grid-5 gauge-grid">
        <RadialGauge value={98} label="Avg Safety Score" colorClass="green" symbol="%" />
        <RadialGauge value={2} label="Compliance Alerts" colorClass="red" max={10} />
      </div>

      <div className="dashboard-layout-main">
        <div className="dashboard-events-section table-container" style={{ gridColumn: 'span 2' }}>
          <div className="section-header flex-between">
            <h2>Active Compliance Alerts</h2>
            <button className="btn btn-secondary btn-sm flex-center">
              <span>View All Reports</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Driver</th>
                <th>Compliance Issue</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {complianceAlerts.map((alert) => (
                <tr key={alert.id}>
                  <td>{alert.driver}</td>
                  <td><strong>{alert.issue}</strong></td>
                  <td>
                    <span className={`badge ${
                      alert.severity === 'High' ? 'badge-danger' : 'badge-warning'
                    }`}>{alert.severity}</span>
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
