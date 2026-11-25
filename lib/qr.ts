import "server-only";

import QRCode from "qrcode";

/** QR code for a URL as an SVG string (dark brown on white, scannable by any phone camera). */
export function qrSvg(url: string) {
  return QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#2a2421", light: "#ffffff" },
  });
}
