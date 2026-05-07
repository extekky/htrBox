#!/usr/bin/env bash
set -euo pipefail

# # -----------------------------------------------------------------------------
# cleanup.sh - очистка docker + проекта
# pgdata НЕ удаляется - хранится в htrBox-data вне проекта
# ./cleanup.sh [yc|vps-se|vps-nl|vps-all|all]
# # -----------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

YC_HOST="51.250.36.236"
YC_USER="stas"
YC_KEY="$HOME/.ssh/ip_rsa"
YC_DIR="/home/stas/htrBox"

VPS_HOST_SE="193.25.216.190"
VPS_USER_SE="root"
VPS_KEY_SE="$HOME/.ssh/id_rsa"
VPS_DIR_SE="/root/htrBox"

VPS_HOST_NL="151.245.136.168"
VPS_USER_NL="root"
VPS_KEY_NL="$HOME/.ssh/id_rsa"
VPS_DIR_NL="/root/htrBox"

VPS_HOST_GE="2.26.99.243"
VPS_USER_GE="root"
VPS_KEY_GE="$HOME/.ssh/id_rsa"
VPS_DIR_GE="/root/htrBox"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓] $1${NC}"; }
warn() { echo -e "${YELLOW}[!] $1${NC}"; }

cleanup_server() {
  local name="$1" host="$2" user="$3" key="$4" proj_dir="$5"

  echo ""
  echo "----------------------------------------------"
  echo " 🧹 $name ($host)"
  echo "----------------------------------------------"

  # Передаём proj_dir явно через переменную окружения, чтобы избежать
  # конфликта между локальным и удалённым окружением в heredoc
  ssh -i "$key" "$user@$host" PROJ_DIR="$proj_dir" 'bash -s' << 'REMOTE'
    set -euo pipefail

    echo "-- Остановка контейнеров --"
    docker ps -q    | xargs -r docker stop --time=5      || true
    docker ps -aq   | xargs -r docker rm -f              || true
    docker images -q | sort -u | xargs -r docker rmi -f  || true
    docker volume ls -q | xargs -r docker volume rm -f   || true
    docker network prune -f  || true
    docker builder prune -af || true
    docker system prune -af --volumes || true

    echo "-- Удаление директории проекта --"
    if [ -d "$PROJ_DIR" ]; then
      sudo chown -R "$(whoami)" "$PROJ_DIR" 2>/dev/null || true
      sudo chmod -R u+rwX "$PROJ_DIR" 2>/dev/null || true
      rm -rf "$PROJ_DIR"
      echo "  -> $PROJ_DIR удалена ✓"
    else
      echo "  -> $PROJ_DIR уже не существует"
    fi

    echo ""
    echo "-- Итог --"
    echo "  pgdata (БД): сохранена"
    echo "  /etc/letsencrypt: сохранён"
REMOTE

  log "$name -> очищен"
}

case "${1-}" in
  yc)
    cleanup_server "Yandex Cloud" "$YC_HOST" "$YC_USER" "$YC_KEY" "$YC_DIR"
    ;;
  vps-se)
    cleanup_server "Sweden VPS" "$VPS_HOST_SE" "$VPS_USER_SE" "$VPS_KEY_SE" "$VPS_DIR_SE"
    ;;
  vps-nl)
    cleanup_server "Nether VPS" "$VPS_HOST_NL" "$VPS_USER_NL" "$VPS_KEY_NL" "$VPS_DIR_NL"
    ;;
  vps-ge)
    cleanup_server "German VPS" "$VPS_HOST_GE" "$VPS_USER_GE" "$VPS_KEY_GE" "$VPS_DIR_GE"
    ;;
  *)
    echo "Использование: $0 [yc|vps-se|vps-nl|vps-ge]"
    exit 1
    ;;
esac

echo ""
log "Очистка завершена. pgdata и сертификаты сохранены."