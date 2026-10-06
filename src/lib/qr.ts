import QRCode from 'qrcode';

/**
 * Generates a high quality QR code data URL (PNG) for a cryptographically signed token
 */
export async function generateQRCodeDataUrl(token: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(token, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 400,
      color: {
        dark: '#0B0D13',
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR Code Data URL:', err);
    throw new Error('Failed to generate QR Code');
  }
}

/**
 * Generates a QR code Buffer for embedding in transactional emails
 */
export async function generateQRCodeBuffer(token: string): Promise<Buffer> {
  try {
    const buffer = await QRCode.toBuffer(token, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 2,
      width: 320,
      color: {
        dark: '#0B0D13',
        light: '#FFFFFF',
      },
    });
    return buffer;
  } catch (err) {
    console.error('Failed to generate QR Code Buffer:', err);
    throw new Error('Failed to generate QR Code Buffer');
  }
}
