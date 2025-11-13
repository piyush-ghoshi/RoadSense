import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import type { Alert } from '../types';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    try {
      const socket = getSocket();

      socket.on('alert:new', (alert: Alert) => {
        setAlerts(prev => [alert, ...prev].slice(0, 5));
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
          setAlerts(prev => prev.filter(a => a.id !== alert.id));
        }, 10000);
      });

      return () => {
        socket.off('alert:new');
      };
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>🚦 Smart Traffic</h1>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/map" className={isActive('/map') ? 'active' : ''}>
              Live Map
            </Link>
          </li>
          <li>
            <Link to="/heatmap" className={isActive('/heatmap') ? 'active' : ''}>
              Heatmap
            </Link>
          </li>
          <li>
            <Link to="/routes" className={isActive('/routes') ? 'active' : ''}>
              Routes
            </Link>
          </li>
          <li>
            <Link to="/reports" className={isActive('/reports') ? 'active' : ''}>
              Reports
            </Link>
          </li>
          <li>
            <Link to="/analytics" className={isActive('/analytics') ? 'active' : ''}>
              Analytics
            </Link>
          </li>
          <li>
            <Link to="/authority" className={isActive('/authority') ? 'active' : ''}>
              Authority
            </Link>
          </li>
        </ul>
      </nav>

      {alerts.length > 0 && (
        <div className="alerts-container">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert alert-${alert.severity}`}>
              <strong>{alert.title}</strong>
              <p>{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
