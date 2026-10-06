'use client';

import React, { useState, useEffect } from 'react';
import { Inbox, CheckCircle2, XCircle, UserPlus, Phone, Mail, Building2, RefreshCw, KeyRound, AlertCircle } from 'lucide-react';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [organizerPassword, setOrganizerPassword] = useState('');
  const [provisionSuccess, setProvisionSuccess] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    status: 'approved' | 'rejected',
    createAccount = false
  ) => {
    setActionLoading(id);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          createOrganizerAccount: createAccount,
          organizerPassword: organizerPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update request');
      }

      if (data.organizer) {
        setProvisionSuccess({
          name: data.organizer.name,
          email: data.organizer.email,
          temporaryPassword: data.organizer.temporaryPassword,
        });
      }

      setSelectedReq(null);
      setOrganizerPassword('');
      fetchRequests();
    } catch (err: any) {
      setErrorMsg(err.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-brand-gold animate-spin mx-auto" />
        <p className="text-sm text-cream-muted">Fetching event creation requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-cream-50">Event Creation Requests</h2>
          <p className="text-xs text-cream-muted">
            Review incoming organizer submissions, approve requests, and provision accounts.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="p-2 rounded-xl bg-surface border border-surface-border text-cream-200 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Provision Notification Modal / Card */}
      {provisionSuccess && (
        <div className="p-6 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/60 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
              <CheckCircle2 className="w-5 h-5" />
              <span>Organizer Account Provisioned!</span>
            </div>
            <button
              onClick={() => setProvisionSuccess(null)}
              className="text-xs text-cream-muted hover:text-white"
            >
              Dismiss
            </button>
          </div>
          <div className="p-3 bg-black/40 rounded-xl space-y-1 font-mono text-xs text-emerald-200">
            <div>Organizer: <strong className="text-white">{provisionSuccess.name}</strong></div>
            <div>Login Email: <strong className="text-brand-gold">{provisionSuccess.email}</strong></div>
            <div>
              Generated Password: <strong className="text-white bg-black/60 px-2 py-0.5 rounded">{provisionSuccess.temporaryPassword}</strong>
            </div>
          </div>
          <p className="text-[11px] text-cream-muted">
            Share these credentials with the organizer so they can log in to their dashboard at <code className="text-brand-gold">/login</code>.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-surface rounded-2xl border border-surface-border">
          <Inbox className="w-12 h-12 text-cream-muted mx-auto" />
          <h3 className="text-base font-bold text-cream-100">No event requests yet.</h3>
          <p className="text-xs text-cream-muted max-w-sm mx-auto">
            When users submit the &quot;Create an Event&quot; request form, their submissions will appear here for review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-surface rounded-2xl border border-surface-border p-6 space-y-4 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border/60 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-brand-gold" />
                    <h3 className="text-lg font-bold text-cream-50">
                      {req.organization_name}
                    </h3>
                  </div>
                  <span className="text-xs text-cream-muted block">
                    Submitted on: {new Date(req.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      req.status === 'approved'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : req.status === 'rejected'
                        ? 'bg-red-950/60 text-red-400 border border-red-500/30'
                        : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>

              {/* Requester Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-cream-200">
                <div className="flex items-center gap-2">
                  <strong className="text-cream-muted">Contact:</strong>
                  <span>{req.full_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                  <a href={`mailto:${req.email}`} className="text-brand-gold hover:underline">
                    {req.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                  <span>{req.phone}</span>
                </div>
              </div>

              {/* Messages */}
              <div className="p-3.5 rounded-xl bg-surface-elevated text-xs text-cream-100 space-y-2">
                <p className="leading-relaxed"><strong className="text-cream-muted block text-[10px] uppercase font-bold">Message:</strong> {req.message}</p>
                {req.event_description && (
                  <p className="pt-2 border-t border-surface-border text-cream-200"><strong className="text-cream-muted block text-[10px] uppercase font-bold">Event Description:</strong> {req.event_description}</p>
                )}
              </div>

              {/* Action Buttons if Pending */}
              {req.status === 'pending' && (
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {selectedReq?.id === req.id ? (
                    <div className="w-full p-4 rounded-xl bg-surface-elevated border border-brand-gold/40 space-y-3">
                      <h4 className="text-xs font-bold text-brand-gold flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5" />
                        Approve & Provision Organizer Account
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="password"
                          value={organizerPassword}
                          onChange={(e) => setOrganizerPassword(e.target.value)}
                          placeholder="Custom password (leave empty to auto-generate)"
                          className="bg-surface border border-surface-border rounded-lg px-3 py-2 text-xs text-cream-100 focus:outline-none focus:border-brand-gold"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'approved', true)}
                            disabled={actionLoading === req.id}
                            className="px-4 py-2 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5"
                          >
                            Confirm Approval
                          </button>
                          <button
                            onClick={() => setSelectedReq(null)}
                            className="px-3 py-2 rounded-lg text-xs text-cream-muted hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setSelectedReq(req)}
                        disabled={actionLoading === req.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve & Authorize Organizer
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'rejected')}
                        disabled={actionLoading === req.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-500/30 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject Request
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
