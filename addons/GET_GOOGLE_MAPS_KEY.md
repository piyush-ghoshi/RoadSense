# 🗺️ How to Get Google Maps API Key (Step-by-Step)

## Quick Steps

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create or Select Project
- Click "Select a project" at the top
- Click "NEW PROJECT"
- Name it: "Traffic Management System"
- Click "CREATE"

### 3. Enable Required APIs
Click on "APIs & Services" → "Enable APIs and Services"

Enable these 4 APIs:
1. **Maps JavaScript API** - For displaying maps
2. **Directions API** - For route suggestions
3. **Places API** - For location search
4. **Geocoding API** - For address conversion

For each API:
- Search for the API name
- Click on it
- Click "ENABLE"

### 4. Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS"
3. Select "API key"
4. Copy the API key (looks like: `AIzaSyD...`)

### 5. (Optional) Restrict API Key
For security, restrict your key:
1. Click on the key name
2. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add: `http://localhost:5173/*`
3. Under "API restrictions":
   - Select "Restrict key"
   - Select the 4 APIs you enabled
4. Click "SAVE"

### 6. Add to Your Project
Open `frontend/.env` and replace:
```
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

With your actual key:
```
VITE_GOOGLE_MAPS_API_KEY=AIzaSyD...your_actual_key
```

### 7. Restart Frontend
```bash
cd frontend
npm run dev
```

### 8. Test It!
Visit: http://localhost:5173/map

You should see Google Maps with:
- ✅ Live traffic layer (red/yellow/green roads)
- ✅ Traffic markers
- ✅ Incident markers
- ✅ Interactive controls

## Free Tier Limits

Google Maps offers **$200 free credit per month**:
- 28,000 map loads
- 40,000 directions requests
- 40,000 geocoding requests

Perfect for development and small projects!

## Troubleshooting

### "This page can't load Google Maps correctly"
- Check if API key is correct
- Make sure all 4 APIs are enabled
- Wait 1-2 minutes after enabling APIs

### "RefererNotAllowedMapError"
- Add `http://localhost:5173/*` to HTTP referrers
- Or remove restrictions for development

### Still not working?
- Check browser console (F12) for errors
- Verify `.env` file has the key
- Make sure you restarted the frontend server

## Need Help?

1. Check the error message in browser console
2. Verify API key in Google Cloud Console
3. Make sure billing is enabled (free tier is fine)
4. Check API quotas in Google Cloud Console

---

**Once configured, your maps will show real-time traffic data automatically!** 🎉
