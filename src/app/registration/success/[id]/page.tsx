import React from 'react';
import { db } from '@/lib/db';
import TicketCard from '@/components/TicketCard';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft, Mail, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function RegistrationSuccessPage({
  params,
}: {
  params: { id: string };
}) {
  const ticketId = params.id;
  const ticket = await db.getTicketById(ticketId);

  if (!ticket) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-cream-100">Ticket Not Found</h2>
        <p className="text-xs text-cream-muted">
          No registered ticket was found for this reference.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-surface-elevated text-brand-gold border border-brand-gold/30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>
      </div>
    );
  }

  const [event, registration] = await Promise.all([
    db.getEventById(ticket.event_id),
    db.getRegistrationByEventAndEmail(
      ticket.event_id,
      // Retrieve registration directly by registration_id or fallback
      (await db.getTicketById(ticketId))?.signed_token ? '' : ''
    ),
  ]);

  // Fetch registration details
  const regs = await db.listRegistrationsForEvent(ticket.event_id);
  const reg = regs.find((r) => r.id === ticket.registration_id);

  const attendeeName = reg?.full_name || 'Attendee';
  const studentId = reg?.student_id || '';
  const attendeeEmail = reg?.email || '';

  return (
    <div className="space-y-10 py-4">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-cream-50 font-display">
          Registration Confirmed!
        </h1>
        <p className="text-xs sm:text-sm text-cream-muted leading-relaxed">
          Your official digital pass has been generated and cryptographically signed.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-elevated border border-surface-border text-xs text-cream-200">
          <Mail className="w-3.5 h-3.5 text-brand-gold" />
          <span>Confirmation dispatched to: <strong className="text-brand-gold">{attendeeEmail}</strong></span>
        </div>
      </div>

      {/* Ticket Pass Presentation */}
      <TicketCard
        eventName={event?.name || 'Event'}
        eventDate={event?.event_date || ''}
        eventTime={event?.start_time || ''}
        venue={event?.venue || ''}
        ticketPrice={Number(event?.ticket_price) || 0}
        attendeeName={attendeeName}
        studentId={studentId}
        ticketNumber={ticket.ticket_number}
        signedToken={ticket.signed_token}
        qrDataUrl={ticket.qr_data_url || ''}
      />
    </div>
  );
}
