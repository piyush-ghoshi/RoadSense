import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, X, Search, MapPin, AlertTriangle,
  CheckCircle, Clock, Trash2, CheckCheck, XCircle,
  Navigation2, Activity, Download, FileText
} from 'lucide-react';
import { reportsApi } from '../lib/api';
import { getSocket } from '../lib/socket';
import './Reports.css';

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }

const TYPE_ICONS: Record<string, any> = {
  accident: AlertTriangle, roadblock: Activity, diversion: Navigation2, congestion: Activity, other: MapPin
};

const SEVERITY_CLASSES: Record<string, string> = {
  low: 'pill-success', medium: 'pill-warning', high: 'pill-warning', critical: 'pill-danger'
};
const SEVERITY_COLORS: Record<string, string> = {
  low: 'var(--traffic-green)', medium: 'var(--traffic-yellow)', high: 'var(--traffic-orange)', critical: 'var(--traffic-red)'
};
const STATUS_CLASSES: Record<string, string> = {
  pending: 'pill-warning', verified: 'pill-info', resolved: 'pill-success', false: 'pill-muted'
};

export default function Reports() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [formData, setFormData] = useState({
    type: 'accident', severity: 'medium', location: '', description: '',
    latitude: undefined as number | undefined, longitude: undefined as number | undefined,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => { const res = await reportsApi.getAll(); return res.data.data; }
  });

  useEffect(() => {
    const socket = getSocket();
    socket.on('report:new',     () => { queryClient.invalidateQueries({ queryKey: ['reports'] }); queryClient.invalidateQueries({ queryKey: ['reports-summary'] }); });
    socket.on('report:updated', () => queryClient.invalidateQueries({ queryKey: ['reports'] }));
    socket.on('report:deleted', () => { queryClient.invalidateQueries({ queryKey: ['reports'] }); queryClient.invalidateQueries({ queryKey: ['reports-summary'] }); });
    return () => { socket.off('report:new'); socket.off('report:updated'); socket.off('report:deleted'); };
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: (data: any) => reportsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
      setShowForm(false);
      setFormData({ type: 'accident', severity: 'medium', location: '', description: '', latitude: undefined, longitude: undefined });
      showToast('Report submitted successfully', 'success');
    },
    onError: () => showToast('Failed to submit report. Please try again.', 'error')
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => reportsApi.updateStatus(id, status),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
      showToast(`Report marked as ${vars.status}`, 'success');
    },
    onError: () => showToast('Failed to update status.', 'error')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reportsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
      showToast('Report deleted', 'info');
    },
    onError: () => showToast('Failed to delete.', 'error')
  });

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { showToast('Geolocation not supported', 'error'); return; }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setFormData(prev => ({ ...prev, latitude, longitude }));
        setLocationLoading(false);
        showToast(`GPS captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, 'success');
      },
      () => { setLocationLoading(false); showToast('Could not get location. Allow location access.', 'error'); },
      { timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location.trim()) { showToast('Please enter a location name.', 'error'); return; }
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const exportCSV = () => {
    if (!filtered || filtered.length === 0) return;
    const header = ['ID','Type','Severity','Status','Location','Description','Lat','Lng','Created'];
    const rows = filtered.map((r: any) => [
      r.id, r.type, r.severity, r.status, `"${r.location}"`, `"${r.description || ''}"`,
      r.latitude || '', r.longitude || '', new Date(r.createdAt).toLocaleString()
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'roadsense_reports.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Reports exported as CSV', 'success');
  };

  // Filter & sort
  const filtered = reports?.filter((r: any) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (filterSeverity !== 'all' && r.severity !== filterSeverity) return false;
    if (searchText && !r.location.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  }).sort((a: any, b: any) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    const sv = { critical: 4, high: 3, medium: 2, low: 1 };
    return (sv[b.severity as keyof typeof sv] || 0) - (sv[a.severity as keyof typeof sv] || 0);
  });

  const pendingCount = reports?.filter((r: any) => r.status === 'pending').length || 0;

  return (
    <div className="reports-page animate-fade-in-up">
      {/* Toast stack */}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' ? <CheckCircle size={15}/> : t.type === 'error' ? <XCircle size={15}/> : <AlertTriangle size={15}/>}
            <span className="toast-msg">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="reports-header">
        <div>
          <h1 className="page-title">Traffic Reports</h1>
          <p className="page-subtitle">{filtered?.length ?? 0} reports · {pendingCount} pending review</p>
        </div>
        <div className="reports-header-actions">
          <button className="btn-ghost" onClick={exportCSV}>
            <Download size={15}/> Export CSV
          </button>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? <><X size={15}/> Cancel</> : <><Plus size={15}/> New Report</>}
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card reports-filter-bar">
        <div className="filter-search">
          <Search size={15} className="filter-search-icon"/>
          <input
            type="text" placeholder="Search by location..."
            value={searchText} onChange={e => setSearchText(e.target.value)}
            className="filter-search-input"
          />
        </div>
        <div className="filter-pills">
          {['all','pending','verified','resolved'].map(s => (
            <button key={s} className={`filter-pill ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="filter-selects">
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="filter-select">
            <option value="all">All Types</option>
            <option value="accident">Accident</option>
            <option value="roadblock">Roadblock</option>
            <option value="diversion">Diversion</option>
            <option value="congestion">Congestion</option>
            <option value="other">Other</option>
          </select>
          <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className="filter-select">
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="severity">By Severity</option>
          </select>
        </div>
      </div>

      {/* Slide-in form panel */}
      {showForm && (
        <div className="report-form-panel card animate-slide-in-up">
          <div className="form-panel-header">
            <h2 className="section-title"><AlertTriangle size={18}/> Submit Incident Report</h2>
            <button className="btn-icon" onClick={() => setShowForm(false)}><X size={16}/></button>
          </div>
          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Incident Type</label>
                <select name="type" value={formData.type} onChange={handleChange} required>
                  <option value="accident">Accident</option>
                  <option value="roadblock">Roadblock</option>
                  <option value="diversion">Diversion</option>
                  <option value="congestion">Congestion</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Severity Level</label>
                <select name="severity" value={formData.severity} onChange={handleChange} required>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location Name <span className="required">*</span></label>
              <input type="text" name="location" value={formData.location} onChange={handleChange}
                placeholder="e.g. Vijay Nagar Square, Indore" required />
            </div>

            <div className="form-group">
              <label className="form-label">GPS Coordinates</label>
              <div className="gps-row">
                <input type="number" step="0.0001" placeholder="Latitude"
                  value={formData.latitude ?? ''}
                  onChange={e => setFormData(p => ({ ...p, latitude: e.target.value ? parseFloat(e.target.value) : undefined }))} />
                <input type="number" step="0.0001" placeholder="Longitude"
                  value={formData.longitude ?? ''}
                  onChange={e => setFormData(p => ({ ...p, longitude: e.target.value ? parseFloat(e.target.value) : undefined }))} />
                <button type="button" className="btn-ghost gps-btn" onClick={handleUseMyLocation} disabled={locationLoading}>
                  <MapPin size={14}/>
                  {locationLoading ? 'Locating...' : 'Use My Location'}
                </button>
              </div>
              {formData.latitude && formData.longitude && (
                <span className="pill pill-success" style={{ marginTop: 8, display: 'inline-flex' }}>
                  <CheckCircle size={12}/> {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange}
                placeholder="Describe the incident — vehicles involved, lanes blocked, estimated clearance time..."
                rows={3} />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                {createMutation.isPending ? <><span className="spinner"/> Submitting...</> : <><CheckCircle size={15}/> Submit Report</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reports List */}
      <div className="reports-list">
        {isLoading && (
          <div className="empty-state"><div className="spinner" style={{ width: 32, height: 32 }}/><p>Loading reports...</p></div>
        )}
        {!isLoading && filtered?.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><FileText size={24}/></div>
            <h3>No reports found</h3>
            <p>Try adjusting your filters or submit a new incident report.</p>
          </div>
        )}
        {filtered?.map((report: any) => {
          const Icon = TYPE_ICONS[report.type] || MapPin;
          return (
            <div key={report.id} className={`report-card card card-hover`} style={{ borderLeftColor: SEVERITY_COLORS[report.severity] }}>
              <div className="report-card-left">
                <div className="report-type-icon" style={{ background: `${SEVERITY_COLORS[report.severity]}18`, color: SEVERITY_COLORS[report.severity] }}>
                  <Icon size={18}/>
                </div>
              </div>
              <div className="report-card-body">
                <div className="report-card-badges">
                  <span className={`pill ${SEVERITY_CLASSES[report.severity]}`}>{report.severity}</span>
                  <span className={`pill ${STATUS_CLASSES[report.status]}`}>{report.status}</span>
                  <span className="report-type-tag">{report.type}</span>
                </div>
                <h3 className="report-card-location">{report.location}</h3>
                {report.description && <p className="report-card-desc">{report.description}</p>}
                <div className="report-card-meta">
                  {report.latitude && <span className="report-coord"><MapPin size={11}/> {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>}
                  <span className="report-time"><Clock size={11}/> {new Date(report.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="report-card-actions">
                {report.status === 'pending' && (
                  <>
                    <button className="btn-success" onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'verified' })}>
                      <CheckCheck size={13}/> Verify
                    </button>
                    <button className="btn-danger" onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'false' })}>
                      <XCircle size={13}/> Reject
                    </button>
                  </>
                )}
                {report.status === 'verified' && (
                  <button className="btn-success" onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'resolved' })}>
                    <CheckCircle size={13}/> Resolve
                  </button>
                )}
                <button className="btn-icon" style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)' }}
                  onClick={() => { if (confirm('Delete this report?')) deleteMutation.mutate(report.id); }}>
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

