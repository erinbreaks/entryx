'use client';

import React, { useState } from 'react';
import { Ticket, Mail, Phone, Building2, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import Logo from '@/components/Logo';

export default function ContactRequestPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [message, setMessage] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    requestId: string;
    emailSent: boolean;
    warning?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          organizationName,
          message,
          eventDescription,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setSuccessResult({
        requestId: data.requestId,
        emailSent: data.emailSent,
        warning: data.warning,
      });

      // Reset form
      setFullName('');
      setEmail('');
      setPhone('');
      setOrganizationName('');
      setMessage('');
      setEventDescription('');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting your request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-gold/15 text-brand-gold text-xs font-semibold border border-brand-gold/30">
          <Ticket className="w-3.5 h-3.5" />
          <span>Organizer Onboarding</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-cream-50 font-display">
          Request to Host an Event
        </h1>
        <p className="text-sm text-cream-muted max-w-xl mx-auto leading-relaxed">
          Submit your event proposal. Our administrative team will review your request and provision an authorized organizer portal for you.
        </p>
      </div>

      {/* Success Banner */}
      {successResult && (
        <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-emerald-100">
                Event Creation Request Submitted Successfully!
              </h3>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                Your request has been recorded in the EntryX system with ID: <code className="font-mono bg-black/40 px-2 py-0.5 rounded text-brand-gold">{successResult.requestId}</code>.
              </p>
              {successResult.emailSent ? (
                <p className="text-xs text-emerald-300 font-semibold pt-1">
                  ✓ A real notification email was dispatched to the system owner (erinbobin@gmail.com).
                </p>
              ) : (
                successResult.warning && (
                  <p className="text-xs text-amber-300 pt-1">
                    Note: {successResult.warning}
                  </p>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 flex items-start gap-3 text-red-200 text-xs">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-surface rounded-3xl border border-surface-border p-6 sm:p-10 shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-cream-200 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5 text-xs text-cream-50 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cream-200 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex@example.com"
                className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5 text-xs text-cream-50 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-cream-200 mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9446611885"
                className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5 text-xs text-cream-50 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cream-200 mb-1.5">
                Organization or Event Name *
              </label>
              <input
                type="text"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="e.g. Tech Horizons Club"
                className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5 text-xs text-cream-50 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cream-200 mb-1.5">
              Message / Request Summary *
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your proposed event, expected audience size, and ticketing needs..."
              className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5 text-xs text-cream-50 focus:outline-none focus:border-brand-gold transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-cream-200 mb-1.5">
              Detailed Event Description (Optional)
            </label>
            <textarea
              rows={3}
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Provide agenda, guest speakers, venue details, or any special requirements..."
              className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5 text-xs text-cream-50 focus:outline-none focus:border-brand-gold transition-colors resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-gold-light to-brand-gold text-background hover:from-brand-gold hover:to-brand-gold-dark transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Submitting Request & Notifying Owner...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Event Creation Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
