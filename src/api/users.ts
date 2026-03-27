import { get, post, put, del } from "./client";

import type {
    UserResponse,
    CreateUserRequest,
    CreateUserResponse,
    UpdateUserRequest,
    SetRoleRequest,
    ChangePasswordRequest,
    ChangePasswordResponse,
    RegenerateHyResponse,
    RegisterRequest,
    RegisterResponse,
    UserSessionInfo,
} from "./types";

// -------------------------------------------------------------
// Администрирование — список, создание, обновление, удаление,
// управление ролями
// -------------------------------------------------------------

/**
 * Получить список всех пользователей с полной информацией.
 * Требует роль администратора.
 */
export function getUsers(): Promise<UserResponse[]> {
    return get<UserResponse[]>("/users");
}

/**
 * Создать новый аккаунт пользователя.
 * Пароль Hysteria2 (hyPassword) генерируется на сервере и возвращается в ответе.
 * Новые пользователи всегда получают роль "user".
 */
export function createUser(
    payload: CreateUserRequest,
): Promise<CreateUserResponse> {
    return post<CreateUserResponse>("/users", payload);
}

/**
 * Обновить отдельные поля существующего пользователя.
 * Доступные поля: allowed, active, expires_at, password.
 * Поля username и role через этот эндпоинт изменить нельзя — для смены роли используйте setRole().
 */
export function updateUser(
    username: string,
    payload: UpdateUserRequest,
): Promise<{ status: string }> {
    return put<{ status: string }>(
        `/users/${encodeURIComponent(username)}`,
        payload,
    );
}

/**
 * Безвозвратно удалить пользователя и все связанные данные.
 * Защита: нельзя удалить самого себя и последнего администратора.
 */
export function deleteUser(username: string): Promise<{ status: string }> {
    return del<{ status: string }>(`/users/${encodeURIComponent(username)}`);
}

/**
 * Изменить роль пользователя (admin <-> user).
 * Защита: нельзя изменить собственную роль и понизить последнего администратора.
 * Изменение вступает в силу немедленно — повторный вход не требуется.
 */
export function setRole(
    username: string,
    payload: SetRoleRequest,
): Promise<{ username: string; role: string }> {
    return post<{ username: string; role: string }>(
        `/users/${encodeURIComponent(username)}/set-role`,
        payload,
    );
}

// -------------------------------------------------------------
// Текущий пользователь — управление собственным аккаунтом
// -------------------------------------------------------------

/**
 * Получить профиль и информацию о сессии текущего авторизованного пользователя.
 * Используется для отображения профиля в реальном времени (для обеих ролей).
 * Также реэкспортируется в auth.ts для удобства.
 */
export function getMe(): Promise<UserSessionInfo> {
    return get<UserSessionInfo>("/users/me");
}

/**
 * Изменить или сбросить пароль указанного пользователя.
 * Поведение зависит от роли вызывающего:
 *   - Обычный пользователь — обязан передать текущий пароль.
 *   - Администратор        — может сбросить пароль без текущего.
 * Побочный эффект: все refresh-токены целевого пользователя аннулируются.
 */
export function changePassword(
    username: string,
    payload: ChangePasswordRequest,
): Promise<ChangePasswordResponse> {
    return post<ChangePasswordResponse>(
        `/users/${encodeURIComponent(username)}/change-password`,
        payload,
    );
}

/**
 * Сгенерировать новый случайный hyPassword для подключения через Hysteria2.
 * Предыдущие учётные данные и строка подключения немедленно аннулируются.
 * Обычный пользователь может перегенерировать только собственный пароль.
 */
export function regenerateHy(
    username: string,
): Promise<RegenerateHyResponse> {
    return post<RegenerateHyResponse>(
        `/users/${encodeURIComponent(username)}/regenerate-hy`,
    );
}

// -------------------------------------------------------------
// Публичные эндпоинты — без авторизации
// -------------------------------------------------------------

/**
 * Публичная самостоятельная регистрация пользователя.
 * Создаёт аккаунт с allowed=true, active=false —
 * перед использованием требуется ручная активация администратором.
 */
export function register(
    payload: RegisterRequest,
): Promise<RegisterResponse> {
    return post<RegisterResponse>("/users/register", payload, {
        skipAuth: true,
    });
}