'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from './Logo';
import { Menu, X, Shield, Calendar, User, LogOut, Ticket, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<{
    id: string;
    email: string;
    name: string;
    role: 'owner' | 'organizer';
  } | null>(null);

  useEffect(() => {
    // Check current auth status
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setSessionUser(data.user);
          } else {
            setSessionUser(null);
          }
        } else {
          setSessionUser(null);
        }
      } catch (e) {
        setSessionUser(null);
      }
    }
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSessionUser(null);
      router.push('/');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/about', label: 'About', icon: Sparkles },
    { href: '/contact', label: 'Create an Event', icon: Ticket },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-surface-border/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-brand-gold bg-brand-gold-muted font-semibold'
                      : 'text-cream-200 hover:text-white hover:bg-surface-elevated/60'
                  }`}
                >
                  <Icon className="w-4 h-4 text-brand-gold/80" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Auth / Profile Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {sessionUser ? (
              <div className="flex items-center space-x-3">
                <Link
                  href={sessionUser.role === 'owner' ? '/admin' : '/organizer'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-surface-elevated border border-brand-gold/30 text-brand-gold hover:bg-brand-gold/10 transition-all shadow-sm"
                >
                  {sessionUser.role === 'owner' ? (
                    <Shield className="w-4 h-4 text-brand-gold" />
                  ) : (
                    <User className="w-4 h-4 text-brand-gold" />
                  )}
                  <span>
                    {sessionUser.role === 'owner' ? 'Owner Portal' : 'Organizer Portal'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-lg text-cream-muted hover:text-white hover:bg-surface-elevated transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-background bg-gradient-to-r from-brand-gold-light to-brand-gold hover:from-brand-gold hover:to-brand-gold-dark transition-all shadow-[0_0_20px_rgba(229,169,60,0.25)] hover:shadow-[0_0_25px_rgba(229,169,60,0.4)]"
              >
                <User className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-cream-200 hover:text-white hover:bg-surface-elevated focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-surface-border px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                  isActive
                    ? 'text-brand-gold bg-brand-gold-muted font-semibold'
                    : 'text-cream-200 hover:text-white hover:bg-surface-elevated'
                }`}
              >
                <Icon className="w-5 h-5 text-brand-gold/80" />
                {link.label}
              </Link>
            );
          })}
          
          <div className="pt-4 border-t border-surface-border">
            {sessionUser ? (
              <div className="space-y-2">
                <Link
                  href={sessionUser.role === 'owner' ? '/admin' : '/organizer'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-semibold bg-surface-elevated text-brand-gold border border-brand-gold/30"
                >
                  {sessionUser.role === 'owner' ? (
                    <Shield className="w-5 h-5 text-brand-gold" />
                  ) : (
                    <User className="w-5 h-5 text-brand-gold" />
                  )}
                  {sessionUser.role === 'owner' ? 'Owner Portal' : 'Organizer Portal'}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-surface-elevated"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-base font-semibold text-background bg-gradient-to-r from-brand-gold-light to-brand-gold"
              >
                <User className="w-5 h-5" />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
