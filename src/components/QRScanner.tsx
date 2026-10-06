'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, RefreshCw, CheckCircle2, AlertTriangle, XCircle, ShieldAlert, KeyRound } from 'lucide-react';

interface QRScannerProps {
  eventId: string;
  onScanResult?: (result: any) => void;
}

export type ScanStatus = 'idle' | 'scanning' | 'verifying' | 'checked_in' | 'already_used' | 'invalid' | 'unauthorized';

interface VerificationResponse {
  result: 'CHECKED_IN' | 'ALREADY_USED' | 'INVALID_TICKET' | 'UNAUTHORIZED' | 'ERROR';
  message: string;
  status: string;
  attendeeName?: string;
  studentId?: string;
  ticketNumber?: string;
  checkedInAt?: string;
  firstCheckedInAt?: string;
  eventName?: string;
}

export default function QRScanner({ eventId, onScanResult }: QRScannerProps) {
  const [scannerActive, setScannerActive] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [lastResponse, setLastResponse] = useState<VerificationResponse | null>(null);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [scannerError, setScannerError] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isVerifyingRef = useRef(false);

  // Play audio feedback chime
  const playSound = (type: 'success' | 'warning' | 'error') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'warning') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        osc.frequency.setValueAtTime(370, audioCtx.currentTime + 0.15); // F#4
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.setValueAtTime(160, audioCtx.currentTime + 0.15); // D#3
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {
      // Audio context might be restricted
    }
  };

  // Discover available cameras
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera on mobile
          const backCam = devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
          setSelectedCamera(backCam ? backCam.id : devices[0].id);
        }
      })
      .catch((err) => {
        console.warn('Camera enumeration error:', err);
      });

    return () => {
      stopScanner();
    };
  }, []);

  const verifyTicketOnServer = async (tokenString: string) => {
    if (isVerifyingRef.current) return;
    isVerifyingRef.current = true;
    setStatus('verifying');
    setScannerError(null);

    try {
      const res = await fetch('/api/verify-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenString.trim(), eventId }),
      });

      const data: VerificationResponse = await res.json();
      setLastResponse(data);
      if (onScanResult) onScanResult(data);

      if (data.result === 'CHECKED_IN') {
        setStatus('checked_in');
        playSound('success');
      } else if (data.result === 'ALREADY_USED') {
        setStatus('already_used');
        playSound('warning');
      } else if (data.result === 'UNAUTHORIZED') {
        setStatus('unauthorized');
        playSound('error');
      } else {
        setStatus('invalid');
        playSound('error');
      }
    } catch (err: any) {
      setStatus('invalid');
      setLastResponse({
        result: 'ERROR',
        message: err.message || 'Connection error to verification server',
        status: 'error',
      });
      playSound('error');
    } finally {
      // Resume scanning after 2.5 seconds pause
      setTimeout(() => {
        isVerifyingRef.current = false;
      }, 2500);
    }
  };

  const startScanner = async () => {
    try {
      setScannerError(null);
      const scanner = new Html5Qrcode('qr-reader-container', {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });

      html5QrCodeRef.current = scanner;

      const cameraIdOrConfig = selectedCamera || { facingMode: 'environment' };

      await scanner.start(
        cameraIdOrConfig,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          verifyTicketOnServer(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );

      setScannerActive(true);
      setStatus('scanning');
    } catch (err: any) {
      console.error('Error starting QR scanner:', err);
      setScannerError(err.message || 'Failed to start camera. Please ensure permissions are granted.');
      setScannerActive(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch (e) {
        console.error('Error stopping scanner:', e);
      }
    }
    setScannerActive(false);
    if (status === 'scanning') setStatus('idle');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    verifyTicketOnServer(manualToken.trim());
  };

  return (
    <div className="flex flex-col space-y-6 max-w-xl mx-auto w-full">
      {/* Scanner Visual Container */}
      <div className="relative bg-surface rounded-2xl border border-surface-border overflow-hidden p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-brand-gold" />
            <h3 className="text-base font-bold text-cream-50">Webcam Scanner</h3>
          </div>

          {cameras.length > 1 && (
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              disabled={scannerActive}
              className="text-xs bg-surface-elevated text-cream-200 border border-surface-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-gold"
            >
              {cameras.map((cam) => (
                <option key={cam.id} value={cam.id}>
                  {cam.label || `Camera ${cam.id.slice(0, 5)}`}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Video Canvas Element */}
        <div className="relative w-full aspect-square max-w-[320px] mx-auto bg-black rounded-xl overflow-hidden border-2 border-dashed border-surface-border flex items-center justify-center">
          <div id="qr-reader-container" className="w-full h-full" />

          {!scannerActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-surface/90">
              <Camera className="w-12 h-12 text-cream-muted mb-3" />
              <p className="text-sm font-medium text-cream-200 mb-4">
                Camera is currently inactive
              </p>
              <button
                onClick={startScanner}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-gold-light to-brand-gold text-background hover:from-brand-gold hover:to-brand-gold-dark transition-all shadow-lg"
              >
                Activate Camera
              </button>
            </div>
          )}
        </div>

        {scannerError && (
          <div className="mt-4 p-3 rounded-lg bg-red-900/30 border border-red-500/40 text-red-200 text-xs">
            {scannerError}
          </div>
        )}

        {scannerActive && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={stopScanner}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-surface-elevated text-cream-200 hover:text-white border border-surface-border"
            >
              Stop Camera
            </button>
          </div>
        )}
      </div>

      {/* Real-time Verification Result Display */}
      {lastResponse && (
        <div
          className={`p-6 rounded-2xl border-2 transition-all transform animate-in fade-in zoom-in-95 duration-200 ${
            lastResponse.result === 'CHECKED_IN'
              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-100'
              : lastResponse.result === 'ALREADY_USED'
              ? 'bg-amber-950/40 border-amber-500 text-amber-100'
              : 'bg-red-950/40 border-red-500 text-red-100'
          }`}
        >
          <div className="flex items-start gap-4">
            {lastResponse.result === 'CHECKED_IN' && (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0 mt-0.5" />
            )}
            {lastResponse.result === 'ALREADY_USED' && (
              <AlertTriangle className="w-8 h-8 text-amber-400 flex-shrink-0 mt-0.5" />
            )}
            {(lastResponse.result === 'INVALID_TICKET' ||
              lastResponse.result === 'UNAUTHORIZED' ||
              lastResponse.result === 'ERROR') && (
              <XCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-0.5" />
            )}

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-black tracking-wide">
                  {lastResponse.result === 'CHECKED_IN' && 'ENTRY GRANTED (CHECKED-IN)'}
                  {lastResponse.result === 'ALREADY_USED' && 'ALREADY USED'}
                  {lastResponse.result === 'INVALID_TICKET' && 'INVALID TICKET'}
                  {lastResponse.result === 'UNAUTHORIZED' && 'UNAUTHORIZED ORGANIZER'}
                  {lastResponse.result === 'ERROR' && 'VERIFICATION ERROR'}
                </h4>
              </div>

              <p className="text-sm opacity-90">{lastResponse.message}</p>

              {lastResponse.attendeeName && (
                <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="opacity-70 block text-[10px] uppercase">Attendee</span>
                    <strong className="text-sm font-semibold">{lastResponse.attendeeName}</strong>
                  </div>
                  <div>
                    <span className="opacity-70 block text-[10px] uppercase">Student ID</span>
                    <strong className="text-sm font-mono">{lastResponse.studentId || 'N/A'}</strong>
                  </div>
                  {lastResponse.ticketNumber && (
                    <div>
                      <span className="opacity-70 block text-[10px] uppercase">Ticket Ref</span>
                      <strong className="font-mono text-xs">{lastResponse.ticketNumber}</strong>
                    </div>
                  )}
                  {lastResponse.checkedInAt && (
                    <div>
                      <span className="opacity-70 block text-[10px] uppercase">Check-in Time</span>
                      <strong className="text-xs">{new Date(lastResponse.checkedInAt).toLocaleTimeString()}</strong>
                    </div>
                  )}
                  {lastResponse.firstCheckedInAt && (
                    <div className="col-span-2 mt-1 p-2 rounded bg-black/40 text-amber-300">
                      <span className="text-[10px] uppercase font-bold block">Originally Checked-in At:</span>
                      <span className="font-semibold text-xs">{new Date(lastResponse.firstCheckedInAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Token Input Fallback */}
      <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <KeyRound className="w-4 h-4 text-brand-gold" />
          <h4 className="text-sm font-bold text-cream-100">Manual Ticket Token Fallback</h4>
        </div>
        <p className="text-xs text-cream-muted mb-4">
          For manual verification, testing, or camera hardware limitations. Enter or paste the signed ticket token below.
        </p>

        <form onSubmit={handleManualSubmit} className="space-y-3">
          <textarea
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            rows={2}
            placeholder="Paste complete cryptographically signed token..."
            className="w-full bg-surface-elevated border border-surface-border rounded-xl px-3.5 py-2.5 text-xs text-cream-100 font-mono focus:outline-none focus:border-brand-gold resize-none"
          />

          <button
            type="submit"
            disabled={!manualToken.trim() || status === 'verifying'}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-surface-elevated hover:bg-surface-border border border-brand-gold/40 text-brand-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'verifying' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Verifying Signature & Database...
              </>
            ) : (
              'Verify Token Manually'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
