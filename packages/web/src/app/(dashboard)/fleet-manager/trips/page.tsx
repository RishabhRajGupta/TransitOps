"use client";

import React, { useState } from 'react';
import { Plus, X, Milestone, Send, CheckCircle, Ban } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTripSchema, CreateTripInput } from '@transitops/shared/schemas/trip.schema';
import { useTrips, useCreateTrip, useUpdateTripStatus } from '../../../../hooks/use-trips';
import { useVehicles } from '../../../../hooks/use-vehicles';
import { useDrivers } from '../../../../hooks/use-drivers';
import './trips.css';

export default function TripsPage() {
  const { data: trips = [], isLoading } = useTrips();
  // Fetch only available vehicles and drivers for the dropdowns
  const { data: availableVehicles = [] } = useVehicles({ status: 'Available' });
  const { data: availableDrivers = [] } = useDrivers({ status: 'Available' });
  
  const createTrip = useCreateTrip();
  const updateStatus = useUpdateTripStatus();

  const [modalOpen, setModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<any>({
    resolver: zodResolver(createTripSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      await createTrip.mutateAsync(data);
      setModalOpen(false);
      reset();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Failed to create trip");
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (newStatus === 'cancelled' && !window.confirm("Are you sure you want to cancel this trip?")) {
      return;
    }
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Failed to update trip status");
    }
  };

  return (
    <div className="page-container" style={{ padding: 0 }}>
      <div className="page-title-area flex-between">
        <div>
          <h1 className="page-title">Trip Dispatcher</h1>
          <p className="page-subtitle">Create trips, assign drivers to vehicles, and monitor transit lifecycle.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} />
          <span>Create Trip</span>
        </button>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading trips...</div>
        ) : trips.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No trips found. Create one to get started.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Trip Code</th>
                <th>Route (Source &rarr; Dest)</th>
                <th>Vehicle & Driver</th>
                <th>Cargo / Dist.</th>
                <th>Status</th>
                <th className="actions-header">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t: any) => (
                <tr key={t.id}>
                  <td>
                    <div className="asset-name-cell">
                      <Milestone size={18} className="asset-box-icon" />
                      <strong>{t.tripCode}</strong>
                    </div>
                  </td>
                  <td>
                    <div><strong>{t.source}</strong></div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>to {t.destination}</div>
                  </td>
                  <td>
                    <div><strong>{t.vehicleRegistration}</strong> ({t.vehicleName})</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Driver: {t.driverName}</div>
                  </td>
                  <td>
                    <div>{t.cargoWeightKg} kg</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{t.plannedDistanceKm} km</div>
                  </td>
                  <td>
                    <span className={`badge ${
                      t.status === 'completed' ? 'badge-success' :
                      t.status === 'dispatched' ? 'badge-info' :
                      t.status === 'cancelled' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </td>
                  <td className="actions-cell" style={{ display: 'flex', gap: '8px' }}>
                    {t.status === 'draft' && (
                      <>
                        <button 
                          className="icon-action-btn" 
                          title="Dispatch Trip"
                          onClick={() => handleUpdateStatus(t.id, 'dispatched')}
                          disabled={updateStatus.isPending}
                        >
                          <Send size={14} color="#0284c7" />
                        </button>
                        <button 
                          className="icon-action-btn delete" 
                          title="Cancel Trip"
                          onClick={() => handleUpdateStatus(t.id, 'cancelled')}
                          disabled={updateStatus.isPending}
                        >
                          <Ban size={14} />
                        </button>
                      </>
                    )}
                    {t.status === 'dispatched' && (
                      <>
                        <button 
                          className="icon-action-btn" 
                          title="Mark Completed"
                          onClick={() => handleUpdateStatus(t.id, 'completed')}
                          disabled={updateStatus.isPending}
                        >
                          <CheckCircle size={14} color="#16a34a" />
                        </button>
                        <button 
                          className="icon-action-btn delete" 
                          title="Cancel Trip"
                          onClick={() => handleUpdateStatus(t.id, 'cancelled')}
                          disabled={updateStatus.isPending}
                        >
                          <Ban size={14} />
                        </button>
                      </>
                    )}
                    {(t.status === 'completed' || t.status === 'cancelled') && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Archived</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content card" style={{ maxWidth: '600px' }}>
            <div className="modal-header flex-between">
              <h3>Dispatch New Trip</h3>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
              <div className="form-field-grid">
                <div className="form-field">
                  <label htmlFor="source">Source Location</label>
                  <input id="source" type="text" placeholder="e.g. Warehouse A" {...register("source")} />
                  {errors.source && <span className="error-text">{errors.source.message as string}</span>}
                </div>
                <div className="form-field">
                  <label htmlFor="destination">Destination</label>
                  <input id="destination" type="text" placeholder="e.g. Distribution Center B" {...register("destination")} />
                  {errors.destination && <span className="error-text">{errors.destination.message as string}</span>}
                </div>
              </div>

              <div className="form-field-grid">
                <div className="form-field">
                  <label htmlFor="vehicleId">Assign Available Vehicle</label>
                  <select id="vehicleId" {...register("vehicleId")}>
                    <option value="">-- Select Vehicle --</option>
                    {availableVehicles.map((v: any) => (
                      <option key={v.id} value={v.id}>{v.registrationNumber} ({v.name} - {v.maxLoadCapacityKg}kg)</option>
                    ))}
                  </select>
                  {errors.vehicleId && <span className="error-text">{errors.vehicleId.message as string}</span>}
                </div>
                <div className="form-field">
                  <label htmlFor="driverId">Assign Available Driver</label>
                  <select id="driverId" {...register("driverId")}>
                    <option value="">-- Select Driver --</option>
                    {availableDrivers.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.licenseCategory})</option>
                    ))}
                  </select>
                  {errors.driverId && <span className="error-text">{errors.driverId.message as string}</span>}
                </div>
              </div>

              <div className="form-field-grid">
                <div className="form-field">
                  <label htmlFor="cargoWeightKg">Cargo Weight (kg)</label>
                  <input id="cargoWeightKg" type="number" step="0.1" placeholder="e.g. 5000" {...register("cargoWeightKg")} />
                  {errors.cargoWeightKg && <span className="error-text">{errors.cargoWeightKg.message as string}</span>}
                </div>
                <div className="form-field">
                  <label htmlFor="plannedDistanceKm">Planned Distance (km)</label>
                  <input id="plannedDistanceKm" type="number" step="0.1" placeholder="e.g. 150.5" {...register("plannedDistanceKm")} />
                  {errors.plannedDistanceKm && <span className="error-text">{errors.plannedDistanceKm.message as string}</span>}
                </div>
              </div>

              <div className="modal-footer-btns">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={createTrip.isPending}>
                  {createTrip.isPending ? 'Saving...' : 'Create Trip Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
