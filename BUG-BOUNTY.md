# Bug Bounty Program

> Tank Wallet bug bounty program — scope, rules, and rewards.
> Launch: after Audit #1 completion or when OPERATOR creates Immunefi account.
>
> Status: **Draft** (not yet live)
> Maintainer: Security Lead
> Last review: 2026-07-17

---

## Program Status

**Not yet live.** This document defines the program that will be
launched on Immunefi after the first external security audit is
completed, OR when the OPERATOR creates an Immunefi account and
publishes this scope.

Until then, vulnerability reports are welcome via PGP-encrypted email
to `endart.studios@gmail.com` (see `SECURITY.md`).

---

## Platform

- **Host**: [Immunefi](https://immunefi.com/)
- **Program URL**: TBD (will be `https://immunefi.com/bounty/tankwallet`)
- **Launch date**: TBD (requires OPERATOR to create account)

---

## Scope

### In scope

| Asset | Type | Path/URL |
|-------|------|----------|
| Tank Wallet Web | Web app | `https://tankwallet.dev` (when deployed) |
| Tank Wallet API | Backend | `/api/*` routes |
| Tank Wallet Core | Crypto lib | `src/lib/wallet-core/` |
| Security Engines | Backend | `src/lib/wallet-engines/` |
| Decision Pipeline | Backend | `src/lib/wallet-kernel/security-decision-pipeline.ts` |
| Chain Plugins | Backend | `src/lib/wallet-plugins/` |
| Smart Contracts | On-chain | TBD (when deployed — ERC-4337 accounts) |
| Audit Log | Backend | `src/lib/wallet-engines/audit/hmac-chain.ts` |

### Out of scope

- Third-party dependencies (report upstream).
- Social engineering.
- Physical attacks.
- Self-XSS.
- Theoretical attacks without PoC.
- Issues already known (check existing reports).
- Automated scanner output without manual verification.
- Findings in excluded directories (`src/lib/wallet-engines/real/`, `src/lib/wallet-engines/transaction/`, `src/lib/wallet-plugins/` — legacy code with `@ts-nocheck`).

---

## Reward Tiers

Rewards are paid in USD via Immunefi (crypto equivalent available).

| Severity | Description | Reward (USD) |
|----------|-------------|--------------|
| Critical | Key compromise, fund theft, RCE, auth bypass, HMAC chain bypass | $1,000 – $5,000 |
| High | Privilege escalation, policy bypass, data leak, threat intel bypass | $250 – $1,000 |
| Medium | Logic flaws, DoS, information disclosure | $100 – $250 |
| Low | Minor security issues, hardening suggestions | $50 – $100 |

### Notes

- Rewards are **initial and low** — designed for a pre-revenue startup.
- As the project grows and generates revenue, rewards will increase.
- First-to-report bonus: +50%.
- Excellent write-up bonus: +25%.
- Responsible disclosure (no public disclosure before fix + 90d): +10%.

---

## Rules

### What we ask of researchers

1. **Act in good faith**: protect user data, don't destroy anything.
2. **Report promptly**: don't sit on vulnerabilities.
3. **No public disclosure** before fix + 90-day grace period.
4. **One vulnerability per report**: helps us track and fix faster.
5. **Provide PoC**: we need to reproduce to validate.
6. **Suggest fix** if possible (not required, but appreciated).
7. **Don't access** data that isn't yours.
8. **Don't DoS** our services.

### What we commit to

1. **Acknowledge** within 48 hours.
2. **Assess** within 7 days.
3. **Fix or mitigate** within 90 days (7 days for critical).
4. **Credit** in transparency report (unless anonymous preferred).
5. **Pay** within 30 days of fix deployment.
6. **Communicate** throughout the process.

---

## Severity Guidelines

We use the [Immunefi Vulnerability Severity Classification](https://immunefi.com/severity-updated/)
as a baseline, with the following Tank Wallet-specific clarifications:

### Critical

- **Key compromise**: any bug that allows extracting the user's mnemonic or private key.
- **Fund theft**: any bug that allows an attacker to move user funds without authorization.
- **RCE**: remote code execution on the server.
- **Auth bypass**: bypassing the wallet unlock mechanism.
- **Audit log tampering**: modifying the HMAC chain without detection.
- **Pipeline bypass**: transaction that should be blocked but isn't (all engines bypassed).

### High

- **Policy bypass**: transaction that should be challenged but isn't.
- **Privilege escalation**: Free user accessing PRO features.
- **Data leak**: exposure of sensitive user data (addresses, balances).
- **Threat Intel bypass**: malicious contract not flagged when it should be.
- **Simulation bypass**: dangerous state change not detected.

### Medium

- **Logic flaws**: edge cases that produce incorrect decisions.
- **DoS**: making the wallet unusable for a user.
- **Information disclosure**: leaking non-sensitive metadata.

### Low

- **Missing security headers**: CSP, HSTS, etc.
- **Verbose error messages**: leaking internal state.
- **Hardening suggestions**: improvements without direct vulnerability.

---

## Payout Process

1. Vulnerability validated by Tank Wallet security team.
2. Severity confirmed (researcher can appeal).
3. Fix developed and deployed.
4. Reward paid via Immunefi within 30 days of deployment.
5. Researcher credited in next transparency report.

---

## Known Issues

Vulnerabilities in these areas may already be known (check before reporting):

- See `reports/code-audit.md` for known code issues (93 findings — legacy code).
- See `docs/freeze-2-candidates.md` for known architectural gaps.
- See GitHub Issues with `security` label.

---

## History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-15 | Initial bug bounty program document. |
| 1.1 | 2026-07-17 | Updated rewards (lower for pre-revenue), added detailed scope, launch guide. |
