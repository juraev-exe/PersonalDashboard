// ============================================
// LifeOS — Authentication Page
// ============================================

import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { isSupabaseConfigured } from '../services/supabase';
import { connectGoogleCalendar } from '../services/googleAuth';

import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, Info, ArrowRight, Activity, Globe } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);
  const loading = useAuthStore((s) => s.loading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (!isLogin && !name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMsg(error);
      }
    } else {
      const { error } = await signUp(email, password, name);
      if (error) {
        setErrorMsg(error);
      } else {
        setSuccessMsg('Account created successfully! Check your email to verify.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    const { error } = await connectGoogleCalendar();

    if (error) setErrorMsg(error);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-primary)',
      padding: '24px',
      fontFamily: 'var(--font-sans)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 400,
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Logo Icon */}
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'var(--color-text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Activity size={24} color="var(--color-bg-primary)" />
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8, color: 'var(--color-text-primary)' }}>
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 32, textAlign: 'center' }}>
          {isLogin ? 'Sign in to access your personal dashboard' : 'Get started with LifeOS dashboard today'}
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 14, top: 10, color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    style={{ paddingLeft: 40 }}
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: 14, top: 10, color: 'var(--color-text-muted)' }} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              style={{ paddingLeft: 40 }}
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: 14, top: 10, color: 'var(--color-text-muted)' }} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              style={{ paddingLeft: 40 }}
              required
            />
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              fontSize: 12,
              color: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <Info size={14} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              fontSize: 12,
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <Info size={14} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', margin: '24px 0', color: 'var(--color-text-muted)' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          <span style={{ fontSize: 12, fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
        </div>

        {/* Third-Party Logins */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          <button
            onClick={handleGoogleSignIn}
            className="btn btn-secondary"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
          >
            <Globe size={16} /> Continue with Google
          </button>

          <button
            onClick={continueAsGuest}
            className="btn btn-ghost"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, border: '1px solid transparent' }}
          >
            Continue as Guest <ArrowRight size={14} />
          </button>
        </div>

        {!isSupabaseConfigured && (
          <div style={{
            marginTop: 20,
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            border: '1px solid var(--color-border)',
            fontSize: 11,
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            width: '100%',
          }}>
            Supabase is not configured. Guest mode runs locally.
          </div>
        )}

        {/* Form Switch */}
        <div style={{ marginTop: 24, fontSize: 13, color: 'var(--color-text-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-primary)',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
