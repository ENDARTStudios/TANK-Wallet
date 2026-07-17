# Security Policy

> Tank Wallet takes security seriously. This document describes how to
> report vulnerabilities, what to expect, and our commitments.
>
> Status: **Active**
> Maintainer: Security Lead
> Last review: 2026-07-17

---

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x | ✅ Active |
| < 1.0 | ❌ Not supported |

---

## Reporting a Vulnerability

### How to report

**Preferred method**: email `security@tankwallet.dev` with PGP encryption
using the public key below.

**Alternative methods**:
- GitHub Security Advisories (via repository "Security" tab — enable first).
- Bug bounty program on [Immunefi](https://immunefi.com) (when live).

**DO NOT** open a public GitHub issue for security vulnerabilities.

### PGP key

Public key file: [`docs/security/pgp-key.asc`](docs/security/pgp-key.asc)

```
Fingerprint: 2F3D 3620 50E3 7DA9 140A 3973 8F04 CCBE 4064 2412
Key ID:      8F04CCBE40642412
Type:        RSA 4096
Expires:     2028-07-16
```

To encrypt your report:
```bash
gpg --import docs/security/pgp-key.asc
gpg --encrypt --recipient "Tank Wallet Security" --armor report.txt
# Send the encrypted report.txt.asc to security@tankwallet.dev
```

### What to include

Please include:
1. Description of the vulnerability.
2. Steps to reproduce (proof of concept).
3. Affected versions.
4. Potential impact.
5. Suggested fix (if any).
6. Your name/handle for credit (optional — see [Hall of Fame](docs/security/hall-of-fame.md)).

### Response timeline

| Event | SLA |
|-------|-----|
| Acknowledgement of report | 48 hours |
| Initial triage and severity assessment | 7 days |
| Fix or mitigation deployed | 90 days (critical: 7 days) |
| Public disclosure | After fix + 90-day grace period |

---

## Triage Process

1. **Receipt**: report received via PGP email, GitHub Advisory, or Immunefi.
2. **Acknowledgement**: within 48h, we confirm receipt and assign a tracking ID.
3. **Triage**: within 7 days, we assess severity (Critical/High/Medium/Low) and validity.
4. **Fix**: we develop and deploy a fix within the SLA for the severity.
5. **Disclosure**: after fix + 90-day grace period (or sooner if researcher agrees).
6. **Credit**: researcher added to [Hall of Fame](docs/security/hall-of-fame.md) unless anonymous.

---

## Scope

### In scope

- Tank Wallet web application (`https://tankwallet.dev` when deployed).
- Tank Wallet browser extension (when released).
- Tank Wallet backend APIs (`/api/*`).
- Smart contracts deployed by Tank Wallet (when released).
- Cryptographic implementation in `src/lib/wallet-core/`.
- Security engines in `src/lib/wallet-engines/`.
- Decision pipeline in `src/lib/wallet-kernel/`.
- Chain plugins in `src/lib/wallet-plugins/`.
- Audit log HMAC chain in `src/lib/wallet-engines/audit/`.

### Out of scope

- Vulnerabilities in third-party dependencies (report to upstream).
- Social engineering attacks.
- Physical attacks on user devices.
- Attacks requiring root/jailbreak on user device.
- Self-XSS (user injecting scripts into their own browser).
- Missing best practices that don't demonstrate actual vulnerability.
- Theoretical attacks without proof of concept.
- Findings in excluded directories (`src/lib/wallet-engines/real/`, `src/lib/wallet-engines/transaction/`, `src/lib/wallet-plugins/` — legacy code).

---

## Safe Harbor

Tank Wallet supports safe harbor for security researchers who:

1. Act in good faith to protect user data.
2. Avoid privacy violations, destruction of data, or disruption of service.
3. Do not access or modify data that does not belong to them.
4. Report vulnerabilities promptly.
5. Do not publicly disclose vulnerabilities before the fix is deployed and the 90-day grace period has elapsed.

Researchers who follow these guidelines will not face legal action from Tank Wallet.

---

## Bug Bounty

Tank Wallet operates a bug bounty program. Details:

- **Platform**: [Immunefi](https://immunefi.com) (launch pending — see [launch guide](docs/security/bug-bounty-launch-guide.md)).
- **Scope**: see "In scope" above.
- **Rewards**: see [`BUG-BOUNTY.md`](BUG-BOUNTY.md) for tier table.
- **Hall of Fame**: [Security Hall of Fame](docs/security/hall-of-fame.md).
- **GitHub Security Advisories**: enable via repository "Security" tab.

---

## Disclosure Policy

1. **Coordinated disclosure**: we work with researchers to fix vulnerabilities before public disclosure.
2. **90-day grace period**: after fix is deployed, we wait 90 days before public disclosure (or sooner if researcher agrees).
3. **Credit**: we credit researchers in our Hall of Fame (unless they prefer to remain anonymous).
4. **CVE**: we request CVE IDs for significant vulnerabilities.

---

## Security Measures

Tank Wallet implements the following security measures:

- **Autocustodial**: private keys never leave the user's device.
- **AES-256-GCM**: vault encryption at rest.
- **PBKDF2 250k iterations**: password-based key derivation.
- **SecureBuffer with zeroization**: keys in memory are overwritten after use.
- **Shamir Secret Sharing**: backup and recovery over GF(256).
- **WebAuthn/Passkeys**: biometric and hardware-backed unlock.
- **Threat Intelligence**: real-time GoPlus API integration.
- **Transaction Simulation**: eth_call pre-flight validation.
- **HMAC-signed audit log**: tamper-evident event chain.
- **16 Security Engines**: defense in depth.
- **Architecture Freeze 1.0**: immutable security contracts.
- **SecurityDecisionPipeline**: every transaction analyzed before signing.
- **CSP headers**: Content-Security-Policy configured.
- **PII sanitization**: in logger and Sentry.

---

## Contact

- **Security reports**: `security@tankwallet.dev` (PGP preferred — see key above)
- **General inquiries**: `endart.studios@gmail.com`
- **Bug bounty**: [Immunefi](https://immunefi.com) (when live)
- **GitHub Security Advisories**: via repository "Security" tab

---

## History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-15 | Initial security policy. |
| 1.1 | 2026-07-17 | Added PGP key, triage process, response timeline, Hall of Fame link, GitHub Security Advisories, detailed scope. |
