import { type ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Map, Flame, Navigation2, FileText,
  BarChart3, Shield, LogOut, Bell, Wifi, WifiOff,
  ChevronLeft, ChevronRight, X, Menu
} from 'lucide-react';
import { getSocket } from '../lib/socket';
import type { Alert } from '../types';
import './Layout.css';

interface LayoutProps { children: ReactNode; }

const NAV_ITEMS = [
  { path: '/',          label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/map',       label: 'Live Map',     icon: Map },
  { path: '/heatmap',   label: 'Heatmap',      icon: Flame },
  { path: '/routes',    label: 'Routes',       icon: Navigation2 },
  { path: '/reports',   label: 'Reports',      icon: FileText },
  { path: '/analytics', label: 'Analytics',    icon: BarChart3 },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [toastAlerts, setToastAlerts] = useState<Alert[]>([]);
  const [isAuthorityVerified, setIsAuthorityVerified] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setIsAuthorityVerified(localStorage.getItem('authorityVerified') === 'true');
  }, [location]);

  useEffect(() => {
    try {
      const socket = getSocket();
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
      if (socket.connected) setIsConnected(true);

      socket.on('alert:new', (alert: Alert) => {
        setAlerts(prev => [alert, ...prev].slice(0, 20));
        setToastAlerts(prev => [alert, ...prev].slice(0, 3));
        setUnreadCount(c => c + 1);
        setTimeout(() => {
          setToastAlerts(prev => prev.filter(a => a.id !== alert.id));
        }, 6000);
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('alert:new');
      };
    } catch { /* socket not available */ }
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('authorityVerified');
    localStorage.removeItem('authorityData');
    setIsAuthorityVerified(false);
    navigate('/');
  };

  const authorityPath = isAuthorityVerified ? '/authority' : '/authority-login';
  const authorityLabel = isAuthorityVerified ? 'Authority Panel' : 'Authority Login';

  return (
    <div className={`rs-layout ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Mobile overlay */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      {/* ── SIDEBAR ── */}
      <aside className="rs-sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#3B82F6"/>
              <circle cx="14" cy="8"  r="3" fill="#EF4444"/>
              <circle cx="14" cy="14" r="3" fill="#EAB308"/>
              <circle cx="14" cy="20" r="3" fill="#22C55E"/>
            </svg>
          </div>
          {!collapsed && <span className="brand-name">RoadSense</span>}
          <button className="collapse-btn desktop-only" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
          </button>
          <button className="collapse-btn mobile-only" onClick={() => setMobileOpen(false)}>
            <X size={16}/>
          </button>
        </div>

        {/* Status Strip */}
        {!collapsed && (
          <div className="sidebar-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}/>
            <span className="status-text">
              {isConnected ? 'System Online' : 'Connecting...'}
            </span>
            {isConnected ? <Wifi size={12} className="status-icon connected"/> : <WifiOff size={12} className="status-icon disconnected"/>}
          </div>
        )}

        {/* Nav Items */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">{!collapsed && 'Navigation'}</div>
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-item ${isActive(path) ? 'active' : ''}`}
              title={collapsed ? label : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} className="nav-icon" />
              {!collapsed && <span className="nav-label">{label}</span>}
              {!collapsed && isActive(path) && <span className="nav-active-bar"/>}
            </Link>
          ))}

          <div className="nav-divider"/>

          <Link
            to={authorityPath}
            className={`nav-item ${isActive(authorityPath) || isActive('/authority') ? 'active' : ''}`}
            title={collapsed ? authorityLabel : undefined}
            onClick={() => setMobileOpen(false)}
          >
            <Shield size={18} className="nav-icon" />
            {!collapsed && <span className="nav-label">{authorityLabel}</span>}
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {isAuthorityVerified && (
            <button className="nav-item nav-logout" onClick={handleLogout} title={collapsed ? 'Sign Out' : undefined}>
              <LogOut size={18} className="nav-icon" />
              {!collapsed && <span className="nav-label">Sign Out</span>}
            </button>
          )}
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="rs-main">
        {/* Top bar */}
        <header className="rs-topbar">
          <button className="topbar-hamburger mobile-only" onClick={() => setMobileOpen(true)}>
            <Menu size={20}/>
          </button>

          <div className="topbar-left">
            <span className="topbar-breadcrumb">
              {NAV_ITEMS.find(n => n.path === location.pathname)?.label ||
               (isActive('/authority') || isActive('/authority-login') ? 'Authority' : 'RoadSense')}
            </span>
          </div>

          <div className="topbar-right">
            <div className="live-indicator">
              <span className="live-dot"/>
              <span>Live</span>
            </div>

            {/* Notification bell */}
            <div className="notif-wrapper">
              <button className="btn-icon" onClick={() => { setNotifOpen(!notifOpen); setUnreadCount(0); }}>
                <Bell size={16}/>
                {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>

              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span className="notif-title">Alerts</span>
                    <button className="btn-icon" onClick={() => setNotifOpen(false)}><X size={14}/></button>
                  </div>
                  <div className="notif-list">
                    {alerts.length === 0 ? (
                      <div className="notif-empty">No recent alerts</div>
                    ) : (
                      alerts.slice(0, 10).map(alert => (
                        <div key={alert.id} className={`notif-item notif-${alert.severity}`}>
                          <div className="notif-item-title">{alert.title}</div>
                          <div className="notif-item-msg">{alert.message}</div>
                          <div className="notif-item-time">{new Date(alert.createdAt).toLocaleTimeString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="rs-content">
          {children}
        </main>
      </div>

      {/* Toast alerts */}
      <div className="toast-stack">
        {toastAlerts.map(alert => (
          <div key={alert.id} className={`toast toast-${alert.severity === 'critical' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'}`}>
            <div>
              <div className="toast-msg" style={{ fontWeight: 600 }}>{alert.title}</div>
              <div className="toast-msg" style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: 2 }}>{alert.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
