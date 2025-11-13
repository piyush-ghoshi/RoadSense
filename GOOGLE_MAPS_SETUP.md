# Google Maps API Setup Guide

## Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps JavaScript API
   - Directions API
   - Places API
   - Geocoding API
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

## Step 2: Add API Key to Environment

Add to `frontend/.env`:
```
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

## Step 3: Restart Frontend Server

```bash
cd frontend
npm run dev
```

## Step 4: Test

Visit http://localhost:5173/map and you should see the Google Map!

## Features Enabled

- ✅ Live traffic layer
- ✅ Congestion heatmap
- ✅ Incident markers
- ✅ Route suggestions
- ✅ Interactive map controls
- ✅ Real-time updates

## For Development (Free Tier)

Google Maps offers $200 free credit per month, which includes:
- 28,000 map loads
- 40,000 directions requests
- 40,000 geocoding requests

Perfect for development and testing!
