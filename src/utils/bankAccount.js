/** Mask a bank account number for display (****1234). */
export function maskBankAccount(accountNumber) {
  if (!accountNumber || !String(accountNumber).trim()) return null;
  const digits = String(accountNumber).trim();
  if (digits.length <= 4) return `****${digits}`;
  return `****${digits.slice(-4)}`;
}
