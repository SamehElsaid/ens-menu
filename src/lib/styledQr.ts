import type { Options } from "qr-code-styling";

/** شعار ENS ثابت في منتصف الـ QR (ليس شعار المنيو) */
export const DEFAULT_QR_CENTER_LOGO = "/ENSd.png";

/** نفس أسلوب الـ QR الناعم (دوائر + زوايا مستديرة) مع شعار ENS في المنتصف */
export function getStyledQrOptions(params: {
  value: string;
  size: number;
}): Options {
  const margin = Math.max(6, Math.round(params.size * 0.035));

  return {
    width: params.size,
    height: params.size,
    type: "canvas",
    data: params.value,
    margin,
    qrOptions: {
      typeNumber: 0,
      errorCorrectionLevel: "H",
    },
    dotsOptions: {
      type: "dots",
      color: "#111111",
      roundSize: true,
    },
    cornersSquareOptions: {
      type: "extra-rounded",
      color: "#111111",
    },
    cornersDotOptions: {
      type: "dot",
      color: "#111111",
    },
    backgroundOptions: {
      color: "#ffffff",
    },
    image: DEFAULT_QR_CENTER_LOGO,
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.32,
      margin: 5,
      crossOrigin: "anonymous",
    },
  };
}
