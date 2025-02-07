import CryptoJS from "crypto-js";

/**
 * Generates an eSewa signature using HMAC-SHA256 hashing.
 *
 * @param secretKey - The secret key provided by eSewa (for test or production).
 * @param message - The concatenated string of the required fields.
 * @returns The generated signature as a Base64 string.
 */
export function generateEsewaSignature(
  secretKey: string,
  message: string
): string {
  const hash = CryptoJS.HmacSHA256(message, secretKey);
  return CryptoJS.enc.Base64.stringify(hash);
}
