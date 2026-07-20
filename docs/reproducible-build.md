# Reproducible Build Verification

> Procedimento para verificar que o build Docker é reproduzível.
> Dois builds a partir do mesmo commit devem produzir a mesma image ID.

## Procedimento

```bash
# 1. Build #1
docker build -t tank-wallet:verify-1 .

# 2. Build #2 (same commit, different tag)
docker build -t tank-wallet:verify-2 .

# 3. Compare image IDs
docker image inspect tank-wallet:verify-1 --format='{{.Id}}'
docker image inspect tank-wallet:verify-2 --format='{{.Id}}'

# 4. IDs should be identical (modulo Next.js build timestamps)
# If different, investigate:
#   - Different bun.lockb? (should be frozen)
#   - Different system deps? (should be pinned in Dockerfile)
#   - Next.js non-deterministic output? (set NEXT_TELEMETRY_DISABLED=1)
```

## Garantias do Dockerfile

- **Base image pinned**: `oven/bun:1.3.14-debian` (not `latest`)
- **Lockfile frozen**: `bun install --frozen-lockfile`
- **Telemetry disabled**: `NEXT_TELEMETRY_DISABLED=1`
- **Non-root user**: deterministic UID 1001
- **Multi-stage**: deps → build → runtime (no build tools in final image)

## CI Verification

The `release.yml` workflow builds the Docker image and pushes to GHCR.
Two builds from the same tag will produce identical images if the
above guarantees hold.

## Known Non-Determinism

Next.js standalone build may include timestamps in `.next/BUILD_ID`.
This does not affect runtime behavior but may cause image ID to differ
by a few bytes. This is acceptable and does not compromise reproducibility
of the actual application code.

## SBOM Verification

Each release includes:
- `reports/sbom.cyclonedx.json` — CycloneDX SBOM
- `reports/sbom.cyclonedx.json.sig` — Ed25519 signature
- `reports/sbom.cyclonedx.json.pem` — signing certificate
- `reports/build-attestation.md` — build metadata
- `reports/image-layers.json` — Docker layer hashes
