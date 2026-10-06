'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, LayoutDashboard, Inbox, Calendar, Users, LogOut, ArrowLeft, RefreshCw } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (!data.authenticated || data.user.role !== 'owner') {
          // If not owner, kick out
          router.push('/login');
          return;
        }
        setUser(data.user);
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-brand-gold animate-spin mx-auto" />
        <p className="text-sm text-cream-muted">Verifying Owner authorization...</p>
      </div>
    );
  }

  if (!user || user.role !== 'owner') {
    return null;
  }

  const tabs = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/requests', label: 'Event Requests', icon: Inbox },
    { href: '/admin/events', label: 'All Events', icon: Calendar },
    { href: '/admin/organizers', label: 'Organizers', icon: Users },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="bg-surface rounded-2xl border border-surface-border p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-gold/15 border border-brand-gold/40 flex items-center justify-center text-brand-gold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-cream-50 font-display">Owner Admin Portal</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-gold text-background">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-cream-muted">
              Authenticated as: <strong className="text-cream-200">{user.name} ({user.email})</strong>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-gold text-background shadow-md'
                    : 'bg-surface-elevated text-cream-200 hover:text-white border border-surface-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Admin Content */}
      <div className="w-full">{children}</div>
    </div>
  );
}
