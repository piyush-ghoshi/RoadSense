import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock, CheckCircle, XCircle, CheckCheck,
  Bell, X, Eye, RefreshCw,
  Megaphone
} from 'lucide-react';
import { reportsApi, alertsApi } from '../lib/api';
import './AuthorityDashboard.css';

const SEVERITY_PILL: Record<string, string> = { low: 'pill-success', medium: 'pill-warning', high: 'pill-warning', critical: 'pill-danger' };
const ALERT_PILL:   Record<string, string> = { info: 'pill-info', warning: 'pill-warning', critical: 'pill-danger' };

export default function AuthorityDashboard() {
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [alertForm, setAlertForm] = useState({ title: '', message: '', severity: 'warning', type: 'traffic' });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const { data: reports, refetch: refetchReports } = useQuery({
    queryKey: ['authority-reports'],
    queryFn: async () => { const res = await reportsApi.getAll({ limit: 100 }); return res.data.data; },
    refetchInterval: 10000
  });

  const { data: alerts } = useQuery({
    queryKey: ['authority-alerts'],
    queryFn: async () => { const res = await alertsApi.getAll(); return res.data.data; }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => reportsApi.updateStatus(id, status),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['authority-reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
      setSelectedReport(null);
      showToast(`Report marked as ${vars.status}`);
    }
  });

  const createAlertMutation = useMutation({
    mutationFn: (data: any) => alertsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authority-alerts'] });
      setAlertForm({ title: '', message: '', severity: 'warning', type: 'traffic' });
      showToast('Alert broadcast successfully');
    }
  });

  const deactivateAlertMutation = useMutation({
    mutationFn: (id: string) => alertsApi.deactivate(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['authority-alerts'] }); showToast('Alert deactivated'); }
  });

  const handleCreateAlert = (e: React.FormEvent) => { e.preventDefault(); createAlertMutation.mutate(alertForm); };

  const pending  = reports?.filter((r: any) => r.status === 'pending')  || [];
  const verified = reports?.filter((r: any) => r.status === 'verified') || [];
  const resolved = reports?.filter((r: any) => r.status === 'resolved') || [];

  return (
    <div className="authority-page animate-fade-in-up">
      {/* Toast */}
      {toast && (
        <div className="toast-stack">
          <div className="toast toast-success"><CheckCircle size={14}/><span className="toast-msg">{toast}</span></div>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Authority Control Panel</h1>
          <p className="page-subtitle">Manage reports, broadcast alerts, and monitor incidents</p>
        </div>
        <button className="btn-ghost" onClick={() => refetchReports()}>
          <RefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* KPI Row */}
      <div className="authority-kpi-grid">
        {[
          { label: 'Pending Review', value: pending.length,  icon: Clock,         color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
          { label: 'Verified',       value: verified.length, icon: CheckCircle,   color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
          { label: 'Resolved',       value: resolved.length, icon: CheckCheck,    color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
          { label: 'Active Alerts',  value: alerts?.length || 0, icon: Bell,      color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
        ].map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-card-icon" style={{ background: k.bg }}><Icon size={18} color={k.color}/></div>
              </div>
              <div className="kpi-card-value">{k.value}</div>
              <div className="kpi-card-label">{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {/* Pending Column */}
        <div className="kanban-column card">
          <div className="kanban-column-header pending-header">
            <div className="section-title"><Clock size={15}/> Pending</div>
            <span className="pill pill-warning">{pending.length}</span>
          </div>
          <div className="kanban-cards">
            {pending.length === 0 && <div className="empty-state" style={{ padding: 'var(--sp-4)' }}><p>No pending reports</p></div>}
            {pending.map((r: any) => (
              <ReportKanbanCard key={r.id} report={r}
                onVerify={() => updateStatusMutation.mutate({ id: r.id, status: 'verified' })}
                onReject={() => updateStatusMutation.mutate({ id: r.id, status: 'false' })}
                onDetails={() => setSelectedReport(r)}
                showVerify showReject showDetails />
            ))}
          </div>
        </div>

        {/* Verified Column */}
        <div className="kanban-column card">
          <div className="kanban-column-header verified-header">
            <div className="section-title"><CheckCircle size={15}/> Verified</div>
            <span className="pill pill-info">{verified.length}</span>
          </div>
          <div className="kanban-cards">
            {verified.length === 0 && <div className="empty-state" style={{ padding: 'var(--sp-4)' }}><p>No verified reports</p></div>}
            {verified.slice(0, 8).map((r: any) => (
              <ReportKanbanCard key={r.id} report={r}
                onResolve={() => updateStatusMutation.mutate({ id: r.id, status: 'resolved' })}
                onDetails={() => setSelectedReport(r)}
                showResolve showDetails />
            ))}
          </div>
        </div>

        {/* Resolved Column */}
        <div className="kanban-column card">
          <div className="kanban-column-header resolved-header">
            <div className="section-title"><CheckCheck size={15}/> Resolved</div>
            <span className="pill pill-success">{resolved.length}</span>
          </div>
          <div className="kanban-cards">
            {resolved.length === 0 && <div className="empty-state" style={{ padding: 'var(--sp-4)' }}><p>No resolved reports</p></div>}
            {resolved.slice(0, 8).map((r: any) => (
              <ReportKanbanCard key={r.id} report={r} onDetails={() => setSelectedReport(r)} showDetails />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="authority-bottom-grid">
        {/* Broadcast Alert Form */}
        <div className="card alert-form-card">
          <div className="section-title" style={{ marginBottom: 'var(--sp-5)' }}>
            <Megaphone size={16}/> Broadcast System Alert
          </div>
          <form onSubmit={handleCreateAlert} className="alert-form">
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Alert Type</label>
                <select value={alertForm.type} onChange={e => setAlertForm({ ...alertForm, type: e.target.value })}>
                  <option value="traffic">Traffic</option>
                  <option value="incident">Incident</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Severity</label>
                <select value={alertForm.severity} onChange={e => setAlertForm({ ...alertForm, severity: e.target.value })}>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Alert Title</label>
              <input type="text" value={alertForm.title} onChange={e => setAlertForm({ ...alertForm, title: e.target.value })} placeholder="e.g., Road Closed — NH47" required />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea value={alertForm.message} onChange={e => setAlertForm({ ...alertForm, message: e.target.value })} placeholder="Describe the situation for citizens..." rows={3} required />
            </div>
            <button type="submit" className="btn-primary" disabled={createAlertMutation.isPending} style={{ width: '100%', justifyContent: 'center' }}>
              {createAlertMutation.isPending ? <><span className="spinner"/> Broadcasting...</> : <><Megaphone size={15}/> Broadcast Alert</>}
            </button>
          </form>
        </div>

        {/* Active Alerts */}
        <div className="card">
          <div className="section-header" style={{ marginBottom: 'var(--sp-4)' }}>
            <div className="section-title"><Bell size={16}/> Active Alerts</div>
            <span className="pill pill-danger">{alerts?.length || 0}</span>
          </div>
          <div className="active-alerts-list">
            {(!alerts || alerts.length === 0) && (
              <div className="empty-state"><div className="empty-state-icon"><CheckCircle size={22}/></div><p>No active alerts</p></div>
            )}
            {alerts?.map((alert: any) => (
              <div key={alert.id} className={`active-alert-card alert-sev-${alert.severity}`}>
                <div className="active-alert-header">
                  <span className={`pill ${ALERT_PILL[alert.severity]}`}>{alert.severity}</span>
                  <span className="alert-type-label">{alert.type}</span>
                  <span className="alert-time">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="active-alert-title">{alert.title}</div>
                <div className="active-alert-msg">{alert.message}</div>
                <button className="btn-danger" style={{ marginTop: 'var(--sp-2)', padding: '4px 12px', fontSize: '0.75rem' }}
                  onClick={() => deactivateAlertMutation.mutate(alert.id)}>
                  <XCircle size={12}/> Deactivate
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="section-title"><Eye size={16}/> Report Details</h2>
              <button className="btn-icon" onClick={() => setSelectedReport(null)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              <div className="modal-detail-row">
                <span className="modal-detail-label">Type</span>
                <span className="modal-detail-value">{selectedReport.type}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Severity</span>
                <span className={`pill ${SEVERITY_PILL[selectedReport.severity]}`}>{selectedReport.severity}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Location</span>
                <span className="modal-detail-value">{selectedReport.location}</span>
              </div>
              {selectedReport.latitude && (
                <div className="modal-detail-row">
                  <span className="modal-detail-label">GPS</span>
                  <span className="modal-detail-value">{selectedReport.latitude.toFixed(5)}, {selectedReport.longitude.toFixed(5)}</span>
                </div>
              )}
              {selectedReport.description && (
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Description</span>
                  <span className="modal-detail-value">{selectedReport.description}</span>
                </div>
              )}
              <div className="modal-detail-row">
                <span className="modal-detail-label">Status</span>
                <span className={`pill ${SEVERITY_PILL[selectedReport.status] || 'pill-muted'}`}>{selectedReport.status}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Reported</span>
                <span className="modal-detail-value">{new Date(selectedReport.createdAt).toLocaleString()}</span>
              </div>
            </div>
            {selectedReport.status === 'pending' && (
              <div className="modal-actions">
                <button className="btn-success" onClick={() => updateStatusMutation.mutate({ id: selectedReport.id, status: 'verified' })}>
                  <CheckCheck size={14}/> Verify
                </button>
                <button className="btn-danger" onClick={() => updateStatusMutation.mutate({ id: selectedReport.id, status: 'false' })}>
                  <XCircle size={14}/> Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportKanbanCard({ report, onVerify, onReject, onResolve, onDetails, showVerify, showReject, showResolve, showDetails }: any) {
  return (
    <div className="kanban-card">
      <div className="kanban-card-badges">
        <span className={`pill ${SEVERITY_PILL[report.severity]}`}>{report.severity}</span>
        <span className="kanban-card-type">{report.type}</span>
      </div>
      <div className="kanban-card-location">{report.location}</div>
      {report.description && <div className="kanban-card-desc">{report.description}</div>}
      <div className="kanban-card-time">{new Date(report.createdAt).toLocaleString()}</div>
      <div className="kanban-card-actions">
        {showVerify  && <button className="btn-success"  style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={onVerify}><CheckCheck size={12}/> Verify</button>}
        {showReject  && <button className="btn-danger"   style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={onReject}><XCircle size={12}/> Reject</button>}
        {showResolve && <button className="btn-success"  style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={onResolve}><CheckCircle size={12}/> Resolve</button>}
        {showDetails && <button className="btn-ghost"    style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={onDetails}><Eye size={12}/> Details</button>}
      </div>
    </div>
  );
}

