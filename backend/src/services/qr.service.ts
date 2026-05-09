import QRCode from "qrcode";
import { config } from "../config.js";

let _counter = 0;

export function generateQrCode(): string {
  const year = new Date().getFullYear();
  const seq = String(++_counter).padStart(6, "0");
  return `CFT-${year}-${seq}`;
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
