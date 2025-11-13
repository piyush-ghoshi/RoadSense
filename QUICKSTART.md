# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Setup Database

```bash
cd backend

# Push database schema
npx prisma db push

# Seed with sample data
npm run seed
```

### Step 3: Run the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:3000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

## 🎯 What You'll See

### Dashboard (/)
- Real-time statistics
- Recent traffic reports
- Active alerts
- Live updates via WebSocket

### Live Map (/map)
- Traffic congestion data
- Color-coded severity levels
- Real-time updates

### Reports (/reports)
- Submit new traffic reports
- View all reports
- Authority actions (verify/reject/resolve)

### Analytics (/analytics)
- Reports by type and severity
- Historical traffic data
- Congestion distribution
- Statistics and trends

## 🧪 Test the Features

### 1. Submit a Report
1. Go to Reports page
2. Click "+ New Report"
3. Fill in the form
4. Submit

### 2. Verify Reports (Authority View)
1. Go to Reports page
2. Click "Verify" or "Reject" on pending reports
3. Click "Resolve" on verified reports

### 3. Watch Real-time Updates
1. Open Dashboard in one browser tab
2. Submit a report in another tab
3. See the dashboard update automatically

## 🔧 Troubleshooting

### Port Already in Use
If port 3000 or 5173 is busy:

**Backend:**
```bash
# Edit backend/.env
PORT=3001
```

**Frontend:**
```bash
# Edit frontend/vite.config.ts
export default defineConfig({
  server: { port: 5174 }
})
```

### Database Issues
```bash
cd backend
npx prisma db push --force-reset
npm run seed
```

### Clear and Restart
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

- Add Google Maps API key for interactive maps
- Implement user authentication
- Deploy to production
- Add more features from the roadmap

## 🆘 Need Help?

Check the documentation in `/docs` folder:
- `project-plan.md` - Full project plan
- `implementation-roadmap.md` - Development roadmap
- `smart-traffic-management-report.md` - Technical report

View system diagrams in `/diagrams` folder.
