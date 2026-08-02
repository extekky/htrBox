Эта директория - конфиг для стека наблюдаемости (Prometheus + Grafana), 
который монтируется внутрь контейнеров на core-сервере. В отличие от 
`ansible/templates/`, файлы здесь коммитятся в репозиторий as-is и 
деплоятся как обычные файлы проекта.

## Структура

```
monitoring
├── grafana
│   └── provisioning
│       └── datasources
│           └── prometheus.yml
├── prometheus.yml
└── rules
```

## Как это монтируется

В `docker-compose.core.yaml.j2` (рендерится только на хосте, равном
`monitoring_host`) эта папка пробрасывается в контейнеры `prometheus` и
`grafana`:

```yaml
volumes:
  - "{{ app_dir }}/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro"
  - "{{ app_dir }}/monitoring/grafana/provisioning:/etc/grafana/provisioning:ro"
```

## Файлы

### `prometheus.yml`

Локальная/дефолтная конфигурация Prometheus. Содержит только два таргета —
`localhost:9090` (сам Prometheus) и `host.docker.internal:9100`
(node_exporter текущей машины). Подходит для локальной разработки, когда
нужно поднять стек мониторинга без реального инвентаря Ansible.

**В продакшене этот файл не используется в исходном виде.** При деплое
Ansible рендерит `ansible/templates/prometheus.yml.j2` — тот же по структуре
файл, но со списком таргетов, собранным динамически из `inventory.yml`
(все хосты групп `core` и `nodes`) — и кладёт результат по тому же пути
`{{ app_dir }}/monitoring/prometheus.yml` на сервере, перезаписывая версию
из репозитория. Поэтому файл в репозитории можно считать заглушкой/примером,
а не тем, что реально крутится на проде.

### `grafana/provisioning/datasources/prometheus.yml`

Конфиг автопровижининга Grafana. При старте контейнера Grafana сама
регистрирует Prometheus как datasource (адрес, тип, доступ) без
необходимости настраивать это руками через UI после каждого передеплоя.

## Локальный запуск

Чтобы поднять стек мониторинга локально с дефолтным `prometheus.yml`
(без реального инвентаря), достаточно поднять сервисы `prometheus` и
`grafana` из `docker-compose.core.yaml` — они увидят только node_exporter
текущей машины через `host.docker.internal:9100`.

Дефолтные креды Grafana задаются через переменные окружения
`GRAFANA_ADMIN_USER` / `GRAFANA_ADMIN_PASSWORD` в `.env`.