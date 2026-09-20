import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { migrationService } from '../../services/migrationService';
import { useAppStore } from '../../store/useAppStore';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import {
  Smartphone,
  ShieldCheck,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  X,
  CheckCircle2,
  AlertCircle,
  Zap,
  Globe,
  RefreshCw,
} from 'lucide-react';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'signup';
}

const COUNTRY_CODES = [
  { code: '+91', country: 'India (IN)', flag: '🇮🇳' },
  { code: '+1', country: 'USA / Canada (US/CA)', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom (UK)', flag: '🇬🇧' },
  { code: '+971', country: 'UAE (AE)', flag: '🇦🇪' },
  { code: '+61', country: 'Australia (AU)', flag: '🇦🇺' },
  { code: '+49', country: 'Germany (DE)', flag: '🇩🇪' },
  { code: '+65', country: 'Singapore (SG)', flag: '🇸🇬' },
  { code: '+33', country: 'France (FR)', flag: '🇫🇷' },
  { code: '+966', country: 'Saudi Arabia (SA)', flag: '🇸🇦' },
  { code: '+81', country: 'Japan (JP)', flag: '🇯🇵' },
];

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const store = useAppStore();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [selectedCountry, setSelectedCountry] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [hunterName, setHunterName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialMode]);

  // Lock background body scroll completely when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fullPhone = `${selectedCountry}${phoneNumber.replace(/\D/g, '')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length < 6) {
      setErrorMsg('Please enter a valid mobile number.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Access key must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    soundService.playClick();
    hapticService.medium();

    try {
      let res;
      if (mode === 'signup') {
        res = await authService.signUpWithPhonePassword(fullPhone, password, hunterName);
      } else {
        res = await authService.loginWithPhonePassword(fullPhone, password);
      }

      if (!res.success || !res.user) {
        setIsLoading(false);
        setErrorMsg(res.error || 'Authentication rejected. Please check your credentials.');
        return;
      }

      // Guest-to-Account Data Migration & Cloud Synchronization
      const currentState = {
        user: store.user,
        missions: store.missions,
        focusSessions: store.focusSessions,
        achievements: store.achievements,
        xpTransactions: store.xpTransactions,
      };

      const migrationResult = await migrationService.migrateGuestToAccount(res.user, currentState);

      // Update zustand store
      store.loginUser(migrationResult.mergedUser);
      store.importDatabaseState({
        ...currentState,
        user: migrationResult.mergedUser,
        missions: migrationResult.mergedMissions,
        focusSessions: migrationResult.mergedFocusSessions,
        achievements: migrationResult.mergedAchievements,
        xpTransactions: migrationResult.mergedXpTransactions,
        categories: store.categories,
        settings: store.settings,
        hasOnboarded: true,
        isAuthenticated: true,
      });

      setIsLoading(false);
      soundService.playMissionClear();
      hapticService.success();
      setSuccessMsg(
        mode === 'signup'
          ? 'Identity awakened! Cloud sync active.'
          : 'Neural link active! Progress restored.'
      );

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'An unexpected error occurred during authentication.');
    }
  };

  const modalNode = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 70, // Sits below Header (zIndex: 100) so Header is present, but above BottomNav (zIndex: 60)
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        paddingTop: '64px', // Offset for Header height so card is centered in visible space
        paddingBottom: '24px',
        overscrollBehavior: 'contain',
        overflowY: 'auto',
      }}
      className="screen-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundService.playClick();
          onClose();
        }
      }}
    >
      <div
        className="glass-panel-glow"
        style={{
          width: '100%',
          maxWidth: '380px',
          background: 'linear-gradient(145deg, rgba(13, 19, 32, 0.98) 0%, rgba(22, 16, 38, 0.98) 100%)',
          border: '1px solid var(--accent-cyan)',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.85), 0 0 25px rgba(0, 240, 255, 0.25)',
          padding: '12px 14px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '7px',
          margin: 'auto',
          boxSizing: 'border-box',
          touchAction: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header - Compact single-row layout */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                border: '1px solid var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={14} color="var(--accent-cyan)" />
            </div>

            <div>
              <div
                style={{
                  fontSize: '8px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-cyan)',
                  letterSpacing: '0.12em',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                {mode === 'login' ? 'AUTHENTICATION GATE' : 'NEW REGISTRATION'}
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '0.04em',
                  margin: 0,
                  lineHeight: 1.15,
                }}
              >
                {mode === 'login' ? 'ESTABLISH NEURAL LINK' : 'AWAKEN IDENTITY'}
              </h2>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={12} />
          </button>
        </div>

        {/* Mode Switcher Segmented Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '2px',
            gap: '3px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              setMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{
              flex: 1,
              padding: '5px 0',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'login' ? 'linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)' : 'transparent',
              color: mode === 'login' ? '#FFFFFF' : 'var(--text-muted)',
              fontFamily: 'var(--font-heading)',
              fontSize: '10.5px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: mode === 'login' ? '0 0 10px rgba(6, 182, 212, 0.4)' : 'none',
            }}
          >
            LOG IN
          </button>

          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              setMode('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{
              flex: 1,
              padding: '5px 0',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'signup' ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : 'transparent',
              color: mode === 'signup' ? '#FFFFFF' : 'var(--text-muted)',
              fontFamily: 'var(--font-heading)',
              fontSize: '10.5px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: mode === 'signup' ? '0 0 10px rgba(139, 92, 246, 0.4)' : 'none',
            }}
          >
            SIGN UP
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              padding: '4px 8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '7px',
              color: '#FCA5A5',
              fontSize: '10.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
            className="screen-fade-in"
          >
            <AlertCircle size={13} color="#EF4444" style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div
            style={{
              padding: '4px 8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '7px',
              color: '#6EE7B7',
              fontSize: '10.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
            className="screen-fade-in"
          >
            <CheckCircle2 size={13} color="#10B981" style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Compact Form - Fits 100% in viewport without any scrolling */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Hunter Callsign / Name (Sign Up only) */}
          {mode === 'signup' && (
            <div>
              <label
                style={{
                  fontSize: '9.5px',
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '2px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                HUNTER CALLSIGN / NAME
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '5px 8px',
                }}
              >
                <UserIcon size={13} color="var(--accent-violet)" />
                <input
                  type="text"
                  placeholder="e.g. Ren Vanguard"
                  value={hunterName}
                  onChange={(e) => setHunterName(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          {/* Mobile Number with Country Code */}
          <div>
            <label
              style={{
                fontSize: '9.5px',
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '2px',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              MOBILE PHONE NUMBER
            </label>
            <div style={{ display: 'flex', gap: '5px' }}>
              {/* Country selector */}
              <div
                style={{
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Globe size={12} color="var(--accent-cyan)" style={{ marginRight: '3px' }} />
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code} style={{ background: '#0D111A', color: '#FFFFFF' }}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone number input */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '5px 8px',
                }}
              >
                <Smartphone size={13} color="var(--accent-cyan)" />
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Access Key (Password) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <label
                style={{
                  fontSize: '9.5px',
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-muted)',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                ACCESS KEY (PASSWORD)
              </label>
              {mode === 'signup' && (
                <span style={{ fontSize: '8.5px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  Min 6 chars
                </span>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '5px 8px',
              }}
            >
              <Lock size={13} color="var(--accent-violet)" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  outline: 'none',
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: '2px',
              padding: '9px 12px',
              borderRadius: '8px',
              background:
                mode === 'signup'
                  ? 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)'
                  : 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontFamily: 'var(--font-heading)',
              fontSize: '11.5px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow:
                mode === 'signup'
                  ? '0 0 14px rgba(139, 92, 246, 0.35)'
                  : '0 0 14px rgba(6, 182, 212, 0.35)',
              transition: 'all 0.15s ease',
            }}
          >
            {isLoading ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>CONNECTING...</span>
              </>
            ) : mode === 'signup' ? (
              <>
                <Zap size={13} />
                <span>AWAKEN & SAVE (SIGN UP)</span>
              </>
            ) : (
              <>
                <span>ESTABLISH LINK (LOG IN)</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>

        {/* Mode Toggle Switch Text */}
        <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>
          {mode === 'login' ? (
            <>
              <span>Need to register? </span>
              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '10px',
                }}
              >
                Sign up here
              </button>
            </>
          ) : (
            <>
              <span>Already registered? </span>
              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '10px',
                }}
              >
                Log in here
              </button>
            </>
          )}
        </div>

        {/* Guest Mode Dismissal */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '4px',
            textAlign: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '9.5px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ← CONTINUE AS GUEST (NO LOGIN REQUIRED)
          </button>
        </div>
      </div>
    </div>
  );

  return modalNode;
};
