import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { authService } from '../../services/authService';
import { ZeninLogo } from '../../assets/icons';
import {
  ChevronRight,
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { PhoneAuthModal } from '../../components/auth/PhoneAuthModal';

type AuthView = 'splash' | 'welcome' | 'login' | 'signup' | 'forgot';

export const AuthScreens: React.FC = () => {
  const { loginUser } = useAppStore();
  const [view, setView] = useState<AuthView>('splash');
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Splash screen timeout
  useEffect(() => {
    if (view === 'splash') {
      const timer = setTimeout(() => {
        setView('welcome');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [view]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const res = await authService.login(email, password);
    setIsLoading(false);

    if (res.success && res.user) {
      loginUser(res.user);
    } else {
      setErrorMsg(res.error || 'Authentication rejected by System.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const res = await authService.signUp(name, email, password);
    setIsLoading(false);

    if (res.success && res.user) {
      loginUser(res.user);
    } else {
      setErrorMsg(res.error || 'Registration failed.');
    }
  };

  const handleGuestAccess = () => {
    const guestUser = authService.createGuestUser();
    loginUser(guestUser);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = authService.requestPasswordReset(email);
    if (res.success) {
      setInfoMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  // 1. SPLASH SCREEN
  if (view === 'splash') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#05070B',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <div className="animate-pulse-glow">
          <ZeninLogo size={80} showGlow={true} />
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 900,
            letterSpacing: '0.2em',
            color: '#FFFFFF',
          }}
          className="glow-text-cyan"
        >
          ZENIN
        </h1>

        <div
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-violet)',
            letterSpacing: '0.15em',
            fontWeight: 600,
          }}
        >
          [SYSTEM INITIALIZING...]
        </div>
      </div>
    );
  }

  // 2. WELCOME SCREEN
  if (view === 'welcome') {
    return (
      <div
        style={{
          padding: '30px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '85vh',
        }}
        className="screen-fade-in"
      >
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <ZeninLogo size={56} showGlow={true} className="animate-pulse-glow" />
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 900,
              letterSpacing: '0.12em',
              color: '#FFFFFF',
              marginTop: '16px',
            }}
          >
            ZENIN
          </h1>
          <p
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-cyan)',
              letterSpacing: '0.1em',
              fontWeight: 700,
              marginTop: '4px',
            }}
          >
            THE SYSTEM AWAITS
          </p>
        </div>

        {/* Core Tagline Card */}
        <div
          className="glass-panel"
          style={{
            padding: '20px',
            textAlign: 'center',
            width: '100%',
            background: 'rgba(16, 22, 35, 0.75)',
            border: '1px solid var(--border-glow)',
          }}
        >
          <div style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 600, lineHeight: 1.5 }}>
            Transform daily productivity into personal power. Complete objectives, acquire EXP, elevate your Hunter Rank.
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
            System Sync Ready • Offline Capable
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => setView('login')}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 0 16px rgba(139, 92, 246, 0.4)',
            }}
          >
            <span>ESTABLISH NEURAL LINK (LOGIN)</span>
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => setShowPhoneAuth(true)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              color: 'var(--accent-cyan)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Smartphone size={16} />
            <span>SIGN IN WITH MOBILE (OTP)</span>
          </button>

          <button
            onClick={() => setView('signup')}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.06em',
              cursor: 'pointer',
            }}
          >
            AWAKEN AS NEW HUNTER (REGISTER)
          </button>

          <button
            onClick={handleGuestAccess}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '12px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '8px',
              marginTop: '4px',
            }}
          >
            CONTINUE IN GUEST PROTOCOL
          </button>
        </div>

        <PhoneAuthModal
          isOpen={showPhoneAuth}
          onClose={() => setShowPhoneAuth(false)}
        />
      </div>
    );
  }

  // 3. LOGIN / SIGNUP / FORGOT PASSWORD FORM CONTAINER
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }} className="screen-fade-in">
      <Header />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
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
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div>
            <button
              onClick={() => setView('welcome')}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '11px', cursor: 'pointer', padding: 0 }}
            >
              ← Back to Terminal
            </button>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 800,
                color: '#FFFFFF',
                marginTop: '4px',
                marginBottom: '2px',
              }}
            >
              {view === 'login' ? 'ACCESS SYSTEM' : view === 'signup' ? 'HUNTER REGISTRATION' : 'RECOVER BEACON'}
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              {view === 'login'
                ? 'Enter your neural link credentials.'
                : view === 'signup'
                ? 'Forge your Hunter persona in the System registry.'
                : 'Transmit recovery frequency to your link address.'}
            </p>
          </div>

      {errorMsg && (
        <div
          style={{
            padding: '6px 10px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '7px',
            color: '#FCA5A5',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {infoMsg && (
        <div
          style={{
            padding: '6px 10px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '7px',
            color: '#10B981',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <CheckCircle2 size={14} />
          <span>{infoMsg}</span>
        </div>
      )}

      <form
        onSubmit={view === 'login' ? handleLogin : view === 'signup' ? handleSignUp : handleForgot}
        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
      >
        {view === 'signup' && (
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontWeight: 700 }}>
              HUNTER CALLSIGN / NAME
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '6px 10px' }}>
              <UserIcon size={14} color="var(--accent-violet)" />
              <input
                type="text"
                placeholder="Ren Vanguard"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', color: '#FFFFFF', outline: 'none', fontSize: '12px' }}
                required
              />
            </div>
          </div>
        )}

        <div>
          <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontWeight: 700 }}>
            NEURAL LINK ADDRESS (EMAIL)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '6px 10px' }}>
            <Mail size={14} color="var(--accent-cyan)" />
            <input
              type="email"
              placeholder="hunter@zenin.network"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#FFFFFF', outline: 'none', fontSize: '12px' }}
              required
            />
          </div>
        </div>

        {view !== 'forgot' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>ACCESS KEY (PASSWORD)</label>
              {view === 'login' && (
                <button
                  type="button"
                  onClick={() => setView('forgot')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '10px', cursor: 'pointer' }}
                >
                  Forgot Key?
                </button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '6px 10px' }}>
              <Lock size={14} color="var(--accent-violet)" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', color: '#FFFFFF', outline: 'none', fontSize: '12px' }}
                required
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            marginTop: '4px',
            padding: '10px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
            border: 'none',
            color: '#FFFFFF',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '12px',
            letterSpacing: '0.06em',
            cursor: 'pointer',
            boxShadow: '0 0 14px rgba(139, 92, 246, 0.35)',
          }}
        >
          {isLoading
            ? 'CONNECTING TO SYSTEM...'
            : view === 'login'
            ? 'AUTHORIZE ENTRY'
            : view === 'signup'
            ? 'AWAKEN HUNTER'
            : 'DISPATCH BEACON'}
        </button>
      </form>

      {/* Switch between Login and SignUp */}
      <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
        {view === 'login' ? (
          <>
            <span>Unregistered operative? </span>
            <button
              onClick={() => setView('signup')}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontWeight: 600, cursor: 'pointer' }}
            >
              Sign up here
            </button>
          </>
        ) : (
          <>
            <span>Already registered? </span>
            <button
              onClick={() => setView('login')}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontWeight: 600, cursor: 'pointer' }}
            >
              Login here
            </button>
          </>
        )}
      </div>

        <PhoneAuthModal
          isOpen={showPhoneAuth}
          onClose={() => setShowPhoneAuth(false)}
        />
      </div>
    </div>
  </div>
  );
};
