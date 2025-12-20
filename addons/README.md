# 🚦 Smart Traffic Management System (STMS)

A comprehensive full-stack web application for real-time traffic monitoring, incident reporting, and intelligent route management using OpenStreetMap.

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ✨ Features

### Core Features (All Implemented ✅)

1. **🗺️ Heatmap Visualization** - Interactive OpenStreetMap with color-coded congestion
2. **📊 Historical Analytics** - Charts and trends with Recharts
3. **🚦 Live Traffic Visualization** - Real-time traffic snapshots with auto-refresh
4. **🔍 Congestion Detection** - Automatic detection with severity classification
5. **🚗 Alternate Route Suggestion** - Multiple route options with traffic consideration
6. **🔔 Real-Time Alerts** - WebSocket-powered instant notifications
7. **👮 Authority Dashboard** - Complete management interface
8. **💾 Data Storage** - Prisma ORM with SQLite database

### Additional Features

- **Marker Clustering** - Handles hundreds of markers efficiently
- **Heatmap Layer** - Visual intensity map with leaflet.heat
- **Custom Markers** - Color-coded by severity
- **Real-time Updates** - WebSocket integration with Socket.IO
- **Responsive Design** - Works on desktop and mobile
- **No API Keys Required** - Uses free OpenStreetMap

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** with TypeScript
- **Vite** (Rolldown) for blazing fast builds
- **React Router 7.9.5** for navigation
- **TanStack Query 5.90.8** for data fetching
- **Socket.IO Client 4.8.1** for real-time updates
- **Leaflet 1.9.4** with plugins (markercluster, heat)
- **Recharts 3.4.1** for data visualization
- **Axios 1.13.2** for API calls

### Backend
- **Node.js 20+** with Express 5.1.0
- **TypeScript 5.9.3**
- **Prisma 6.19.0** ORM with SQLite
- **Socket.IO 4.x** for WebSocket
- **Zod** for validation
- **CORS** enabled

## 📋 Prerequisites

- Node.js 20 or higher
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/smart-traffic-management.git
cd smart-traffic-management
```

### 2. Backend Setup

```bash
cd backend
npm install

# Setup database
npx prisma generate
npx prisma db push

# Add sample data
npm run seed

# Start backend server
npm run dev
```

Backend runs on `http://localhost:3000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install

# Start frontend server
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Access the Application

Open your browser and visit: **http://localhost:5173**

## 📁 Project Structure

```
stms/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── src/
│   │   ├── routes/             # API routes
│   │   │   ├── reports.ts      # Traffic reports endpoints
│   │   │   ├── traffic.ts      # Traffic data endpoints
│   │   │   ├── analytics.ts    # Analytics endpoints
│   │   │   └── alerts.ts       # Alerts endpoints
│   │   ├── lib/
│   │   │   └── prisma.ts       # Prisma client
│   │   ├── index.ts            # Express server
│   │   └── seed.ts             # Database seeding
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.tsx      # Main layout with navigation
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx   # Main dashboard
│   │   │   ├── TrafficMap.tsx  # Live traffic map
│   │   │   ├── Reports.tsx     # Reports management
│   │   │   └── Analytics.tsx   # Analytics page
│   │   ├── lib/
│   │   │   ├── api.ts          # API client
│   │   │   └── socket.ts       # Socket.IO client
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── docs/                        # Documentation
└── diagrams/                    # System diagrams (Mermaid)
```

## 🔌 API Endpoints

### Reports
- `GET /api/reports` - Get all reports (with filters)
- `GET /api/reports/:id` - Get specific report
- `POST /api/reports` - Create new report
- `PATCH /api/reports/:id` - Update report status

### Traffic
- `GET /api/traffic/live` - Get live traffic data
- `POST /api/traffic/snapshot` - Create traffic snapshot

### Analytics
- `GET /api/analytics/historical` - Get historical traffic data
- `GET /api/analytics/reports-summary` - Get reports summary

### Alerts
- `GET /api/alerts` - Get active alerts
- `POST /api/alerts` - Create new alert
- `PATCH /api/alerts/:id/deactivate` - Deactivate alert

## 🔄 Real-time Events

Socket.IO events:
- `alert:new` - New alert broadcast
- `traffic:update` - Traffic data update

## 🗄️ Database Schema

### Models
- **User** - User accounts (commuters and authorities)
- **TrafficReport** - User-submitted traffic incidents
- **CongestionSnapshot** - Traffic congestion data points
- **Alert** - System alerts and notifications

## 🎨 Features in Detail

### Dashboard
- Real-time statistics (total, pending, resolved reports)
- Recent reports list
- Active alerts display
- Live updates via Socket.IO

### Reports Management
- Submit new traffic reports
- Filter by type, severity, status
- Authority actions (verify, reject, resolve)
- Real-time updates

### Traffic Map
- Live traffic data visualization
- Color-coded congestion levels
- Recent snapshots display
- Ready for Google Maps integration

### Analytics
- Reports by type and severity
- Historical traffic data
- Congestion distribution
- Resolution rate statistics

## 🔮 Future Enhancements

- Google Maps API integration for interactive maps
- User authentication (JWT/Auth0)
- Route suggestion algorithm
- Mobile app (React Native)
- AI-powered traffic prediction
- IoT sensor integration
- Public transport integration

## 📚 Documentation

See the `/docs` folder for:
- Project plan and milestones
- Implementation roadmap
- Technical report
- Build plan

See the `/diagrams` folder for:
- Class diagrams
- Sequence diagrams
- Use case diagrams
- Data flow diagrams

## 🤝 Contributing

This is an educational project. Contributions are welcome!

## 📄 License

MIT License

## 👥 Authors

Smart Traffic Management System Team

---

**Note**: This is a prototype/educational project demonstrating web development skills applied to traffic management challenges.


## 📱 Pages & Features

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Overview with statistics and recent activity |
| Live Map | `/map` | OpenStreetMap with traffic markers and clustering |
| Heatmap | `/heatmap` | Visual congestion intensity map |
| Routes | `/routes` | Alternate route suggestions |
| Reports | `/reports` | Submit and manage traffic reports |
| Analytics | `/analytics` | Charts and historical data |
| Authority | `/authority` | Management dashboard for authorities |

## 🎯 API Endpoints

### Reports
- `GET /api/reports` - List all reports
- `POST /api/reports` - Create new report
- `PATCH /api/reports/:id` - Update report status

### Traffic
- `GET /api/traffic/live` - Get live traffic data
- `POST /api/traffic/snapshot` - Create traffic snapshot

### Analytics
- `GET /api/analytics/historical` - Historical traffic data
- `GET /api/analytics/reports-summary` - Summary statistics

### Alerts
- `GET /api/alerts` - Get active alerts
- `POST /api/alerts` - Create new alert

### Congestion
- `GET /api/congestion/detect` - Detect congestion in area
- `GET /api/congestion/heatmap` - Get heatmap data

### Routes
- `POST /api/routes/suggest` - Get route suggestions

## 📊 Database Schema

- **User** - User accounts with roles
- **TrafficReport** - Incident reports with geolocation
- **CongestionSnapshot** - Traffic data points
- **Alert** - System notifications

## 🔄 Real-time Features

- WebSocket connection via Socket.IO
- Live alert broadcasting
- Traffic update notifications
- Auto-refresh every 30 seconds

## 📚 Documentation

- `README.md` - This file
- `QUICKSTART.md` - Quick setup guide
- `USER_GUIDE.md` - Complete user manual
- `TESTING_GUIDE.md` - Testing instructions
- `OSM_FEATURES.md` - OpenStreetMap features
- `FINAL_STATUS.md` - Project completion status

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

Smart Traffic Management System Team

## 🙏 Acknowledgments

- OpenStreetMap contributors
- Leaflet.js community
- React and Node.js communities

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Built with ❤️ using React, Node.js, and OpenStreetMap**

**Status:** ✅ Production Ready | **Version:** 1.0.0 | **Date:** November 2025
