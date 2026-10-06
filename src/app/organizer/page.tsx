'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Ticket, Users, CheckCircle2, Clock, MapPin, PlusCircle, QrCode, Eye, RefreshCw, AlertCircle } from 'lucide-react';

export default function OrganizerDashboardPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Create event form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ticketPrice, setTicketPrice] = useState('0');
  const [maxCapacity, setMaxCapacity] = useState('100');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('17:00');
  const [venue, setVenue] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const loadOrganizerEvents = async () => {
    try {
      setLoading(true);
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const u = await userRes.json();
        setUser(u.user);

        // Fetch events filtered for this organizer
        const evtsRes = await fetch(`/api/events?organizerId=${u.user.id}`);
        if (evtsRes.ok) {
          const d = await evtsRes.json();
          setEvents(d.events || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizerEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setCreating(true);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description ? description.trim() : undefined,
          ticketPrice: Number(ticketPrice),
          maxCapacity: Number(maxCapacity),
          eventDate,
          startTime,
          endTime: endTime || undefined,
          venue: venue.trim(),
          imageUrl: imageUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      setShowCreateModal(false);
      setName('');
      setDescription('');
      setImageUrl('');
      setVenue('');
      loadOrganizerEvents();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating event');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-brand-gold animate-spin mx-auto" />
        <p className="text-sm text-cream-muted">Loading your authorized events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-cream-50">My Authorized Events</h2>
          <p className="text-xs text-cream-muted">
            Live dashboard of real capacity, registered attendees, and gate check-in counts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadOrganizerEvents}
            className="p-2.5 rounded-xl bg-surface border border-surface-border text-cream-200 hover:text-white"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-gold-light to-brand-gold text-background hover:from-brand-gold hover:to-brand-gold-dark transition-all shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            Create Event
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-surface rounded-3xl border border-surface-border max-w-lg mx-auto p-8">
          <Calendar className="w-12 h-12 text-cream-muted mx-auto" />
          <h3 className="text-base font-bold text-cream-100">
            No events have been assigned to you yet.
          </h3>
          <p className="text-xs text-cream-muted leading-relaxed">
            You currently have no authorized events. You can create your own event or wait for the system owner to assign one.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-gold text-background hover:bg-brand-gold-light transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              Create Your First Event
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((evt) => {
            const registered = evt.registered_count || 0;
            const checkedIn = evt.checked_in_count || 0;
            const remainingSeats = evt.remaining_capacity ?? (evt.max_capacity - registered);
            const remainingAttendees = Math.max(0, registered - checkedIn);

            return (
              <div
                key={evt.id}
                className="bg-surface rounded-3xl border border-surface-border overflow-hidden shadow-xl flex flex-col justify-between"
              >
                {/* Event Image if Available */}
                {evt.image_url && (
                  <div className="relative w-full h-44 overflow-hidden bg-surface-elevated">
                    <img
                      src={evt.image_url}
                      alt={evt.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-background/80 backdrop-blur-md text-brand-gold border border-brand-gold/30">
                        {evt.ticket_price === 0 ? 'Free' : `₹${evt.ticket_price}`}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/30">
                        {evt.event_date}
                      </span>
                      <span className="text-xs font-bold text-cream-200 font-mono">
                        ID: {evt.id.slice(0, 8)}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-black text-cream-50 leading-snug">
                      {evt.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-cream-muted">
                      <span className="flex items-center gap-1.5 text-cream-200">
                        <Clock className="w-3.5 h-3.5 text-brand-gold" />
                        {evt.start_time}{evt.end_time ? ` - ${evt.end_time}` : ''}
                      </span>
                      <span className="flex items-center gap-1.5 text-cream-200">
                        <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                        {evt.venue}
                      </span>
                    </div>

                    {/* Exact Database Metrics Display */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-surface-border">
                      <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border text-center">
                        <span className="text-[10px] uppercase font-bold text-cream-muted block">
                          Capacity
                        </span>
                        <strong className="text-base font-black text-cream-50 font-mono">
                          {evt.max_capacity}
                        </strong>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border text-center">
                        <span className="text-[10px] uppercase font-bold text-cream-muted block">
                          Registered
                        </span>
                        <strong className="text-base font-black text-brand-gold font-mono">
                          {registered}
                        </strong>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border text-center">
                        <span className="text-[10px] uppercase font-bold text-cream-muted block">
                          Checked-In
                        </span>
                        <strong className="text-base font-black text-emerald-400 font-mono">
                          {checkedIn}
                        </strong>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-elevated border border-surface-border text-center">
                        <span className="text-[10px] uppercase font-bold text-cream-muted block">
                          Remaining
                        </span>
                        <strong className="text-base font-black text-cream-200 font-mono">
                          {remainingSeats}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-surface-border flex items-center justify-between gap-3">
                    <Link
                      href={`/organizer/events/${evt.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-surface-elevated hover:bg-surface-border text-cream-100 border border-surface-border transition-all"
                    >
                      <Eye className="w-4 h-4 text-brand-gold" />
                      View Attendee Roster
                    </Link>

                    <Link
                      href={`/organizer/events/${evt.id}/scan`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-gold-light to-brand-gold text-background hover:from-brand-gold hover:to-brand-gold-dark transition-all shadow-md"
                    >
                      <QrCode className="w-4 h-4" />
                      Open QR Gate Scanner
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Organizer Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-cream-50">Create New Event</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-xs text-cream-muted hover:text-white"
              >
                Close
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-cream-200 mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AI & Cloud Workshop 2026"
                  className="w-full bg-surface-elevated border border-surface-border rounded-xl px-3.5 py-2 text-cream-50 focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-cream-200 mb-1">
                    Ticket Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-xl px-3.5 py-2 text-cream-50 focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-cream-200 mb-1">
                    Max Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-xl px-3.5 py-2 text-cream-50 focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-semibold text-cream-200 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-xl px-3 py-2 text-cream-50 focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-cream-200 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-xl px-3 py-2 text-cream-50 focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-cream-200 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-surface-elevated border border-surface-border rounded-xl px-3 py-2 text-cream-50 focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-cream-200 mb-1">
                  Venue Location *
                </label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Science Auditorium, Floor 2"
                  className="w-full bg-surface-elevated border border-surface-border rounded-xl px-3.5 py-2 text-cream-50 focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block font-semibold text-cream-200 mb-1">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-surface-elevated border border-surface-border rounded-xl px-3.5 py-2 text-cream-50 focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block font-semibold text-cream-200 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-surface-elevated border border-surface-border rounded-xl px-3.5 py-2 text-cream-50 focus:outline-none focus:border-brand-gold resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-cream-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl font-bold bg-brand-gold text-background hover:bg-brand-gold-light transition-all flex items-center gap-2"
                >
                  {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
