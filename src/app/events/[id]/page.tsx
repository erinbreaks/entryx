'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Ticket, Users, ArrowLeft, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');

  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) {
          throw new Error('Event not found or failed to load');
        }
        const data = await res.json();
        setEvent(data.event);
      } catch (err: any) {
        setErrorMsg(err.message || 'Could not load event');
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          fullName: fullName.trim(),
          email: email.trim(),
          studentId: studentId.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete registration');
      }

      // Successful registration -> Navigate to pass confirmation
      router.push(`/registration/success/${data.ticket.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-brand-gold animate-spin mx-auto" />
        <p className="text-sm text-cream-muted">Loading live event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-cream-100">Event Not Found</h2>
        <p className="text-xs text-cream-muted">
          The requested event could not be found or has been removed.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-surface-elevated text-brand-gold border border-brand-gold/30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>
      </div>
    );
  }

  const isCapacityFull = (event.remaining_capacity ?? 0) <= 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-xs font-semibold text-cream-muted hover:text-brand-gold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Event Details */}
        <div className="lg:col-span-7 space-y-6">
          {event.image_url && (
            <div className="rounded-2xl overflow-hidden border border-surface-border bg-surface max-h-72">
              <img
                src={event.image_url}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="bg-surface rounded-2xl border border-surface-border p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
                {event.ticket_price === 0 ? 'Free Entry' : `₹${event.ticket_price} per Ticket`}
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-cream-50 leading-tight">
                {event.name}
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-cream-200">
              <div className="p-3.5 rounded-xl bg-surface-elevated border border-surface-border space-y-1">
                <span className="text-[10px] uppercase font-bold text-cream-muted flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                  Date
                </span>
                <p className="font-semibold text-cream-100">{event.event_date}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-elevated border border-surface-border space-y-1">
                <span className="text-[10px] uppercase font-bold text-cream-muted flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-gold" />
                  Time
                </span>
                <p className="font-semibold text-cream-100">
                  {event.start_time}{event.end_time ? ` - ${event.end_time}` : ''}
                </p>
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-xl bg-surface-elevated border border-surface-border space-y-1">
                <span className="text-[10px] uppercase font-bold text-cream-muted flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                  Venue
                </span>
                <p className="font-semibold text-cream-100">{event.venue}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2 border-t border-surface-border">
              <h3 className="text-sm font-bold text-cream-100">About This Event</h3>
              <p className="text-xs sm:text-sm text-cream-muted leading-relaxed whitespace-pre-line">
                {event.description || 'No additional details provided by the organizer.'}
              </p>
            </div>

            {/* Real-time Capacity Status */}
            <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-cream-100">Real-Time Availability</span>
                <p className="text-[11px] text-cream-muted">
                  Max: {event.max_capacity} | Registered: {event.registered_count || 0}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-black font-mono ${
                    isCapacityFull ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {event.remaining_capacity ?? event.max_capacity} seats left
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="lg:col-span-5">
          <div className="bg-surface rounded-2xl border border-surface-border p-6 md:p-8 space-y-6 shadow-2xl sticky top-28">
            <div>
              <h2 className="text-xl font-bold text-cream-50">Register for Ticket</h2>
              <p className="text-xs text-cream-muted mt-1">
                Provide your details to generate your cryptographically verified pass.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isCapacityFull ? (
              <div className="p-6 rounded-xl bg-surface-elevated border border-red-500/30 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                <h4 className="text-sm font-bold text-red-300">
                  Registration Closed — Capacity Reached
                </h4>
                <p className="text-xs text-cream-muted">
                  All {event.max_capacity} seats for this event have been reserved.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-cream-200 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Erin Bobin"
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
                    placeholder="e.g. erinbobin@gmail.com"
                    className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5 text-xs text-cream-50 focus:outline-none focus:border-brand-gold transition-colors"
                  />
                  <span className="text-[10px] text-cream-muted block mt-1">
                    Your QR ticket will be sent to this email.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cream-200 mb-1.5">
                    Student ID / Registration ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. 21BCE1045"
                    className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5 text-xs text-cream-50 focus:outline-none focus:border-brand-gold transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-gold-light to-brand-gold text-background hover:from-brand-gold hover:to-brand-gold-dark transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Securing Ticket & Generating QR...
                    </>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      Confirm & Issue Ticket
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
