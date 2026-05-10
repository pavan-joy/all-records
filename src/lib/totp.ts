import { Secret, TOTP } from "otpauth";

const ISSUER = "IT Asset Portal";

export function generateTotpSecretBase32(): string {
  return new Secret({ size: 20 }).base32;
}

export function createTotp(secretBase32: string, email: string): TOTP {
  return new TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  });
}

export function verifyTotpToken(secretBase32: string, token: string, window = 1): boolean {
  const trimmed = token.replace(/\s/g, "");
  if (!/^\d{6}$/.test(trimmed)) return false;
  const totp = createTotp(secretBase32, "verify");
  return totp.validate({ token: trimmed, window }) !== null;
}

export function getTotpKeyUri(secretBase32: string, email: string): string {
  return createTotp(secretBase32, email).toString();
}
