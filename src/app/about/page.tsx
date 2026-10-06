import React from 'react';
import Link from 'next/link';
import { Ticket, QrCode, Mail, Phone, Calendar, ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <Logo size="lg" withSlogan />
        <h1 className="text-3xl sm:text-4xl font-black text-cream-50 font-display">
          About EntryX
        </h1>
        <p className="text-base text-cream-muted max-w-2xl mx-auto leading-relaxed">
          EntryX helps organizers create events, manage registrations, issue secure digital tickets, and verify attendees through QR scanning.
        </p>
      </div>

      {/* Two Paths Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Path 1: Organizers */}
        <div className="bg-surface rounded-3xl border border-surface-border p-8 space-y-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-gold-muted border border-brand-gold/30 flex items-center justify-center text-brand-gold">
              <Ticket className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-cream-50">Want to Organize an Event?</h2>
            <p className="text-xs sm:text-sm text-cream-muted leading-relaxed">
              If you or your organization wants to host an event on EntryX, submit your proposal through our Event Creation Request form. Once approved by the owner, you receive an authorized organizer account to configure capacities, monitor registrations, and verify attendees via the webcam QR scanner.
            </p>
          </div>

          <div className="pt-4 border-t border-surface-border">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-gold-light to-brand-gold text-background hover:from-brand-gold hover:to-brand-gold-dark transition-all shadow-md w-full justify-center"
            >
              Submit Event Creation Request <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Path 2: Attendees / Students */}
        <div className="bg-surface rounded-3xl border border-surface-border p-8 space-y-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-gold-muted border border-brand-gold/30 flex items-center justify-center text-brand-gold">
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-cream-50">Want to Attend an Event?</h2>
            <p className="text-xs sm:text-sm text-cream-muted leading-relaxed">
              If you want to attend an upcoming event, simply browse available events and register using your real email address. A cryptographically signed digital pass containing a unique QR code will be generated instantly and delivered to your inbox.
            </p>
          </div>

          <div className="pt-4 border-t border-surface-border">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-surface-elevated hover:bg-surface-border text-cream-100 border border-surface-border transition-all shadow-md w-full justify-center"
            >
              Browse Available Events <Calendar className="w-4 h-4 text-brand-gold" />
            </Link>
          </div>
        </div>

      </div>


      {/* Direct Contact Card */}
      <div className="bg-surface-elevated rounded-2xl border border-brand-gold/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-cream-50">Have questions or need technical support?</h4>
          <p className="text-xs text-cream-muted">Contact the EntryX operations team directly.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <a
            href="mailto:erinbobin@gmail.com"
            className="inline-flex items-center gap-1.5 text-brand-gold hover:underline"
          >
            <Mail className="w-4 h-4" />
            erinbobin@gmail.com
          </a>
          <a
            href="tel:9446611885"
            className="inline-flex items-center gap-1.5 text-cream-100 hover:text-brand-gold"
          >
            <Phone className="w-4 h-4 text-brand-gold" />
            9446611885
          </a>
        </div>
      </div>
    </div>
  );
}
