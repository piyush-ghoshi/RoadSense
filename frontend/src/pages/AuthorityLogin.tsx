import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthorityLogin.css';

interface VerificationData {
  badgeNumber: string;
  email: string;
  post: string;
  department: string;
  verificationCode: string;
}

export default function AuthorityLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'initial' | 'verification' | 'verified'>('initial');
  const [formData, setFormData] = useState<VerificationData>({
    badgeNumber: '',
    email: '',
    post: '',
    department: '',
    verificationCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentCode, setSentCode] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate inputs
    if (!formData.badgeNumber || !formData.email || !formData.post || !formData.department) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Call backend API to send OTP
      const response = await fetch('http://localhost:3000/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          badgeNumber: formData.badgeNumber,
          post: formData.post,
          department: formData.department
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code');
      }

      // If development mode, show the OTP
      if (data.developmentOTP) {
        alert(`Development Mode: Your verification code is: ${data.developmentOTP}\n\nNote: In production, this would be sent to your email.`);
        setSentCode(data.developmentOTP);
      }

      // If preview URL available (Ethereal), show it
      if (data.previewUrl) {
        console.log('📧 Email Preview:', data.previewUrl);
        alert(`Email sent! Check console for preview link.\n\nPreview: ${data.previewUrl}`);
      } else {
        alert(`Verification code sent to ${formData.email}\n\nPlease check your email inbox (and spam folder).`);
      }

      setStep('verification');
      setLoading(false);

    } catch (err: any) {
      console.error('Send OTP error:', err);
      setError(err.message || 'Failed to send verification code. Please try again.');
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call backend API to verify OTP
      const response = await fetch('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          code: formData.verificationCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid verification code');
      }

      if (data.verified) {
        // Store authority credentials in localStorage
        localStorage.setItem('authorityVerified', 'true');
        localStorage.setItem('authorityData', JSON.stringify({
          badgeNumber: formData.badgeNumber,
          email: formData.email,
          post: formData.post,
          department: formData.department,
          verifiedAt: new Date().toISOString()
        }));
        
        setStep('verified');
        setLoading(false);
        
        // Redirect to authority dashboard after 2 seconds
        setTimeout(() => {
          navigate('/authority');
        }, 2000);
      } else {
        throw new Error('Verification failed');
      }

    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setError(err.message || 'Invalid verification code. Please try again.');
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      // First, call resend endpoint to clear old OTP
      await fetch('http://localhost:3000/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email })
      });

      // Then send new OTP
      const response = await fetch('http://localhost:3000/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          badgeNumber: formData.badgeNumber,
          post: formData.post,
          department: formData.department
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }

      // If development mode, show the OTP
      if (data.developmentOTP) {
        alert(`New verification code: ${data.developmentOTP}`);
        setSentCode(data.developmentOTP);
      } else {
        alert('New verification code sent to your email!');
      }

      setLoading(false);

    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Failed to resend code. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="authority-login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="badge-icon">👮</div>
          <h1>Authority Verification</h1>
          <p className="subtitle">Secure access to administrator dashboard</p>
        </div>

        {step === 'initial' && (
          <form onSubmit={handleSendVerification} className="verification-form">
            <div className="security-notice">
              <span className="notice-icon">🔒</span>
              <div>
                <strong>Secure Verification Required</strong>
                <p>Only authorized traffic officials can access this section</p>
              </div>
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">🎫</span>
                Badge Number
              </label>
              <input
                type="text"
                name="badgeNumber"
                value={formData.badgeNumber}
                onChange={handleChange}
                placeholder="e.g., TPA-2024-001"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">📧</span>
                Official Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="officer@traffic.gov.in"
                required
              />
              <span className="field-hint">Use your official government email</span>
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">👤</span>
                Post/Designation
              </label>
              <select
                name="post"
                value={formData.post}
                onChange={handleChange}
                required
              >
                <option value="">Select your post</option>
                <option value="Traffic Inspector">Traffic Inspector</option>
                <option value="Sub-Inspector">Sub-Inspector</option>
                <option value="Assistant Sub-Inspector">Assistant Sub-Inspector</option>
                <option value="Head Constable">Head Constable</option>
                <option value="Traffic Constable">Traffic Constable</option>
                <option value="Traffic Warden">Traffic Warden</option>
                <option value="Senior Officer">Senior Officer</option>
                <option value="Commissioner">Commissioner</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">🏢</span>
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select department</option>
                <option value="Traffic Police">Traffic Police</option>
                <option value="Highway Patrol">Highway Patrol</option>
                <option value="Emergency Response">Emergency Response</option>
                <option value="Traffic Management">Traffic Management</option>
                <option value="Road Safety">Road Safety</option>
                <option value="Control Room">Control Room</option>
              </select>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-verify"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Sending Verification Code...
                </>
              ) : (
                <>
                  <span>📧</span>
                  Send Verification Code
                </>
              )}
            </button>

            <div className="help-text">
              <p>
                <strong>Note:</strong> A 6-digit verification code will be sent to your official email address.
              </p>
            </div>
          </form>
        )}

        {step === 'verification' && (
          <form onSubmit={handleVerifyCode} className="verification-form">
            <div className="verification-sent">
              <div className="sent-icon">✉️</div>
              <h3>Verification Code Sent!</h3>
              <p>We've sent a 6-digit code to:</p>
              <strong>{formData.email}</strong>
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">🔢</span>
                Enter Verification Code
              </label>
              <input
                type="text"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                placeholder="000000"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                className="code-input"
              />
              <span className="field-hint">Enter the 6-digit code from your email</span>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-verify"
              disabled={loading || formData.verificationCode.length !== 6}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Verifying...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Verify & Access Dashboard
                </>
              )}
            </button>

            <div className="resend-section">
              <p>Didn't receive the code?</p>
              <button 
                type="button" 
                className="btn-resend"
                onClick={handleResendCode}
                disabled={loading}
              >
                Resend Code
              </button>
            </div>

            <button 
              type="button" 
              className="btn-back"
              onClick={() => setStep('initial')}
            >
              ← Back to Details
            </button>
          </form>
        )}

        {step === 'verified' && (
          <div className="verification-success">
            <div className="success-animation">
              <div className="checkmark">✓</div>
            </div>
            <h2>Verification Successful!</h2>
            <p>Welcome, {formData.post}</p>
            <div className="verified-details">
              <div className="detail-item">
                <span className="detail-icon">🎫</span>
                <span>Badge: {formData.badgeNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🏢</span>
                <span>{formData.department}</span>
              </div>
            </div>
            <p className="redirect-message">Redirecting to dashboard...</p>
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
          </div>
        )}

        <div className="login-footer">
          <div className="security-badges">
            <span className="badge">🔒 Secure</span>
            <span className="badge">✓ Verified</span>
            <span className="badge">🛡️ Protected</span>
          </div>
          <p className="footer-text">
            This is a secure portal. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
