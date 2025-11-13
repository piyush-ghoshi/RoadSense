# 📖 Smart Traffic Management System - User Guide

## 🎯 Overview

The Smart Traffic Management System (STMS) is a comprehensive web application for monitoring and managing urban traffic in real-time. This guide will help you navigate and use all features effectively.

---

## 🚀 Getting Started

### Access the Application

1. **Frontend:** Open http://localhost:5173 in your browser
2. **Backend API:** http://localhost:3000

### Navigation Menu

The top navigation bar provides access to all features:
- 🏠 **Dashboard** - Overview and statistics
- 🗺️ **Live Map** - Real-time traffic view
- 🔥 **Heatmap** - Congestion visualization
- 🚗 **Routes** - Route suggestions
- 📋 **Reports** - Incident management
- 📊 **Analytics** - Historical data
- 👮 **Authority** - Management dashboard

---

## 📱 Feature Guide

### 1. 🏠 Dashboard (Home Page)

**Purpose:** Get a quick overview of the current traffic situation

**What You'll See:**
- **Statistics Cards**
  - Total Reports
  - Pending Reports (orange)
  - Resolved Reports (green)
  - Active Alerts (red)

- **Recent Reports**
  - Last 5 traffic reports
  - Color-coded by type and severity
  - Timestamps

- **Active Alerts**
  - Current system alerts
  - Severity indicators
  - Auto-updating

**Real-time Updates:** Dashboard refreshes automatically when new data arrives

---

### 2. 🗺️ Live Traffic Map

**Purpose:** View current traffic conditions across the city

**Features:**
- Real-time traffic snapshots
- Color-coded congestion indicators:
  - 🟢 Green = Light traffic
  - 🟡 Yellow = Moderate traffic
  - 🟠 Orange = Heavy traffic
  - 🔴 Red = Severe congestion
- Speed information (km/h)
- Location details
- Timestamps

**How to Use:**
1. View the grid of recent traffic snapshots
2. Check congestion levels and speeds
3. Monitor updates in real-time (auto-refresh every 30 seconds)

---

### 3. 🔥 Heatmap Visualization

**Purpose:** Visual representation of traffic congestion intensity

**Features:**
- Interactive map with OpenStreetMap
- Color-coded circular markers
- Popup information on click
- Time range filters
- Statistics panel

**How to Use:**
1. Select time range (15 min to 6 hours)
2. Click 🔄 Refresh to update data
3. Click on markers to see details
4. View statistics at the bottom:
   - Total data points
   - Severe areas count
   - Heavy traffic areas
   - Average speed

**Legend:**
- 🟢 Light (0-25%)
- 🟡 Moderate (25-50%)
- 🟠 Heavy (50-75%)
- 🔴 Severe (75-100%)

---

### 4. 🚗 Route Suggestions

**Purpose:** Find the best route considering current traffic

**How to Use:**

1. **Enter Route Details:**
   - Origin Latitude & Longitude
   - Destination Latitude & Longitude
   - Check "Avoid congested areas" if desired

2. **Click "🔍 Find Routes"**

3. **Review Suggestions:**
   - ⭐ Recommended route (highlighted)
   - Alternative routes
   - Compare metrics:
     - 📏 Distance
     - ⏱️ Duration
     - 🚦 Congestion level
     - ⚠️ Incidents count

4. **Select Route:**
   - Click "Select This Route" button

**Route Types:**
- **Fastest** - Quickest based on current traffic
- **Shortest** - Minimum distance
- **Alternate** - Avoids congestion (if enabled)

**Traffic Conditions Panel:**
Shows current situation:
- Traffic snapshots analyzed
- Active incidents
- Congestion areas

---

### 5. 📋 Reports Management

**Purpose:** Submit and manage traffic incident reports

**For Regular Users:**

**Submit a Report:**
1. Click "+ New Report" button
2. Fill in the form:
   - **Type:** accident, roadblock, diversion, congestion, other
   - **Severity:** low, medium, high, critical
   - **Location:** Address or description
   - **Description:** Additional details (optional)
3. Click "Submit Report"

**View Reports:**
- See all submitted reports
- Filter by status, type, severity
- Real-time updates

**For Authorities:**
See Authority Dashboard section below

---

### 6. 📊 Analytics

**Purpose:** Analyze historical traffic data and trends

**What You'll See:**

1. **Reports by Type (Bar Chart)**
   - Visual breakdown of incident types
   - Interactive tooltips
   - Count per category

2. **Reports by Severity (Pie Chart)**
   - Distribution of severity levels
   - Color-coded segments
   - Percentage view

3. **Historical Traffic Data**
   - Total snapshots
   - Average speed
   - Congestion distribution

4. **Summary Statistics**
   - Total reports
   - Pending review
   - Resolved
   - Resolution rate (%)

**How to Use:**
- Hover over charts for details
- Use data to identify patterns
- Track resolution performance

---

### 7. 👮 Authority Dashboard

**Purpose:** Manage reports and broadcast alerts (Authority users only)

**Features:**

#### A. Statistics Overview
- Pending Review count
- Verified reports
- Resolved reports
- Active alerts

#### B. Pending Reports Queue
**Actions:**
- ✓ **Verify** - Confirm report is valid
- ✗ **Reject** - Mark as false report
- 👁 **Details** - View full information

**How to Process:**
1. Review report details
2. Click appropriate action button
3. Report moves to next status

#### C. Verified Reports
**Actions:**
- ✓ **Mark Resolved** - Close the incident

#### D. Create System Alert
**How to Broadcast:**
1. Select alert type (Traffic/Incident/System)
2. Choose severity (Info/Warning/Critical)
3. Enter title and message
4. Click "📢 Broadcast Alert"
5. Alert sent to all connected users instantly

#### E. Active Alerts Management
- View all active alerts
- Deactivate alerts when resolved
- Monitor alert history

---

## 🔔 Real-Time Alerts

**How They Work:**
- Alerts appear in top-right corner
- Auto-dismiss after 10 seconds
- Color-coded by severity:
  - 🔵 Blue = Info
  - 🟠 Orange = Warning
  - 🔴 Red = Critical

**Alert Types:**
- 🚦 Traffic updates
- 🚨 Incident notifications
- ⚙️ System messages

---

## 💡 Tips & Best Practices

### For Commuters:
1. Check Dashboard before traveling
2. Use Route Suggestions for optimal paths
3. Report incidents immediately
4. Monitor real-time alerts
5. Check Heatmap for congestion hotspots

### For Authorities:
1. Process pending reports promptly
2. Verify reports before marking resolved
3. Broadcast alerts for major incidents
4. Monitor analytics for patterns
5. Use congestion data for planning

### General Tips:
- Keep browser tab open for real-time updates
- Refresh if data seems stale
- Use time filters in Heatmap for historical view
- Check Analytics weekly for trends
- Report false information to improve accuracy

---

## 🎨 Understanding Visual Indicators

### Report Types (Badges):
- 🚗 **Accident** - Red badge
- 🚧 **Roadblock** - Orange badge
- ↪️ **Diversion** - Blue badge
- 🚦 **Congestion** - Pink badge
- ❓ **Other** - Purple badge

### Severity Levels:
- 🟢 **Low** - Green
- 🟡 **Medium** - Yellow/Orange
- 🟠 **High** - Orange
- 🔴 **Critical** - Red

### Report Status:
- 🟡 **Pending** - Awaiting review
- 🔵 **Verified** - Confirmed by authority
- 🟢 **Resolved** - Issue fixed
- 🔴 **False** - Invalid report

---

## 🔧 Troubleshooting

### Data Not Updating?
- Check internet connection
- Refresh the page (F5)
- Verify backend is running (http://localhost:3000/health)

### Map Not Loading?
- Check browser console for errors
- Ensure Leaflet CSS is loaded
- Try different browser

### Real-time Alerts Not Appearing?
- Check WebSocket connection
- Look for Socket.IO connection in browser console
- Verify backend Socket.IO is running

### Reports Not Submitting?
- Check all required fields are filled
- Verify API connection
- Check browser console for errors

---

## 📊 Sample Coordinates (for testing)

Use these coordinates to test Route Suggestions:

**New York City:**
- Times Square: `40.7589, -73.9851`
- Central Park: `40.7829, -73.9654`
- Brooklyn Bridge: `40.7061, -73.9969`

**Test Scenarios:**
1. Times Square → Central Park (short route)
2. Times Square → Brooklyn Bridge (medium route)
3. Central Park → Brooklyn Bridge (cross-city route)

---

## 🎯 Quick Actions

| Task | Steps |
|------|-------|
| Report incident | Reports → + New Report → Fill form → Submit |
| Check traffic | Dashboard or Live Map |
| Find route | Routes → Enter coordinates → Find Routes |
| View congestion | Heatmap → Select time range |
| Verify report | Authority → Pending Reports → Verify |
| Broadcast alert | Authority → Create Alert → Fill → Broadcast |
| View analytics | Analytics page |

---

## 🆘 Need Help?

- Check `README.md` for setup instructions
- See `FEATURES_IMPLEMENTED.md` for technical details
- Review `QUICKSTART.md` for quick setup
- Check browser console for errors
- Verify both frontend and backend are running

---

## 🎉 Enjoy Using STMS!

The Smart Traffic Management System is designed to make urban commuting safer and more efficient. Your reports and participation help everyone navigate better!

**Happy Commuting! 🚗💨**
