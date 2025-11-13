import { useQuery } from '@tanstack/react-query';
import { analyticsApi, reportsApi, alertsApi } from '../lib/api';
import './Dashboard.css';

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['reports-summary'],
    queryFn: async () => {
      const res = await analyticsApi.getReportsSummary();
      console.log('Summary data:', res.data);
      return res.data.data;
    }
  });

  const { data: recentReports, isLoading: reportsLoading, error: reportsError } = useQuery({
    queryKey: ['recent-reports'],
    queryFn: async () => {
      const res = await reportsApi.getAll({ limit: 5 });
      console.log('Recent reports:', res.data);
      return res.data.data;
    }
  });

  const { data: activeAlerts, isLoading: alertsLoading, error: alertsError } = useQuery({
    queryKey: ['active-alerts'],
    queryFn: async () => {
      const res = await alertsApi.getAll();
      console.log('Active alerts:', res.data);
      return res.data.data;
    }
  });

  console.log('Dashboard state:', { summary, recentReports, activeAlerts });

  if (summaryLoading || reportsLoading || alertsLoading) {
    return <div className="dashboard"><h1>Loading...</h1></div>;
  }

  if (summaryError || reportsError || alertsError) {
    return (
      <div className="dashboard">
        <h1>Error Loading Dashboard</h1>
        <p>Please check the console for details.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Traffic Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Reports</h3>
          <p className="stat-value">{summary?.total || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-value pending">{summary?.pending || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Resolved</h3>
          <p className="stat-value resolved">{summary?.resolved || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Active Alerts</h3>
          <p className="stat-value alerts">{activeAlerts?.length || 0}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2>Recent Reports</h2>
          <div className="reports-list">
            {!recentReports || recentReports.length === 0 ? (
              <p>No reports yet</p>
            ) : (
              recentReports.map((report: any) => (
              <div key={report.id} className="report-item">
                <div className="report-header">
                  <span className={`badge badge-${report.type}`}>{report.type}</span>
                  <span className={`severity severity-${report.severity}`}>{report.severity}</span>
                </div>
                <p className="report-location">{report.location}</p>
                <p className="report-time">{new Date(report.createdAt).toLocaleString()}</p>
              </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Active Alerts</h2>
          <div className="alerts-list">
            {!activeAlerts || activeAlerts.length === 0 ? (
              <p>No active alerts</p>
            ) : (
              activeAlerts.map((alert: any) => (
              <div key={alert.id} className={`alert-item alert-${alert.severity}`}>
                <h4>{alert.title}</h4>
                <p>{alert.message}</p>
                <small>{new Date(alert.createdAt).toLocaleString()}</small>
              </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
