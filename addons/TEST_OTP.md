# 🧪 Test OTP System

## ✅ System Status
- Backend: Running on port 3000
- Frontend: Running on port 5174
- OTP API: /api/auth/send-otp
- Verify API: /api/auth/verify-otp

## 🚀 How to Test

### Step 1: Go to Login Page
```
http://localhost:5174/authority-login
```

### Step 2: Fill in Form
```
Badge Number: TPA-2024-001
Email: test@example.com
Post: Traffic Inspector
Department: Traffic Police
```

### Step 3: Click "Send Verification Code"
- Wait 2-3 seconds
- System will use Ethereal (fake SMTP)
- Check browser console (F12) for preview URL
- Or check alert for development OTP

### Step 4: Get OTP
**Option 1 - Ethereal (Recommended)**:
- Look in browser console for: "📧 Email Preview: https://ethereal.email/message/xxxxx"
- Click the URL
- See the beautiful email
- Copy the 6-digit code

**Option 2 - Development Mode**:
- If email fails, alert shows: "Development Mode: Your code is 123456"
- Copy the code from alert

### Step 5: Enter Code
- Paste the 6-digit code
- Click "Verify & Access Dashboard"
- Success! Redirected to dashboard

## 🐛 If It Doesn't Work

### Check Backend Logs:
```
Look for:
✅ OTP sent to: test@example.com
📧 OTP: 123456
🔗 Preview URL: https://ethereal.email/message/xxxxx
```

### Check Frontend Console:
```
Look for:
- No 500 errors
- API response with success: true
- Preview URL or developmentOTP
```

### Common Issues:

**1. 500 Error**:
- Backend not running
- Check backend console for errors
- Restart backend

**2. No Email/Preview**:
- Check browser console
- Look for preview URL
- Or use development OTP from alert

**3. Invalid Code**:
- Code expired (5 minutes)
- Wrong code entered
- Request new code

## 📧 What to Expect

### Ethereal Mode (Current):
```
1. Request OTP
2. Backend creates Ethereal account
3. Sends email to Ethereal
4. Returns preview URL
5. Click URL to see email
6. Copy OTP from email
7. Verify and login
```

### Development Mode (Fallback):
```
1. Request OTP
2. Email sending fails
3. Returns OTP in response
4. Alert shows OTP
5. Copy from alert
6. Verify and login
```

## ✅ Success Indicators

You'll know it's working when:
- ✅ No 500 errors in console
- ✅ Backend logs show "OTP sent"
- ✅ Preview URL or OTP shown
- ✅ Email visible in Ethereal
- ✅ Code verification works
- ✅ Redirected to dashboard

## 🎯 Current Configuration

**Email Mode**: Ethereal (automatic)
**Fallback**: Development mode
**OTP Length**: 6 digits
**Expiration**: 5 minutes
**Rate Limit**: 3 attempts per 15 min

## 🚀 Ready to Test!

Try it now at: http://localhost:5174/authority-login

Expected result: Real email OTP authentication working! 🎉
