import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '../lib/api';
import './Reports.css';

export default function Reports() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'accident',
    severity: 'medium',
    location: '',
    description: ''
  });

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await reportsApi.getAll();
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => reportsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
      setShowForm(false);
      setFormData({ type: 'accident', severity: 'medium', location: '', description: '' });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      reportsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>Traffic Reports</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Report'}
        </button>
      </div>

      {showForm && (
        <div className="report-form-container">
          <h2>Submit Traffic Report</h2>
          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleChange} required>
                <option value="accident">Accident</option>
                <option value="roadblock">Roadblock</option>
                <option value="diversion">Diversion</option>
                <option value="congestion">Congestion</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Severity</label>
              <select name="severity" value={formData.severity} onChange={handleChange} required>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Additional details..."
                rows={4}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>
      )}

      <div className="reports-list-container">
        <h2>All Reports ({reports?.length || 0})</h2>
        {isLoading && <p>Loading reports...</p>}
        {reports?.length === 0 && <p>No reports found</p>}
        <div className="reports-table">
          {reports?.map((report: any) => (
            <div key={report.id} className="report-row">
              <div className="report-main">
                <div className="report-badges">
                  <span className={`badge badge-${report.type}`}>{report.type}</span>
                  <span className={`severity severity-${report.severity}`}>{report.severity}</span>
                  <span className={`status status-${report.status}`}>{report.status}</span>
                </div>
                <h3>{report.location}</h3>
                {report.description && <p>{report.description}</p>}
                <small>{new Date(report.createdAt).toLocaleString()}</small>
              </div>
              <div className="report-actions">
                {report.status === 'pending' && (
                  <>
                    <button
                      className="btn-small btn-success"
                      onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'verified' })}
                    >
                      Verify
                    </button>
                    <button
                      className="btn-small btn-danger"
                      onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'false' })}
                    >
                      Reject
                    </button>
                  </>
                )}
                {report.status === 'verified' && (
                  <button
                    className="btn-small btn-success"
                    onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'resolved' })}
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
