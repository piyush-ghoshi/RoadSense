import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '../lib/api';
import './ReportsEnhanced.css';

export default function ReportsEnhanced() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'accident',
    severity: 'medium',
    location: '',
    description: '',
    imageUrl: '',
    isEmergency: false,
    contactNumber: ''
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
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({ 
      type: 'accident', 
      severity: 'medium', 
      location: '', 
      description: '',
      imageUrl: '',
      isEmergency: false,
      contactNumber: ''
    });
    setImagePreview(null);
    setIsEmergency(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, imageUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEmergency && !formData.contactNumber) {
      alert('Please provide a contact number for emergency reports');
      return;
    }

    createMutation.mutate({
      ...formData,
      isEmergency
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEmergencyToggle = () => {
    setIsEmergency(!isEmergency);
    if (!isEmergency) {
      setFormData(prev => ({ ...prev, severity: 'critical', type: 'accident' }));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#ff5722';
      case 'critical': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'accident': return '💥';
      case 'roadblock': return '🚧';
      case 'congestion': return '🚗';
      case 'hazard': return '⚠️';
      case 'emergency': return '🚨';
      default: return '📍';
    }
  };

  return (
    <div className="reports-enhanced-page">
      <div className="reports-header">
        <div className="header-content">
          <h1>🚨 Traffic Reports & Incidents</h1>
          <p className="header-subtitle">Report incidents and track real-time traffic updates</p>
        </div>
        <div className="header-actions">
          <button 
            className={`btn-emergency ${isEmergency ? 'active' : ''}`}
            onClick={handleEmergencyToggle}
          >
            <span className="emergency-icon">🚨</span>
            {isEmergency ? 'Emergency Mode Active' : 'Emergency SOS'}
          </button>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ New Report'}
          </button>
        </div>
      </div>

      {isEmergency && (
        <div className="emergency-banner">
          <div className="emergency-pulse"></div>
          <div className="emergency-content">
            <span className="emergency-icon-large">🚨</span>
            <div>
              <h3>Emergency Mode Activated</h3>
              <p>Your report will be prioritized and sent to nearby emergency services</p>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="report-form-container">
          <div className="form-header">
            <h2>{isEmergency ? '🚨 Emergency Report' : '📝 Submit Traffic Report'}</h2>
            <div className="current-time">
              <span className="time-icon">🕐</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-row">
              <div className="form-group">
                <label>
                  <span className="label-icon">📋</span>
                  Incident Type
                </label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange} 
                  required
                  disabled={isEmergency}
                >
                  <option value="accident">💥 Accident</option>
                  <option value="roadblock">🚧 Roadblock</option>
                  <option value="congestion">🚗 Traffic Congestion</option>
                  <option value="hazard">⚠️ Road Hazard</option>
                  <option value="emergency">🚨 Emergency</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">⚡</span>
                  Severity Level
                </label>
                <select 
                  name="severity" 
                  value={formData.severity} 
                  onChange={handleChange} 
                  required
                  disabled={isEmergency}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="critical">🔴 Critical</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">📍</span>
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., MG Road, Rajwada Chowk, Indore"
                required
              />
            </div>

            {isEmergency && (
              <div className="form-group emergency-contact">
                <label>
                  <span className="label-icon">📞</span>
                  Emergency Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>
                <span className="label-icon">📝</span>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed information about the incident..."
                rows={4}
                required
              />
            </div>

            <div className="form-group image-upload-group">
              <label>
                <span className="label-icon">📸</span>
                Upload Incident Photo (Optional)
              </label>
              <div className="image-upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      className="btn-remove-image"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, imageUrl: '' }));
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-upload"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="upload-icon">📷</span>
                    <span>Click to upload photo</span>
                    <span className="upload-hint">Max size: 5MB</span>
                  </button>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => {
                setShowForm(false);
                resetForm();
              }}>
                Cancel
              </button>
              <button 
                type="submit" 
                className={`btn-submit ${isEmergency ? 'emergency' : ''}`}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : isEmergency ? (
                  <>
                    <span>🚨</span>
                    Send Emergency Report
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="reports-list">
        <h2>Recent Reports ({reports?.length || 0})</h2>
        
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading reports...</p>
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="reports-grid">
            {reports.map((report: any) => (
              <div 
                key={report.id} 
                className={`report-card ${report.isEmergency ? 'emergency' : ''} ${report.status}`}
              >
                {report.isEmergency && (
                  <div className="emergency-badge">
                    <span className="pulse-dot"></span>
                    EMERGENCY
                  </div>
                )}
                
                <div className="report-header">
                  <div className="report-type">
                    <span className="type-icon">{getTypeIcon(report.type)}</span>
                    <span className="type-text">{report.type}</span>
                  </div>
                  <div 
                    className="severity-badge"
                    style={{ backgroundColor: getSeverityColor(report.severity) }}
                  >
                    {report.severity}
                  </div>
                </div>

                {report.imageUrl && (
                  <div className="report-image">
                    <img src={report.imageUrl} alt="Incident" />
                  </div>
                )}

                <div className="report-content">
                  <h3>{report.location}</h3>
                  <p>{report.description}</p>
                  
                  {report.contactNumber && (
                    <div className="contact-info">
                      <span className="contact-icon">📞</span>
                      <span>{report.contactNumber}</span>
                    </div>
                  )}
                </div>

                <div className="report-footer">
                  <div className="report-time">
                    <span className="time-icon">🕐</span>
                    <span>{new Date(report.createdAt).toLocaleString()}</span>
                  </div>
                  <div className={`status-badge status-${report.status}`}>
                    {report.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No Reports Yet</h3>
            <p>Be the first to report a traffic incident</p>
          </div>
        )}
      </div>
    </div>
  );
}
