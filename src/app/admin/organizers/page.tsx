'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Phone, Calendar, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminOrganizersPage() {
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Organizer Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/organizers');
      if (res.ok) {
        const data = await res.json();
        setOrganizers(data.organizers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const handleCreateOrganizer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setCreating(true);

    try {
      const res = await fetch('/api/admin/organizers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create organizer');
      }

      setSuccessMsg(`Organizer ${data.organizer.name} has been authorized!`);
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      fetchOrganizers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Creation error');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-brand-gold animate-spin mx-auto" />
        <p className="text-sm text-cream-muted">Loading authorized organizers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-cream-50">Authorized Organizers</h2>
          <p className="text-xs text-cream-muted">
            Manage authorized event hosts and their access credentials.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-gold-light to-brand-gold text-background hover:from-brand-gold hover:to-brand-gold-dark transition-all shadow-md"
        >
          <UserPlus className="w-4 h-4" />
          Authorize New Organizer
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {organizers.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-surface rounded-2xl border border-surface-border">
          <Users className="w-12 h-12 text-cream-muted mx-auto" />
          <h3 className="text-base font-bold text-cream-100">No organizers registered yet.</h3>
          <p className="text-xs text-cream-muted max-w-sm mx-auto">
            Authorize organizers directly or approve submitted event requests to grant organizer privileges.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizers.map((org) => (
            <div
              key={org.id}
              className="bg-surface rounded-2xl border border-surface-border p-6 space-y-4 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold font-bold">
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-cream-50">{org.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-elevated text-brand-gold border border-brand-gold/20">
                    Organizer
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-cream-200 pt-2 border-t border-surface-border">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                  <a href={`mailto:${org.email}`} className="text-brand-gold hover:underline truncate">
                    {org.email}
                  </a>
                </div>
                {org.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                    <span>{org.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[11px] text-cream-muted">
                  <Calendar className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                  <span>Created: {new Date(org.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Organizer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-cream-50">Authorize Organizer</h3>
              <button
                onClick={() => setShowAddModal(false)}
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

            <form onSubmit={handleCreateOrganizer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-cream-200 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-surface-elevated border border-surface-border rounded-xl px-3.5 py-2 text-cream-50 focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block font-semibold text-cream-200 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full bg-surface-elevated border border-surface-border rounded-xl px-3.5 py-2 text-cream-50 focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block font-semibold text-cream-200 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set organizer password"
                  className="w-full bg-surface-elevated border border-surface-border rounded-xl px-3.5 py-2 text-cream-50 focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block font-semibold text-cream-200 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9446611885"
                  className="w-full bg-surface-elevated border border-surface-border rounded-xl px-3.5 py-2 text-cream-50 focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-cream-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl font-bold bg-brand-gold text-background hover:bg-brand-gold-light transition-all flex items-center gap-2"
                >
                  {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Authorize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
