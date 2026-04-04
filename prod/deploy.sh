#!/bin/bash
set -e

# -----------------------------------------------------------------------------
# deploy.sh - деплой htrBox
# ./deploy.sh [yc|vps-se|vps-nl|vps-ge]
# -----------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# -- Yandex Cloud (frontend + backend + postgres) ------------------------------
YC_HOST="93.77.187.20"
YC_USER="dolzhkevich"
YC_KEY="$HOME/.ssh/ssh-key-yandex-cloud"
YC_DIR="/home/dolzhkevich/htrBox"
YC_DATA_DIR="/home/dolzhkevich/htrBox-data"

# -- VPS Sweden (hysteria) -----------------------------------------------------
VPS_HOST_SE="193.25.216.190"
VPS_USER_SE="root"
VPS_KEY_SE="$HOME/.ssh/id_rsa"
VPS_DIR_SE="/root/htrBox"

# -- VPS Nether (hysteria) —----------------------------------------------------
VPS_HOST_NL="151.245.136.168"
VPS_USER_NL="root"
VPS_KEY_NL="$HOME/.ssh/id_rsa"
VPS_DIR_NL="/root/htrBox"

# -- VPS Germany (hysteria) —----------------------------------------------------
VPS_HOST_GE="94.156.170.52"
VPS_USER_GE="root"
VPS_KEY_GE="$HOME/.ssh/id_rsa"
VPS_DIR_GE="/root/htrBox"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
fail() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# -- Проверяем что запущено из папки prod/ ------------------------------------
[ ! -f "$SCRIPT_DIR/infra/docker-compose.yaml" ]       && fail "infra/docker-compose.yaml не найден - запускай из папки prod/"
[ ! -f "$SCRIPT_DIR/servers/docker-compose.se.yaml" ]  && fail "servers/docker-compose.se.yaml не найден"
[ ! -f "$SCRIPT_DIR/servers/docker-compose.nl.yaml" ]  && fail "servers/docker-compose.nl.yaml не найден"
[ ! -f "$SCRIPT_DIR/servers/docker-compose.ge.yaml" ]  && fail "servers/docker-compose.ge.yaml не найден"

# ----------------------------------------------------
# ДЕПЛОЙ Yandex Cloud (frontend + backend + postgres)
# ----------------------------------------------------
deploy_yc() {
  echo ""
  echo "-------------------------------------------"
  echo "  🚀 Деплой -> Yandex Cloud ($YC_HOST)"
  echo "-------------------------------------------"

  [ ! -f "$SCRIPT_DIR/certificates/yandex-cloud.ini" ] && fail "certificates/yandex-cloud.ini не найден"
  [ ! -f "$SCRIPT_DIR/infra/.env" ]                    && fail "infra/.env не найден"
  [ ! -f "$SCRIPT_DIR/infra/nginx.conf" ]              && fail "infra/nginx.conf не найден"

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
  ssh -i "$YC_KEY" "$YC_USER@$YC_HOST" "tar --warning=no-unknown-keyword -xzf /tmp/backend.tar.gz -C $YC_DIR && rm /tmp/backend.tar.gz"
  rm /tmp/backend.tar.gz

  log "Копируем frontend/ на YC..."
  tar -czf /tmp/frontend.tar.gz \
    --exclude="node_modules" \
    --exclude="dist" \
    -C "$PROJECT_ROOT" frontend
  scp -i "$YC_KEY" /tmp/frontend.tar.gz "$YC_USER@$YC_HOST:/tmp/"
  ssh -i "$YC_KEY" "$YC_USER@$YC_HOST" "tar --warning=no-unknown-keyword -xzf /tmp/frontend.tar.gz -C $YC_DIR && rm /tmp/frontend.tar.gz"
  rm /tmp/frontend.tar.gz

  # nginx.conf для prod передаётся отдельно, поверх распакованного frontend/
  # dev-файл (frontend/nginx.conf в репозитории) не затрагивается
  log "Копируем prod nginx.conf на YC (infra/nginx.conf -> frontend/nginx.conf)..."
  scp -i "$YC_KEY" "$SCRIPT_DIR/infra/nginx.conf" "$YC_USER@$YC_HOST:$YC_DIR/frontend/nginx.conf"

  log "Копируем docker-compose и .env..."
  scp -i "$YC_KEY" "$SCRIPT_DIR/infra/docker-compose.yaml" "$YC_USER@$YC_HOST:$YC_DIR/docker-compose.yaml"
  scp -i "$YC_KEY" "$SCRIPT_DIR/infra/.env"                "$YC_USER@$YC_HOST:$YC_DIR/.env"

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
    docker compose -f docker-compose.yaml up -d --build --force-recreate frontend backend postgres
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

# ----------------------------------------------------
# ДЕПЛОЙ VPS Sweden (hysteria)
# ----------------------------------------------------
deploy_vps_se() {
  echo ""
  echo "-------------------------------------------"
  echo "    Деплой -> Sweden VPS ($VPS_HOST_SE)"
  echo "-------------------------------------------"

  [ ! -f "$SCRIPT_DIR/certificates/vps-sweden.ini" ] && fail "certificates/vps-sweden.ini не найден"
  [ ! -f "$SCRIPT_DIR/servers/.env" ]                && fail "servers/.env не найден"

  log "Создаём директорию $VPS_DIR_SE..."
  ssh -i "$VPS_KEY_SE" "$VPS_USER_SE@$VPS_HOST_SE" "mkdir -p $VPS_DIR_SE/hysteria"

  log "Копируем hysteria конфиг и docker-compose..."
  scp -i "$VPS_KEY_SE" "$SCRIPT_DIR/servers/config.yaml"              "$VPS_USER_SE@$VPS_HOST_SE:$VPS_DIR_SE/hysteria/config.yaml"
  scp -i "$VPS_KEY_SE" "$SCRIPT_DIR/servers/docker-compose.se.yaml"   "$VPS_USER_SE@$VPS_HOST_SE:$VPS_DIR_SE/docker-compose.yaml"
  scp -i "$VPS_KEY_SE" "$SCRIPT_DIR/servers/.env"                     "$VPS_USER_SE@$VPS_HOST_SE:$VPS_DIR_SE/.env"

  log "Копируем Cloudflare токен..."
  ssh -i "$VPS_KEY_SE" "$VPS_USER_SE@$VPS_HOST_SE" "mkdir -p ~/.secrets && chmod 700 ~/.secrets"
  scp -i "$VPS_KEY_SE" "$SCRIPT_DIR/certificates/vps-sweden.ini" "$VPS_USER_SE@$VPS_HOST_SE:~/.secrets/cloudflare-vps.ini"
  ssh -i "$VPS_KEY_SE" "$VPS_USER_SE@$VPS_HOST_SE" "chmod 600 ~/.secrets/cloudflare-vps.ini"

  log "Проверяем сертификат для se.stdoq.ru..."
  ssh -i "$VPS_KEY_SE" "$VPS_USER_SE@$VPS_HOST_SE" '
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
  ssh -i "$VPS_KEY_SE" "$VPS_USER_SE@$VPS_HOST_SE" "
    cd $VPS_DIR_SE
    docker-compose -f docker-compose.yaml pull
    docker-compose -f docker-compose.yaml up -d --force-recreate hysteria
    docker image prune -f
  "

  echo ""
  echo "---- Статус контейнеров ----"
  ssh -i "$VPS_KEY_SE" "$VPS_USER_SE@$VPS_HOST_SE" "docker ps --filter name=hysteria --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

  echo ""
  echo "---- Логи hysteria (последние 20 строк) ----"
  ssh -i "$VPS_KEY_SE" "$VPS_USER_SE@$VPS_HOST_SE" "docker logs hysteria --tail=20"

  log "Sweden VPS задеплоен ✓"
}

# ----------------------------------------------------
# ДЕПЛОЙ VPS Nether (hysteria)
# ----------------------------------------------------
deploy_vps_nl() {
  echo ""
  echo "-------------------------------------------"
  echo "    Деплой -> Nether VPS"
  echo "-------------------------------------------"

  [ ! -f "$SCRIPT_DIR/certificates/vps-nether.ini" ]              && fail "certificates/vps-nether.ini не найден"
  [ ! -f "$SCRIPT_DIR/servers/docker-compose.nl.yaml" ]           && fail "servers/docker-compose.nl.yaml не найден"
  [ ! -f "$SCRIPT_DIR/servers/.env" ]                             && fail "servers/.env не найден"

  log "Создаём директорию $VPS_DIR_NL..."
  ssh -i "$VPS_KEY_NL" "$VPS_USER_NL@$VPS_HOST_NL" "mkdir -p $VPS_DIR_NL/hysteria"

  log "Копируем hysteria конфиг и docker-compose..."
  scp -i "$VPS_KEY_NL" "$SCRIPT_DIR/servers/config.yaml"                    "$VPS_USER_NL@$VPS_HOST_NL:$VPS_DIR_NL/hysteria/config.yaml"
  scp -i "$VPS_KEY_NL" "$SCRIPT_DIR/servers/docker-compose.nl.yaml"         "$VPS_USER_NL@$VPS_HOST_NL:$VPS_DIR_NL/docker-compose.yaml"
  scp -i "$VPS_KEY_NL" "$SCRIPT_DIR/servers/.env"                           "$VPS_USER_NL@$VPS_HOST_NL:$VPS_DIR_NL/.env"

  log "Копируем Cloudflare токен..."
  ssh -i "$VPS_KEY_NL" "$VPS_USER_NL@$VPS_HOST_NL" "mkdir -p ~/.secrets && chmod 700 ~/.secrets"
  scp -i "$VPS_KEY_NL" "$SCRIPT_DIR/certificates/vps-nether.ini" "$VPS_USER_NL@$VPS_HOST_NL:~/.secrets/cloudflare-vps.ini"
  ssh -i "$VPS_KEY_NL" "$VPS_USER_NL@$VPS_HOST_NL" "chmod 600 ~/.secrets/cloudflare-vps.ini"

  log "Проверяем Docker..."
  ssh -i "$VPS_KEY_NL" "$VPS_USER_NL@$VPS_HOST_NL" '
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

  log "Проверяем сертификат для nl.stdoq.ru..."
  ssh -i "$VPS_KEY_NL" "$VPS_USER_NL@$VPS_HOST_NL" '
    CERT_PATH="/etc/letsencrypt/live/nl.stdoq.ru/fullchain.pem"
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
        -d nl.stdoq.ru \
        --email st.stanislove@yandex.ru \
        --agree-tos --no-eff-email \
        --non-interactive
      echo "  -> Сертификат получен ✓"
    else
      echo "  -> Сертификат актуален, пропускаем ✓"
    fi
  '

  log "Запускаем hysteria..."
  ssh -i "$VPS_KEY_NL" "$VPS_USER_NL@$VPS_HOST_NL" "
    cd $VPS_DIR_NL
    docker compose -f docker-compose.yaml pull
    docker compose -f docker-compose.yaml up -d --force-recreate hysteria
    docker image prune -f
  "

  echo ""
  echo "---- Статус контейнеров ----"
  ssh -i "$VPS_KEY_NL" "$VPS_USER_NL@$VPS_HOST_NL" "docker ps --filter name=hysteria --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

  echo ""
  echo "---- Логи hysteria (последние 20 строк) ----"
  ssh -i "$VPS_KEY_NL" "$VPS_USER_NL@$VPS_HOST_NL" "docker logs hysteria --tail=20"

  log "Nether VPS задеплоен ✓"
}

# ----------------------------------------------------
# ДЕПЛОЙ VPS Germany (hysteria)
# ----------------------------------------------------
deploy_vps_ge() {
  echo ""
  echo "-------------------------------------------"
  echo "    Деплой -> Germany VPS"
  echo "-------------------------------------------"

  [ ! -f "$SCRIPT_DIR/certificates/vps-german.ini" ]              && fail "certificates/vps-german.ini не найден"
  [ ! -f "$SCRIPT_DIR/servers/docker-compose.ge.yaml" ]           && fail "servers/docker-compose.ge.yaml не найден"
  [ ! -f "$SCRIPT_DIR/servers/.env" ]                             && fail "servers/.env не найден"

  log "Создаём директорию $VPS_DIR_GE..."
  ssh -i "$VPS_KEY_GE" "$VPS_USER_GE@$VPS_HOST_GE" "mkdir -p $VPS_DIR_GE/hysteria"

  log "Копируем hysteria конфиг и docker-compose..."
  scp -i "$VPS_KEY_GE" "$SCRIPT_DIR/servers/config.yaml"                    "$VPS_USER_GE@$VPS_HOST_GE:$VPS_DIR_GE/hysteria/config.yaml"
  scp -i "$VPS_KEY_GE" "$SCRIPT_DIR/servers/docker-compose.ge.yaml"         "$VPS_USER_GE@$VPS_HOST_GE:$VPS_DIR_GE/docker-compose.yaml"
  scp -i "$VPS_KEY_GE" "$SCRIPT_DIR/servers/.env"                           "$VPS_USER_GE@$VPS_HOST_GE:$VPS_DIR_GE/.env"

  log "Копируем Cloudflare токен..."
  ssh -i "$VPS_KEY_GE" "$VPS_USER_GE@$VPS_HOST_GE" "mkdir -p ~/.secrets && chmod 700 ~/.secrets"
  scp -i "$VPS_KEY_GE" "$SCRIPT_DIR/certificates/vps-german.ini" "$VPS_USER_GE@$VPS_HOST_GE:~/.secrets/cloudflare-vps.ini"
  ssh -i "$VPS_KEY_GE" "$VPS_USER_GE@$VPS_HOST_GE" "chmod 600 ~/.secrets/cloudflare-vps.ini"

  log "Проверяем Docker..."
  ssh -i "$VPS_KEY_GE" "$VPS_USER_GE@$VPS_HOST_GE" '
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

  log "Проверяем сертификат для ge.stdoq.ru..."
  ssh -i "$VPS_KEY_GE" "$VPS_USER_GE@$VPS_HOST_GE" '
    CERT_PATH="/etc/letsencrypt/live/ge.stdoq.ru/fullchain.pem"
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
        -d ge.stdoq.ru \
        --email st.stanislove@yandex.ru \
        --agree-tos --no-eff-email \
        --non-interactive
      echo "  -> Сертификат получен ✓"
    else
      echo "  -> Сертификат актуален, пропускаем ✓"
    fi
  '

  log "Запускаем hysteria..."
  ssh -i "$VPS_KEY_GE" "$VPS_USER_GE@$VPS_HOST_GE" "
    cd $VPS_DIR_GE
    docker compose -f docker-compose.yaml pull
    docker compose -f docker-compose.yaml up -d --force-recreate hysteria
    docker image prune -f
  "

  echo ""
  echo "---- Статус контейнеров ----"
  ssh -i "$VPS_KEY_GE" "$VPS_USER_GE@$VPS_HOST_GE" "docker ps --filter name=hysteria --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

  echo ""
  echo "---- Логи hysteria (последние 20 строк) ----"
  ssh -i "$VPS_KEY_GE" "$VPS_USER_GE@$VPS_HOST_GE" "docker logs hysteria --tail=20"

  log "Germany VPS задеплоен ✓"
}

# ----------------------------------------------------
# ТОЧКА ВХОДА
# ----------------------------------------------------
case "${1}" in
  yc)      deploy_yc ;;
  vps-se)  deploy_vps_se ;;
  vps-nl)  deploy_vps_nl ;;
  vps-ge)  deploy_vps_ge ;;
  *)
    echo "Использование: ./deploy.sh [yc|vps-se|vps-nl|vps-ge]"
    exit 1
    ;;
esac

echo ""
log "Деплой завершён ✓"