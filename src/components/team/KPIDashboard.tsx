import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { PlusIcon, CheckCircleIcon, ExclamationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface KPI {
  id: string;
  kpi_name: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  period: string;
  status: 'on_track' | 'at_risk' | 'off_track';
  updated_at: string;
}

interface KPIDashboardProps {
  teamId: string;
  isAdmin: boolean;
}

export const KPIDashboard: React.FC<KPIDashboardProps> = ({ teamId, isAdmin }) => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKPI, setNewKPI] = useState({
    kpi_name: '',
    description: '',
    target_value: 0,
    current_value: 0,
    unit: 'number',
    period: 'weekly'
  });

  useEffect(() => {
    fetchKPIs();
  }, [teamId]);

  const fetchKPIs = async () => {
    try {
      const { data, error } = await supabase
        .from('team_kpis')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKpis(data || []);
    } catch (err) {
      console.error('Error fetching KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatus = (current: number, target: number): 'on_track' | 'at_risk' | 'off_track' => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return 'on_track';
    if (percentage >= 70) return 'at_risk';
    return 'off_track';
  };

  const handleAddKPI = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const status = calculateStatus(newKPI.current_value, newKPI.target_value);
      
      const { error } = await supabase
        .from('team_kpis')
        .insert({
          team_id: teamId,
          ...newKPI,
          status
        });

      if (error) throw error;
      
      setShowAddForm(false);
      setNewKPI({
        kpi_name: '',
        description: '',
        target_value: 0,
        current_value: 0,
        unit: 'number',
        period: 'weekly'
      });
      fetchKPIs();
    } catch (err: any) {
      console.error('Error adding KPI:', err);
      alert('Failed to add KPI: ' + err.message);
    }
  };

  const handleUpdateValue = async (kpiId: string, newValue: number, targetValue: number) => {
    try {
      const status = calculateStatus(newValue, targetValue);
      
      const { error } = await supabase
        .from('team_kpis')
        .update({ 
          current_value: newValue,
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', kpiId);

      if (error) throw error;
      fetchKPIs();
    } catch (err: any) {
      console.error('Error updating KPI:', err);
      alert('Failed to update KPI: ' + err.message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'at_risk':
        return <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />;
      case 'off_track':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'at_risk':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'off_track':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Loading KPIs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team KPIs</h2>
          <p className="text-sm text-slate-600">Track key performance indicators</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add KPI
          </Button>
        )}
      </div>

      {/* Add KPI Form */}
      {showAddForm && isAdmin && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New KPI</h3>
          <form onSubmit={handleAddKPI} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">KPI Name</label>
                <input
                  type="text"
                  value={newKPI.kpi_name}
                  onChange={(e) => setNewKPI({ ...newKPI, kpi_name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Period</label>
                <select
                  value={newKPI.period}
                  onChange={(e) => setNewKPI({ ...newKPI, period: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                value={newKPI.description}
                onChange={(e) => setNewKPI({ ...newKPI, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Value</label>
                <input
                  type="number"
                  value={newKPI.target_value}
                  onChange={(e) => setNewKPI({ ...newKPI, target_value: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Value</label>
                <input
                  type="number"
                  value={newKPI.current_value}
                  onChange={(e) => setNewKPI({ ...newKPI, current_value: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Unit</label>
                <select
                  value={newKPI.unit}
                  onChange={(e) => setNewKPI({ ...newKPI, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="number">Number</option>
                  <option value="percentage">Percentage</option>
                  <option value="hours">Hours</option>
                  <option value="count">Count</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button type="submit">Add KPI</Button>
              <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* KPI List */}
      {kpis.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <p className="text-slate-600 mb-4">No KPIs tracked yet</p>
          {isAdmin && (
            <Button onClick={() => setShowAddForm(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Your First KPI
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kpis.map((kpi) => {
            const progress = (kpi.current_value / kpi.target_value) * 100;
            return (
              <div
                key={kpi.id}
                className={`bg-white rounded-lg border-2 p-6 ${getStatusColor(kpi.status)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">{kpi.kpi_name}</h3>
                    {kpi.description && (
                      <p className="text-sm text-slate-600 mt-1">{kpi.description}</p>
                    )}
                    <span className="text-xs text-slate-500 mt-2 inline-block">
                      {kpi.period.charAt(0).toUpperCase() + kpi.period.slice(1)}
                    </span>
                  </div>
                  {getStatusIcon(kpi.status)}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-3xl font-bold text-slate-900">
                        {kpi.current_value}
                        <span className="text-lg text-slate-600 ml-1">
                          / {kpi.target_value} {kpi.unit}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-slate-900">
                        {progress.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        kpi.status === 'on_track'
                          ? 'bg-green-500'
                          : kpi.status === 'at_risk'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  {isAdmin && (
                    <div className="pt-3 border-t border-slate-200">
                      <label className="block text-xs font-medium text-slate-700 mb-2">
                        Update Current Value
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          defaultValue={kpi.current_value}
                          onBlur={(e) => {
                            const newValue = parseFloat(e.target.value);
                            if (newValue !== kpi.current_value) {
                              handleUpdateValue(kpi.id, newValue, kpi.target_value);
                            }
                          }}
                          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  Last updated: {new Date(kpi.updated_at).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
