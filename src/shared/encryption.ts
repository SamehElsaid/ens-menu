import CryptoJS from "crypto-js";

export class DecryptError extends Error {
  constructor(message = "Decrypt failed") {
    super(message);
    this.name = "DecryptError";
  }
}

export const encryptData = (data: unknown): string => {
  const jsonString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(
    jsonString,
    process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string,
  );
  return encrypted.toString() || "";
};

export const decryptData = (encodedData: string): object => {
  const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string;

  if (!key) {
    throw new DecryptError("Encryption key missing");
  }
  if (!encodedData?.trim()) {
    throw new DecryptError("Decrypt payload missing");
  }

  const decrypted = CryptoJS.AES.decrypt(encodedData, key);
  let decoded: string;
  try {
    decoded = decrypted.toString(CryptoJS.enc.Utf8);
  } catch {
    throw new DecryptError();
  }

  if (!decoded) {
    throw new DecryptError();
  }

  try {
    return JSON.parse(decoded) as object;
  } catch {
    throw new DecryptError("Decrypt payload was not JSON");
  }
};

export function encryptDataApi(data: unknown, passphrase: string) {
  const jsonString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonString, passphrase);

  return encrypted.toString();
}

export function decryptDataApi(encryptedData: string, passphrase: string) {
  if (!encryptedData || !passphrase) {
    throw new DecryptError("Decrypt payload or passphrase missing");
  }
  const bytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
  if (!decryptedString) {
    throw new DecryptError();
  }

  try {
    return JSON.parse(decryptedString);
  } catch {
    return decryptedString;
  }
}
