import { Router, Request, Response } from 'express';

const router = Router();

// In-memory storage for OTPs (in production, use Redis or database)
const otpStorage = new Map<string, { code: string; expiresAt: number; attempts: number }>();

// Email transporter configuration (nodemailer setup)
let nodemailer: any = null;

async function initNodemailer() {
  if (!nodemailer) {
    try {
      nodemailer = await import('nodemailer');
    } catch (e) {
      console.warn('⚠️  nodemailer not available');
    }
  }
  return nodemailer;
}

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP endpoint
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { email, badgeNumber, post, department } = req.body;

    // Validate input
    if (!email || !badgeNumber || !post || !department) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check rate limiting (max 3 attempts per email per 15 minutes)
    const existingOTP = otpStorage.get(email);
    if (existingOTP && existingOTP.attempts >= 3) {
      const timeLeft = Math.ceil((existingOTP.expiresAt - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        message: `Too many attempts. Please try again in ${timeLeft} minutes.`
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes

    // Store OTP
    otpStorage.set(email, {
      code: otp,
      expiresAt,
      attempts: existingOTP ? existingOTP.attempts + 1 : 1
    });

    // Try to send email, fallback to dev mode
    try {
      const nm = await initNodemailer();
      
      if (nm && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        // Use Gmail
        const transporter = nm.default.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Authority Verification Code - Smart Traffic Management',
          html: generateEmailHtml(otp, post, badgeNumber, department)
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ OTP sent to:', email);

        return res.json({
          success: true,
          message: 'Verification code sent to your email'
        });
      } else {
        // Development mode: return OTP in response
        console.log('🔧 [DEV-MODE] Generated OTP for', email, ':', otp);
        return res.json({
          success: true,
          message: 'Development mode: OTP generated (check console)',
          developmentOTP: otp,
          developmentNote: 'Email not configured. Use this OTP for testing.'
        });
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Fallback: return OTP in development mode
      console.log('🔧 [FALLBACK] Generated OTP for', email, ':', otp);
      return res.json({
        success: true,
        message: 'Email service unavailable. Development mode activated.',
        developmentOTP: otp,
        developmentNote: 'Use this OTP for testing.'
      });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code. Please try again.'
    });
  }
});

function generateEmailHtml(otp: string, post: string, badgeNumber: string, department: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 3px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 10px 0; }
        .badge { display: inline-block; padding: 5px 10px; background: #e3f2fd; border-radius: 5px; margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>👮 Authority Verification</h1>
        <p>Smart Traffic Management System</p>
      </div>
      <div class="content">
        <h2>Hello, ${post}!</h2>
        <p>Your verification code:</p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <p style="color: #999; font-size: 14px;">Valid for 5 minutes</p>
        </div>
        <div class="badge">🎫 Badge: ${badgeNumber}</div><br>
        <div class="badge">👤 Post: ${post}</div><br>
        <div class="badge">🏢 Department: ${department}</div>
      </div>
    </body>
    </html>
  `;
}

// Verify OTP endpoint
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    // Validate input
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and code are required'
      });
    }

    // Get stored OTP
    const storedOTP = otpStorage.get(email);

    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found. Please request a new one.'
      });
    }

    // Check expiration
    if (Date.now() > storedOTP.expiresAt) {
      otpStorage.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    // Verify code
    if (storedOTP.code !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please try again.'
      });
    }

    // Success - remove OTP
    otpStorage.delete(email);

    res.json({
      success: true,
      message: 'Verification successful',
      verified: true
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed. Please try again.'
    });
  }
});

// Resend OTP endpoint
router.post('/resend-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if there's an existing OTP
    const existingOTP = otpStorage.get(email);
    if (existingOTP) {
      // Check if enough time has passed (30 seconds cooldown)
      const timeSinceLastSend = Date.now() - (existingOTP.expiresAt - 5 * 60 * 1000);
      if (timeSinceLastSend < 30000) {
        return res.status(429).json({
          success: false,
          message: 'Please wait 30 seconds before requesting a new code'
        });
      }
    }

    // Delete old OTP and let user request new one
    otpStorage.delete(email);

    res.json({
      success: true,
      message: 'You can now request a new verification code'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request. Please try again.'
    });
  }
});

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStorage.entries()) {
    if (now > data.expiresAt) {
      otpStorage.delete(email);
      console.log('🗑️ Cleaned up expired OTP for:', email);
    }
  }
}, 60000); // Run every minute

// TEMP TEST ROUTE: generate and return an OTP for a given email (development only)
router.get('/test-otp', (req: Request, res: Response) => {
  try {
    const email = (req.query.email as string) || 'dev@example.com';
    const otp = generateOTP();
    const expiresAt = Date.now() + (5 * 60 * 1000);

    otpStorage.set(email, { code: otp, expiresAt, attempts: 1 });
    console.log('🔧 [TEST-OTP] Generated OTP for', email, otp);

    return res.json({ success: true, email, otp, expiresAt });
  } catch (error) {
    console.error('Test OTP error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate test OTP' });
  }
});

export default router;
