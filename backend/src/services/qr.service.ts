import QRCode from "qrcode";
import { config } from "../config.js";

export function generateQrCode(): string {
  const year = new Date().getFullYear();
  const ts  = Date.now().toString(36).toUpperCase().slice(-5); // last 5 chars of base-36 timestamp
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase(); // 3 random chars
  return `CFT-${year}-${ts}${rnd}`;
}

export async function qrCodeToPng(qrCode: string): Promise<Buffer> {
  const url = `${config.APP_URL}/scan/${qrCode}`;
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    width: 400,
    margin: 2,
  });
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
  return Buffer.from(base64, "base64");
}

export async function qrCodeToSvg(qrCode: string): Promise<string> {
  const url = `${config.APP_URL}/scan/${qrCode}`;
  return QRCode.toString(url, { type: "svg", errorCorrectionLevel: "H" });
}
