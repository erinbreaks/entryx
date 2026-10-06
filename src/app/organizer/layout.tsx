'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, LayoutDashboard, PlusCircle, LogOut, ArrowLeft, RefreshCw, Ticket } from 'lucide-react';

export default function OrganizerLayout({
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
        if (!data.authenticated) {
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
        <p className="text-sm text-cream-muted">Verifying Organizer authorization...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="bg-surface rounded-2xl border border-surface-border p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-gold/15 border border-brand-gold/40 flex items-center justify-center text-brand-gold">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-cream-50 font-display">Organizer Portal</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-gold text-background">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-cream-muted">
              Logged in as: <strong className="text-cream-200">{user.name} ({user.email})</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/organizer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-surface-elevated hover:bg-surface-border text-cream-100 border border-surface-border transition-all"
          >
            <LayoutDashboard className="w-4 h-4 text-brand-gold" />
            My Events
          </Link>
          {user.role === 'owner' && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-gold text-background hover:bg-brand-gold-light transition-all shadow-md"
            >
              Switch to Owner Portal
            </Link>
          )}
        </div>
      </div>

      <div className="w-full">{children}</div>
    </div>
  );
}
