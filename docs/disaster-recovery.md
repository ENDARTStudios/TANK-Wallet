# Disaster Recovery Plan
> Status: Active | Maintainer: Engineering Lead
## Scenarios: Server loss (4h/1h), DB loss (2h/1h), Cloud compromise (8h/24h), DDoS (1h/n/a), Code loss (24h/0), Key loss (4h/0)
## Backup: SQLite hourly, Git mirror, Keys via Shamir SSS, Config sealed-secrets
## DR Drills: Monthly DB restore, Quarterly full, Annual multi-failure
