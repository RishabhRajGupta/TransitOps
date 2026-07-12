"use client";

import React, { useState } from 'react';
import { Search, Bell, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth-store';
import { api } from '../../lib/api';
import '../../app/(dashboard)/header.css';

export default function Header() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const userEmail = user?.email || 'operator@shieldops.io';
  const userName = user?.name || userEmail.split('@')[0];
  
  const roleDisplay = user?.role === 'fleet_manager' ? 'Fleet Manager'
                    : user?.role === 'driver' ? 'Driver'
                    : user?.role === 'safety_officer' ? 'Safety Officer'
                    : user?.role === 'financial_analyst' ? 'Financial Analyst'
                    : 'Operator';

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    clearAuth();
    router.push('/login');
  };

  return (
    <header className="app-header">
      {/* Search Bar */}
      <div className="header-search">
        <Search className="header-search-icon" size={18} />
        <input 
          type="text" 
          placeholder="Quick search vehicles, drivers, dispatches..." 
          className="header-search-input"
        />
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Status Indicator */}
        <div className="header-status">
          <span className="status-dot online"></span>
          <span className="status-text">Active Fleet Net</span>
        </div>

        {/* Notifications */}
        <button className="header-action-btn notification-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="notification-badge">2</span>
        </button>

        {/* User Dropdown */}
        <div className="header-user-dropdown">
          <button 
            className="user-profile-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="user-avatar">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-role">{roleDisplay}</span>
            </div>
            <ChevronDown size={14} className={`chevron-icon ${dropdownOpen ? 'rotate' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <span className="dropdown-email">{userEmail}</span>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={() => { setDropdownOpen(false); router.push('/settings'); }}>
                <User size={16} />
                <span>My Profile</span>
              </button>
              <button className="dropdown-item" onClick={() => { setDropdownOpen(false); router.push('/settings'); }}>
                <Settings size={16} />
                <span>Console Settings</span>
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
