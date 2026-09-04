import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, BadgeCheck, Mail, User, Building2, Lock, ChevronLeft, CheckCircle } from 'lucide-react';
import './AuthorityLogin.css';

interface VerificationData {
  badgeNumber: string; email: string; post: string; department: string; verificationCode: string;
}

const POSTS = ['Traffic Inspector','Sub-Inspector','Assistant Sub-Inspector','Head Constable','Traffic Constable','Traffic Warden','Senior Officer','Commissioner'];
const DEPARTMENTS = ['Traffic Police','Highway Patrol','Emergency Response','Traffic Management','Road Safety','Control Room'];

export default function AuthorityLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'initial' | 'verification' | 'verified'>('initial');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState<VerificationData>({ badgeNumber: '', email: '', post: '', department: '', verificationCode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    const code = newDigits.join('');
    setFormData(prev => ({ ...prev, verificationCode: code }));
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const autofillOtp = (code: string) => {
    const digits = code.split('').slice(0, 6);
    const newDigits = [...digits, ...Array(6 - digits.length).fill('')];
    setOtpDigits(newDigits);
    setFormData(prev => ({ ...prev, verificationCode: digits.join('') }));
  };

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setDevOtp(null);
    if (!formData.badgeNumber || !formData.email || !formData.post || !formData.department) {
      setError('Please fill in all required fields'); setLoading(false); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address'); setLoading(false); return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/auth/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, badgeNumber: formData.badgeNumber, post: formData.post, department: formData.department })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send verification code');
      if (data.developmentOTP) setDevOtp(data.developmentOTP);
      setStep('verification');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: formData.verificationCode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Invalid verification code');
      if (data.verified) {
        localStorage.setItem('authorityVerified', 'true');
        localStorage.setItem('authorityData', JSON.stringify({ badgeNumber: formData.badgeNumber, email: formData.email, post: formData.post, department: formData.department, verifiedAt: new Date().toISOString() }));
        setStep('verified');
        setTimeout(() => navigate('/authority'), 2000);
      } else {
        throw new Error('Verification failed');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
    }
    setLoading(false);
  };

  const handleResendCode = async () => {
    setLoading(true); setError('');
    try {
      await fetch('http://localhost:3000/api/auth/resend-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email }) });
      const response = await fetch('http://localhost:3000/api/auth/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, badgeNumber: formData.badgeNumber, post: formData.post, department: formData.department })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to resend code');
      if (data.developmentOTP) { setDevOtp(data.developmentOTP); autofillOtp(data.developmentOTP); }
    } catch (err: any) {
      setError(err.message || 'Failed to resend. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="authority-login-page">
      <div className="login-bg-grid"/>

      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="#3B82F6"/>
              <circle cx="16" cy="9"  r="3.5" fill="#EF4444"/>
              <circle cx="16" cy="16" r="3.5" fill="#EAB308"/>
              <circle cx="16" cy="23" r="3.5" fill="#22C55E"/>
            </svg>
          </div>
          <span className="login-brand-name">RoadSense</span>
        </div>

        {/* Step indicators */}
        <div className="step-indicators">
          <div className={`step-dot ${step !== 'initial' ? 'done' : 'active'}`}/>
          <div className="step-line"/>
          <div className={`step-dot ${step === 'verified' ? 'done' : step === 'verification' ? 'active' : ''}`}/>
          <div className="step-line"/>
          <div className={`step-dot ${step === 'verified' ? 'active' : ''}`}/>
        </div>

        {/* Header */}
        <div className="login-header">
          <div className="login-icon-wrap">
            <Shield size={28} color="#3B82F6"/>
          </div>
          <h1 className="login-title">Authority Verification</h1>
          <p className="login-subtitle">
            {step === 'initial' && 'Provide your credentials to receive a verification code'}
            {step === 'verification' && 'Enter the code sent to your official email'}
            {step === 'verified' && 'Identity verified — redirecting to dashboard'}
          </p>
        </div>

        {/* ── STEP 1: Credentials ── */}
        {step === 'initial' && (
          <form onSubmit={handleSendVerification} className="login-form">
            <div className="security-notice">
              <Lock size={14}/>
              <span>Secure access — authorized traffic officials only</span>
            </div>

            <div className="form-group">
              <label className="form-label"><BadgeCheck size={13}/> Badge Number</label>
              <input type="text" name="badgeNumber" value={formData.badgeNumber} onChange={handleChange} placeholder="e.g., TPA-2024-001" required />
            </div>

            <div className="form-group">
              <label className="form-label"><Mail size={13}/> Official Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="officer@traffic.gov.in" required />
              <span className="field-hint">Use your official government email address</span>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label"><User size={13}/> Designation</label>
                <select name="post" value={formData.post} onChange={handleChange} required>
                  <option value="">Select post</option>
                  {POSTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label"><Building2 size={13}/> Department</label>
                <select name="department" value={formData.department} onChange={handleChange} required>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {error && <div className="login-error"><Lock size={13}/> {error}</div>}

            <button type="submit" className="btn-primary login-btn" disabled={loading}>
              {loading ? <><span className="spinner"/> Sending Code...</> : <><Mail size={15}/> Send Verification Code</>}
            </button>

            <p className="login-footnote">A 6-digit code will be sent to your official email address.</p>
          </form>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === 'verification' && (
          <form onSubmit={handleVerifyCode} className="login-form">
            <div className="otp-sent-notice">
              <Mail size={16} color="#3B82F6"/>
              <div>
                <div className="otp-sent-label">Code sent to</div>
                <div className="otp-sent-email">{formData.email}</div>
              </div>
            </div>

            {devOtp && (
              <div className="dev-otp-notice">
                <div className="dev-otp-header">
                  <span className="dev-badge">DEV MODE</span>
                  <span>Your OTP: <strong>{devOtp}</strong></span>
                </div>
                <button type="button" className="btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => autofillOtp(devOtp)}>
                  Auto-fill OTP
                </button>
              </div>
            )}

            <div className="otp-input-section">
              <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: 'var(--sp-4)' }}>
                Enter 6-digit verification code
              </label>
              <div className="otp-boxes">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    type="text" inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className={`otp-box ${digit ? 'filled' : ''}`}
                  />
                ))}
              </div>
            </div>

            {error && <div className="login-error"><Lock size={13}/> {error}</div>}

            <button type="submit" className="btn-primary login-btn" disabled={loading || formData.verificationCode.length !== 6}>
              {loading ? <><span className="spinner"/> Verifying...</> : <><CheckCircle size={15}/> Verify & Access Dashboard</>}
            </button>

            <div className="otp-actions">
              <span className="login-footnote">Didn't receive it?</span>
              <button type="button" className="btn-link" onClick={handleResendCode} disabled={loading}>Resend Code</button>
            </div>

            <button type="button" className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep('initial')}>
              <ChevronLeft size={14}/> Back to Details
            </button>
          </form>
        )}

        {/* ── STEP 3: Success ── */}
        {step === 'verified' && (
          <div className="login-success">
            <div className="success-checkmark">
              <CheckCircle size={48} color="#10B981"/>
            </div>
            <h2 className="success-title">Verification Successful</h2>
            <p className="success-subtitle">Welcome, {formData.post}</p>
            <div className="verified-details">
              <div className="verified-detail-item">
                <BadgeCheck size={14} color="#3B82F6"/>
                <span>Badge {formData.badgeNumber}</span>
              </div>
              <div className="verified-detail-item">
                <Building2 size={14} color="#3B82F6"/>
                <span>{formData.department}</span>
              </div>
            </div>
            <p className="redirect-msg">Redirecting to dashboard...</p>
            <div className="redirect-bar"><div className="redirect-fill"/></div>
          </div>
        )}

        {/* Footer */}
        <div className="login-footer">
          <Lock size={12}/> Secure · Encrypted · Authorized Access Only
        </div>
      </div>
    </div>
  );
}
