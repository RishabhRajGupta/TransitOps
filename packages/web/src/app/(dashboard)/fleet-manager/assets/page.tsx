"use client";

import React, { useState } from 'react';
import { Plus, Search, ShieldAlert, Edit2, Eye, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createVehicleSchema, CreateVehicleInput } from '@transitops/shared/schemas/vehicle.schema';
import { useVehicles, useCreateVehicle, useRetireVehicle } from '../../../../hooks/use-vehicles';
import './assets.css';
import { isAxiosError } from 'axios';

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: vehiclesData = [], isLoading } = useVehicles({
    search: searchTerm,
    type: typeFilter,
    status: statusFilter,
  });
  const vehicles = vehiclesData as any[];

  const createMutation = useCreateVehicle();
  const retireMutation = useRetireVehicle();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<any>({
    resolver: zodResolver(createVehicleSchema),
    defaultValues: {
      type: 'van',
      status: 'available',
      maxLoadCapacityKg: '500',
      odometerKm: '12000',
      acquisitionCost: '25000',
    } as any
  });

  const onSubmit = async (data: any) => {
    setErrorMsg('');
    try {
      await createMutation.mutateAsync(data);
      reset();
      setModalOpen(false);
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error?.message) {
        setErrorMsg(err.response.data.error.message);
      } else {
        setErrorMsg("An unexpected error occurred while creating the vehicle.");
      }
    }
  };

  const handleDeleteVehicle = async (id: string, regNum: string) => {
    if (window.confirm(`Are you sure you want to decommission/retire vehicle ${regNum}?`)) {
      try {
        await retireMutation.mutateAsync(id);
      } catch (err) {
        if (isAxiosError(err) && err.response?.data?.error?.message) {
          alert(err.response.data.error.message);
        } else {
          alert("Failed to retire vehicle.");
        }
      }
    }
  };

  return (
    <div className="page-container" style={{ padding: 0 }}>
      {/* Page Header */}
      <div className="page-title-area flex-between">
        <div>
          <h1 className="page-title">Vehicle Registry</h1>
          <p className="page-subtitle">Master inventory list of vehicles including registration keys, load limits, and operational states.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setErrorMsg(''); setModalOpen(true); }}>
          <Plus size={18} />
          <span>Register Vehicle</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="assets-filters-bar card">
        <div className="search-input-col">
          <Search className="filter-search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Search by registration number, vehicle model name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-search-input"
          />
        </div>

        <div className="dropdowns-col">
          <div className="filter-group">
            <label htmlFor="type-select">Vehicle Type</label>
            <select 
              id="type-select"
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="van">Van</option>
              <option value="truck">Truck</option>
              <option value="pickup">Pickup</option>
              <option value="trailer">Trailer</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status-select">Status</label>
            <select 
              id="status-select"
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Registration Number</th>
              <th>Vehicle / Model Name</th>
              <th>Type</th>
              <th>Max Load Limit</th>
              <th>Odometer (km)</th>
              <th>Acquisition Cost</th>
              <th>Status</th>
              <th className="actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="table-empty-row" style={{ padding: '2rem', textAlign: 'center' }}>
                  Loading vehicles...
                </td>
              </tr>
            ) : vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td><code className="asset-id-code">{vehicle.registrationNumber}</code></td>
                  <td><strong>{vehicle.name}</strong></td>
                  <td style={{ textTransform: 'capitalize' }}>{vehicle.type}</td>
                  <td>{Number(vehicle.maxLoadCapacityKg).toLocaleString()} kg</td>
                  <td>{Number(vehicle.odometerKm).toLocaleString()} km</td>
                  <td>${Number(vehicle.acquisitionCost).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${
                      vehicle.status === 'available' ? 'badge-success' :
                      vehicle.status === 'on_trip' ? 'badge-info' :
                      vehicle.status === 'in_shop' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {vehicle.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="icon-action-btn" title="Inspect Vehicle Logs">
                      <Eye size={16} />
                    </button>
                    <button className="icon-action-btn" title="Modify Vehicle Details">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="icon-action-btn delete" 
                      title="Decommission Vehicle" 
                      onClick={() => handleDeleteVehicle(vehicle.id, vehicle.registrationNumber)}
                      disabled={retireMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="table-empty-row">
                  <ShieldAlert size={28} className="empty-row-icon" />
                  <p>No registered vehicles match selected filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Vehicle Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content card">
            <div className="modal-header flex-between">
              <h3>Register New Transport Vehicle</h3>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            {errorMsg && <div className="login-error-alert" style={{ marginBottom: 16 }}>{errorMsg}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
              <div className="form-field-grid">
                <div className="form-field">
                  <label htmlFor="modal-reg-num">Registration Number (Unique)</label>
                  <input 
                    id="modal-reg-num"
                    type="text" 
                    placeholder="e.g. TX-4491"
                    {...register("registrationNumber")}
                  />
                  {errors.registrationNumber && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.registrationNumber.message as string}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="modal-name">Vehicle / Model Name</label>
                  <input 
                    id="modal-name"
                    type="text" 
                    placeholder="e.g. Van-08"
                    {...register("name")}
                  />
                  {errors.name && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.name.message as string}</span>}
                </div>
              </div>

              <div className="form-field-grid">
                <div className="form-field">
                  <label htmlFor="modal-type">Vehicle Type</label>
                  <select 
                    id="modal-type"
                    {...register("type")}
                  >
                    <option value="van">Van</option>
                    <option value="truck">Truck</option>
                    <option value="pickup">Pickup</option>
                    <option value="trailer">Trailer</option>
                  </select>
                  {errors.type && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.type.message as string}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="modal-max-load">Max Load Capacity (kg)</label>
                  <input 
                    id="modal-max-load"
                    type="number" 
                    min="1"
                    {...register("maxLoadCapacityKg")}
                  />
                  {errors.maxLoadCapacityKg && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.maxLoadCapacityKg.message as string}</span>}
                </div>
              </div>

              <div className="form-field-grid">
                <div className="form-field">
                  <label htmlFor="modal-odometer">Current Odometer (km)</label>
                  <input 
                    id="modal-odometer"
                    type="number" 
                    min="0"
                    {...register("odometerKm")}
                  />
                  {errors.odometerKm && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.odometerKm.message as string}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="modal-cost">Acquisition Cost ($)</label>
                  <input 
                    id="modal-cost"
                    type="number" 
                    min="1"
                    {...register("acquisitionCost")}
                  />
                  {errors.acquisitionCost && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.acquisitionCost.message as string}</span>}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="modal-status">Lifecycle Status</label>
                <select 
                  id="modal-status"
                  {...register("status")}
                >
                  <option value="available">Available</option>
                  <option value="on_trip">On Trip</option>
                  <option value="in_shop">In Shop</option>
                  <option value="retired">Retired</option>
                </select>
                {errors.status && <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>{errors.status.message as string}</span>}
              </div>

              <div className="modal-footer-btns">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Instantiating...' : 'Instantiate Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
