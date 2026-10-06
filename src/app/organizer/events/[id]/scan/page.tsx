'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QRScanner from '@/components/QRScanner';
import { Calendar, Users, CheckCircle2, ArrowLeft, RefreshCw, QrCode, ShieldAlert, Clock, Sparkles } from 'lucide-react';

export default function OrganizerScanPage() {
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        const d = await res.json();
        setEvent(d.event);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const handleScanResult = (result: any) => {
    setScanHistory((prev) => [
      {
        ...result,
        scannedAt: new Date().toISOString(),
      },
      ...prev.slice(0, 9), // Keep last 10 scans
    ]);

    // Refresh live event numbers
    loadEvent();
  };

  if (loading && !event) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-brand-gold animate-spin mx-auto" />
        <p className="text-sm text-cream-muted">Initializing Gate Scanner...</p>
      </div>
    );
  }

  const registered = event?.registered_count || 0;
  const checkedIn = event?.checked_in_count || 0;
  const remainingToCheckIn = Math.max(0, registered - checkedIn);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={`/organizer/events/${eventId}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-cream-muted hover:text-brand-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Event Overview
        </Link>

        <div className="flex items-center gap-2 text-xs text-cream-muted">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Gate Verification Active</span>
        </div>
      </div>

      {/* Event Banner */}
      <div className="bg-surface rounded-3xl border border-surface-border p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold">
            Gate Scanning Terminal
          </span>
          <h1 className="text-2xl font-black text-cream-50 mt-0.5">{event?.name}</h1>
          <p className="text-xs text-cream-muted mt-1">
            {event?.event_date} • {event?.venue}
          </p>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border text-center">
            <span className="text-[9px] uppercase font-bold text-cream-muted block">Registered</span>
            <strong className="text-lg font-black text-cream-50 font-mono">{registered}</strong>
          </div>
          <div className="p-3 rounded-xl bg-surface-elevated border border-emerald-500/30 text-center">
            <span className="text-[9px] uppercase font-bold text-emerald-400 block">Checked-In</span>
            <strong className="text-lg font-black text-emerald-400 font-mono">{checkedIn}</strong>
          </div>
          <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border text-center">
            <span className="text-[9px] uppercase font-bold text-amber-400 block">Remaining</span>
            <strong className="text-lg font-black text-amber-400 font-mono">{remainingToCheckIn}</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: QR Scanner */}
        <div className="lg:col-span-7">
          <QRScanner eventId={eventId} onScanResult={handleScanResult} />
        </div>

        {/* Right Column: Real-time Scan Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-cream-50 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-gold" />
                Live Scan Activity
              </h3>
              <span className="text-[10px] text-cream-muted font-mono">Latest 10</span>
            </div>

            {scanHistory.length === 0 ? (
              <div className="py-12 text-center text-xs text-cream-muted border border-dashed border-surface-border rounded-xl">
                Awaiting scans... Results will stream here instantly.
              </div>
            ) : (
              <div className="space-y-2.5">
                {scanHistory.map((scan, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      scan.result === 'CHECKED_IN'
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : scan.result === 'ALREADY_USED'
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                        : 'bg-red-950/30 border-red-500/40 text-red-200'
                    }`}
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{scan.attendeeName || 'Unknown Attendee'}</span>
                        {scan.ticketNumber && (
                          <span className="font-mono text-[10px] opacity-75">({scan.ticketNumber})</span>
                        )}
                      </div>
                      <p className="text-[11px] opacity-80 truncate">{scan.message}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-mono opacity-70 block">
                        {new Date(scan.scannedAt).toLocaleTimeString()}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider">
                        {scan.result.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
