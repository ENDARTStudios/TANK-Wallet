/**
 * TankError — Base class for all typed errors in Tank Wallet.
 * @stable
 */

export type ErrorSeverity = "low" | "medium" | "high" | "critical";

export type TankErrorCode =
  | "TANK-1001" | "TANK-1002" | "TANK-1003" | "TANK-1004" | "TANK-1005"
  | "TANK-1006" | "TANK-1007" | "TANK-1008" | "TANK-1009" | "TANK-1010"
  | "TANK-2001" | "TANK-2002" | "TANK-2003" | "TANK-2004" | "TANK-2005"
  | "TANK-2006" | "TANK-2007" | "TANK-2008" | "TANK-2009" | "TANK-2010"
  | "TANK-3001" | "TANK-3002" | "TANK-3003" | "TANK-3004" | "TANK-3005"
  | "TANK-3006" | "TANK-3007" | "TANK-3008"
  | "TANK-4001" | "TANK-4002" | "TANK-4003" | "TANK-4004" | "TANK-4005"
  | "TANK-4006" | "TANK-4007" | "TANK-4008"
  | "TANK-5001" | "TANK-5002" | "TANK-5003" | "TANK-5004" | "TANK-5005"
  | "TANK-5006" | "TANK-5007" | "TANK-5008"
  | "TANK-6001" | "TANK-6002" | "TANK-6003" | "TANK-6004" | "TANK-6005"
  | "TANK-6006" | "TANK-6007" | "TANK-6008" | "TANK-6009" | "TANK-6010"
  | "TANK-7001" | "TANK-7002" | "TANK-7003" | "TANK-7004" | "TANK-7005"
  | "TANK-7006" | "TANK-7007"
  | "TANK-8001" | "TANK-8002" | "TANK-8003" | "TANK-8004" | "TANK-8005"
  | "TANK-8006" | "TANK-8007" | "TANK-8008" | "TANK-8009" | "TANK-8010";

export interface TankErrorOptions {
  code: TankErrorCode;
  message: string;
  severity: ErrorSeverity;
  userFacing?: boolean;
  cause?: TankError;
  context?: Record<string, unknown>;
}

export abstract class TankError extends Error {
  abstract readonly kind: string;
  readonly code: TankErrorCode;
  readonly severity: ErrorSeverity;
  readonly userFacing: boolean;
  readonly cause?: TankError;
  readonly context?: Record<string, unknown>;
  readonly timestamp: number;
  readonly traceId: string;

  constructor(opts: TankErrorOptions) {
    super(opts.message);
    this.name = this.constructor.name;
    this.code = opts.code;
    this.severity = opts.severity;
    this.userFacing = opts.userFacing ?? false;
    this.cause = opts.cause;
    this.context = opts.context;
    this.timestamp = Date.now();
    this.traceId = Date.now().toString(16) + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
  }
}

export class ValidationError extends TankError {
  readonly kind = "ValidationError";
  constructor(code: Extract<TankErrorCode, "TANK-1001" | "TANK-1002" | "TANK-1003" | "TANK-1004" | "TANK-1005" | "TANK-1006" | "TANK-1007" | "TANK-1008" | "TANK-1009" | "TANK-1010">, message: string, context?: Record<string, unknown>) {
    super({ code, message, severity: "medium", userFacing: true, context });
  }
}

export class NetworkError extends TankError {
  readonly kind = "NetworkError";
  constructor(code: Extract<TankErrorCode, "TANK-2001" | "TANK-2002" | "TANK-2003" | "TANK-2004" | "TANK-2005" | "TANK-2006" | "TANK-2007" | "TANK-2008" | "TANK-2009" | "TANK-2010">, message: string, severity: ErrorSeverity = "high", context?: Record<string, unknown>) {
    super({ code, message, severity, userFacing: true, context });
  }
}

export class PolicyError extends TankError {
  readonly kind = "PolicyError";
  constructor(code: Extract<TankErrorCode, "TANK-3001" | "TANK-3002" | "TANK-3003" | "TANK-3004" | "TANK-3005" | "TANK-3006" | "TANK-3007" | "TANK-3008">, message: string, context?: Record<string, unknown>) {
    super({ code, message, severity: "high", userFacing: true, context });
  }
}

export class ThreatError extends TankError {
  readonly kind = "ThreatError";
  constructor(code: Extract<TankErrorCode, "TANK-4001" | "TANK-4002" | "TANK-4003" | "TANK-4004" | "TANK-4005" | "TANK-4006" | "TANK-4007" | "TANK-4008">, message: string, context?: Record<string, unknown>) {
    super({ code, message, severity: "critical", userFacing: true, context });
  }
}

export class SimulationError extends TankError {
  readonly kind = "SimulationError";
  constructor(code: Extract<TankErrorCode, "TANK-5001" | "TANK-5002" | "TANK-5003" | "TANK-5004" | "TANK-5005" | "TANK-5006" | "TANK-5007" | "TANK-5008">, message: string, context?: Record<string, unknown>) {
    super({ code, message, severity: "high", userFacing: true, context });
  }
}

export class WalletError extends TankError {
  readonly kind = "WalletError";
  constructor(code: Extract<TankErrorCode, "TANK-6001" | "TANK-6002" | "TANK-6003" | "TANK-6004" | "TANK-6005" | "TANK-6006" | "TANK-6007" | "TANK-6008" | "TANK-6009" | "TANK-6010">, message: string, severity: ErrorSeverity = "high", context?: Record<string, unknown>) {
    super({ code, message, severity, userFacing: true, context });
  }
}

export class PluginError extends TankError {
  readonly kind = "PluginError";
  constructor(code: Extract<TankErrorCode, "TANK-7001" | "TANK-7002" | "TANK-7003" | "TANK-7004" | "TANK-7005" | "TANK-7006" | "TANK-7007">, message: string, context?: Record<string, unknown>) {
    super({ code, message, severity: "high", userFacing: true, context });
  }
}

export class InternalError extends TankError {
  readonly kind = "InternalError";
  constructor(code: Extract<TankErrorCode, "TANK-8001" | "TANK-8002" | "TANK-8003" | "TANK-8004" | "TANK-8005" | "TANK-8006" | "TANK-8007" | "TANK-8008" | "TANK-8009" | "TANK-8010">, message: string, context?: Record<string, unknown>) {
    super({ code, message, severity: "critical", userFacing: false, context });
  }
}

export class KeyManagementError extends TankError {
  readonly kind: string = "KeyManagementError";
  constructor(code: Extract<TankErrorCode, "TANK-6005" | "TANK-6006" | "TANK-6007">, message: string, context?: Record<string, unknown>) {
    super({ code, message, severity: "critical", userFacing: false, context });
  }
}

export function isTankError(e: unknown): e is TankError {
  return e instanceof TankError;
}
