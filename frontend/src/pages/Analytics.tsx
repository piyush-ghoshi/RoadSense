import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { analyticsApi } from '../lib/api';
import './Analytics.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Analytics() {
  const { data: summary } = useQuery({
    queryKey: ['reports-summary'],
    queryFn: async () => {
      const res = await analyticsApi.getReportsSummary();
      return res.data.data;
    }
  });

  const { data: historical } = useQuery({
    queryKey: ['historical-data'],
    queryFn: async () => {
      const res = await analyticsApi.getHistorical();
      return res.data;
    }
  });

  // Prepare chart data
  const typeChartData = summary?.byType?.map((item: any) => ({
    name: item.type,
    value: item._count
  })) || [];

  const severityChartData = summary?.bySeverity?.map((item: any) => ({
    name: item.severity,
    value: item._count
  })) || [];

  return (
    <div className="analytics-page">
      <h1>📊 Traffic Analytics</h1>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h2>Reports by Type</h2>
          <div className="chart-placeholder">
            {typeChartData.length === 0 ? (
              <p>No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#0f3460" name="Reports" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="analytics-card">
          <h2>Reports by Severity</h2>
          <div className="chart-placeholder">
            {severityChartData.length === 0 ? (
              <p>No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {severityChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="analytics-card full-width">
          <h2>Historical Traffic Data</h2>
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-label">Total Snapshots</span>
              <span className="stat-number">{historical?.stats?.totalSnapshots || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg Speed</span>
              <span className="stat-number">
                {historical?.stats?.avgSpeed?.toFixed(1) || 0} km/h
              </span>
            </div>
          </div>
          
          {historical?.stats?.congestionDistribution && (
            <div className="congestion-distribution">
              <h3>Congestion Distribution</h3>
              <div className="distribution-grid">
                {Object.entries(historical.stats.congestionDistribution).map(([level, count]: [string, any]) => (
                  <div key={level} className={`distribution-item level-${level}`}>
                    <div className="distribution-label">{level}</div>
                    <div className="distribution-count">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="analytics-card full-width">
          <h2>Summary Statistics</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <h3>Total Reports</h3>
              <p className="summary-value">{summary?.total || 0}</p>
            </div>
            <div className="summary-item">
              <h3>Pending Review</h3>
              <p className="summary-value pending">{summary?.pending || 0}</p>
            </div>
            <div className="summary-item">
              <h3>Resolved</h3>
              <p className="summary-value resolved">{summary?.resolved || 0}</p>
            </div>
            <div className="summary-item">
              <h3>Resolution Rate</h3>
              <p className="summary-value">
                {summary?.total ? ((summary.resolved / summary.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
