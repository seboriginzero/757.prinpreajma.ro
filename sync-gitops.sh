#!/usr/bin/env bash
set -euo pipefail

TENANT_SLUG="757"
CURRENT_OS="$(uname -s)"
CURRENT_ARCH="$(uname -m)"
CURRENT_HOST="$(hostname 2>/dev/null || uname -n)"

if [[ "$CURRENT_ARCH" == "aarch64" ]] && [[ "$CURRENT_OS" == "Linux" ]]; then
  ENV_MODE="HETZNER_MAIN_PRODUCTION"
elif [[ "$CURRENT_ARCH" == "x86_64" ]] && [[ "$CURRENT_OS" == "Linux" ]]; then
  ENV_MODE="PROXMOX_VM1_DEV_STANDBY"
else
  ENV_MODE="MAC_LOCAL_DEVELOPMENT"
fi

echo "================================================================================"
echo "🚀 ORIGINZERO GITOPS SYNC — Tenant: ${TENANT_SLUG} | Env: ${ENV_MODE} (${CURRENT_HOST})"
echo "   Domains: https://757.prinpreajma.ro & https://757.originzero.art"
echo "   Rules: Zero-Local-Copy | Zero .env in Git | Hostico CDN | BKP Prior Update"
echo "================================================================================"

# Poarta 1: Blocare scurgere secrete .env în Git
if git status --porcelain 2>/dev/null | grep -E '(^|\s)\.env($|\.)' | grep -v '\.env\.example'; then
  echo "❌ [BLOCAT] S-a detectat un fișier .env în Git! Mută-l în secrets/ și adaugă-l în .gitignore."
  exit 1
fi

# Poarta 2: Avertisment fișiere media grele (> 2MB)
LARGE_FILES=$(find . -maxdepth 4 -not -path '*/.*' -not -path './node_modules/*' -not -path './data/*' -type f -size +2M 2>/dev/null || true)
if [[ -n "$LARGE_FILES" ]]; then
  echo "⚠️  [ATENȚIE MEDIA] Fișiere >2MB detectate (urcă-le pe https://media-hostico.prinpreajma.ro):"
  echo "$LARGE_FILES"
fi

if [[ "$ENV_MODE" == "MAC_LOCAL_DEVELOPMENT" ]]; then
  echo "✅ [Mac Dev] Verificările GitOps au trecut. Rulează git commit & git push origin main."
else
  exec ./deploy-gitops.sh
fi

