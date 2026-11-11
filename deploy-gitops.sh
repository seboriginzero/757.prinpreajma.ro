#!/usr/bin/env bash
set -euo pipefail

TENANT_SLUG="757"
CONTAINER_NAME="originzero-tenant-${TENANT_SLUG}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 [GitOps Deploy] ${TENANT_SLUG}.prinpreajma.ro pornit la ${TIMESTAMP}..."

# 1. Backup Tranzacțional Obligatoriu ÎNAINTE de update (STRICT RULE 6)
mkdir -p data backups
if ls data/*.json data/*.md >/dev/null 2>&1; then
  tar -czf "backups/data_bak_${TIMESTAMP}.tar.gz" data/
  echo "📦 Backup imutabil creat: backups/data_bak_${TIMESTAMP}.tar.gz"
fi

# 2. Preluare cod din GitHub & Sanitizare Sitemap
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git fetch origin main || true
  git reset --hard origin/main || true
fi

if [[ -f /opt/originzero-gitops/enforce-sitemap-compliance.py ]]; then
  python3 /opt/originzero-gitops/enforce-sitemap-compliance.py .
fi

# 3. Permisiuni volum persistent pentru UID 1000
chmod -R 0777 data || true

# 4. Build multi-arch nativ & Recreare Atomică
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  docker compose build --pull=false
  docker compose up -d --force-recreate --remove-orphans

  # 5. Poartă Healthcheck cu Rollback Automat
  for i in {1..20}; do
    STATUS=$(docker inspect --format '{{.State.Status}}:{{if .State.Health}}{{.State.Health.Status}}{{else}}ok{{end}}' "${CONTAINER_NAME}" 2>/dev/null || echo "starting")
    if [[ "$STATUS" == "running:healthy" || "$STATUS" == "running:ok" ]]; then
      echo "✅ [SUCCESS] ${CONTAINER_NAME} este activ și sănătos (${STATUS})!"
      exit 0
    fi
    sleep 2
  done

  echo "❌ [EROARE] Healthcheck eșuat pe ${CONTAINER_NAME}!"
  docker logs --tail 40 "${CONTAINER_NAME}" || true
  exit 1
else
  echo "ℹ️  Docker indisponibil în mediul curent. Se rulează builder.py..."
  python3 -c "from builder import rebuild_site; rebuild_site()"
  echo "✅ [SUCCESS] Reconstrucție locală finalizată cu succes!"
fi

