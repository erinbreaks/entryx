'use client';

import React, { useRef } from 'react';
import { Calendar, MapPin, User, Hash, ShieldCheck, Download, Printer } from 'lucide-react';

interface TicketCardProps {
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  ticketPrice: number;
  attendeeName: string;
  studentId: string;
  ticketNumber: string;
  signedToken: string;
  qrDataUrl: string;
}

export default function TicketCard({
  eventName,
  eventDate,
  eventTime,
  venue,
  ticketPrice,
  attendeeName,
  studentId,
  ticketNumber,
  signedToken,
  qrDataUrl,
}: TicketCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `EntryX-QR-${ticketNumber}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto w-full">
      {/* Printable Digital Ticket Pass */}
      <div
        ref={cardRef}
        className="relative w-full bg-surface border-2 border-brand-gold/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden"
      >
        {/* Golden Header Strip */}
        <div className="bg-gradient-to-r from-brand-gold-dark via-brand-gold to-brand-gold-light p-6 text-background">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-background/80">
                Official Access Pass
              </span>
              <h2 className="text-2xl font-black tracking-tight text-background">
                EntryX
              </h2>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-background/90 text-brand-gold font-bold text-xs rounded-full uppercase tracking-wider">
                Confirmed
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Main Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Event Title */}
          <div>
            <h3 className="text-xl md:text-2xl font-black text-cream-50 leading-snug">
              {eventName}
            </h3>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-2 text-xs md:text-sm text-cream-muted">
              <span className="flex items-center gap-1.5 text-cream-200">
                <Calendar className="w-4 h-4 text-brand-gold" />
                {eventDate} • {eventTime}
              </span>
              <span className="flex items-center gap-1.5 text-cream-200">
                <MapPin className="w-4 h-4 text-brand-gold" />
                {venue}
              </span>
            </div>
          </div>

          {/* Attendee Details Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-surface-elevated/70 border border-surface-border">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-cream-muted block">
                Attendee
              </span>
              <span className="text-sm md:text-base font-bold text-cream-50 flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-brand-gold" />
                {attendeeName}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-cream-muted block">
                Student ID
              </span>
              <span className="text-sm md:text-base font-bold text-cream-50 flex items-center gap-1.5 mt-0.5 font-mono">
                <Hash className="w-3.5 h-3.5 text-brand-gold" />
                {studentId}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-cream-muted block">
                Ticket Reference
              </span>
              <span className="text-xs md:text-sm font-bold text-brand-gold font-mono mt-0.5 block">
                {ticketNumber}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-cream-muted block">
                Price
              </span>
              <span className="text-xs md:text-sm font-bold text-cream-100 mt-0.5 block">
                {ticketPrice === 0 ? 'Free' : `₹${ticketPrice}`}
              </span>
            </div>
          </div>

          {/* Perforated Divider with Notches */}
          <div className="relative py-2">
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background border-r-2 border-brand-gold/50" />
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background border-l-2 border-brand-gold/50" />
            <div className="w-full border-b-2 border-dashed border-surface-border" />
          </div>

          {/* QR Code Presentation */}
          <div className="flex flex-col items-center justify-center text-center space-y-3 pt-2">
            <div className="p-3 bg-white rounded-2xl shadow-xl">
              <img
                src={qrDataUrl}
                alt="Ticket QR Code"
                className="w-48 h-48 md:w-56 md:h-56 object-contain"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-gold">
              <ShieldCheck className="w-4 h-4" />
              <span>Cryptographically Signed Entry Pass</span>
            </div>
            <p className="text-[11px] text-cream-muted font-mono max-w-sm truncate">
              {signedToken.substring(0, 48)}...
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface-elevated px-6 py-3 border-t border-surface-border text-center">
          <p className="text-[11px] text-cream-muted">
            Show this QR code at the entrance for instant scanning verification.
          </p>
        </div>
      </div>

      {/* Pass Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-8 print:hidden">
        <button
          onClick={handleDownloadQR}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-surface-elevated text-cream-100 hover:bg-surface-border border border-surface-border transition-all shadow-md"
        >
          <Download className="w-4 h-4 text-brand-gold" />
          Download QR Code
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-gold text-background hover:bg-brand-gold-light transition-all shadow-md"
        >
          <Printer className="w-4 h-4" />
          Print / Save Pass
        </button>
      </div>
    </div>
  );
}
