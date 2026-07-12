"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth-store';
import '../../app/(dashboard)/sidebar.css';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navItems = [];
  
  if (user?.role === 'fleet_manager') {
    navItems.push(
      { name: 'Dashboard', path: '/fleet-manager' },
      { name: 'Fleet', path: '/fleet-manager/assets' },
      { name: 'Drivers', path: '/fleet-manager/drivers' },
      { name: 'Trips', path: '/fleet-manager/trips' },
      { name: 'Maintenance', path: '/fleet-manager/maintenance' },
      { name: 'Fuel & Expenses', path: '/fleet-manager/expenses' },
      { name: 'Analytics', path: '/fleet-manager/reports' }
    );
  } else if (user?.role === 'driver') {
    navItems.push(
      { name: 'Dashboard', path: '/driver' },
      { name: 'My Trips', path: '/driver/trips' },
      { name: 'My Vehicle', path: '/driver/vehicle' }
    );
  } else if (user?.role === 'safety_officer') {
    navItems.push(
      { name: 'Dashboard', path: '/safety-officer' },
      { name: 'Profiles', path: '/safety-officer/profiles' },
      { name: 'Compliance', path: '/safety-officer/reports' }
    );
  } else if (user?.role === 'financial_analyst') {
    navItems.push(
      { name: 'Dashboard', path: '/financial-analyst' },
      { name: 'Expenses', path: '/financial-analyst/expenses' },
      { name: 'ROI Reports', path: '/financial-analyst/reports' }
    );
  }

  navItems.push({ name: 'Settings', path: '/settings' });

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-text">TransitOps</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-link-text">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
