# Project Structure

## 📁 Complete Directory Tree

```
stms/
├── 📄 README.md                          # Main project documentation
├── 📄 QUICKSTART.md                      # Quick start guide
├── 📄 FEATURES.md                        # Features checklist
├── 📄 PROJECT_STRUCTURE.md               # This file
├── 📄 package.json                       # Root package config
│
├── 📂 backend/                           # Backend application
│   ├── 📄 package.json                   # Backend dependencies
│   ├── 📄 tsconfig.json                  # TypeScript config
│   ├── 📄 .env                           # Environment variables
│   ├── 📄 .env.example                   # Environment template
│   │
│   ├── 📂 prisma/                        # Database
│   │   ├── 📄 schema.prisma              # Database schema
│   │   ├── 📄 dev.db                     # SQLite database
│   │   └── 📂 migrations/                # Database migrations
│   │
│   └── 📂 src/                           # Source code
│       ├── 📄 index.ts                   # Express server + Socket.IO
│       ├── 📄 seed.ts                    # Database seeding script
│       │
│       ├── 📂 lib/                       # Utilities
│       │   └── 📄 prisma.ts              # Prisma client instance
│       │
│       └── 📂 routes/                    # API routes
│           ├── 📄 reports.ts             # Reports CRUD endpoints
│           ├── 📄 traffic.ts             # Traffic data endpoints
│           ├── 📄 analytics.ts           # Analytics endpoints
│           └── 📄 alerts.ts              # Alerts endpoints
│
├── 📂 frontend/                          # Frontend application
│   ├── 📄 package.json                   # Frontend dependencies
│   ├── 📄 tsconfig.json                  # TypeScript config
│   ├── 📄 vite.config.ts                 # Vite configuration
│   ├── 📄 .env                           # Environment variables
│   ├── 📄 .env.example                   # Environment template
│   ├── 📄 index.html                     # HTML entry point
│   │
│   └── 📂 src/                           # Source code
│       ├── 📄 main.tsx                   # React entry point
│       ├── 📄 App.tsx                    # Main app component
│       ├── 📄 App.css                    # App styles
│       ├── 📄 index.css                  # Global styles
│       │
│       ├── 📂 components/                # Reusable components
│       │   ├── 📄 Layout.tsx             # Main layout with nav
│       │   └── 📄 Layout.css             # Layout styles
│       │
│       ├── 📂 pages/                     # Page components
│       │   ├── 📄 Dashboard.tsx          # Dashboard page
│       │   ├── 📄 Dashboard.css          # Dashboard styles
│       │   ├── 📄 TrafficMap.tsx         # Traffic map page
│       │   ├── 📄 TrafficMap.css         # Map styles
│       │   ├── 📄 Reports.tsx            # Reports page
│       │   ├── 📄 Reports.css            # Reports styles
│       │   ├── 📄 Analytics.tsx          # Analytics page
│       │   └── 📄 Analytics.css          # Analytics styles
│       │
│       ├── 📂 lib/                       # Utilities
│       │   ├── 📄 api.ts                 # API client (Axios)
│       │   └── 📄 socket.ts              # Socket.IO client
│       │
│       ├── 📂 types/                     # TypeScript types
│       │   └── 📄 index.ts               # Type definitions
│       │
│       └── 📂 assets/                    # Static assets
│           └── 📄 react.svg              # React logo
│
├── 📂 docs/                              # Documentation
│   ├── 📄 project-plan.md                # Project plan & milestones
│   ├── 📄 build-plan.md                  # Build plan
│   ├── 📄 implementation-roadmap.md      # Implementation roadmap
│   ├── 📄 smart-traffic-management-report.md  # Technical report
│   └── 📄 IMPLEMENTATION_SUMMARY.md      # Implementation summary
│
└── 📂 diagrams/                          # System diagrams (Mermaid)
    ├── 📄 class.mmd                      # Class diagram
    ├── 📄 sequence.mmd                   # Sequence diagrams
    ├── 📄 use_case.mmd                   # Use case diagram
    ├── 📄 data_flow.mmd                  # Data flow diagram
    ├── 📄 activity.mmd                   # Activity diagram
    └── 📄 state.mmd                      # State diagram
```

## 🗂️ File Organization

### Backend Structure

```
backend/src/
├── index.ts              # Main server file
│   ├── Express setup
│   ├── Socket.IO configuration
│   ├── Middleware (CORS, JSON)
│   ├── Route mounting
│   └── Server startup
│
├── routes/               # API endpoints
│   ├── reports.ts        # POST, GET, PATCH reports
│   ├── traffic.ts        # GET live, POST snapshot
│   ├── analytics.ts      # GET historical, summary
│   └── alerts.ts         # GET, POST, PATCH alerts
│
├── lib/
│   └── prisma.ts         # Database client
│
└── seed.ts               # Sample data generator
```

### Frontend Structure

```
frontend/src/
├── main.tsx              # App initialization
│   ├── React Query setup
│   ├── Router setup
│   └── Root render
│
├── App.tsx               # Route definitions
│
├── components/
│   └── Layout.tsx        # Navigation + alerts
│
├── pages/                # Route components
│   ├── Dashboard.tsx     # Statistics & overview
│   ├── TrafficMap.tsx    # Live traffic view
│   ├── Reports.tsx       # Report management
│   └── Analytics.tsx     # Data visualization
│
├── lib/
│   ├── api.ts            # HTTP client
│   └── socket.ts         # WebSocket client
│
└── types/
    └── index.ts          # TypeScript interfaces
```

## 📊 Code Statistics

### Backend
- **Total Files**: 8 TypeScript files
- **Lines of Code**: ~800 lines
- **API Endpoints**: 12 endpoints
- **Database Models**: 4 models
- **Routes**: 4 route modules

### Frontend
- **Total Files**: 15 TypeScript/CSS files
- **Lines of Code**: ~1,200 lines
- **Pages**: 4 pages
- **Components**: 1 layout component
- **Utilities**: 2 lib files

### Documentation
- **Total Files**: 10 markdown files
- **Diagrams**: 6 Mermaid diagrams
- **Documentation Lines**: ~2,000 lines

## 🔗 Dependencies

### Backend Dependencies
```json
{
  "dependencies": {
    "@prisma/client": "^6.19.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "prisma": "^6.19.0",
    "socket.io": "^4.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.5",
    "@types/node": "^24.10.1",
    "ts-node": "^10.x",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.9.3"
  }
}
```

### Frontend Dependencies
```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^6.x",
    "@tanstack/react-query": "^5.x",
    "axios": "^1.x",
    "socket.io-client": "^4.x"
  },
  "devDependencies": {
    "@types/react": "^19.2.2",
    "@types/react-dom": "^19.2.2",
    "@vitejs/plugin-react": "^5.1.0",
    "typescript": "~5.9.3",
    "vite": "npm:rolldown-vite@7.2.2",
    "eslint": "^9.39.1"
  }
}
```

## 🎯 Key Files

### Configuration Files
- `backend/tsconfig.json` - Backend TypeScript config
- `frontend/tsconfig.json` - Frontend TypeScript config
- `frontend/vite.config.ts` - Vite bundler config
- `backend/prisma/schema.prisma` - Database schema
- `.env` files - Environment variables

### Entry Points
- `backend/src/index.ts` - Backend server
- `frontend/src/main.tsx` - Frontend app
- `backend/src/seed.ts` - Database seeding

### Core Logic
- `backend/src/routes/*` - API endpoints
- `frontend/src/pages/*` - UI pages
- `frontend/src/lib/api.ts` - API client
- `frontend/src/lib/socket.ts` - WebSocket client

## 🚀 Build Outputs

### Backend Build
```
backend/dist/
├── index.js
├── routes/
│   ├── reports.js
│   ├── traffic.js
│   ├── analytics.js
│   └── alerts.js
└── lib/
    └── prisma.js
```

### Frontend Build
```
frontend/dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
└── [static files]
```

## 📦 Package Sizes

- **Backend**: ~50 MB (with node_modules)
- **Frontend**: ~200 MB (with node_modules)
- **Database**: ~100 KB (SQLite with seed data)
- **Total Project**: ~250 MB

## 🔄 Data Flow

```
User Browser
    ↓
Frontend (React)
    ↓
API Client (Axios) ←→ Socket.IO Client
    ↓                      ↓
Backend (Express)    WebSocket Server
    ↓                      ↓
Validation (Zod)     Real-time Events
    ↓                      ↓
Prisma ORM          Broadcast to Clients
    ↓
SQLite Database
```

## 🎨 Styling Architecture

- **Global Styles**: `frontend/src/index.css`
- **Component Styles**: Co-located CSS files
- **Design System**: Custom CSS variables
- **Responsive**: Mobile-first approach
- **Color Scheme**: Professional blue/gray palette

---

This structure provides a solid foundation for a scalable, maintainable traffic management system!
