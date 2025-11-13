export interface TrafficReport {
  id: string;
  userId?: string;
  type: 'accident' | 'roadblock' | 'diversion' | 'congestion' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  status: 'pending' | 'verified' | 'resolved' | 'false';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CongestionSnapshot {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  congestionLevel: 'light' | 'moderate' | 'heavy' | 'severe';
  trafficSpeed?: number;
  timestamp: string;
}

export interface Alert {
  id: string;
  type: 'traffic' | 'incident' | 'system';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  location?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface ReportsSummary {
  total: number;
  pending: number;
  resolved: number;
  byType: Array<{ type: string; _count: number }>;
  bySeverity: Array<{ severity: string; _count: number }>;
}
