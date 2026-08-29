export interface MultisigConfig { threshold: number; signers: string[] }
export interface TimelockConfig { delaySeconds: number; expirySeconds?: number }
export interface SpendingLimit { daily: string; weekly: string; usedDaily: string; usedWeekly: string }
export interface VaultEvolution { multisig?: MultisigConfig; timelock?: TimelockConfig; spendingLimit?: SpendingLimit; passphrase?: string }

export function validateMultisig(config: MultisigConfig): boolean {
  return config.threshold > 0 && config.threshold <= config.signers.length && config.signers.length >= 2;
}

export function validateTimelock(config: TimelockConfig): boolean {
  return config.delaySeconds >= 0 && (config.expirySeconds === undefined || config.expirySeconds > config.delaySeconds);
}

export function canSpend(limit: SpendingLimit, amount: string): boolean {
  const amt = BigInt(amount);
  const daily = BigInt(limit.daily);
  const usedD = BigInt(limit.usedDaily);
  return amt + usedD <= daily;
}

export function applyPassphrase(mnemonic: string, passphrase: string): string {
  return `${mnemonic} + passphrase:${passphrase.slice(0, 8)}...`;
}

export function createVaultEvolution(): VaultEvolution {
  return {};
}
