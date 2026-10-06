'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Ticket, Image as ImageIcon } from 'lucide-react';

interface EventVisual {
  id: string;
  name: string;
  image_url: string;
  event_date: string;
  venue: string;
  ticket_price: number;
}

export default function EventCarousel() {
  const [eventsWithImages, setEventsWithImages] = useState<EventVisual[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVisuals() {
      try {
        const res = await fetch('/api/events?onlyWithImages=true&status=active');
        if (res.ok) {
          const data = await res.json();
          // Keep only active events with valid image URLs
          const validList = (data.events || []).filter(
            (e: any) => e.image_url && e.image_url.trim().length > 0
          );
          setEventsWithImages(validList);
        }
      } catch (err) {
        console.error('Error fetching carousel images:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchVisuals();
  }, []);

  // Auto slide if multiple images
  useEffect(() => {
    if (eventsWithImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % eventsWithImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [eventsWithImages.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + eventsWithImages.length) % eventsWithImages.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % eventsWithImages.length);
  };

  if (loading) {
    return (
      <div className="w-full h-80 rounded-2xl bg-surface-elevated/40 border border-surface-border flex items-center justify-center animate-pulse">
        <span className="text-sm text-cream-muted">Loading live event visuals...</span>
      </div>
    );
  }

  // Pure clean empty state when no real events have images
  if (eventsWithImages.length === 0) {
    return (
      <div className="w-full py-16 px-6 rounded-2xl bg-surface/80 border border-surface-border flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center text-brand-gold/70 mb-4 shadow-inner">
          <ImageIcon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-cream-100 mb-1">
          No upcoming event visuals yet.
        </h3>
        <p className="text-sm text-cream-muted max-w-md mb-6">
          Visuals will automatically appear here once organizers create real events with cover images.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-cream-100 bg-surface-elevated hover:bg-surface-border border border-surface-border transition-all"
        >
          <Calendar className="w-3.5 h-3.5 text-brand-gold" />
          Browse Real Events
        </Link>
      </div>
    );
  }

  const currentEvent = eventsWithImages[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-2xl group">
      {/* Visual Image Container */}
      <div className="relative w-full h-[400px] md:h-[480px]">
        <img
          src={currentEvent.image_url}
          alt={currentEvent.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Event Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold/20 text-brand-gold border border-brand-gold/40 backdrop-blur-sm">
              <Calendar className="w-3.5 h-3.5" />
              {currentEvent.event_date}
            </span>
            <h3 className="text-2xl md:text-4xl font-extrabold text-cream-50 leading-tight">
              {currentEvent.name}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-cream-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-gold" />
                {currentEvent.venue}
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-brand-gold">
                <Ticket className="w-4 h-4" />
                {currentEvent.ticket_price === 0 ? 'Free Entry' : `₹${currentEvent.ticket_price}`}
              </span>
            </div>
          </div>

          <Link
            href={`/events/${currentEvent.id}`}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm text-background bg-gradient-to-r from-brand-gold-light to-brand-gold hover:from-brand-gold hover:to-brand-gold-dark transition-all shadow-[0_0_20px_rgba(229,169,60,0.3)] flex-shrink-0"
          >
            Register Now
          </Link>
        </div>
      </div>

      {/* Slide Navigation Controls */}
      {eventsWithImages.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-surface-border text-cream-200 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-surface-border text-cream-200 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-background/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-surface-border">
            {eventsWithImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex ? 'w-6 bg-brand-gold' : 'bg-cream-muted/40 hover:bg-cream-muted'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
