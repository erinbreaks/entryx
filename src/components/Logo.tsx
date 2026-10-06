import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withSlogan?: boolean;
  href?: string;
  className?: string;
}

export default function Logo({
  size = 'md',
  withSlogan = false,
  href = '/',
  className = '',
}: LogoProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 group cursor-pointer ${className}`}>
      {/* Stylized Golden-Yellow Ticket Icon with Integrated Dark Checkmark */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(229,169,60,0.35)]"
        >
          {/* Main Golden Ticket Body */}
          <path
            d="M6 10C6 7.79086 7.79086 6 10 6H38C40.2091 6 42 7.79086 42 10V20C39.7909 20 38 21.7909 38 24C38 26.2091 39.7909 28 42 28V38C42 40.2091 40.2091 42 38 42H10C7.79086 42 6 40.2091 6 38V28C8.20914 28 10 26.2091 10 24C10 21.7909 8.20914 20 6 20V10Z"
            fill="url(#goldGradient)"
            stroke="#F5BE58"
            strokeWidth="1.5"
          />
          {/* Perforated dashed divider */}
          <line
            x1="18"
            y1="8"
            x2="18"
            y2="40"
            stroke="#0B0D13"
            strokeWidth="1.5"
            strokeDasharray="2.5 2.5"
            strokeOpacity="0.4"
          />
          {/* Integrated Dark Checkmark / Verification Notch */}
          <path
            d="M24 24.5L28.5 29L35 19.5"
            stroke="#0B0D13"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Subtle Cream Highlight Accent */}
          <circle cx="12" cy="14" r="1.5" fill="#FAF6EE" fillOpacity="0.8" />
          <circle cx="12" cy="24" r="1.5" fill="#FAF6EE" fillOpacity="0.8" />
          <circle cx="12" cy="34" r="1.5" fill="#FAF6EE" fillOpacity="0.8" />

          {/* Golden Gradient Definition */}
          <defs>
            <linearGradient
              id="goldGradient"
              x1="6"
              y1="6"
              x2="42"
              y2="42"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#F5BE58" />
              <stop offset="0.5" stopColor="#E5A93C" />
              <stop offset="1" stopColor="#C98D23" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className={`font-display font-extrabold tracking-tight text-cream-50 ${textSizes[size]}`}>
            Entry<span className="text-brand-gold">X</span>
          </span>
        </div>
        {withSlogan && (
          <span className="text-[10px] tracking-widest uppercase font-semibold text-cream-muted -mt-0.5">
            Event Entry, Reimagined.
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
