'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Inbox, Users, CheckCircle2, QrCode, ArrowRight, RefreshCw, AlertCircle, PlusCircle } from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, reqsRes, evtsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/requests'),
        fetch('/api/events'),
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
      }
      if (reqsRes.ok) {
        const d = await reqsRes.json();
        setRequests(d.requests || []);
      }
      if (evtsRes.ok) {
        const d = await evtsRes.json();
        setEvents(d.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-brand-gold animate-spin mx-auto" />
        <p className="text-sm text-cream-muted">Calculating real-time platform metrics...</p>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-8">
      {/* 6 Real Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cream-muted block">
            Total Events
          </span>
          <div className="text-3xl font-black text-cream-50 font-mono">
            {stats?.totalEvents || 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gold block">
            Active Events
          </span>
          <div className="text-3xl font-black text-brand-gold font-mono">
            {stats?.activeEvents || 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cream-muted block">
            Registrations
          </span>
          <div className="text-3xl font-black text-cream-50 font-mono">
            {stats?.totalRegistrations || 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
            Check-Ins
          </span>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {stats?.totalCheckIns || 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
            Pending Requests
          </span>
          <div className="text-3xl font-black text-amber-400 font-mono">
            {stats?.pendingRequests || 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cream-muted block">
            Organizers
          </span>
          <div className="text-3xl font-black text-cream-50 font-mono">
            {stats?.totalOrganizers || 0}
          </div>
        </div>
      </div>

      {/* Two Column Section: Pending Requests & Live Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pending Requests Preview */}
        <div className="bg-surface rounded-2xl border border-surface-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-cream-100 flex items-center gap-2">
              <Inbox className="w-4 h-4 text-brand-gold" />
              Event Creation Requests
            </h3>
            <Link
              href="/admin/requests"
              className="text-xs font-semibold text-brand-gold hover:underline flex items-center gap-1"
            >
              Manage Requests <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="py-12 text-center text-xs text-cream-muted border border-dashed border-surface-border rounded-xl">
              No pending event requests.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 4).map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-cream-100">
                      {req.organization_name}
                    </h4>
                    <p className="text-xs text-cream-muted">
                      From: {req.full_name} ({req.email})
                    </p>
                  </div>
                  <Link
                    href="/admin/requests"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-gold text-background hover:bg-brand-gold-light"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Events Preview */}
        <div className="bg-surface rounded-2xl border border-surface-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-cream-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-gold" />
              Events Overview
            </h3>
            <Link
              href="/admin/events"
              className="text-xs font-semibold text-brand-gold hover:underline flex items-center gap-1"
            >
              All Events <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="py-12 text-center text-xs text-cream-muted border border-dashed border-surface-border rounded-xl">
              No events created yet.
            </div>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 4).map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-cream-100">{evt.name}</h4>
                    <p className="text-xs text-cream-muted">
                      {evt.event_date} • {evt.registered_count || 0}/{evt.max_capacity} registered
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      evt.status === 'active'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-950/60 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {evt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
