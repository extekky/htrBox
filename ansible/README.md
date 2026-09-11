# Ansible

Небольшая дока по Ansible части проекта.

## TLDR;

В первый раз ставим все зависимости:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
ansible-galaxy collection install -r ansible/requirements.yml
```

Деплой на CORE сервер:
```bash
ansible-playbook ansible/deploy-core.yml \
  -i ansible/inventory.yml \
  --limit "master:localhost" \
  --tags deploy
```

Деплой на VPS'ки:
```bash
ansible-playbook ansible/deploy-nodes.yml \
  -i ansible/inventory.yml \
  --limit "vps_se:localhost" \
  --tags deploy
```

Что здесь происходит:

- `ansible/deploy-core.yml` — playbook для развёртывания core сервера.
- `-i ansible/inventory.yml` — путь до инвентаря.
- `--limit "master:loalhost"` — ограничиваем выполнение конкретным хостом (см ниже).
- `--tags deploy` — выполняем только таски, помеченные тегом `deploy`.
- `-v` — verbose mode, подробный вывод для отладки.

## Основные playbook'и

1. `deploy-core.yml` — playbook для выкладки обновлений на core сервер, который обрабатывает авторизацию клиентов и выполняет остальную рутинную работу.
2. `deploy-nodes.yml` — playbook для обновления нод, которые позволяют пользователям выходить в интернет под IP default gateway интерфейса.

## Файлы и директории, специфичные для Ansible

1. `inventory.yml` — первый файл, на который стоит обратить внимание при изучении ansible директории. Описывает хосты и их группировку по ролям (core, nodes и т.д.).
2. `group_vars` — директория для объявления общих переменных для конкретной группы нод (`all.yml` — общие для всех, `core.yml` и `nodes.yml` — специфичные для соответствующих групп).
3. `tasks` — папка с переиспользуемыми тасками (аналог функций -> позволяют упростить основной playbook), которые подключаются в playbook'и через `include_tasks`/`import_tasks`.
4. `templates` — директория с Jinja2 шаблонами (`.j2`), на основе которых генерируются конфигурационные и прочие файлы, подставляя значения из переменных Ansible.
5. `requirements.yml` — список внешних ролей и коллекций, которые нужно установить перед первым запуском:

```bash
ansible-galaxy install -r requirements.yml
```

6. `pull_secrets.py` — скрипт, который тянет секреты из Cloud.ru Secret Manager и пишет их в YAML-файл для `include_vars`. Подробно описан ниже, в разделе про секреты.

Также в проекте есть файл `ansible.cfg`, который задаёт формат вывода логов и прочие настройки, специфичные для каждого deploy (например, путь до inventory по умолчанию, стратегию выполнения, таймауты и т.д.).

## Секреты: откуда они берутся при деплое

Раньше секреты (`EMAIL`, `JWT_SECRET`, `POSTGRES_PASSWORD` и т.д.) передавались вручную через `export` в терминале перед запуском `ansible-playbook`. Сейчас это делать не нужно — секреты подтягиваются автоматически через [Cloud Secret Manager](https://cloud.ru/docs/scsm/ug/index).

### Как это работает

`deploy-core.yml` начинается с отдельного play `Pull secrets from Cloud.ru Secret Manager`, который выполняется на `localhost` (то есть на машине, откуда запускается Ansible):

1. Запускается `pull_secrets.py` — он логинится в [Cloud](https://cloud.ru), получает список всех секретов проекта, их последние версии и значения, и пишет результат в файл `secrets.yml` **в корне проекта** (не в `ansible/`).
2. `include_vars` читает этот файл и кладёт значения в переменные хоста `localhost`.
3. Файл `secrets.yml` сразу удаляется — секрет физически лежит на диске доли секунды, между записью и чтением. Удаление обёрнуто в `block/always`, так что файл удалится даже если что-то из шагов выше упадёт с ошибкой.

Во втором play (`Deploy CORE`) секреты читаются не через `lookup('env', ...)`, а через `hostvars['localhost']['VAR_NAME']` — то есть из того, что получил первый play. Переменные, которые не являются секретами из облака (например `IMAGE_TAG`, `MONITORING_HOST`, `GRAFANA_ADMIN_USER` — у них есть разумные дефолты), по-прежнему читаются через `lookup('env', ...)`.

`pull_secrets.py` в свою очередь читает ключи доступа к самому Cloud.ru (`PRIVATE_KEY_ID`, `PRIVATE_SECRET_ID`, `PRODUCT_INSTANCE_ID`) из файла `ansible/.env` (он в `.gitignore`, в репозитории его нет).

### Важно: `--limit` должен включать `localhost`

Сбор секретов выполняется на `localhost`. Если запустить плейбук без `localhost`, Ansible отфильтрует play со сбором секретов целиком (`skipping: no hosts matched`), переменные не подтянутся, и деплой упадёт на проверке `assert` с ошибкой вида `'HostVars' has no attribute 'EMAIL'`.

Поэтому `--limit` для `deploy-core.yml` всегда должен выглядеть так:

```bash
--limit "master:localhost"
```

### Проверить, что секреты подтягиваются, вручную

Можно запустить `pull_secrets.py` напрямую, без Ansible, чтобы проверить, что ключи в `.env` рабочие и все нужные секреты существуют в Cloud.ru:

```bash
cd ansible
source ansible_venv/bin/activate
python pull_secrets.py --output /tmp/test_secrets.yml
cat /tmp/test_secrets.yml
rm /tmp/test_secrets.yml
```

### Dry run перед реальным запуском

Перед боевым запуском хорошим тоном является прогнать playbook в dry run режиме, чтобы увидеть, какие изменения будут применены, не трогая при этом реальную инфраструктуру:

```bash
ansible-playbook ansible/deploy-nodes.yml \
  -i ansible/inventory.yml \
  --limit vps_se \
  --tags deploy \
  --check \
  --diff \
  -v
```

- `--check` — запускает playbook в режиме симуляции: Ansible сообщает, какие таски были бы выполнены и что изменилось бы, но не применяет изменения на хосте.
- `--diff` — вместе с `--check` показывает построчный diff для файлов и шаблонов, которые были бы изменены (например, сгенерированные `.env` или `docker-compose` файлы из `templates/`).

Важно помнить, что не все модули корректно поддерживают `--check` (особенно таски, которые выполняют произвольные команды через `command`/`shell`), поэтому dry run стоит рассматривать как дополнительную проверку, а не как гарантию полной безопасности запуска.

### Проверка охвата: какие хосты и таски подхватятся

Перед запуском также полезно убедиться, что playbook с текущими `-i` и `--limit` заденет именно те хосты, которые вы ожидаете, и подхватит именно те таски, которые нужны. Для этого не обязательно ничего выполнять на хостах — Ansible умеет просто вывести список:

```bash
ansible-playbook ansible/deploy-nodes.yml \
  -i ansible/inventory.yml \
  --limit vps_se \
  --tags deploy \
  --list-hosts \
  --list-tasks
```

- `--list-hosts` — выводит список хостов из инвентаря, которые попадают под текущий `--limit` (и другие условия отбора, если они есть). Полезно, чтобы случайно не задеть лишнюю ноду или, наоборот, не забыть какую-то из группы.
- `--list-tasks` — выводит список тасок, которые будут выполнены, с учётом фильтрации по `--tags`/`--skip-tags`. Показывает таски из самого playbook'а и из подключённых через `tasks/` файлов, но ничего не запускает на хостах.

Обе опции можно использовать вместе или по отдельности, и они безопасны в том смысле, что не устанавливают соединение с хостами для выполнения тасок — только для резолва инвентаря. Если нужно также посмотреть, какие теги вообще определены в playbook'е, можно использовать `--list-tags`:

```bash
ansible-playbook ansible/deploy-nodes.yml \
  -i ansible/inventory.yml \
  --list-tags
```
