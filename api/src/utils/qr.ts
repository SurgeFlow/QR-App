import QRCode from 'qrcode';

export async function makeQrPngBuffer(data: string): Promise<Buffer> {
  // Return a PNG buffer for the given data
  return await QRCode.toBuffer(data, { type: 'png', errorCorrectionLevel: 'M', margin: 1, width: 512 });
}