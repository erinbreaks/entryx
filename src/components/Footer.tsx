import React from 'react';
import Logo from './Logo';
import { Mail, Phone, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#080A0F] border-t border-surface-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-between">
          
          {/* Brand Info */}
          <div>
            <Logo size="md" withSlogan />
            <p className="mt-3 text-sm text-cream-muted max-w-sm leading-relaxed">
              A real-time event registration and QR-based entry verification platform designed for secure, instant gate check-ins.
            </p>
          </div>

          {/* Contact Details & Security */}
          <div className="flex flex-col md:items-end space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-brand-gold">
              Direct Contact
            </h4>
            <div className="flex flex-col space-y-2 text-sm text-cream-200 md:items-end">
              <a
                href="mailto:erinbobin@gmail.com"
                className="inline-flex items-center gap-2 hover:text-brand-gold transition-colors"
              >
                <Mail className="w-4 h-4 text-brand-gold" />
                erinbobin@gmail.com
              </a>
              <a
                href="tel:9446611885"
                className="inline-flex items-center gap-2 hover:text-brand-gold transition-colors"
              >
                <Phone className="w-4 h-4 text-brand-gold" />
                9446611885
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-surface-border/40 flex flex-col sm:flex-row items-center justify-between text-xs text-cream-muted gap-4">
          <p>© {new Date().getFullYear()} EntryX. All rights reserved.</p>
          <div className="flex items-center gap-2 text-cream-muted">
            <ShieldCheck className="w-4 h-4 text-brand-gold/80" />
            <span>Cryptographically signed ticket verification</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
