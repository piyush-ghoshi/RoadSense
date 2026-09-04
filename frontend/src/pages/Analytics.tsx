import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, FileText, CheckCircle, Clock, Activity } from 'lucide-react';
import { analyticsApi } from '../lib/api';
import './Analytics.css';

const PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px', boxShadow: 'var(--shadow-lg)'
    }}>
      {label && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize: '0.85rem', color: p.color || 'var(--text-primary)', fontWeight: 600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { data: summary } = useQuery({
    queryKey: ['reports-summary'],
    queryFn: async () => { const res = await analyticsApi.getReportsSummary(); return res.data.data; }
  });

  const { data: historical } = useQuery({
    queryKey: ['historical-data'],
    queryFn: async () => { const res = await analyticsApi.getHistorical(); return res.data; }
  });

  const typeChartData = summary?.byType?.map((item: any) => ({
    name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    value: item._count
  })) || [];

  const severityChartData = summary?.bySeverity?.map((item: any) => ({
    name: item.severity.charAt(0).toUpperCase() + item.severity.slice(1),
    value: item._count
  })) || [];

  const congestionData = historical?.stats?.congestionDistribution
    ? Object.entries(historical.stats.congestionDistribution).map(([level, count]) => ({
        name: level.charAt(0).toUpperCase() + level.slice(1), value: count as number
      }))
    : [];

  const resolutionRate = summary?.total
    ? Math.round((summary.resolved / summary.total) * 100)
    : 0;

  const kpis = [
    { label: 'Total Reports', value: summary?.total ?? 0, icon: FileText, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
    { label: 'Pending', value: summary?.pending ?? 0, icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Resolved', value: summary?.resolved ?? 0, icon: CheckCircle, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Avg Speed', value: `${historical?.stats?.avgSpeed?.toFixed(1) || 0} km/h`, icon: Activity, color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
  ];

  return (
    <div className="analytics-page animate-fade-in-up">
      <div>
        <h1 className="page-title">Traffic Analytics</h1>
        <p className="page-subtitle">Insights and trends from your traffic data</p>
      </div>

      {/* KPI Row */}
      <div className="analytics-kpi-grid">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-card-icon" style={{ background: kpi.bg }}>
                  <Icon size={18} color={kpi.color} />
                </div>
              </div>
              <div className="kpi-card-value">{kpi.value}</div>
              <div className="kpi-card-label">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Resolution Rate */}
      <div className="card">
        <div className="section-header">
          <div className="section-title"><TrendingUp size={16}/> Resolution Rate</div>
          <span className="resolution-rate-value">{resolutionRate}%</span>
        </div>
        <div className="resolution-bar-track">
          <div className="resolution-bar-fill" style={{ width: `${resolutionRate}%` }}/>
        </div>
        <div className="resolution-bar-labels">
          <span>{summary?.resolved || 0} resolved</span>
          <span>{summary?.total || 0} total</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Bar Chart — Reports by Type */}
        <div className="card chart-card">
          <div className="section-title" style={{ marginBottom: 'var(--sp-5)' }}>
            Reports by Type
          </div>
          {typeChartData.length === 0 ? (
            <div className="empty-state"><p>No data available</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={typeChartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip />}/>
                <Bar dataKey="value" name="Reports" radius={[6,6,0,0]}>
                  {typeChartData.map((_: any, i: number) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut Chart — Severity */}
        <div className="card chart-card">
          <div className="section-title" style={{ marginBottom: 'var(--sp-5)' }}>
            Reports by Severity
          </div>
          {severityChartData.length === 0 ? (
            <div className="empty-state"><p>No data available</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={severityChartData}
                  cx="50%" cy="50%"
                  innerRadius={65} outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {severityChartData.map((_: any, i: number) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]}/>
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />}/>
                <Legend iconType="circle" iconSize={10} formatter={(val) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{val}</span>}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Congestion Distribution */}
        {congestionData.length > 0 && (
          <div className="card chart-card">
            <div className="section-title" style={{ marginBottom: 'var(--sp-5)' }}>
              Congestion Distribution
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={congestionData} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false}/>
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={80}/>
                <Tooltip content={<CustomTooltip />}/>
                <Bar dataKey="value" name="Count" radius={[0,6,6,0]}>
                  {congestionData.map((_: any, i: number) => (
                    <Cell key={i} fill={['#22C55E','#EAB308','#F97316','#EF4444'][i % 4]}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Historical Stats */}
        <div className="card chart-card">
          <div className="section-title" style={{ marginBottom: 'var(--sp-5)' }}>
            Historical Summary
          </div>
          <div className="hist-stats-grid">
            <div className="hist-stat-item">
              <div className="hist-stat-value">{historical?.stats?.totalSnapshots || 0}</div>
              <div className="hist-stat-label">Traffic Snapshots</div>
            </div>
            <div className="hist-stat-item">
              <div className="hist-stat-value">{historical?.stats?.avgSpeed?.toFixed(1) || 0}</div>
              <div className="hist-stat-label">Avg Speed (km/h)</div>
            </div>
            <div className="hist-stat-item">
              <div className="hist-stat-value">{resolutionRate}%</div>
              <div className="hist-stat-label">Resolution Rate</div>
            </div>
            <div className="hist-stat-item">
              <div className="hist-stat-value">{summary?.total || 0}</div>
              <div className="hist-stat-label">Total Reports</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
