# ERROR-CATALOG.md — Catálogo Oficial de Erros

> Códigos TANK-XXXX. Nunca reusar, renumerar ou mudar significado.

## TANK-1000 — Validation
| Code | Name | Severity |
|------|------|----------|
| TANK-1001 | InvalidAddress | medium |
| TANK-1002 | InvalidMnemonic | high |
| TANK-1003 | InvalidBIP32Path | medium |
| TANK-1004 | InvalidCalldata | medium |
| TANK-1005 | InvalidChainId | medium |
| TANK-1006 | InvalidAmount | medium |
| TANK-1007 | InvalidSignature | high |
| TANK-1008 | InvalidTypedData | medium |
| TANK-1009 | SchemaValidationFailed | medium |
| TANK-1010 | MissingRequiredField | medium |

## TANK-2000 — Network
| Code | Name | Severity |
|------|------|----------|
| TANK-2001 | RPCUnavailable | high |
| TANK-2002 | RPCTimeout | medium |
| TANK-2003 | RPCQuorumFailed | high |
| TANK-2004 | RPCFailoverExhausted | high |
| TANK-2005 | RPCRateLimited | medium |
| TANK-2006 | RPCInvalidResponse | high |
| TANK-2007 | CircuitBreakerOpen | high |
| TANK-2008 | BlockHeightStale | medium |
| TANK-2009 | NetworkUnreachable | high |
| TANK-2010 | CORSBlocked | medium |

## TANK-3000 — Policy
| Code | Name | Severity |
|------|------|----------|
| TANK-3001 | PolicyViolated | high |
| TANK-3002 | MaxTransactionValueExceeded | high |
| TANK-3003 | UntrustedContract | high |
| TANK-3004 | CooldownActive | medium |
| TANK-3005 | MultiSigRequired | high |
| TANK-3006 | TimeLockActive | medium |
| TANK-3007 | DAppBlocked | high |
| TANK-3008 | PolicyEvaluationFailed | high |

## TANK-4000 — Threat
| Code | Name | Severity |
|------|------|----------|
| TANK-4001 | ThreatDetected | critical |
| TANK-4002 | HoneypotToken | critical |
| TANK-4003 | MaliciousContract | critical |
| TANK-4004 | PhishingSite | critical |
| TANK-4005 | SanctionedAddress | critical |
| TANK-4006 | DrainerAddress | critical |
| TANK-4007 | ThreatIntelUnavailable | medium |
| TANK-4008 | ThreatIntelStale | medium |

## TANK-5000 — Simulation
| Code | Name | Severity |
|------|------|----------|
| TANK-5001 | SimulationFailed | high |
| TANK-5002 | SimulationReverted | high |
| TANK-5003 | GasEstimationFailed | medium |
| TANK-5004 | StateDiffSuspicious | high |
| TANK-5005 | ApprovalChangeDetected | medium |
| TANK-5006 | OwnershipTransferDetected | critical |
| TANK-5007 | SelfDestructDetected | critical |
| TANK-5008 | DelegateCallDetected | high |

## TANK-6000 — Wallet
| Code | Name | Severity |
|------|------|----------|
| TANK-6001 | WalletLocked | medium |
| TANK-6002 | WalletNotFound | high |
| TANK-6003 | InvalidPassword | medium |
| TANK-6004 | VaultCorrupted | critical |
| TANK-6005 | SecureBufferDestroyed | high |
| TANK-6006 | KeyDerivationFailed | critical |
| TANK-6007 | EncryptionFailed | critical |
| TANK-6008 | DecryptionFailed | critical |
| TANK-6009 | InsufficientBalance | medium |
| TANK-6010 | NonceTooLow | medium |

## TANK-7000 — Plugin
| Code | Name | Severity |
|------|------|----------|
| TANK-7001 | PluginNotFound | high |
| TANK-7002 | PluginVersionMismatch | high |
| TANK-7003 | PluginCapabilityMissing | medium |
| TANK-7004 | PluginInitFailed | high |
| TANK-7005 | PluginConformanceFailed | high |
| TANK-7006 | BroadcastFailed | high |
| TANK-7007 | MonitorFailed | medium |

## TANK-8000 — Internal
| Code | Name | Severity |
|------|------|----------|
| TANK-8001 | InvariantViolated | critical |
| TANK-8002 | UnexpectedState | critical |
| TANK-8003 | EngineUnavailable | high |
| TANK-8004 | EventBusError | critical |
| TANK-8005 | DecisionPipelineError | critical |
| TANK-8006 | AuditLogWriteFailed | critical |
| TANK-8007 | RecoveryFailed | critical |
| TANK-8008 | LockdownFailed | critical |
| TANK-8009 | ObservabilityFailed | medium |
| TANK-8010 | UnknownError | critical |
