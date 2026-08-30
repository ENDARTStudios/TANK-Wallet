#!/usr/bin/env bash
# Backup agendado (hourly via cron):
# 0 * * * * /usr/local/bin/backup-cron.sh
# Faz backup de SQLite ou Postgres, cifra com BACKUP_ENCRYPTION_KEY, upload S3 stub.

set -e

BACKUP_DIR="${BACKUP_DIR:-./db/backups}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

mkdir -p "$BACKUP_DIR"
TS=$(date -u +%Y%m%dT%H%M%SZ)
OUT="$BACKUP_DIR/backup-$TS.db"

if [[ "${DATABASE_URL:-file:./db/custom.db}" == postgres* ]]; then
  echo "Postgres backup via pg_dump"
  PGOUT="$BACKUP_DIR/pg-$TS.sql"
  pg_dump "$DATABASE_URL" > "$PGOUT"
  if [[ -n "$ENCRYPTION_KEY" ]]; then
    openssl enc -aes-256-cbc -salt -pbkdf2 -in "$PGOUT" -out "$PGOUT.enc" -pass "pass:$ENCRYPTION_KEY"
    rm "$PGOUT"
  fi
  echo "Postgres backup done: $PGOUT${ENCRYPTION_KEY:+.enc}"
else
  echo "SQLite backup via copy"
  cp "./db/custom.db" "$OUT"
  if [[ -n "$ENCRYPTION_KEY" ]]; then
    openssl enc -aes-256-cbc -salt -pbkdf2 -in "$OUT" -out "$OUT.enc" -pass "pass:$ENCRYPTION_KEY"
    rm "$OUT"
  fi
  echo "SQLite backup done: $OUT${ENCRYPTION_KEY:+.enc}"
fi

# Upload S3 stub (registro)
S3_BUCKET="${BACKUP_S3_BUCKET:-tank-wallet-backups}"
echo "Upload stub: s3://$S3_BUCKET/backup-$TS.{db,sql,enc}"

# Cleanup antigos > RETENTION_DAYS
find "$BACKUP_DIR" -type f -mtime +"$RETENTION_DAYS" -delete 2>/dev/null || true

echo "Backup complete: $(date -u)"
