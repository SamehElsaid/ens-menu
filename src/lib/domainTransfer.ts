import type { DomainTransferRequest } from "@/types/DomainTransfer";

export const DOMAIN_TRANSFER_SYSTEM_KEYS = {
  DNS_INSTRUCTIONS: "__system:dns_instructions__",
  VERIFICATION_STARTED: "__system:verification_started__",
  TRANSFER_COMPLETE: "__system:transfer_complete__",
  USER_CONFIRMED: "confirmed_steps",
} as const;

export function isSystemMessageKey(message: string): boolean {
  return message.startsWith("__system:");
}

/** Latest admin-written DNS config (excludes automated system keys). */
export function getLatestDnsConfigMessage(request: DomainTransferRequest) {
  const adminMessages =
    request.messages?.filter(
      (m) => m.senderType === "admin" && !isSystemMessageKey(m.message),
    ) ?? [];
  return adminMessages[adminMessages.length - 1] ?? null;
}
