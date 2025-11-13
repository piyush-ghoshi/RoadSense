# Troubleshooting Guide

## Blank Screen Issue

If you're seeing a blank screen, try these steps:

### 1. Check Browser Console
- Open browser DevTools (F12)
- Go to Console tab
- Look for any error messages
- Common errors:
  - Module not found
  - Network errors
  - CORS errors
  - JavaScript syntax errors

### 2. Check Network Tab
- Open DevTools → Network tab
- Refresh the page
- Check if:
  - main.tsx is loading
  - API calls are succeeding
  - Status codes are 200

### 3. Verify Servers are Running
```bash
# Backend should show:
🚀 Server is running on http://localhost:3000
📊 Health check: http://localhost:3000/health
🔌 Socket.IO ready for connections

# Frontend should show:
ROLLDOWN-VITE v7.2.2  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### 4. Test API Connection
Open http://localhost:3000/health in browser
Should return: `{"status":"ok","message":"Smart Traffic Management System API is running"}`

### 5. Test Simple Page
Navigate to: http://localhost:5173/test
This should show a simple test page

### 6. Clear Browser Cache
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or clear browser cache completely

### 7. Restart Servers
```bash
# Stop both servers (Ctrl+C in terminals)
# Then restart:

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 8. Check for Port Conflicts
```bash
# Windows
netstat -ano | findstr :5173
netstat -ano | findstr :3000

# If ports are in use, kill the process or change ports
```

### 9. Reinstall Dependencies
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

### 10. Check Console Logs
Look for these console messages:
- "App component rendering"
- "Dashboard state: ..."
- "Summary data: ..."
- "Recent reports: ..."

### Common Issues

#### Issue: CORS Error
**Solution:** Backend CORS is configured. Check if backend is running.

#### Issue: Module Not Found
**Solution:** Run `npm install` in frontend directory

#### Issue: API Connection Failed
**Solution:** 
1. Check backend is running on port 3000
2. Check `.env` file has correct API URL
3. Verify no firewall blocking

#### Issue: White/Blank Screen
**Solution:**
1. Check browser console for errors
2. Try /test route
3. Check CSS is loading
4. Verify React is rendering

### Debug Mode

Add this to see what's happening:

1. Open browser console
2. Type: `localStorage.debug = '*'`
3. Refresh page
4. Check console for detailed logs

### Still Not Working?

1. Take screenshot of browser console
2. Check terminal output for both servers
3. Verify all files are saved
4. Try different browser
5. Check if antivirus/firewall is blocking

### Quick Test Commands

```bash
# Test backend
curl http://localhost:3000/health

# Test API
curl http://localhost:3000/api/reports

# Check if frontend is serving
curl http://localhost:5173
```
