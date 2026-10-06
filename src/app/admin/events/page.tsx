'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, PlusCircle, Users, MapPin, Ticket, AlertCircle, RefreshCw, Eye, Ban, CheckCircle } from 'lucide-react';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Event Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ticketPrice, setTicketPrice] = useState('0');
  const [maxCapacity, setMaxCapacity] = useState('100');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('17:00');
  const [venue, setVenue] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [assignedOrganizerId, setAssignedOrganizerId] = useState('');
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsRes, orgsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/admin/organizers'),
      ]);

      if (eventsRes.ok) {
        const d = await eventsRes.json();
        setEvents(d.events || []);
      }
      if (orgsRes.ok) {
        const d = await orgsRes.json();
        setOrganizers(d.organizers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
          name,
          description,
          ticketPrice: Number(ticketPrice),
          maxCapacity: Number(maxCapacity),
          eventDate,
          startTime,
          endTime,
          venue,
          imageUrl: imageUrl || undefined,
          assignedOrganizerId: assignedOrganizerId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      setShowCreateModal(false);
      // Reset form
      setName('');
      setDescription('');
      setImageUrl('');
      setVenue('');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Creation failed');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (eventId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'cancelled' : 'active';
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-brand-gold animate-spin mx-auto" />
        <p className="text-sm text-cream-muted">Loading events catalogue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-cream-50">Event Management</h2>
          <p className="text-xs text-cream-muted">
            Create events, assign organizers, configure capacity limits, and monitor entries.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-gold-light to-brand-gold text-background hover:from-brand-gold hover:to-brand-gold-dark transition-all shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-surface rounded-2xl border border-surface-border">
          <Calendar className="w-12 h-12 text-cream-muted mx-auto" />
          <h3 className="text-base font-bold text-cream-100">No events available yet.</h3>
          <p className="text-xs text-cream-muted max-w-sm mx-auto">
            Click &quot;Create New Event&quot; above to create your first event.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-surface rounded-2xl border border-surface-border p-6 flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      evt.status === 'active'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-950/60 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {evt.status}
                  </span>
                  <span className="text-xs font-bold text-brand-gold">
                    {evt.ticket_price === 0 ? 'Free' : `₹${evt.ticket_price}`}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-cream-50">{evt.name}</h3>

                <div className="space-y-1.5 text-xs text-cream-muted pt-2 border-t border-surface-border">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                    <span>{evt.event_date} ({evt.start_time})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-brand-gold" />
                    <span>
                      Registered: <strong className="text-cream-100">{evt.registered_count || 0}</strong> / {evt.max_capacity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-border flex items-center justify-between gap-2">
                <Link
                  href={`/organizer/events/${evt.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-elevated text-cream-200 hover:text-white border border-surface-border"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Roster
                </Link>
                <Link
                  href={`/organizer/events/${evt.id}/scan`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-gold/20 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/30"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  Scan
                </Link>
                <button
                  onClick={() => handleToggleStatus(evt.id, evt.status)}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    evt.status === 'active'
                      ? 'text-red-400 hover:bg-red-950/40'
                      : 'text-emerald-400 hover:bg-emerald-950/40'
                  }`}
                  title={evt.status === 'active' ? 'Cancel Event' : 'Reactivate Event'}
                >
                  <Ban className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-cream-50">Create Event</h3>
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
                  placeholder="e.g. Annual Tech Symposium 2026"
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
                  placeholder="e.g. Main Auditorium, Hall A"
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
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-surface-elevated border border-surface-border rounded-xl px-3.5 py-2 text-cream-50 focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block font-semibold text-cream-200 mb-1">
                  Assign Organizer (Optional)
                </label>
                <select
                  value={assignedOrganizerId}
                  onChange={(e) => setAssignedOrganizerId(e.target.value)}
                  className="w-full bg-surface-elevated border border-surface-border rounded-xl px-3.5 py-2 text-cream-50 focus:outline-none focus:border-brand-gold"
                >
                  <option value="">-- Select Organizer --</option>
                  {organizers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.email})
                    </option>
                  ))}
                </select>
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
                  {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
