import CryptoJS from "crypto-js";

export const encryptData = (data: unknown): string => {
  console.log(process.env.NEXT_PUBLIC_ENCRYPTION_KEY);
  const jsonString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(
    jsonString,
    process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string
  );
  return encrypted.toString() || "";
};

export const decryptData = (encodedData: string): object => {
  const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string;

  if (!key) {
    throw new Error("Encryption key missing");
  }

  try {
    const decrypted = CryptoJS.AES.decrypt(encodedData, key);

    let decoded: string;
    try {
      decoded = decrypted.toString(CryptoJS.enc.Utf8);
    } catch {
      return {};
    }

    if (!decoded) {
      return {};
    }

    return JSON.parse(decoded);
  } catch {
    return {};
  }
};
