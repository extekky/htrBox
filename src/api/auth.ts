import { post, ApiRequestError } from "./client";
import { getMe as _getMe } from "./users";
import type {
    LoginRequest,
    LoginResponse,
    AccessTokenResponse,
} from "./types";

// -------------------------------------------------------------
// Константы
// -------------------------------------------------------------

const BASE_URL = "/api";
// const BASE_URL = import.meta.env.VITE_API_BASE || "/api";

// -------------------------------------------------------------
// Вспомогательные функции
// -------------------------------------------------------------

/**
 * Читает тело ответа и формирует человекочитаемое сообщение об ошибке.
 * Обрабатывает как строковый `detail`, так и массив ошибок валидации FastAPI.
 */
async function extractErrorMessage(response: Response): Promise<string> {
    const raw = await response.text();

    // Логируем сырой ответ, чтобы видеть что именно отклонил FastAPI
    console.error("[auth] HTTP", response.status, raw);

    try {
        const json = JSON.parse(raw);

        if (typeof json.detail === "string") {
            return json.detail;
        }

        if (Array.isArray(json.detail)) {
            return json.detail
                .map((e: { msg?: string; loc?: string[] }) => `${e.loc?.join(".")} — ${e.msg}`)
                .join("; ");
        }
    } catch {
        // Ответ не является JSON — используем статус как сообщение
    }

    return response.statusText || `HTTP ${response.status}`;
}

// -------------------------------------------------------------
// API-методы
// -------------------------------------------------------------

/**
 * Вход по логину и паролю.
 * Возвращает access-токен и данные пользователя.
 * Бросает ApiRequestError при любом не-2xx ответе.
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new ApiRequestError(response.status, message);
    }

    return response.json() as Promise<LoginResponse>;
}

/**
 * Обновляет access-токен через refresh-cookie.
 * skipAuth — не добавляет Authorization-заголовок (токена ещё нет).
 */
export function refreshToken(): Promise<AccessTokenResponse> {
    return post<AccessTokenResponse>("/auth/refresh", undefined, { skipAuth: true });
}

/** Выход — сервер инвалидирует refresh-cookie. */
export function logout(): Promise<{ ok: boolean }> {
    return post<{ ok: boolean }>("/auth/logout");
}

/**
 * Загружает текущего пользователя.
 * Возвращает null если пользователь не авторизован или запрос упал —
 * используется при инициализации приложения, чтобы не ломать загрузку.
 */
export async function getMe() {
    try {
        return await _getMe();
    } catch {
        return null;
    }
}