import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Calendar, Clock, MapPin, Ticket, Search, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const events = await db.listEvents({ status: 'active' });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-cream-50 font-display">
          Discover
        </h1>
        <p className="text-sm text-cream-muted">
          Browse real events and register for digital QR access passes.
        </p>
      </div>

      {/* Events Grid or Clean Empty State */}
      {events.length === 0 ? (
        <div className="py-20 px-6 rounded-3xl bg-surface/80 border border-surface-border text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center text-brand-gold mx-auto shadow-inner">
            <Calendar className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-cream-100">
            No events available yet.
          </h2>
          <p className="text-sm text-cream-muted leading-relaxed">
            There are currently no active events in the system. Check back later or request to organize an event.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-gold-light to-brand-gold text-background hover:from-brand-gold hover:to-brand-gold-dark transition-all shadow-md"
            >
              <Ticket className="w-4 h-4" />
              Request an Event
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => {
            const isFull = (evt.remaining_capacity ?? 0) <= 0;
            return (
              <div
                key={evt.id}
                className="bg-surface rounded-2xl border border-surface-border hover:border-brand-gold/40 transition-all flex flex-col justify-between overflow-hidden shadow-xl group"
              >
                {/* Optional Real Event Image */}
                {evt.image_url && (
                  <div className="relative w-full h-48 overflow-hidden bg-surface-elevated">
                    <img
                      src={evt.image_url}
                      alt={evt.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-background/80 backdrop-blur-md text-brand-gold border border-brand-gold/30">
                        {evt.ticket_price === 0 ? 'Free' : `₹${evt.ticket_price}`}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {!evt.image_url && (
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-surface-elevated text-brand-gold border border-brand-gold/20">
                          {evt.event_date}
                        </span>
                        <span className="text-xs font-bold text-cream-200">
                          {evt.ticket_price === 0 ? 'Free' : `₹${evt.ticket_price}`}
                        </span>
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-cream-50 group-hover:text-brand-gold transition-colors leading-snug">
                      {evt.name}
                    </h3>

                    <p className="text-xs text-cream-muted line-clamp-3 leading-relaxed">
                      {evt.description || 'No description provided.'}
                    </p>

                    {/* Event Metadata */}
                    <div className="space-y-1.5 pt-2 text-xs text-cream-200 border-t border-surface-border/50">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                        <span>{evt.event_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                        <span>{evt.start_time}{evt.end_time ? ` - ${evt.end_time}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                        <span>
                          Seats: <strong className={isFull ? 'text-red-400' : 'text-emerald-400'}>
                            {evt.remaining_capacity ?? evt.max_capacity} remaining
                          </strong> / {evt.max_capacity} max
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    {isFull ? (
                      <button
                        disabled
                        className="w-full py-3 rounded-xl font-bold text-xs bg-surface-elevated text-cream-muted border border-surface-border cursor-not-allowed opacity-75"
                      >
                        Registration Closed — Capacity Reached
                      </button>
                    ) : (
                      <Link
                        href={`/events/${evt.id}`}
                        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-gold-light to-brand-gold text-background hover:from-brand-gold hover:to-brand-gold-dark transition-all shadow-md"
                      >
                        Register for Event
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
