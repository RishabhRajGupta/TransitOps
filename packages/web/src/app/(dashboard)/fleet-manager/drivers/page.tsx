"use client";

import React, { useState } from 'react';
import { Plus, ShieldAlert, Mail, Edit, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDriverSchema, CreateDriverInput } from '@transitops/shared/schemas/driver.schema';
import { useDrivers, useCreateDriver, useUpdateDriverStatus, useDeleteDriver } from '../../../../hooks/use-drivers';
import './drivers.css';

const formatStatus = (status: string) => {
  return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function DriversPage() {
  const { data: drivers = [], isLoading } = useDrivers();
  const createDriver = useCreateDriver();
  const updateStatus = useUpdateDriverStatus();
  const deleteDriver = useDeleteDriver();

  const [modalOpen, setModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<any>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      licCat: 'Class A CDL',
      safetyScore: 100,
      status: 'available',
    } as any
  });

  const onSubmit = async (data: any) => {
    try {
      await createDriver.mutateAsync(data);
      setModalOpen(false);
      reset();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Failed to create driver");
    }
  };

  const handleDeleteDriver = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove driver profile for ${name}?`)) {
      try {
        await deleteDriver.mutateAsync(id);
      } catch (error: any) {
        alert(error.response?.data?.error?.message || "Failed to delete driver");
      }
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatusMap: Record<string, "available" | "on_trip" | "off_duty" | "suspended"> = {
      'available': 'on_trip',
      'on_trip': 'off_duty',
      'off_duty': 'suspended',
      'suspended': 'available'
    };
    const newStatus = nextStatusMap[currentStatus] || 'available';
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleSendReminder = (name: string, expiryDate: string) => {
    alert(`Alert notification dispatch queued for driver: "${name}". \nMessage: Please update your license profile. Validity limit is: ${expiryDate}.`);
  };

  return (
    <div className="page-container" style={{ padding: 0 }}>
      {/* Page Header */}
      <div className="page-title-area flex-between">
        <div>
          <h1 className="page-title">Driver Management</h1>
          <p className="page-subtitle">Onboard drivers, verify commercial license validity, and monitor safety scores.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} />
          <span>Onboard Driver</span>
        </button>
      </div>

      {/* Safety Table */}
      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading drivers...</div>
        ) : drivers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No drivers found. Add one to get started.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Driver / Name</th>
                <th>License Number</th>
                <th>Category</th>
                <th>License Expiration</th>
                <th>Safety Score</th>
                <th>Status</th>
                <th className="actions-header">Compliance Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d: any) => {
                const isExpired = new Date(d.licenseExpiryDate) < new Date();
                const isLowScore = d.safetyScore < 60;
                return (
                  <tr key={d.id}>
                    <td>
                      <div className="profile-name-cell">
                        <ShieldAlert 
                          size={18} 
                          className={`profile-shield-icon ${isLowScore ? 'red' : ''}`} 
                          style={{ color: isExpired || isLowScore ? 'var(--danger)' : 'var(--primary)' }}
                        />
                        <strong>{d.name}</strong>
                      </div>
                    </td>
                    <td><code>{d.licenseNumber}</code></td>
                    <td>{d.licenseCategory}</td>
                    <td>
                      <span className={`date-cell ${isExpired ? 'expired-text' : ''}`} style={{
                        color: isExpired ? 'var(--danger)' : 'inherit',
                        fontWeight: isExpired ? '700' : 'normal'
                      }}>
                        {d.licenseExpiryDate} {isExpired && '(Expired)'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        d.safetyScore >= 90 ? 'badge-success' :
                        d.safetyScore >= 70 ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {d.safetyScore} / 100
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`status-toggle-btn ${
                          d.status === 'available' ? 'active' :
                          d.status === 'on_trip' ? 'info-style' :
                          d.status === 'off_duty' ? 'neutral-style' : 'inactive'
                        }`}
                        onClick={() => toggleStatus(d.id, d.status)}
                        title="Click to toggle status cycle"
                        disabled={updateStatus.isPending}
                      >
                        <span className="toggle-dot"></span>
                        <span>{formatStatus(d.status)}</span>
                      </button>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="action-pill-btn trigger-btn" 
                        title="Dispatch license renewal notification"
                        onClick={() => handleSendReminder(d.name, d.licenseExpiryDate)}
                      >
                        <Mail size={12} />
                        <span>Email Reminder</span>
                      </button>
                      <button className="icon-action-btn delete" onClick={() => handleDeleteDriver(d.id, d.name)} title="Offboard Driver">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content card">
            <div className="modal-header flex-between">
              <h3>Onboard Driver Profile</h3>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
              <div className="form-field-grid">
                <div className="form-field">
                  <label htmlFor="driver-name">Full Driver Name</label>
                  <input 
                    id="driver-name"
                    type="text" 
                    placeholder="e.g. Richard Hendricks"
                    {...register("name")}
                  />
                  {errors.name && <span className="error-text">{errors.name.message as string}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="driver-phone">Contact Number</label>
                  <input 
                    id="driver-phone"
                    type="text" 
                    placeholder="e.g. +1-555-9012"
                    {...register("contactNumber")}
                  />
                  {errors.contactNumber && <span className="error-text">{errors.contactNumber.message as string}</span>}
                </div>
              </div>

              <div className="form-field-grid">
                <div className="form-field">
                  <label htmlFor="driver-licnum">License Number</label>
                  <input 
                    id="driver-licnum"
                    type="text" 
                    placeholder="e.g. DL-48301"
                    {...register("licenseNumber")}
                  />
                  {errors.licenseNumber && <span className="error-text">{errors.licenseNumber.message as string}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="driver-liccat">License Category</label>
                  <select id="driver-liccat" {...register("licenseCategory")}>
                    <option value="Class A CDL">Class A CDL (Heavy Truck)</option>
                    <option value="Class B CDL">Class B CDL (Medium Cargo)</option>
                    <option value="Class C Standard">Class C (Standard Auto)</option>
                  </select>
                </div>
              </div>

              <div className="form-field-grid">
                <div className="form-field">
                  <label htmlFor="driver-expiry">License Expiration Date</label>
                  <input 
                    id="driver-expiry"
                    type="date" 
                    {...register("licenseExpiryDate")}
                  />
                  {errors.licenseExpiryDate && <span className="error-text">{errors.licenseExpiryDate.message as string}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="driver-score">Driver Safety Score (0-100)</label>
                  <input 
                    id="driver-score"
                    type="number" 
                    min="0"
                    max="100"
                    {...register("safetyScore")}
                  />
                  {errors.safetyScore && <span className="error-text">{errors.safetyScore.message as string}</span>}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="driver-status">Initial Driver Status</label>
                <select id="driver-status" {...register("status")}>
                  <option value="available">Available</option>
                  <option value="off_duty">Off Duty</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="modal-footer-btns">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={createDriver.isPending}>
                  {createDriver.isPending ? 'Onboarding...' : 'Onboard Operator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
