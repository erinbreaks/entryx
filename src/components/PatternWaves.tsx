'use client';

import React from 'react';
import PatternWavesJs from './PatternWaves.jsx';

export interface PatternWavesProps {
  preset?: 'silk' | 'ocean' | 'pond' | 'lines' | 'terminal' | 'mesh';
  pattern?: 'dot' | 'square' | 'plus' | 'line' | 'glyph';
  wave?: 'silk' | 'swell' | 'ripple';
  color?: string;
  backgroundColor?: string;
  spacing?: number;
  markSize?: number;
  depth?: number;
  light?: number;
  shine?: number;
  contrast?: number;
  speed?: number;
  scale?: number;
  direction?: number;
  opacity?: number;
  fade?: 'edges' | 'center' | 'bottom' | 'top' | 'none';
  fadeSize?: number;
  characters?: string;
  interactive?: boolean;
  cursorSize?: number;
  cursorStrength?: number;
  intro?: boolean;
  paused?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function PatternWaves(props: PatternWavesProps) {
  return <PatternWavesJs {...props} />;
}
