#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────
# cleanup.sh — очистка docker + проекта
# pgdata НЕ удаляется — хранится в htrBox-data вне проекта
# Запуск из папки prod/: ./cleanup.sh [yc|vps-se|vps-nether|vps-all|all]
# ─────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

YC_HOST="93.77.187.20"
YC_USER="dolzhkevich"
YC_KEY="$HOME/.ssh/ssh-key-yandex-cloud"
YC_DIR="/home/dolzhkevich/htrBox"

VPS_HOST_SE="193.25.216.190"
VPS_USER="root"
VPS_KEY="$HOME/.ssh/id_rsa"
VPS_DIR="/root/htrBox"

VPS_HOST_NETHER=""
VPS_USER_NETHER="root"
VPS_KEY_NETHER="$HOME/.ssh/id_rsa"
VPS_DIR_NETHER="/root/htrBox"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓] $1${NC}"; }
warn() { echo -e "${YELLOW}[!] $1${NC}"; }

cleanup_server() {
  local name="$1" host="$2" user="$3" key="$4" proj_dir="$5"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo " 🧹 $name ($host)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  ssh -i "$key" "$user@$host" bash << EOF
    set -euo pipefail

    echo "── Остановка контейнеров ──"
    docker ps -q   | xargs -r docker stop --time=5       || true
    docker ps -aq  | xargs -r docker rm -f               || true
    docker images -q | sort -u | xargs -r docker rmi -f  || true
    docker volume ls -q | xargs -r docker volume rm -f   || true
    docker network prune -f  || true
    docker builder prune -af || true
    docker system prune -af --volumes || true

    echo "── Удаление директории проекта ──"
    if [ -d "$proj_dir" ]; then
      sudo chown -R "\$(whoami)" "$proj_dir" 2>/dev/null || true
      sudo chmod -R u+rwX "$proj_dir" 2>/dev/null || true
      rm -rf "$proj_dir"
      echo "  -> $proj_dir удалена ✓"
    else
      echo "  -> $proj_dir уже не существует"
    fi

    echo ""
    echo "── Итог ──"
    echo "  pgdata (БД): сохранена"
    echo "  /etc/letsencrypt: сохранён"
EOF

  log "$name -> очищен"
}

case "${1:-all}" in
  yc)
    cleanup_server "Yandex Cloud" "$YC_HOST" "$YC_USER" "$YC_KEY" "$YC_DIR"
    ;;
  vps-se)
    cleanup_server "Sweden VPS" "$VPS_HOST_SE" "$VPS_USER" "$VPS_KEY" "$VPS_DIR"
    ;;
  vps-nether)
    if [ -z "$VPS_HOST_NETHER" ]; then
      warn "Nether VPS ещё не настроен — заполни VPS_HOST_NETHER в cleanup.sh"
    else
      cleanup_server "Nether VPS" "$VPS_HOST_NETHER" "$VPS_USER_NETHER" "$VPS_KEY_NETHER" "$VPS_DIR_NETHER"
    fi
    ;;
  vps-all)
    cleanup_server "Sweden VPS" "$VPS_HOST_SE" "$VPS_USER" "$VPS_KEY" "$VPS_DIR"
    if [ -z "$VPS_HOST_NETHER" ]; then
      warn "Nether VPS пропущен — заполни VPS_HOST_NETHER"
    else
      cleanup_server "Nether VPS" "$VPS_HOST_NETHER" "$VPS_USER_NETHER" "$VPS_KEY_NETHER" "$VPS_DIR_NETHER"
    fi
    ;;
  all)
    TMPDIR=$(mktemp -d)
    cleanup_server "Yandex Cloud" "$YC_HOST" "$YC_USER" "$YC_KEY" "$YC_DIR" \
      > "$TMPDIR/yc.log" 2>&1 & YC_PID=$!
    cleanup_server "Sweden VPS" "$VPS_HOST_SE" "$VPS_USER" "$VPS_KEY" "$VPS_DIR" \
      > "$TMPDIR/se.log" 2>&1 & SE_PID=$!

    wait $YC_PID || true
    wait $SE_PID || true

    echo "═══ Yandex Cloud ═══"; cat "$TMPDIR/yc.log"
    echo "═══ Sweden VPS ═══";   cat "$TMPDIR/se.log"
    rm -rf "$TMPDIR"

    if [ -z "$VPS_HOST_NETHER" ]; then
      warn "Nether VPS пропущен — заполни VPS_HOST_NETHER"
    else
      cleanup_server "Nether VPS" "$VPS_HOST_NETHER" "$VPS_USER_NETHER" "$VPS_KEY_NETHER" "$VPS_DIR_NETHER"
    fi
    ;;
  *)
    echo "Использование: $0 [yc|vps-se|vps-nether|vps-all|all]"
    exit 1
    ;;
esac

echo ""
log "Очистка завершена. pgdata и сертификаты сохранены."