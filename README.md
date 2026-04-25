# htrBox

Панель управления Hysteria 2 с разделением ролей, управлением пользователями и серверами, генерацией клиентских URL и сбором статистики трафика.

Проект состоит из:

- `backend` — FastAPI + PostgreSQL API для аутентификации, админки и сбора трафика
- `frontend` — React 19 + Vite + TypeScript интерфейс для администратора и пользователей
- `hysteria` — локальная конфигурация Hysteria 2 для разработки
- `prod` — production-compose конфиги для инфраструктуры и серверов

## Возможности

- аутентификация через JWT access token + refresh cookie
- роли `admin` и `user`
- управление VPN-пользователями: создание, регистрация, блокировка, активация, смена пароля, регенерация `hyPassword`
- управление серверами Hysteria 2: добавление, редактирование, деактивация, удаление
- генерация `hysteria2://` URL для подключения клиента
- дашборд администратора: пользователи, онлайн, серверы, истекающие подписки
- профиль пользователя: статус аккаунта, трафик, срок действия, выбор сервера
- сбор и агрегация трафика по 5-минутным бакетам
- rate limiting для чувствительных endpoints
- healthcheck и базовые security headers

## Стек

### Backend

- Python 3.11
- FastAPI
- PostgreSQL
- psycopg2
- bcrypt
- PyJWT
- httpx

### Frontend

- React 19
- TypeScript
- Vite
- TanStack Query
- Zustand
- React Hook Form + Zod
- Tailwind CSS v4
- Radix UI
- Recharts

## Архитектура

```text
Frontend (Vite, :5173)
        |
        | /api
        v
Backend (FastAPI, :8000)
        |
        +--> PostgreSQL (:5432)
        |
        +--> Hysteria management API (:8080)
```

В dev-режиме frontend проксирует `/api/*` в backend через `frontend/vite.config.ts`.

## Структура репозитория

```text
.
├── backend/
│   ├── source/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   └── routers/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── stores/
│   │   └── styles/
│   ├── Dockerfile
│   └── package.json
├── hysteria/
├── prod/
├── docker-compose.yaml
└── .env
```

## Быстрый старт через Docker Compose

Это основной и самый простой способ поднять проект локально.

### 1. Подготовьте переменные окружения

В корне проекта нужен `.env`. Минимально важные переменные:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change_me
JWT_SECRET=replace_with_long_random_secret_at_least_32_chars
HYSTERIA_AUTH=Bearer change_me

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=htrbox

ALLOWED_ORIGINS=http://localhost:5173
COOKIE_SECURE=false
DOCS_ENABLED=true
```

Полный список переменных и значений по умолчанию смотрите в `backend/source/config.py`.

Не храните реальные production-секреты в репозитории.

Для локального Hysteria также используются:

- `hysteria/.env`
- `hysteria/config.yaml`
- сертификаты в `hysteria/certs/`

### 2. Запустите сервисы

```bash
docker compose up --build
```

Поднимутся:

- `postgres` — база данных
- `backend` — FastAPI API на `http://localhost:8000`
- `frontend` — Vite dev server на `http://localhost:5173`
- `hysteria` — локальный Hysteria server

### 3. Откройте приложение

- frontend: `http://localhost:5173`
- backend healthcheck: `http://localhost:8000/health`
- Swagger UI: `http://localhost:8000/docs` при `DOCS_ENABLED=true`

## Ручной запуск без Docker

Возможен, но менее удобен, чем Compose.

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd source
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

Важно: текущий `frontend/vite.config.ts` проксирует API на хост `backend`, то есть на имя docker-сервиса. Если запускать frontend вне Docker, прокси для `/api` нужно либо адаптировать под `localhost:8000`, либо запускать frontend внутри Compose.

## Основные страницы

### Для администратора

- `/admin` — дашборд
- `/users` — управление пользователями
- `/servers` — управление серверами
- `/settings` — настройки аккаунта

### Для пользователя

- `/profile` — профиль, статус, трафик, сервер, ссылка подключения
- `/manual` — инструкция/онбординг
- `/chekavo` — дополнительная пользовательская страница
- `/settings` — настройки аккаунта

### Публичные

- `/login`
- `/register`

## Основные API-группы

- `/auth` — логин, refresh, logout, Hysteria auth callback
- `/users` — пользователи и self-service сценарии
- `/servers` — список и управление серверами
- `/traffic` — трафик по пользователям и серверам
- `/kick`, `/online`, `/generate-url/{username}` — Hysteria-интеграция
- `/health` — healthcheck

## Что происходит при старте backend

При запуске приложение:

- инициализирует PostgreSQL connection pool
- создаёт таблицы, если они отсутствуют
- создаёт первого администратора из `ADMIN_USERNAME` и `ADMIN_PASSWORD`
- запускает cleanup rate limiter
- запускает traffic collector
- запускает maintenance worker

## Безопасность и важные замечания

- access token хранится на клиенте в памяти
- refresh token хранится в `HttpOnly` cookie
- роль пользователя читается из базы на каждом запросе, поэтому смена роли применяется сразу
- для production рекомендуется `COOKIE_SECURE=true`
- `/docs` и `/redoc` выключены по умолчанию и открываются через `DOCS_ENABLED=true`
- в `backend/source/database.py` отдельно задокументировано, почему `hyPassword` хранится в открытом виде: это отдельный VPN-секрет, а не пароль аккаунта

## Production-конфиги

В репозитории есть отдельные compose-файлы для production-развёртывания:

- `prod/infra/docker-compose.yaml`
- `prod/servers/docker-compose.*.yaml`

Они отделены от локального `docker-compose.yaml`, который предназначен именно для разработки.

## Полезные директории для разработки

- `backend/source/routers` — HTTP endpoints
- `backend/source/schemas.py` — Pydantic-схемы API
- `frontend/src/pages` — страницы приложения
- `frontend/src/components` — UI и бизнес-компоненты
- `frontend/src/api` — клиентские API-обёртки
- `frontend/src/hooks` — data-fetching и прикладные хуки
- `frontend/src/stores` — Zustand stores
- `frontend/src/styles` — централизованные токены и стили

## Команды

### Frontend

```bash
cd frontend
npm run dev
npm run build
```

### Backend

```bash
cd backend/source
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Дальше

Если вы только знакомитесь с проектом, безопасный порядок такой:

1. Поднять стек через `docker compose up --build`
2. Проверить `http://localhost:8000/health`
3. Открыть `http://localhost:5173`
4. Войти под администратором из `.env`
5. Добавить первый сервер через `/servers`
6. Создать тестового пользователя и проверить генерацию URL
