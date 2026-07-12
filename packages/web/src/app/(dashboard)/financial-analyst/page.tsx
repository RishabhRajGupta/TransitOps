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

export default function FinancialAnalystDashboard() {
  const recentExpenses = [
    { id: '1', date: 'Today', category: 'Fuel', amount: '$345.50', vehicle: 'Van-05' },
    { id: '2', date: 'Yesterday', category: 'Maintenance', amount: '$1,200.00', vehicle: 'Truck-02' },
    { id: '3', date: '10/07', category: 'Toll', amount: '$15.00', vehicle: 'Sedan-01' },
  ];

  return (
    <div className="page-container" style={{ padding: 0 }}>
      <div className="page-title-area flex-between">
        <div>
          <h1 className="page-title">Financial Analytics</h1>
          <p className="page-subtitle">Track operational costs, fuel expenses, and ROI reports across the fleet.</p>
        </div>
        <div className="dashboard-date-badge">
          <Clock size={16} />
          <span>Last updated: Just now</span>
        </div>
      </div>

      <div className="grid-5 gauge-grid">
        <RadialGauge value={12.5} label="Monthly Fuel ($k)" colorClass="orange" max={20} symbol="k" />
        <RadialGauge value={4.2} label="Maintenance ($k)" colorClass="red" max={10} symbol="k" />
        <RadialGauge value={85} label="Avg Fleet ROI" colorClass="green" max={100} symbol="%" />
      </div>

      <div className="dashboard-layout-main">
        <div className="dashboard-events-section table-container" style={{ gridColumn: 'span 2' }}>
          <div className="section-header flex-between">
            <h2>Recent Operational Expenses</h2>
            <button className="btn btn-secondary btn-sm flex-center">
              <span>View All Expenses</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Vehicle Asset</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.map((exp) => (
                <tr key={exp.id}>
                  <td className="timestamp-cell">{exp.date}</td>
                  <td><strong>{exp.category}</strong></td>
                  <td>
                    <span className="badge badge-warning">{exp.amount}</span>
                  </td>
                  <td><code>{exp.vehicle}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
