'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, QrCode, ArrowLeft, RefreshCw, CheckCircle2, XCircle, Search, Mail, Hash } from 'lucide-react';

export default function OrganizerEventOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [evtRes, attRes] = await Promise.all([
        fetch(`/api/events/${eventId}`),
        fetch(`/api/events/${eventId}/attendees`),
      ]);

      if (evtRes.ok) {
        const d = await evtRes.json();
        setEvent(d.event);
      }
      if (attRes.ok) {
        const d = await attRes.json();
        setAttendees(d.attendees || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadData();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-brand-gold animate-spin mx-auto" />
        <p className="text-sm text-cream-muted">Loading attendee records from database...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-cream-100">Event Not Found</h2>
        <Link
          href="/organizer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-surface-elevated text-brand-gold border border-brand-gold/30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const filteredAttendees = attendees.filter(
    (a) =>
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.ticketNumber && a.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const checkedInCount = attendees.filter((a) => a.isCheckedIn).length;

  return (
    <div className="space-y-8">
      {/* Navigation header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/organizer"
          className="inline-flex items-center gap-2 text-xs font-semibold text-cream-muted hover:text-brand-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Organizer Dashboard
        </Link>

        <Link
          href={`/organizer/events/${eventId}/scan`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-gold-light to-brand-gold text-background hover:from-brand-gold hover:to-brand-gold-dark transition-all shadow-md self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4" />
          Open QR Gate Scanner
        </Link>
      </div>

      {/* Event Summary Card */}
      <div className="bg-surface rounded-3xl border border-surface-border p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
              {event.status.toUpperCase()}
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-cream-50">{event.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-cream-muted">
              <span className="flex items-center gap-1.5 text-cream-200">
                <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                {event.event_date} ({event.start_time})
              </span>
              <span className="flex items-center gap-1.5 text-cream-200">
                <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                {event.venue}
              </span>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-surface-elevated border border-surface-border text-center min-w-[100px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cream-muted block">
                Registered
              </span>
              <span className="text-2xl font-black text-brand-gold font-mono">
                {attendees.length} / {event.max_capacity}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-surface-elevated border border-surface-border text-center min-w-[100px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                Checked In
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {checkedInCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendee Roster Section */}
      <div className="bg-surface rounded-3xl border border-surface-border p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-cream-50">Attendee Roster</h2>
            <p className="text-xs text-cream-muted">
              Real-time list of all registered attendees and gate verification timestamps.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-cream-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search attendee or token..."
              className="w-full bg-surface-elevated border border-surface-border rounded-xl pl-9 pr-3 py-2 text-xs text-cream-50 focus:outline-none focus:border-brand-gold"
            />
          </div>
        </div>

        {attendees.length === 0 ? (
          <div className="py-16 text-center space-y-3 border border-dashed border-surface-border rounded-2xl">
            <Users className="w-10 h-10 text-cream-muted mx-auto" />
            <h3 className="text-sm font-bold text-cream-100">No registrations yet.</h3>
            <p className="text-xs text-cream-muted">
              Attendees who register for this event will appear in this real-time roster.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-cream-200">
              <thead className="bg-surface-elevated uppercase tracking-wider text-[10px] text-cream-muted font-bold border-b border-surface-border">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Attendee</th>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Ticket Ref</th>
                  <th className="px-4 py-3">Registration Date</th>
                  <th className="px-4 py-3">Entry Status</th>
                  <th className="px-4 py-3 rounded-r-xl">Checked-In At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {filteredAttendees.map((att) => (
                  <tr key={att.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-cream-50">
                      <div>{att.fullName}</div>
                      <div className="text-[11px] text-cream-muted font-normal">{att.email}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono">{att.studentId}</td>
                    <td className="px-4 py-3.5 font-mono text-brand-gold font-bold">
                      {att.ticketNumber || 'N/A'}
                    </td>
                    <td className="px-4 py-3.5 text-cream-muted">
                      {new Date(att.registeredAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      {att.isCheckedIn ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          CHECKED-IN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-elevated text-cream-muted border border-surface-border">
                          VALID
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-cream-muted font-mono text-[11px]">
                      {att.checkedInAt ? new Date(att.checkedInAt).toLocaleTimeString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
