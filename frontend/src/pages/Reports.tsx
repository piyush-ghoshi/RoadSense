import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '../lib/api';
import { getSocket } from '../lib/socket';
import './Reports.css';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function Reports() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'accident',
    severity: 'medium',
    location: '',
    description: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await reportsApi.getAll();
      return res.data.data;
    }
  });

  // Listen for real-time new reports
  useEffect(() => {
    const socket = getSocket();
    socket.on('report:new', () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
    });
    socket.on('report:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    });
    socket.on('report:deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    });
    return () => {
      socket.off('report:new');
      socket.off('report:updated');
      socket.off('report:deleted');
    };
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: (data: any) => reportsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
      setShowForm(false);
      setFormData({ type: 'accident', severity: 'medium', location: '', description: '', latitude: undefined, longitude: undefined });
      showToast('✅ Report submitted successfully!', 'success');
    },
    onError: () => {
      showToast('❌ Failed to submit report. Please try again.', 'error');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      reportsApi.updateStatus(id, status),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
      showToast(`✅ Report marked as ${vars.status}`, 'success');
    },
    onError: () => {
      showToast('❌ Failed to update status.', 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reportsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
      showToast('🗑️ Report deleted', 'success');
    },
    onError: () => {
      showToast('❌ Failed to delete report.', 'error');
    }
  });

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showToast('❌ Geolocation is not supported by your browser.', 'error');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({ ...prev, latitude, longitude }));
        setLocationLoading(false);
        showToast(`📍 Location captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, 'success');
      },
      () => {
        setLocationLoading(false);
        showToast('❌ Could not get your location. Please allow location access.', 'error');
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location.trim()) {
      showToast('❌ Please enter a location name.', 'error');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getSeverityColor = (severity: string) => {
    const map: Record<string, string> = {
      low: '#4caf50', medium: '#ffc107', high: '#ff9800', critical: '#f44336'
    };
    return map[severity] || '#9e9e9e';
  };

  const getTypeIcon = (type: string) => {
    const map: Record<string, string> = {
      accident: '💥', roadblock: '🚧', diversion: '↩️', congestion: '🚗', other: '⚠️'
    };
    return map[type] || '📍';
  };

  const getStatusIcon = (status: string) => {
    const map: Record<string, string> = {
      pending: '⏳', verified: '✅', resolved: '🎉', false: '❌'
    };
    return map[status] || '❓';
  };

  return (
    <div className="reports-page">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>

      <div className="reports-header">
        <h1>📋 Traffic Reports</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ New Report'}
        </button>
      </div>

      {showForm && (
        <div className="report-form-container">
          <h2>🚨 Submit Traffic Report</h2>
          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-row">
              <div className="form-group">
                <label>Incident Type</label>
                <select name="type" value={formData.type} onChange={handleChange} required>
                  <option value="accident">💥 Accident</option>
                  <option value="roadblock">🚧 Roadblock</option>
                  <option value="diversion">↩️ Diversion</option>
                  <option value="congestion">🚗 Congestion</option>
                  <option value="other">⚠️ Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Severity</label>
                <select name="severity" value={formData.severity} onChange={handleChange} required>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="critical">🔴 Critical</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Location Name *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Vijay Nagar Square, Indore"
                required
              />
            </div>

            <div className="form-group">
              <label>GPS Coordinates</label>
              <div className="location-row">
                <div className="coord-inputs">
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Latitude"
                    value={formData.latitude ?? ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  />
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Longitude"
                    value={formData.longitude ?? ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  />
                </div>
                <button
                  type="button"
                  className="btn-location"
                  onClick={handleUseMyLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? '⏳ Getting...' : '📍 Use My Location'}
                </button>
              </div>
              {formData.latitude && formData.longitude && (
                <span className="coords-badge">
                  ✅ GPS: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what's happening — vehicles involved, lanes blocked, etc."
                rows={3}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? '⏳ Submitting...' : '🚨 Submit Report'}
            </button>
          </form>
        </div>
      )}

      <div className="reports-list-container">
        <h2>All Reports ({reports?.length || 0})</h2>
        {isLoading && <div className="loading-state">Loading reports...</div>}
        {!isLoading && reports?.length === 0 && (
          <div className="empty-state">
            <p>No reports yet. Be the first to report a traffic incident!</p>
          </div>
        )}
        <div className="reports-table">
          {reports?.map((report: any) => (
            <div key={report.id} className={`report-row report-${report.severity}`}>
              <div className="report-main">
                <div className="report-badges">
                  <span className={`badge badge-${report.type}`}>
                    {getTypeIcon(report.type)} {report.type}
                  </span>
                  <span
                    className="severity-badge"
                    style={{ background: getSeverityColor(report.severity), color: 'white' }}
                  >
                    {report.severity}
                  </span>
                  <span className={`status-badge status-${report.status}`}>
                    {getStatusIcon(report.status)} {report.status}
                  </span>
                </div>
                <h3>{report.location}</h3>
                {report.description && <p className="report-desc">{report.description}</p>}
                {report.latitude && report.longitude && (
                  <p className="report-coords">📍 {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</p>
                )}
                <small className="report-time">🕐 {new Date(report.createdAt).toLocaleString()}</small>
              </div>
              <div className="report-actions">
                {report.status === 'pending' && (
                  <>
                    <button
                      className="btn-small btn-success"
                      onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'verified' })}
                    >
                      ✓ Verify
                    </button>
                    <button
                      className="btn-small btn-danger"
                      onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'false' })}
                    >
                      ✗ Reject
                    </button>
                  </>
                )}
                {report.status === 'verified' && (
                  <button
                    className="btn-small btn-success"
                    onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'resolved' })}
                  >
                    ✓ Resolve
                  </button>
                )}
                <button
                  className="btn-small btn-delete"
                  onClick={() => {
                    if (confirm('Delete this report?')) {
                      deleteMutation.mutate(report.id);
                    }
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
