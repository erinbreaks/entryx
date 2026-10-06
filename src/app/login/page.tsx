'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { Lock, Mail, Shield, User, AlertCircle, RefreshCw, KeyRound, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Setup Owner state (if no owner exists yet)
  const [ownerExists, setOwnerExists] = useState<boolean | null>(null);
  const [setupMode, setSetupMode] = useState(false);
  const [setupName, setSetupName] = useState('Erin Bobin');
  const [setupEmail, setSetupEmail] = useState('erinbobin@gmail.com');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupPhone, setSetupPhone] = useState('9446611885');
  const [setupSuccessMsg, setSetupSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function checkOwnerStatus() {
      try {
        const res = await fetch('/api/auth/setup-owner');
        if (res.ok) {
          const data = await res.json();
          setOwnerExists(data.ownerExists);
          if (!data.ownerExists) {
            // Pre-fill owner email
            setSetupEmail(data.ownerEmail || 'erinbobin@gmail.com');
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    checkOwnerStatus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Check your email and password.');
      }

      // Role-based routing
      if (data.user.role === 'owner') {
        router.push('/admin');
      } else {
        router.push('/organizer');
      }
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/setup-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: setupName.trim(),
          email: setupEmail.trim(),
          password: setupPassword,
          phone: setupPhone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize owner account');
      }

      setSetupSuccessMsg('Owner account initialized successfully! You can now log in.');
      setOwnerExists(true);
      setSetupMode(false);
      setEmail(setupEmail);
    } catch (err: any) {
      setErrorMsg(err.message || 'Setup error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-8">
      {/* Branding */}
      <div className="text-center space-y-3">
        <Logo size="lg" withSlogan />
        <h1 className="text-2xl font-bold text-cream-50 pt-2 font-display">
          {setupMode ? 'Initialize Owner Account' : 'Portal Authentication'}
        </h1>
        <p className="text-xs text-cream-muted">
          {setupMode
            ? 'Set up the Super Admin credentials for EntryX.'
            : 'Secure access for System Owner and Authorized Organizers.'}
        </p>
      </div>

      {/* Initial Setup Banner if no owner exists */}
      {ownerExists === false && !setupMode && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-brand-gold/40 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-brand-gold font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Initial Setup Notice</span>
          </div>
          <p className="text-cream-200">
            No Super Admin profile exists in the database. Please initialize the Owner account to manage requests and authorized organizers.
          </p>
          <button
            onClick={() => setSetupMode(true)}
            className="mt-2 w-full py-2 rounded-lg font-bold text-xs bg-brand-gold text-background hover:bg-brand-gold-light transition-all"
          >
            Initialize Owner Account Now
          </button>
        </div>
      )}

      {/* Success Notification */}
      {setupSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs">
          {setupSuccessMsg}
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Login or Setup Card */}
      <div className="bg-surface rounded-3xl border border-surface-border p-6 sm:p-8 shadow-2xl">
        {setupMode ? (
          <form onSubmit={handleSetupOwner} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-cream-200 mb-1.5">
                Owner Full Name *
              </label>
              <input
                type="text"
                required
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5 text-xs text-cream-50 focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cream-200 mb-1.5">
                Owner Email Address *
              </label>
              <input
                type="email"
                required
                value={setupEmail}
                onChange={(e) => setSetupEmail(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5 text-xs text-cream-50 focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cream-200 mb-1.5">
                Contact Phone
              </label>
              <input
                type="tel"
                value={setupPhone}
                onChange={(e) => setSetupPhone(e.target.value)}
                className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5 text-xs text-cream-50 focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cream-200 mb-1.5">
                Master Password (min 8 chars) *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={setupPassword}
                onChange={(e) => setSetupPassword(e.target.value)}
                placeholder="Choose a strong password"
                className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5 text-xs text-cream-50 focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-gold-light to-brand-gold text-background hover:from-brand-gold hover:to-brand-gold-dark transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Create Super Admin
              </button>
              <button
                type="button"
                onClick={() => setSetupMode(false)}
                className="w-full py-2 text-xs text-cream-muted hover:text-white"
              >
                Cancel and Return to Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-cream-200 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-cream-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@entryx.app or organizer@domain.com"
                  className="w-full bg-surface-elevated border border-surface-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-cream-50 focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cream-200 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-cream-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-elevated border border-surface-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-cream-50 focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-gold-light to-brand-gold text-background hover:from-brand-gold hover:to-brand-gold-dark transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Sign In to Portal
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
