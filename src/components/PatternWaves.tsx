'use client';

import React, { useEffect, useRef } from 'react';
import { Renderer, Camera, Transform, Program, Mesh, Triangle } from 'ogl';

interface PatternWavesProps {
  speed?: number;
  waveFrequency?: number;
  waveAmplitude?: number;
  className?: string;
}

export default function PatternWaves({
  speed = 0.4,
  waveFrequency = 2.0,
  waveAmplitude = 0.15,
  className = '',
}: PatternWavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;

    const renderer = new Renderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const canvas = gl.canvas;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    const camera = new Camera(gl);
    camera.position.z = 1;

    const scene = new Transform();
    const geometry = new Triangle(gl);

    const vertexShader = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Subtle dark charcoal background with warm golden-yellow ticket wave highlights
    const fragmentShader = `
      precision highp float;
      uniform float uTime;
      uniform vec2 uResolution;
      varying vec2 vUv;

      void main() {
        vec2 st = gl_FragCoord.xy / uResolution.xy;
        st.x *= uResolution.x / uResolution.y;

        float time = uTime * ${speed.toFixed(2)};
        
        // Multi-layered smooth ticket waves
        float wave1 = sin(st.x * ${waveFrequency.toFixed(2)} + time * 0.8) * ${waveAmplitude.toFixed(2)};
        float wave2 = cos(st.x * ${(waveFrequency * 1.5).toFixed(2)} - time * 0.5 + st.y * 2.0) * ${(waveAmplitude * 0.7).toFixed(2)};
        float wave3 = sin(st.y * 3.0 + st.x * 1.2 + time * 0.6) * 0.1;

        float dist = abs(st.y - 0.5 + wave1 + wave2 + wave3);

        // Golden ticket accent line (#E5A93C)
        vec3 goldColor = vec3(0.898, 0.663, 0.235);
        vec3 deepSurface = vec3(0.043, 0.051, 0.075); // #0B0D13

        float glow = smoothstep(0.4, 0.01, dist);
        float fineLine = smoothstep(0.04, 0.005, dist);

        vec3 color = mix(deepSurface, goldColor, glow * 0.08 + fineLine * 0.12);

        // Add subtle grid / ticket notch effect
        float grid = step(0.98, fract(st.x * 8.0)) * step(0.98, fract(st.y * 8.0));
        color += goldColor * grid * 0.02;

        gl_FragColor = vec4(color, 0.35);
      }
    `;

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [container.clientWidth, container.clientHeight] },
      },
      transparent: true,
    });

    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);

    function resize() {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [width, height];
    }

    window.addEventListener('resize', resize);
    resize();

    let lastTime = performance.now();
    function update(time: number) {
      animationFrameId = requestAnimationFrame(update);
      const delta = (time - lastTime) * 0.001;
      lastTime = time;
      program.uniforms.uTime.value += delta;
      renderer.render({ scene, camera });
    }

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, [speed, waveFrequency, waveAmplitude]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
}
