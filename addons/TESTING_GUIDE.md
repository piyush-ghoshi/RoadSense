# 🧪 Testing Guide - Smart Traffic Management System

## Quick Start Testing

### Step 1: Verify Servers are Running

**Check Backend:**
```bash
curl http://localhost:3000/health
```
Expected: `{"status":"ok","message":"Smart Traffic Management System API is running"}`

**Check Frontend:**
Open browser to: http://localhost:5173

### Step 2: Test Each Feature

#### 1. 🏠 Dashboard (http://localhost:5173/)
**What to Test:**
- [ ] Statistics cards show numbers (Total, Pending, Resolved, Alerts)
- [ ] Recent reports list displays
- [ ] Active alerts section shows
- [ ] Data updates automatically

**Expected Data:**
- Total Reports: 3
- Pending: 1
- Resolved: 1
- Active Alerts: 2

---

#### 2. 🗺️ Live Traffic Map (http://localhost:5173/map)
**What to Test:**
- [ ] Traffic snapshots grid displays
- [ ] Color-coded congestion levels visible
- [ ] Speed information shows
- [ ] Timestamps are correct
- [ ] Auto-refresh works (30 seconds)

**Expected Data:**
- 4 traffic snapshots
- Different congestion levels (light, moderate, heavy, severe)
- Speed values in km/h

---

#### 3. 🔥 Heatmap (http://localhost:5173/heatmap)
**What to Test:**
- [ ] Interactive map loads
- [ ] Circular markers appear
- [ ] Click markers to see popup
- [ ] Time range filter works
- [ ] Statistics panel shows data
- [ ] Refresh button works

**How to Test:**
1. Select different time ranges
2. Click on colored circles
3. Check statistics at bottom
4. Click refresh button

---

#### 4. 🚗 Route Suggestions (http://localhost:5173/routes)
**What to Test:**
- [ ] Form accepts coordinates
- [ ] "Find Routes" button works
- [ ] Multiple route options display
- [ ] Metrics show correctly (distance, duration, congestion, incidents)
- [ ] Recommended route is highlighted
- [ ] Traffic conditions panel shows

**Test Coordinates:**
```
Origin: 40.7589, -73.9851
Destination: 40.7614, -73.9776
```

**Expected Results:**
- 3 route options (Fastest, Shortest, Avoid Congestion)
- Distance in km
- Duration in minutes
- Congestion levels
- Incident counts

---

#### 5. 📋 Reports (http://localhost:5173/reports)
**What to Test:**
- [ ] "+ New Report" button opens form
- [ ] Form validation works
- [ ] Submit creates new report
- [ ] Reports list displays
- [ ] Filter/status badges show
- [ ] Authority actions work (Verify, Reject, Resolve)

**How to Test:**
1. Click "+ New Report"
2. Fill form:
   - Type: Accident
   - Severity: High
   - Location: Test Street
   - Description: Test incident
3. Submit
4. Verify it appears in list
5. Try Verify/Reject buttons

---

#### 6. 📊 Analytics (http://localhost:5173/analytics)
**What to Test:**
- [ ] Bar chart (Reports by Type) displays
- [ ] Pie chart (Reports by Severity) displays
- [ ] Historical data section shows
- [ ] Summary statistics display
- [ ] Charts are interactive (hover tooltips)

**Expected Charts:**
- Bar chart with 3 types (accident, roadblock, congestion)
- Pie chart with 3 severity levels
- Statistics cards with numbers

---

#### 7. 👮 Authority Dashboard (http://localhost:5173/authority)
**What to Test:**
- [ ] Statistics cards show counts
- [ ] Pending reports queue displays
- [ ] Verify button works
- [ ] Reject button works
- [ ] Resolve button works
- [ ] Create alert form works
- [ ] Alert broadcast works
- [ ] Active alerts display
- [ ] Deactivate alert works

**How to Test:**
1. Check pending reports
2. Click "Verify" on a report
3. Check verified reports section
4. Click "Mark Resolved"
5. Create new alert:
   - Type: Traffic
   - Severity: Warning
   - Title: Test Alert
   - Message: This is a test
6. Submit and check if it appears
7. Deactivate the alert

---

#### 8. 🔔 Real-Time Alerts
**What to Test:**
- [ ] Alerts appear in top-right corner
- [ ] Color-coded by severity
- [ ] Auto-dismiss after 10 seconds
- [ ] Multiple alerts stack

**How to Test:**
1. Go to Authority Dashboard
2. Create a new alert
3. Watch for toast notification
4. Check it appears on all pages

---

## API Testing

### Test All Endpoints

```bash
# Reports
curl http://localhost:3000/api/reports
curl http://localhost:3000/api/reports -X POST -H "Content-Type: application/json" -d '{"type":"accident","severity":"high","location":"Test Location"}'

# Traffic
curl http://localhost:3000/api/traffic/live

# Analytics
curl http://localhost:3000/api/analytics/reports-summary
curl http://localhost:3000/api/analytics/historical

# Alerts
curl http://localhost:3000/api/alerts

# Congestion
curl "http://localhost:3000/api/congestion/heatmap?timeRange=60"
curl "http://localhost:3000/api/congestion/detect?latitude=40.7589&longitude=-73.9851&radius=5"

# Routes
curl http://localhost:3000/api/routes/suggest -X POST -H "Content-Type: application/json" -d '{"origin":{"lat":40.7589,"lng":-73.9851},"destination":{"lat":40.7614,"lng":-73.9776},"avoidCongestion":true}'
```

---

## Browser Console Testing

### Check for Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Look for:
   - ✅ "App component rendering"
   - ✅ "Dashboard state: ..."
   - ✅ "Socket connected: ..."
   - ❌ No red errors

### Check Network Requests
1. Open DevTools → Network tab
2. Refresh page
3. Verify:
   - ✅ All API calls return 200
   - ✅ main.tsx loads
   - ✅ CSS files load
   - ❌ No 404 or 500 errors

---

## Real-Time Testing

### Test WebSocket Connection
1. Open two browser windows side-by-side
2. Window 1: Dashboard
3. Window 2: Authority Dashboard
4. In Window 2: Create an alert
5. In Window 1: Alert should appear immediately

### Test Auto-Refresh
1. Go to Live Map
2. Wait 30 seconds
3. Data should refresh automatically

---

## Performance Testing

### Load Time
- Dashboard should load in < 2 seconds
- API responses should be < 100ms
- WebSocket latency should be < 50ms

### Data Volume
- Dashboard handles 100+ reports
- Heatmap handles 1000+ points
- Analytics processes large datasets

---

## Troubleshooting Tests

### If Dashboard is Blank:
1. Check browser console for errors
2. Visit http://localhost:5173/test
3. Verify API is responding: http://localhost:3000/health
4. Check Network tab for failed requests

### If Data Not Loading:
1. Check backend is running
2. Verify CORS is enabled
3. Check API URL in .env file
4. Test API directly with curl

### If Real-Time Not Working:
1. Check Socket.IO connection in console
2. Verify backend Socket.IO is running
3. Check firewall/antivirus settings
4. Test with different browser

---

## Test Checklist

### Before Testing
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Database has seed data
- [ ] Browser console is open

### During Testing
- [ ] All 7 pages load
- [ ] All API calls succeed
- [ ] No console errors
- [ ] Real-time updates work
- [ ] Forms submit successfully
- [ ] Charts render correctly
- [ ] Maps display properly

### After Testing
- [ ] Data persists in database
- [ ] No memory leaks
- [ ] No performance issues
- [ ] All features functional

---

## Success Criteria

✅ **All features working:**
1. Heatmap Visualization
2. Historical Analytics
3. Live Traffic Visualization
4. Congestion Detection
5. Alternate Route Suggestion
6. Real-Time Alerts
7. Authority Dashboard
8. Data Storage

✅ **No errors in console**
✅ **All API endpoints responding**
✅ **Real-time updates working**
✅ **Data persisting correctly**

---

## Next Steps After Testing

1. ✅ Verify all features work
2. 📸 Take screenshots of each page
3. 📝 Document any issues found
4. 🚀 Ready for demonstration
5. 🎯 Plan next enhancements

---

**Happy Testing! 🎉**
