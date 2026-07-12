"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Milestone, 
  Wrench, 
  Receipt, 
  BarChart3, 
  Settings, 
  LogOut,
  Navigation
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth-store';
import { api } from '../../lib/api';
import '../../app/(dashboard)/sidebar.css';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    clearAuth();
    router.push('/login');
  };

  const navItems = [];
  
  if (user?.role === 'fleet_manager') {
    navItems.push(
      { name: 'Dashboard', path: '/fleet-manager', icon: LayoutDashboard },
      { name: 'Vehicle Registry', path: '/fleet-manager/assets', icon: Truck },
      { name: 'Driver Management', path: '/fleet-manager/drivers', icon: Users },
      { name: 'Trip Dispatcher', path: '/fleet-manager/trips', icon: Milestone },
      { name: 'Maintenance Logs', path: '/fleet-manager/maintenance', icon: Wrench },
      { name: 'Fuel & Expenses', path: '/fleet-manager/expenses', icon: Receipt },
      { name: 'Fleet Reports', path: '/fleet-manager/reports', icon: BarChart3 }
    );
  } else if (user?.role === 'driver') {
    navItems.push(
      { name: 'Dashboard', path: '/driver', icon: LayoutDashboard },
      { name: 'My Trips', path: '/driver/trips', icon: Milestone },
      { name: 'My Vehicle', path: '/driver/vehicle', icon: Truck }
    );
  } else if (user?.role === 'safety_officer') {
    navItems.push(
      { name: 'Dashboard', path: '/safety-officer', icon: LayoutDashboard },
      { name: 'Safety Profiles', path: '/safety-officer/profiles', icon: Users },
      { name: 'Compliance Reports', path: '/safety-officer/reports', icon: BarChart3 }
    );
  } else if (user?.role === 'financial_analyst') {
    navItems.push(
      { name: 'Dashboard', path: '/financial-analyst', icon: LayoutDashboard },
      { name: 'Expenses', path: '/financial-analyst/expenses', icon: Receipt },
      { name: 'ROI Reports', path: '/financial-analyst/reports', icon: BarChart3 }
    );
  }

  navItems.push({ name: 'Settings', path: '/settings', icon: Settings });

  return (
    <aside className="app-sidebar">
      {/* Sidebar Header with Brand Logo */}
      <div className="sidebar-brand">
        <Navigation className="sidebar-brand-icon" size={24} />
        <span className="sidebar-brand-text">TransitOps</span>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="sidebar-link-icon" size={18} />
              <span className="sidebar-link-text">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer with Logout */}
      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  );
}
