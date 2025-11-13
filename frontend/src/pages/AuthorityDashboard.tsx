import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi, alertsApi, congestionApi } from '../lib/api';
import './AuthorityDashboard.css';

export default function AuthorityDashboard() {
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [alertForm, setAlertForm] = useState({
    title: '',
    message: '',
    severity: 'warning',
    type: 'traffic'
  });

  const { data: reports } = useQuery({
    queryKey: ['authority-reports'],
    queryFn: async () => {
      const res = await reportsApi.getAll({ limit: 50 });
      return res.data.data;
    },
    refetchInterval: 10000
  });

  const { data: alerts } = useQuery({
    queryKey: ['authority-alerts'],
    queryFn: async () => {
      const res = await alertsApi.getAll();
      return res.data.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      reportsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authority-reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
      setSelectedReport(null);
    }
  });

  const createAlertMutation = useMutation({
    mutationFn: (data: any) => alertsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authority-alerts'] });
      setAlertForm({ title: '', message: '', severity: 'warning', type: 'traffic' });
    }
  });

  const deactivateAlertMutation = useMutation({
    mutationFn: (id: string) => alertsApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authority-alerts'] });
    }
  });

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    createAlertMutation.mutate(alertForm);
  };

  const pendingReports = reports?.filter((r: any) => r.status === 'pending') || [];
  const verifiedReports = reports?.filter((r: any) => r.status === 'verified') || [];
  const resolvedReports = reports?.filter((r: any) => r.status === 'resolved') || [];

  return (
    <div className="authority-dashboard">
      <h1>👮 Authority Dashboard</h1>

      <div className="authority-stats">
        <div className="stat-card">
          <h3>Pending Review</h3>
          <p className="stat-number pending">{pendingReports.length}</p>
        </div>
        <div className="stat-card">
          <h3>Verified</h3>
          <p className="stat-number verified">{verifiedReports.length}</p>
        </div>
        <div className="stat-card">
          <h3>Resolved</h3>
          <p className="stat-number resolved">{resolvedReports.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Alerts</h3>
          <p className="stat-number alerts">{alerts?.length || 0}</p>
        </div>
      </div>

      <div className="authority-grid">
        <div className="authority-section">
          <h2>📋 Pending Reports ({pendingReports.length})</h2>
          <div className="reports-queue">
            {pendingReports.length === 0 && <p className="empty-message">No pending reports</p>}
            {pendingReports.map((report: any) => (
              <div key={report.id} className="queue-item">
                <div className="queue-item-header">
                  <div className="badges">
                    <span className={`badge badge-${report.type}`}>{report.type}</span>
                    <span className={`severity severity-${report.severity}`}>{report.severity}</span>
                  </div>
                  <span className="time-ago">{new Date(report.createdAt).toLocaleString()}</span>
                </div>
                <h4>{report.location}</h4>
                {report.description && <p>{report.description}</p>}
                <div className="queue-actions">
                  <button
                    className="btn-action btn-verify"
                    onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'verified' })}
                  >
                    ✓ Verify
                  </button>
                  <button
                    className="btn-action btn-reject"
                    onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'false' })}
                  >
                    ✗ Reject
                  </button>
                  <button
                    className="btn-action btn-details"
                    onClick={() => setSelectedReport(report)}
                  >
                    👁 Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="authority-section">
          <h2>✅ Verified Reports ({verifiedReports.length})</h2>
          <div className="reports-queue">
            {verifiedReports.length === 0 && <p className="empty-message">No verified reports</p>}
            {verifiedReports.slice(0, 5).map((report: any) => (
              <div key={report.id} className="queue-item verified">
                <div className="queue-item-header">
                  <div className="badges">
                    <span className={`badge badge-${report.type}`}>{report.type}</span>
                    <span className={`severity severity-${report.severity}`}>{report.severity}</span>
                  </div>
                </div>
                <h4>{report.location}</h4>
                <div className="queue-actions">
                  <button
                    className="btn-action btn-resolve"
                    onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'resolved' })}
                  >
                    ✓ Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="authority-section full-width">
        <h2>📢 Create System Alert</h2>
        <form onSubmit={handleCreateAlert} className="alert-form">
          <div className="form-row">
            <div className="form-group">
              <label>Alert Type</label>
              <select
                value={alertForm.type}
                onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value })}
              >
                <option value="traffic">Traffic</option>
                <option value="incident">Incident</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="form-group">
              <label>Severity</label>
              <select
                value={alertForm.severity}
                onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={alertForm.title}
              onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
              placeholder="Alert title"
              required
            />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea
              value={alertForm.message}
              onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
              placeholder="Alert message"
              rows={3}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={createAlertMutation.isPending}>
            {createAlertMutation.isPending ? 'Creating...' : '📢 Broadcast Alert'}
          </button>
        </form>
      </div>

      <div className="authority-section full-width">
        <h2>🔔 Active Alerts ({alerts?.length || 0})</h2>
        <div className="alerts-grid">
          {alerts?.length === 0 && <p className="empty-message">No active alerts</p>}
          {alerts?.map((alert: any) => (
            <div key={alert.id} className={`alert-card alert-${alert.severity}`}>
              <div className="alert-header">
                <span className={`alert-type-badge ${alert.type}`}>{alert.type}</span>
                <span className={`alert-severity-badge ${alert.severity}`}>{alert.severity}</span>
              </div>
              <h3>{alert.title}</h3>
              <p>{alert.message}</p>
              <div className="alert-footer">
                <small>{new Date(alert.createdAt).toLocaleString()}</small>
                <button
                  className="btn-deactivate"
                  onClick={() => deactivateAlertMutation.mutate(alert.id)}
                >
                  Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Report Details</h2>
              <button className="modal-close" onClick={() => setSelectedReport(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>Type:</strong>
                <span className={`badge badge-${selectedReport.type}`}>{selectedReport.type}</span>
              </div>
              <div className="detail-row">
                <strong>Severity:</strong>
                <span className={`severity severity-${selectedReport.severity}`}>{selectedReport.severity}</span>
              </div>
              <div className="detail-row">
                <strong>Location:</strong>
                <span>{selectedReport.location}</span>
              </div>
              {selectedReport.latitude && (
                <div className="detail-row">
                  <strong>Coordinates:</strong>
                  <span>{selectedReport.latitude}, {selectedReport.longitude}</span>
                </div>
              )}
              {selectedReport.description && (
                <div className="detail-row">
                  <strong>Description:</strong>
                  <span>{selectedReport.description}</span>
                </div>
              )}
              <div className="detail-row">
                <strong>Status:</strong>
                <span className={`status status-${selectedReport.status}`}>{selectedReport.status}</span>
              </div>
              <div className="detail-row">
                <strong>Reported:</strong>
                <span>{new Date(selectedReport.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
