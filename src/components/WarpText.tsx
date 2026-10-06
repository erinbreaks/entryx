'use client';

import React from 'react';
import WarpTextJs from './WarpText.jsx';

export interface WarpTextProps {
  text?: string;
  color?: string;
  warpStrength?: number;
  warpScale?: number;
  speed?: number;
  pointerInfluence?: number;
  pointerStrength?: number;
  refraction?: number;
  ripple?: boolean;
  fontSize?: string | number;
  fontWeight?: string | number;
  fontFamily?: string;
  letterSpacing?: string | number;
  lineHeight?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export default function WarpText(props: WarpTextProps) {
  return <WarpTextJs {...props} />;
}
