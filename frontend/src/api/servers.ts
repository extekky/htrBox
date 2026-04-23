import { get, post, put, del } from "./client";
import type {
  ServerPublicResponse,
  ServerAdminResponse,
  ServerCreateResponse,
  CreateServerRequest,
  UpdateServerRequest,
} from "./types";

/**
 * Возвращает список всех зарегистрированных VPN-серверов.
 *
 * Структура ответа зависит от роли вызывающего (определяется бэкендом по токену):
 * - Неаутентифицированный или обычный пользователь -> массив ServerPublicResponse (ограниченные поля)
 * - Администратор -> массив ServerAdminResponse (полная конфигурация)
 *
 * Используйте getServersAdmin(), если вызывающий точно имеет права администратора,
 * чтобы избежать сужения union-типов в компонентах и хуках.
 */
export function getServers(): Promise<
  ServerPublicResponse[] | ServerAdminResponse[]
> {
  return get<ServerPublicResponse[] | ServerAdminResponse[]>("/servers");
}

/**
 * Админский вариант getServers() — возвращает полные данные серверов.
 *
 * Используется в панели администратора, страницах управления серверами и т.д.
 * Позволяет избежать сужения union-типа на стороне вызова.
 */
export function getServersAdmin(): Promise<ServerAdminResponse[]> {
  return get<ServerAdminResponse[]>("/servers");
}

/**
 * Регистрирует новый VPN-сервер в системе. Только для администраторов.
 *
 * Обязательные поля: country, city, ip
 * Опциональные / со значениями по умолчанию:
 *   - port: 443
 *   - label: "VPN"
 *   - protocol: "hysteria2"
 *   - hysteria_url: внутренний Docker/service URL (для связи бэкенда с сервером)
 *
 * @param data Данные для создания сервера
 */
export function createServer(
  data: CreateServerRequest,
): Promise<ServerCreateResponse> {
  return post<ServerCreateResponse>("/servers", data);
}

/**
 * Выполняет полное или частичное обновление существующего сервера. Только для администраторов.
 *
 * Все поля UpdateServerRequest опциональны — изменяются только переданные поля.
 * Бэкенд автоматически обновляет метку времени updated_at.
 *
 * @param serverId Уникальный идентификатор сервера
 * @param data Полный или частичный payload для обновления сервера
 */
export function updateServer(
  serverId: string,
  data: UpdateServerRequest,
): Promise<ServerAdminResponse> {
  const path = `/servers/${encodeURIComponent(serverId)}`;
  return put<ServerAdminResponse>(path, data);
}

/**
 * Безвозвратно удаляет сервер из реестра. Только для администраторов.
 *
 * Не удаляет связанные исторические данные о трафике и логи.
 * Активные подключения не отключаются автоматически
 * (при необходимости используйте kickUsers).
 *
 * @param serverId Уникальный идентификатор удаляемого сервера
 */
export function deleteServer(serverId: string): Promise<{ message: string }> {
  const path = `/servers/${encodeURIComponent(serverId)}`;
  return del<{ message: string }>(path);
}
