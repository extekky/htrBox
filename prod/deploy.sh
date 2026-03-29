#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — деплой htrBox
# Запуск из папки prod/: ./deploy.sh [yc|vps-se|vps-nether|vps-all|all]
# ─────────────────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# ── Yandex Cloud (frontend + backend + postgres) ──────────────────────────────
YC_HOST="93.77.187.20"
YC_USER="dolzhkevich"
YC_KEY="$HOME/.ssh/ssh-key-yandex-cloud"
YC_DIR="/home/dolzhkevich/htrBox"
YC_DATA_DIR="/home/dolzhkevich/htrBox-data"

# ── VPS Sweden (hysteria) ─────────────────────────────────────────────────────
VPS_HOST_SE="193.25.216.190"
VPS_USER="root"
VPS_KEY="$HOME/.ssh/id_rsa"
VPS_DIR="/root/htrBox"

# ── VPS Nether (hysteria) — сервер ещё не поднят ─────────────────────────────
VPS_HOST_NETHER=""      # TODO: заполнить когда сервер появится
VPS_USER_NETHER="root"
VPS_KEY_NETHER="$HOME/.ssh/id_rsa"
VPS_DIR_NETHER="/root/htrBox"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
fail() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

[ ! -f "$SCRIPT_DIR/infra/yandex-cloud.yaml" ] && fail "Запускай из папки prod/"
[ ! -f "$SCRIPT_DIR/servers/sweden.yaml" ]      && fail "servers/sweden.yaml не найден"

# ════════════════════════════════════════════════════
# ДЕПЛОЙ Yandex Cloud (frontend + backend + postgres)
# ════════════════════════════════════════════════════
deploy_yc() {
  echo ""
  echo "-------------------------------------------"
  echo "  🚀 Деплой -> Yandex Cloud ($YC_HOST)"
  echo "-------------------------------------------"

  [ ! -f "$SCRIPT_DIR/certificates/yandex-cloud.ini" ] && fail "certificates/yandex-cloud.ini не найден"
  [ ! -f "$SCRIPT_DIR/infra/.env" ]                    && fail "infra/.env не найден"

  log "Создаём директории на YC..."
  ssh -i "$YC_KEY" "$YC_USER@$YC_HOST" "mkdir -p $YC_DIR $YC_DATA_DIR/pgdata"

  log "Копируем backend/ на YC..."
  tar -czf /tmp/backend.tar.gz \
    --exclude="venv" \
    --exclude="__pycache__" \
    --exclude="*.pyc" \
    --exclude=".pytest_cache" \
    -C "$PROJECT_ROOT" backend
  scp -i "$YC_KEY" /tmp/backend.tar.gz "$YC_USER@$YC_HOST:/tmp/"
  ssh -i "$YC_KEY" "$YC_USER@$YC_HOST" "mkdir -p $YC_DIR && tar --warning=no-unknown-keyword -xzf /tmp/backend.tar.gz -C $YC_DIR && rm /tmp/backend.tar.gz"
  rm /tmp/backend.tar.gz

  log "Копируем frontend/ на YC..."
  cp "$SCRIPT_DIR/infra/nginx.conf" "$PROJECT_ROOT/frontend/nginx.conf"
  tar -czf /tmp/frontend.tar.gz \
    --exclude="node_modules" \
    --exclude="dist" \
    -C "$PROJECT_ROOT" frontend
  scp -i "$YC_KEY" /tmp/frontend.tar.gz "$YC_USER@$YC_HOST:/tmp/"
  ssh -i "$YC_KEY" "$YC_USER@$YC_HOST" "tar --warning=no-unknown-keyword -xzf /tmp/frontend.tar.gz -C $YC_DIR && rm /tmp/frontend.tar.gz"
  rm /tmp/frontend.tar.gz

  log "Копируем docker-compose и .env..."
  scp -i "$YC_KEY" "$SCRIPT_DIR/infra/yandex-cloud.yaml" "$YC_USER@$YC_HOST:$YC_DIR/docker-compose.yc.yaml"
  scp -i "$YC_KEY" "$SCRIPT_DIR/infra/.env"              "$YC_USER@$YC_HOST:$YC_DIR/.env.FrontBack"

  log "Копируем Cloudflare токен..."
  ssh -i "$YC_KEY" "$YC_USER@$YC_HOST" "mkdir -p ~/.secrets && chmod 700 ~/.secrets"
  scp -i "$YC_KEY" "$SCRIPT_DIR/certificates/yandex-cloud.ini" "$YC_USER@$YC_HOST:~/.secrets/cloudflare-yc.ini"
  ssh -i "$YC_KEY" "$YC_USER@$YC_HOST" "chmod 600 ~/.secrets/cloudflare-yc.ini"

  log "Проверяем сертификат для stdoq.ru..."
  ssh -i "$YC_KEY" "$YC_USER@$YC_HOST" '
    CERT_PATH="/etc/letsencrypt/live/stdoq.ru/fullchain.pem"
    RENEW_NEEDED=false

    if [ ! -f "$CERT_PATH" ]; then
      echo "  -> Сертификат не найден, получаем новый..."
      RENEW_NEEDED=true
    else
      EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_PATH" | cut -d= -f2)
      EXPIRY_TS=$(date -d "$EXPIRY" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$EXPIRY" +%s 2>/dev/null)
      NOW_TS=$(date +%s)
      DAYS_LEFT=$(( (EXPIRY_TS - NOW_TS) / 86400 ))
      echo "  -> Сертификат найден, осталось дней: $DAYS_LEFT"
      [ "$DAYS_LEFT" -lt 30 ] && RENEW_NEEDED=true
    fi

    if [ "$RENEW_NEEDED" = true ]; then
      if ! command -v certbot &>/dev/null; then
        echo "  -> Устанавливаем certbot..."
        sudo apt-get update -qq && sudo apt-get install -y -qq certbot python3-certbot-dns-cloudflare
      fi
      sudo certbot certonly \
        --dns-cloudflare \
        --dns-cloudflare-credentials ~/.secrets/cloudflare-yc.ini \
        -d stdoq.ru -d www.stdoq.ru \
        --email st.stanislove@yandex.ru \
        --agree-tos --no-eff-email \
        --non-interactive
      echo "  -> Сертификат получен ✓"
    else
      echo "  -> Сертификат актуален, пропускаем ✓"
    fi
  '

  log "Запускаем контейнеры (--build)..."
  ssh -i "$YC_KEY" "$YC_USER@$YC_HOST" "
    cd $YC_DIR
    docker compose -f docker-compose.yc.yaml up -d --build --force-recreate frontend backend postgres
    docker image prune -f
  "

  echo ""
  echo "---- Статус контейнеров ----"
  ssh -i "$YC_KEY" "$YC_USER@$YC_HOST" "docker ps --filter name=frontend --filter name=backend --filter name=postgres --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

  echo ""
  echo "---- Логи backend (последние 20 строк) ----"
  ssh -i "$YC_KEY" "$YC_USER@$YC_HOST" "docker logs backend --tail=20"

  log "Yandex Cloud задеплоен ✓"
}

# ════════════════════════════════════════════════════
# ДЕПЛОЙ VPS Sweden (hysteria)
# ════════════════════════════════════════════════════
deploy_vps_se() {
  echo ""
  echo "-------------------------------------------"
  echo "  🇸🇪 Деплой -> Sweden VPS ($VPS_HOST_SE)"
  echo "-------------------------------------------"

  [ ! -f "$SCRIPT_DIR/certificates/vps-sweden.ini" ] && fail "certificates/vps-sweden.ini не найден"
  [ ! -f "$SCRIPT_DIR/servers/.env" ]                && fail "servers/.env не найден"

  log "Создаём директорию $VPS_DIR..."
  ssh -i "$VPS_KEY" "$VPS_USER@$VPS_HOST_SE" "mkdir -p $VPS_DIR/hysteria"

  log "Копируем hysteria конфиг и docker-compose..."
  scp -i "$VPS_KEY" "$SCRIPT_DIR/servers/config.yaml" "$VPS_USER@$VPS_HOST_SE:$VPS_DIR/hysteria/config.yaml"
  scp -i "$VPS_KEY" "$SCRIPT_DIR/servers/sweden.yaml" "$VPS_USER@$VPS_HOST_SE:$VPS_DIR/docker-compose.hysteria.yaml"
  scp -i "$VPS_KEY" "$SCRIPT_DIR/servers/.env"        "$VPS_USER@$VPS_HOST_SE:$VPS_DIR/.env.Hysteria"

  log "Копируем Cloudflare токен..."
  ssh -i "$VPS_KEY" "$VPS_USER@$VPS_HOST_SE" "mkdir -p ~/.secrets && chmod 700 ~/.secrets"
  scp -i "$VPS_KEY" "$SCRIPT_DIR/certificates/vps-sweden.ini" "$VPS_USER@$VPS_HOST_SE:~/.secrets/cloudflare-vps.ini"
  ssh -i "$VPS_KEY" "$VPS_USER@$VPS_HOST_SE" "chmod 600 ~/.secrets/cloudflare-vps.ini"

  log "Проверяем сертификат для se.stdoq.ru..."
  ssh -i "$VPS_KEY" "$VPS_USER@$VPS_HOST_SE" '
    CERT_PATH="/etc/letsencrypt/live/se.stdoq.ru/fullchain.pem"
    RENEW_NEEDED=false

    if [ ! -f "$CERT_PATH" ]; then
      echo "  -> Сертификат не найден, получаем новый..."
      RENEW_NEEDED=true
    else
      EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_PATH" | cut -d= -f2)
      EXPIRY_TS=$(date -d "$EXPIRY" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$EXPIRY" +%s 2>/dev/null)
      NOW_TS=$(date +%s)
      DAYS_LEFT=$(( (EXPIRY_TS - NOW_TS) / 86400 ))
      echo "  -> Сертификат найден, осталось дней: $DAYS_LEFT"
      [ "$DAYS_LEFT" -lt 30 ] && RENEW_NEEDED=true
    fi

    if [ "$RENEW_NEEDED" = true ]; then
      if ! command -v certbot &>/dev/null; then
        echo "  -> Устанавливаем certbot..."
        apt-get update -qq && apt-get install -y -qq certbot python3-certbot-dns-cloudflare
      fi
      certbot certonly \
        --dns-cloudflare \
        --dns-cloudflare-credentials ~/.secrets/cloudflare-vps.ini \
        -d se.stdoq.ru \
        --email st.stanislove@yandex.ru \
        --agree-tos --no-eff-email \
        --non-interactive
      echo "  -> Сертификат получен ✓"
    else
      echo "  -> Сертификат актуален, пропускаем ✓"
    fi
  '

  log "Запускаем hysteria..."
  ssh -i "$VPS_KEY" "$VPS_USER@$VPS_HOST_SE" "
    cd $VPS_DIR
    docker-compose -f docker-compose.hysteria.yaml pull
    docker-compose -f docker-compose.hysteria.yaml up -d --force-recreate hysteria
    docker image prune -f
  "

  echo ""
  echo "---- Статус контейнеров ----"
  ssh -i "$VPS_KEY" "$VPS_USER@$VPS_HOST_SE" "docker ps --filter name=hysteria --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

  echo ""
  echo "---- Логи hysteria (последние 20 строк) ----"
  ssh -i "$VPS_KEY" "$VPS_USER@$VPS_HOST_SE" "docker logs hysteria --tail=20"

  log "Sweden VPS задеплоен ✓"
}

# ════════════════════════════════════════════════════
# ДЕПЛОЙ VPS Nether (hysteria) — сервер ещё не поднят
# TODO: создать servers/nether.yaml когда сервер появится
# ════════════════════════════════════════════════════
deploy_vps_nether() {
  echo ""
  echo "-------------------------------------------"
  echo "  🌑 Деплой -> Nether VPS"
  echo "-------------------------------------------"

  if [ -z "$VPS_HOST_NETHER" ]; then
    warn "Nether VPS ещё не настроен — заполни VPS_HOST_NETHER в deploy.sh"
    warn "Также создай servers/nether.yaml и заполни certificates/vps-nether.ini"
    return 0
  fi

  [ ! -f "$SCRIPT_DIR/certificates/vps-nether.ini" ] && fail "certificates/vps-nether.ini не найден"
  [ ! -f "$SCRIPT_DIR/servers/nether.yaml" ]         && fail "servers/nether.yaml не найден"
  [ ! -f "$SCRIPT_DIR/servers/.env" ]                && fail "servers/.env не найден"

  log "Создаём директорию $VPS_DIR_NETHER..."
  ssh -i "$VPS_KEY_NETHER" "$VPS_USER_NETHER@$VPS_HOST_NETHER" "mkdir -p $VPS_DIR_NETHER/hysteria"

  log "Копируем hysteria конфиг и docker-compose..."
  scp -i "$VPS_KEY_NETHER" "$SCRIPT_DIR/servers/config.yaml" "$VPS_USER_NETHER@$VPS_HOST_NETHER:$VPS_DIR_NETHER/hysteria/config.yaml"
  scp -i "$VPS_KEY_NETHER" "$SCRIPT_DIR/servers/nether.yaml" "$VPS_USER_NETHER@$VPS_HOST_NETHER:$VPS_DIR_NETHER/docker-compose.hysteria.yaml"
  scp -i "$VPS_KEY_NETHER" "$SCRIPT_DIR/servers/.env"        "$VPS_USER_NETHER@$VPS_HOST_NETHER:$VPS_DIR_NETHER/.env.Hysteria"

  log "Копируем Cloudflare токен..."
  ssh -i "$VPS_KEY_NETHER" "$VPS_USER_NETHER@$VPS_HOST_NETHER" "mkdir -p ~/.secrets && chmod 700 ~/.secrets"
  scp -i "$VPS_KEY_NETHER" "$SCRIPT_DIR/certificates/vps-nether.ini" "$VPS_USER_NETHER@$VPS_HOST_NETHER:~/.secrets/cloudflare-vps.ini"
  ssh -i "$VPS_KEY_NETHER" "$VPS_USER_NETHER@$VPS_HOST_NETHER" "chmod 600 ~/.secrets/cloudflare-vps.ini"

  log "Проверяем Docker..."
  ssh -i "$VPS_KEY_NETHER" "$VPS_USER_NETHER@$VPS_HOST_NETHER" '
    if ! command -v docker &>/dev/null; then
      echo "  -> Docker не найден, устанавливаем..."
      apt-get update -qq
      apt-get install -y -qq ca-certificates curl gnupg
      install -m 0755 -d /etc/apt/keyrings
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
      chmod a+r /etc/apt/keyrings/docker.gpg
      echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
        https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
        > /etc/apt/sources.list.d/docker.list
      apt-get update -qq
      apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
      systemctl enable docker && systemctl start docker
      echo "  -> Docker установлен ✓"
    else
      echo "  -> Docker уже установлен: $(docker --version)"
    fi
    if ! systemctl is-active --quiet docker; then
      systemctl start docker && sleep 3
    fi
    echo "  -> Docker daemon активен ✓"
  '

  log "Проверяем сертификат для nether.stdoq.ru..."
  ssh -i "$VPS_KEY_NETHER" "$VPS_USER_NETHER@$VPS_HOST_NETHER" '
    CERT_PATH="/etc/letsencrypt/live/nether.stdoq.ru/fullchain.pem"
    RENEW_NEEDED=false

    if [ ! -f "$CERT_PATH" ]; then
      echo "  -> Сертификат не найден, получаем новый..."
      RENEW_NEEDED=true
    else
      EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_PATH" | cut -d= -f2)
      EXPIRY_TS=$(date -d "$EXPIRY" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$EXPIRY" +%s 2>/dev/null)
      NOW_TS=$(date +%s)
      DAYS_LEFT=$(( (EXPIRY_TS - NOW_TS) / 86400 ))
      echo "  -> Сертификат найден, осталось дней: $DAYS_LEFT"
      [ "$DAYS_LEFT" -lt 30 ] && RENEW_NEEDED=true
    fi

    if [ "$RENEW_NEEDED" = true ]; then
      if ! command -v certbot &>/dev/null; then
        echo "  -> Устанавливаем certbot..."
        apt-get update -qq && apt-get install -y -qq certbot python3-certbot-dns-cloudflare
      fi
      certbot certonly \
        --dns-cloudflare \
        --dns-cloudflare-credentials ~/.secrets/cloudflare-vps.ini \
        -d nether.stdoq.ru \
        --email st.stanislove@yandex.ru \
        --agree-tos --no-eff-email \
        --non-interactive
      echo "  -> Сертификат получен ✓"
    else
      echo "  -> Сертификат актуален, пропускаем ✓"
    fi
  '

  log "Запускаем hysteria..."
  ssh -i "$VPS_KEY_NETHER" "$VPS_USER_NETHER@$VPS_HOST_NETHER" "
    cd $VPS_DIR_NETHER
    docker compose -f docker-compose.hysteria.yaml pull
    docker compose -f docker-compose.hysteria.yaml up -d --force-recreate hysteria
    docker image prune -f
  "

  echo ""
  echo "---- Статус контейнеров ----"
  ssh -i "$VPS_KEY_NETHER" "$VPS_USER_NETHER@$VPS_HOST_NETHER" "docker ps --filter name=hysteria --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

  echo ""
  echo "---- Логи hysteria (последние 20 строк) ----"
  ssh -i "$VPS_KEY_NETHER" "$VPS_USER_NETHER@$VPS_HOST_NETHER" "docker logs hysteria --tail=20"

  log "Nether VPS задеплоен ✓"
}

# ════════════════════════════════════════════════════
# ТОЧКА ВХОДА
# ════════════════════════════════════════════════════
case "${1:-all}" in
  yc)         deploy_yc ;;
  vps-se)     deploy_vps_se ;;
  vps-nether) deploy_vps_nether ;;
  vps-all)    deploy_vps_se && deploy_vps_nether ;;
  all)        deploy_yc && deploy_vps_se && deploy_vps_nether ;;
  *)
    echo "Использование: ./deploy.sh [yc|vps-se|vps-nether|vps-all|all]"
    exit 1
    ;;
esac

echo ""
log "Деплой завершён 🎉"