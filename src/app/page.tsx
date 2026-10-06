import React from 'react';
import Link from 'next/link';
import EventCarousel from '@/components/EventCarousel';
import WarpText from '@/components/WarpText';
import { Calendar, Ticket, ShieldCheck, QrCode, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch real events and actual system statistics
  const [events, stats] = await Promise.all([
    db.listEvents({ status: 'active' }),
    db.getSystemOverviewStats(),
  ]);

  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="relative pt-6 pb-12 md:py-16 text-center max-w-4xl mx-auto space-y-8">
        
        {/* Main Headline with React Bits WarpText */}
        <div className="space-y-2 flex flex-col items-center">
          <div className="w-full max-w-lg h-28 sm:h-36 relative flex items-center justify-center">
            <WarpText
              text="EntryX"
              color="#FAF6EE"
              warpStrength={0.08}
              warpScale={1.7}
              speed={0.55}
              pointerInfluence={0.42}
              pointerStrength={0.38}
              refraction={0.018}
              ripple={true}
              fontSize="clamp(3.5rem, 9vw, 6.5rem)"
              fontWeight={900}
              letterSpacing="-0.04em"
              style={{ width: '100%', height: '100%', minHeight: '100px' }}
            />
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-cream-200 tracking-tight">
            Event Entry, Reimagined.
          </p>
        </div>

        {/* Description */}
        <p className="text-base sm:text-lg text-cream-muted max-w-2xl mx-auto leading-relaxed">
          Discover exciting events, Register, Get your ticket, and Scan your way in.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/events"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-background bg-gradient-to-r from-brand-gold-light to-brand-gold hover:from-brand-gold hover:to-brand-gold-dark transition-all shadow-[0_0_25px_rgba(229,169,60,0.35)] hover:scale-[1.02]"
          >
            <Calendar className="w-5 h-5" />
            Browse Events
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-cream-100 bg-surface-elevated hover:bg-surface-border border border-surface-border transition-all hover:scale-[1.02]"
          >
            <Ticket className="w-5 h-5 text-brand-gold" />
            Create an Event
          </Link>
        </div>

        {/* Live Real-time Database Metrics (ONLY if real data exists) */}
        {(stats.totalEvents > 0 || stats.totalRegistrations > 0) && (
          <div className="pt-8 border-t border-surface-border/50 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
            <div className="p-4 rounded-xl bg-surface/60 border border-surface-border">
              <div className="text-2xl md:text-3xl font-black text-brand-gold font-mono">
                {stats.activeEvents}
              </div>
              <div className="text-xs text-cream-muted font-medium mt-1">Active Events</div>
            </div>
            <div className="p-4 rounded-xl bg-surface/60 border border-surface-border">
              <div className="text-2xl md:text-3xl font-black text-cream-50 font-mono">
                {stats.totalRegistrations}
              </div>
              <div className="text-xs text-cream-muted font-medium mt-1">Confirmed Registrations</div>
            </div>
            <div className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-surface/60 border border-surface-border">
              <div className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">
                {stats.totalCheckIns}
              </div>
              <div className="text-xs text-cream-muted font-medium mt-1">Live Check-Ins</div>
            </div>
          </div>
        )}

      </section>

      {/* Dynamic Real Event Visual Carousel */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-cream-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse" />
            Upcoming Events
          </h2>
          <Link
            href="/events"
            className="text-xs font-semibold text-brand-gold hover:underline flex items-center gap-1"
          >
            View all events <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <EventCarousel />
      </section>

      {/* Upcoming Real Events Listing */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-cream-100">
              Upcoming Events
            </h2>
            <p className="text-xs md:text-sm text-cream-muted">
              Live registration and real-time seat availability
            </p>
          </div>
          <Link
            href="/events"
            className="text-xs md:text-sm font-semibold text-brand-gold hover:underline flex items-center gap-1"
          >
            All Events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="py-12 px-6 rounded-2xl bg-surface/60 border border-surface-border text-center space-y-3">
            <Calendar className="w-12 h-12 text-cream-muted mx-auto" />
            <h3 className="text-base font-semibold text-cream-100">No events available yet.</h3>
            <p className="text-xs text-cream-muted max-w-sm mx-auto">
              No public events are scheduled at this moment. Check back soon or submit a request to organize an event.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-surface-elevated text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/10 transition-all"
              >
                Submit Event Request
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-surface rounded-2xl border border-surface-border hover:border-brand-gold/50 transition-all p-6 flex flex-col justify-between group shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-elevated text-brand-gold border border-brand-gold/20">
                      {evt.event_date}
                    </span>
                    <span className="text-xs font-bold text-cream-200">
                      {evt.ticket_price === 0 ? 'Free' : `₹${evt.ticket_price}`}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-cream-50 group-hover:text-brand-gold transition-colors">
                    {evt.name}
                  </h3>

                  <p className="text-xs text-cream-muted line-clamp-2">
                    {evt.description || 'No description provided.'}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-cream-muted">
                    <span>Venue: <strong className="text-cream-200">{evt.venue}</strong></span>
                    <span>
                      Seats: <strong className="text-brand-gold">{evt.remaining_capacity ?? evt.max_capacity}</strong> left
                    </span>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-surface-border">
                  <Link
                    href={`/events/${evt.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs bg-surface-elevated hover:bg-brand-gold hover:text-background text-cream-100 transition-all border border-surface-border"
                  >
                    View Details & Register
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
