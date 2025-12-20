# 🚦 RoadSense - Smart Traffic Management System

A comprehensive full-stack web application for real-time traffic monitoring, incident reporting, and intelligent route management. Built with modern technologies to provide commuters and traffic authorities with actionable traffic insights.

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-green.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5+-blue.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

### Core Features (All Implemented ✅)

1. **🗺️ Heatmap Visualization**
   - Interactive map with color-coded congestion intensity
   - Real-time updates from traffic reports
   - Customizable map layers (OpenStreetMap, Google Maps)
   - Time range filtering

2. **📊 Historical Analytics**
   - Comprehensive charts and graphs using Recharts
   - Reports breakdown by type and severity
   - Traffic trend analysis
   - Historical data visualization

3. **🚦 Live Traffic Visualization**
   - Real-time traffic snapshots from 6 major locations
   - Auto-refresh every 30 seconds
   - Speed and congestion level indicators
   - Interactive incident markers

4. **🔍 Congestion Detection**
   - Automatic detection algorithm
   - Severity classification (low, moderate, high, severe)
   - Area-based analysis
   - Related incidents correlation

5. **🚗 Alternate Route Suggestion**
   - Multiple route options for congested areas
   - Distance and duration estimates
   - Traffic-adjusted routing
   - Route comparison interface
   - Haversine formula for distance calculation

6. **🔔 Real-Time Alerts**
   - WebSocket-powered instant notifications
   - Toast notifications with auto-dismiss
   - Severity-based styling
   - Alert history tracking

7. **👮 Authority Dashboard**
   - Report verification and management
   - Create system-wide alerts
   - Incident management interface
   - Real-time report updates

8. **💾 Data Storage**
   - Prisma ORM with SQLite/PostgreSQL
   - Comprehensive data models
   - Full CRUD operations
   - Database migrations support

### Additional Features

- **Marker Clustering** - Handles hundreds of markers efficiently
- **Heatmap Layer** - Visual intensity map with leaflet.heat
- **Custom Markers** - Color-coded by severity
- **Real-time Updates** - WebSocket integration with Socket.IO
- **Responsive Design** - Works on desktop and mobile
- **No API Keys Required** - Uses free OpenStreetMap

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Real-time**: Socket.IO Client
- **UI Components**: Material-UI, Custom CSS
- **Maps**: Leaflet.js, OpenStreetMap, Google Maps API
- **Charts**: Recharts
- **Styling**: CSS3, Responsive Design

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **ORM**: Prisma
- **Real-time**: Socket.IO
- **Database**: SQLite (default) / PostgreSQL
- **Validation**: Zod
- **Language**: TypeScript
- **Server**: ts-node-dev (development)

### Infrastructure
- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **Development**: VS Code
- **API Style**: RESTful

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20 or higher ([Download](https://nodejs.org/))
- **npm**: v10 or higher (comes with Node.js)
- **Git**: For version control ([Download](https://git-scm.com/))
- **VS Code**: Recommended editor ([Download](https://code.visualstudio.com/))

### Optional
- **Google Maps API Key**: For live traffic features
- **PostgreSQL**: For production database (optional, SQLite works for dev)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/piyush-ghoshi/RoadSense.git
cd RoadSense
```

### 2. Setup Backend
```bash
cd backend
npm install

# Configure environment
cp .env.example .env

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start backend server
npm run dev
```

Backend will run on: `http://localhost:3000`

### 3. Setup Frontend
```bash
cd ../frontend
npm install

# Start frontend development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

### 4. Access the Application
Open your browser and navigate to:
- **Main App**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`

## 📁 Project Structure

```
RoadSense/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── migrations/         # Database migrations
│   ├── src/
│   │   ├── index.ts            # Express server setup
│   │   ├── seed.ts             # Database seeding
│   │   ├── routes/
│   │   │   ├── alerts.ts       # Alert endpoints
│   │   │   ├── analytics.ts    # Analytics endpoints
│   │   │   ├── auth.ts         # Authentication endpoints
│   │   │   ├── congestion.ts   # Congestion endpoints
│   │   │   ├── reports.ts      # Reports CRUD endpoints
│   │   │   ├── routes.ts       # Route suggestions endpoints
│   │   │   └── traffic.ts      # Traffic data endpoints
│   │   └── lib/
│   │       └── prisma.ts       # Prisma client
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GoogleMap.tsx   # Google Maps component
│   │   │   ├── Layout.tsx      # Main layout & navigation
│   │   │   ├── OSMMap.tsx      # OpenStreetMap component
│   │   │   └── ProtectedRoute.tsx # Route protection
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx   # Main dashboard
│   │   │   ├── TrafficMap.tsx  # Live traffic map
│   │   │   ├── Heatmap.tsx     # Heatmap visualization
│   │   │   ├── RouteSuggestion.tsx # Route finder
│   │   │   ├── Reports.tsx     # Report management
│   │   │   ├── Analytics.tsx   # Analytics dashboard
│   │   │   ├── AuthorityDashboard.tsx # Authority panel
│   │   │   ├── AuthorityLogin.tsx # Authority login
│   │   │   └── DashboardEnhanced.tsx # Enhanced dashboard
│   │   ├── lib/
│   │   │   ├── api.ts          # API client utilities
│   │   │   └── socket.ts       # Socket.IO setup
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript type definitions
│   │   ├── App.tsx             # Main app component
│   │   └── main.tsx            # React app entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── addons/
│   ├── docs/                   # Detailed documentation
│   ├── diagrams/               # System diagrams (Mermaid)
│   ├── images/                 # Project images
│   └── *.md                    # Feature guides and tutorials
│
└── README.md                   # This file
```

## 🔌 API Endpoints

### Base URL: `http://localhost:3000/api`

### Reports
```
POST   /reports              - Create new report
GET    /reports              - Get all reports (with filters)
GET    /reports/:id          - Get report by ID
PATCH  /reports/:id          - Update report
DELETE /reports/:id          - Delete report
```

### Traffic Data
```
GET    /traffic              - Get traffic snapshots
POST   /traffic              - Create traffic snapshot
GET    /traffic/congestion   - Get congestion data
```

### Analytics
```
GET    /analytics/summary    - Get summary statistics
GET    /analytics/reports    - Get reports analytics
GET    /analytics/trends     - Get traffic trends
```

### Alerts
```
GET    /alerts               - Get all alerts
POST   /alerts               - Create new alert
DELETE /alerts/:id           - Delete alert
```

### Congestion
```
GET    /congestion           - Get congestion data
POST   /congestion/detect    - Detect congestion
```

### Routes
```
POST   /routes/suggest       - Get suggested routes
GET    /routes               - Get route history
```

### Authentication
```
POST   /auth/login           - Authority login
POST   /auth/logout          - Logout
GET    /auth/verify          - Verify token
```

## 🔄 Real-Time Events

### Socket.IO Events

**Server → Client:**
```javascript
socket.on('alert', (alert) => {})           // New alert
socket.on('report', (report) => {})         // New report
socket.on('traffic-update', (data) => {})   // Traffic update
socket.on('congestion', (congestion) => {}) // Congestion change
```

**Client → Server:**
```javascript
socket.emit('report-submitted', (data) => {})  // Send report
socket.emit('request-update', () => {})        // Request refresh
```

## 🗄️ Database Schema

### User
```typescript
id            String      @id @default(cuid())
email         String      @unique
password      String
name          String
role          UserRole    // COMMUTER | AUTHORITY
isVerified    Boolean     @default(false)
createdAt     DateTime    @default(now())
updatedAt     DateTime    @updatedAt
```

### TrafficReport
```typescript
id            String      @id @default(cuid())
title         String
description   String
location      String
latitude      Float
longitude     Float
type          ReportType  // ACCIDENT | CONGESTION | ROAD_WORK | etc
severity      Severity    // LOW | MODERATE | HIGH | SEVERE
status        ReportStatus // PENDING | VERIFIED | RESOLVED | REJECTED
reportedBy    String      (userId)
createdAt     DateTime    @default(now())
updatedAt     DateTime    @updatedAt
```

### CongestionSnapshot
```typescript
id            String      @id @default(cuid())
location      String
latitude      Float
longitude     Float
congestionLevel String
speed         Float
timestamp     DateTime    @default(now())
```

### Alert
```typescript
id            String      @id @default(cuid())
title         String
message       String
severity      Severity
location      String
expiresAt     DateTime
createdAt     DateTime    @default(now())
```

## 🎨 Features in Detail

### Dashboard
- Real-time statistics (total reports, pending, resolved)
- Recent reports list with live updates
- Active alerts display
- Quick access to all features

### Reports Management
- Submit detailed traffic reports with location
- Filter reports by type, severity, status
- Authority verification system
- Real-time status updates
- Report history tracking

### Live Traffic Map
- Interactive map with marker clustering
- Real-time traffic data visualization
- Color-coded severity levels
- Responsive design for mobile & desktop
- Multiple map layers support

### Analytics
- Comprehensive traffic statistics
- Reports breakdown by type and severity
- Historical trends and patterns
- Visual charts using Recharts
- Custom date range selection

### Route Suggestions
- Suggests alternate routes when congestion detected
- Distance and duration estimates
- Traffic-aware routing
- Multiple options comparison
- Route comparison UI

### Authority Dashboard
- Complete report management
- Verify or reject submissions
- Create system-wide alerts
- Incident tracking
- User authentication

## 🔮 Future Enhancements

- [ ] AI/ML traffic prediction
- [ ] Integration with public transport APIs
- [ ] Carpooling suggestions
- [ ] Parking availability tracking
- [ ] Emergency vehicle priority routing
- [ ] Mobile native apps (React Native)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced analytics dashboard
- [ ] IoT sensor integration

## 🚀 Available Scripts

### Backend Scripts
```bash
npm run dev       # Start development server with hot reload
npm run build     # Build TypeScript to JavaScript
npm run start     # Run production build
npm run seed      # Seed database with sample data
npm run prisma    # Run Prisma CLI
```

### Frontend Scripts
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## 🔐 Environment Configuration

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=file:./dev.db
GOOGLE_MAPS_API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_MAPS_KEY=your_api_key_here
```

## 📊 Data Models & Types

### Enums
```typescript
enum UserRole {
  COMMUTER
  AUTHORITY
}

enum ReportType {
  ACCIDENT
  CONGESTION
  ROAD_WORK
  WEATHER
  OTHER
}

enum Severity {
  LOW
  MODERATE
  HIGH
  SEVERE
}

enum ReportStatus {
  PENDING
  VERIFIED
  RESOLVED
  REJECTED
}
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test              # Run unit tests
npm run test:watch   # Watch mode
```

### Frontend Testing
```bash
cd frontend
npm test             # Run tests
npm run test:watch  # Watch mode
```

## 🔄 Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Follow TypeScript best practices
   - Use meaningful commit messages

3. **Test your changes**
   - Test locally before committing
   - Check for console errors/warnings

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: describe your feature"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Describe your changes
   - Reference related issues
   - Request review

## 🌐 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
# Deploy the dist folder to Vercel or Netlify
```

### Backend Deployment (Render/Fly.io)
```bash
# Update .env with production values
npm run build
# Deploy to your hosting provider
```

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Change port in backend/src/index.ts or .env
# Or kill the process using the port
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Database connection error**
```bash
# Reset database
npx prisma db push --force-reset
npx prisma db seed
```

**CORS errors**
- Verify `CORS_ORIGIN` in backend .env matches frontend URL

**Socket.IO connection issues**
- Check WebSocket support in your network
- Verify backend is running on correct port

**Missing environment variables**
- Copy `.env.example` to `.env`
- Fill in required values

## 📚 Documentation

For detailed guides and tutorials, check the `/addons` directory:

- `START_HERE.md` - Project overview and setup
- `QUICKSTART.md` - Quick setup guide
- `USER_GUIDE.md` - Complete user manual
- `FEATURES.md` - Feature checklist
- `TESTING_GUIDE.md` - Testing instructions
- `TROUBLESHOOTING.md` - Common issues & solutions
- `ROADSENSE_UPDATES.md` - Latest updates

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Guidelines
- Write clear, descriptive commit messages
- Add comments for complex logic
- Update documentation as needed
- Test your code before submitting
- Follow existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: Piyush Ghoshi
- **Role**: Full Stack Developer

## 🙏 Acknowledgments

- OpenStreetMap for map services
- Google Maps API for traffic data
- React community for excellent tools
- Prisma for amazing ORM
- Socket.IO for real-time communication

## 📞 Support

For support, email support@roadsense.com or open an issue on GitHub.

### Resources
- [Project Documentation](./addons/)
- [GitHub Issues](https://github.com/piyush-ghoshi/RoadSense/issues)
- [Discussions](https://github.com/piyush-ghoshi/RoadSense/discussions)

## 🎯 Project Goals

✅ Real-time traffic monitoring for commuters
✅ Comprehensive incident reporting system
✅ Intelligent route optimization
✅ Authority-level management dashboard
✅ Historical data analytics
✅ Scalable and maintainable codebase
✅ Production-ready application

---

**Last Updated**: December 2025

**Version**: 1.0.0

---

<div align="center">
Made with ❤️ by Piyush Ghoshi
</div>

**Status:** ✅ Production Ready | **Version:** 1.0.0 | **Date:** November 2025
