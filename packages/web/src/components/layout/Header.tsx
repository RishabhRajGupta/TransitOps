"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth-store';
import { api } from '../../lib/api';
import '../../app/(dashboard)/header.css';

export default function Header() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  
  const userName = user?.name || (user?.email ? user.email.split('@')[0] : 'Raven K.');
  const initials = userName.substring(0, 2).toUpperCase();
  
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    clearAuth();
    router.push('/login');
  };

  return (
    <header className="app-header">
      <div className="header-search">
        <input 
          type="text" 
          placeholder="Search..." 
          className="header-search-input"
        />
      </div>

      <div className="header-actions">
        <span className="header-user-name">{userName}</span>
        <button onClick={handleLogout} className="header-role-pill" title="Logout">
          <span className="role-text">Dispatcher</span>
          <div className="role-avatar">{initials}</div>
        </button>
      </div>
    </header>
  );
}
