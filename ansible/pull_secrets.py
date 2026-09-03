#!/usr/bin/env python3
"""
Скрипт тянет секреты из из cloud.ru secret management
и записи их в yaml файл для последующего include_vars в ansible

Запускается из корня проекта ansible playbook (delegate_to: localhost),
читает ключи доступа из ansible/.env для создания access_token, пишет 
секреты в файл, путь к которому передаётся аргументом --output
"""

import os
import sys
import base64
import argparse

import yaml
import requests
from dotenv import load_dotenv

AUTH_URL = "https://auth.iam.cloud.ru/auth/system/openid/token"
SECRET_MANAGER_URL = "https://secretmanager.api.cloud.ru/v1/secrets"
REQUEST_TIMEOUT = 5  # секунд на запрос

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(SCRIPT_DIR, ".env")


def get_access_token(key_id: str, key_secret: str) -> str:
    """
    Получение временного токена для авторизации в облаке
    """
    payload = {
        "grant_type"    : "access_key",
        "client_id"     : key_id,
        "client_secret" : key_secret,
    }

    response = requests.post(AUTH_URL, data=payload, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()

    token = response.json().get("access_token")
    if not token:
        raise RuntimeError(f"В ответе IAM нет access_token: {response.text}")

    return token


def list_all_secrets(access_token: str, parent_id: str) -> dict:
    """
    Получение списка всех секретов
    """
    headers = {
        "Authorization" : f"Bearer {access_token}",
        "Content-Type"  : "application/json",
    }
    params = {"parentId": parent_id}

    response = requests.get(
        SECRET_MANAGER_URL, headers=headers, params=params, timeout=REQUEST_TIMEOUT
    )
    response.raise_for_status()

    return response.json()


def get_secret_versions(access_token: str, secret_id: str) -> dict:
    """
    Получение списка всех версий определённого секрета
    """
    url = f"{SECRET_MANAGER_URL}/{secret_id}/versions"
    headers = {
        "Authorization" : f"Bearer {access_token}",
        "Content-Type"  : "application/json",
    }

    response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()

    return response.json()


def get_secret_value(access_token: str, secret_id: str, version: int) -> str:
    """
    Получение значения секрета по определённой версии
    """
    url = f"{SECRET_MANAGER_URL}/{secret_id}/versions/{version}/payload"
    headers = {
        "Authorization" : f"Bearer {access_token}",
        "Content-Type"  : "application/json",
    }

    response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()

    encoded_value = response.json().get("data")
    if encoded_value is None:
        raise RuntimeError(f"В ответе Secret Manager нет поля data: {response.text}")

    # Значение секрета всегда в Base64 - декодируем в обычную UTF-8 строку
    return base64.b64decode(encoded_value).decode("utf-8")


def build_secret_table(access_token: str, parent_id: str) -> dict:
    """
    Собирает { name: [id_secret, latest_version, value] } для секретов
    """
    table = {}

    secrets_data = list_all_secrets(access_token, parent_id)

    for secret in secrets_data["secrets"]:
        name = secret["name"]
        id_secret = secret["id"]

        versions = get_secret_versions(access_token, id_secret)["versions"]
        if not versions:
            raise RuntimeError(f"У секрета {name!r} ({id_secret}) нет версий")

        latest_version = max(versions, key=lambda v: v["created_at"])["id"]
        value = get_secret_value(access_token, id_secret, latest_version)

        table[name] = [id_secret, latest_version, value]

    return table


def load_required_env(*names: str) -> dict[str, str]:
    """
    Читает переданные имена переменных окружения и гарантирует,
    что все они заданы. Если чего-то не хватает — падает с кодом 1
    """
    values = {name: os.environ.get(name) for name in names}

    missing = [name for name, value in values.items() if not value]
    if missing:
        print(f"В {ENV_PATH} не заданы переменные: {', '.join(missing)}", file=sys.stderr)
        sys.exit(1)

    # На этом этапе Pylance ещё видит тип str | None — сообщаем ему явно,
    # что после проверки выше все значения гарантированно строки.
    return {name: value for name, value in values.items()}  # type: ignore[misc]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    load_dotenv(ENV_PATH)

    env = load_required_env("PRIVATE_KEY_ID", "PRIVATE_SECRET_ID", "PRODUCT_INSTANCE_ID")

    access_token = get_access_token(env["PRIVATE_KEY_ID"], env["PRIVATE_SECRET_ID"])
    table = build_secret_table(access_token, env["PRODUCT_INSTANCE_ID"])

    # Ansible include_vars ждёт плоский словарь { VAR_NAME: value },
    # поэтому из [id_secret, version, value] берём только value.
    flat_vars = {name: entry[2] for name, entry in table.items()}

    with open(args.output, "w", encoding="utf-8") as f:
        yaml.safe_dump(flat_vars, f, allow_unicode=True)


if __name__ == "__main__":
    main()