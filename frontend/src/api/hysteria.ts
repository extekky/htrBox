import { get, post } from "./client";
import type {
    KickUsersRequest,
    GenerateUrlResponse,
    OnlineUsersResponse,
} from "./types";

/**
 * Возвращает список пользователей, подключённых в данный момент,
 * агрегированных по всем активным серверам Hysteria.
 * Только для администраторов.
 *
 * Возвращает объект, где ключи — имена пользователей, значения содержат:
 * - количество активных подключений
 * - список ID серверов, к которым подключён пользователь
 *
 * Офлайн или недоступные серверы пропускаются.
 * Данные быстро устаревают — рекомендуется инвалидировать кэш
 * при получении WebSocket-события 'online_changed'.
 */
export function getOnlineUsers(): Promise<OnlineUsersResponse> {
    return get<OnlineUsersResponse>("/online");
}

/**
 * Блокирует указанных пользователей в БД (устанавливает allowed = false)
 * и принудительно разрывает все их активные подключения Hysteria на серверах.
 * Только для администраторов.
 *
 * Блокировка в БД является авторитетной — даже если отключение не удалось,
 * пользователь не сможет переподключиться до снятия блокировки.
 * Отключение выполняется по принципу best-effort для каждого сервера;
 * недоступные серверы фиксируются в errors.
 *
 * @param usernames Массив имён пользователей для блокировки и отключения
 */
export function kickUsers(
    usernames: string[],
): Promise<{
    kicked: string[];
    blocked_in_db: number;
    kick_errors?: Array<{ server_id: string; error: string }>;
}> {
    const body: KickUsersRequest = { usernames };
    return post("/kick", body);
}

/**
 * Генерирует готовый URL подключения hysteria2:// для указанного пользователя.
 *
 * Формат: hysteria2://{username}:{password}@{host}:{port}#{label}
 *
 * Правила на стороне сервера:
 * - Администраторы могут генерировать URL для любого пользователя
 * - Обычные пользователи могут генерировать только свой URL
 *
 * @param username Имя целевого пользователя
 * @param serverId Опционально — принудительное подключение к конкретному серверу
 *                 (по умолчанию используется первый активный)
 */
export function generateUrl(
    username: string,
    serverId?: string,
): Promise<GenerateUrlResponse> {
    const query = new URLSearchParams();
    if (serverId) {
        query.append("server_id", serverId);
    }
    const qs = query.toString();
    const url = `/generate-url/${encodeURIComponent(username)}${qs ? `?${qs}` : ""}`;
    return get<GenerateUrlResponse>(url);
}

/**
 * Сбрасывает накопленный счётчик трафика пользователя (usedTraffic) до нуля.
 * Только для администраторов.
 *
 * Не удаляет исторические 5-минутные срезы трафика — сбрасывает только
 * суммарный счётчик, отображаемый в UI (например, в профиле или таблицах админа).
 *
 * @param username Пользователь, чей счётчик трафика необходимо сбросить
 */
export function resetTraffic(
    username: string,
): Promise<{ username: string; usedTraffic: number }> {
    return post<{ username: string; usedTraffic: number }>(
        `/traffic/reset/${encodeURIComponent(username)}`,
    );
}