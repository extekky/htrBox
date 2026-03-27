import { useAuthStore } from "@/stores/authStore";

// -------------------------------------------------------------
// Константы
// -------------------------------------------------------------

const BASE_URL = "/api";

// -------------------------------------------------------------
// Ошибка HTTP-запроса
// Бросается при любом не-2xx ответе сервера.
// Поле status позволяет обработчикам реагировать на конкретные коды.
// -------------------------------------------------------------

export class ApiRequestError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message);
        this.name = "ApiRequestError";
    }
}

// -------------------------------------------------------------
// Опции запроса
// Расширяет стандартный RequestInit:
//   body     — будет автоматически сериализован в JSON
//   skipAuth — не добавлять токен и не пытаться обновить его при 401
// -------------------------------------------------------------

export interface RequestOptions extends Omit<RequestInit, "body"> {
    body?: unknown;
    skipAuth?: boolean;
}

// -------------------------------------------------------------
// Вспомогательные функции
// -------------------------------------------------------------

/**
 * Читает тело ответа и возвращает человекочитаемое сообщение об ошибке.
 * Поддерживает строковый detail, массив ошибок валидации FastAPI и поле message.
 */
async function extractErrorMessage(res: Response): Promise<string> {
    try {
        const body = await res.json();

        if (typeof body.detail === "string") {
            return body.detail;
        }

        if (Array.isArray(body.detail)) {
            return body.detail
                .map((e: { msg?: string }) => e.msg)
                .filter(Boolean)
                .join("; ");
        }

        if (body.message) {
            return String(body.message);
        }
    } catch {
        // Ответ не является JSON — используем статус как сообщение
    }

    return res.statusText || `HTTP ${res.status}`;
}

/** Формирует заголовки запроса, при необходимости добавляя Authorization. */
function buildHeaders(
    extraHeaders: HeadersInit | undefined,
    token: string | null,
): Record<string, string> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((extraHeaders as Record<string, string>) ?? {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

/** Формирует итоговый RequestInit для fetch. */
function buildRequestInit(
    options: Omit<RequestOptions, "body" | "skipAuth">,
    body: unknown,
    token: string | null,
): RequestInit {
    return {
        ...options,
        credentials: "include",
        headers: buildHeaders(options.headers, token),
        body: body !== undefined ? JSON.stringify(body) : undefined,
    };
}

// -------------------------------------------------------------
// Основная функция запроса
// -------------------------------------------------------------

/**
 * Универсальная обёртка над fetch.
 *
 * - Автоматически добавляет Authorization-заголовок из authStore.
 * - При получении 401 пробует обновить токен и повторяет запрос.
 * - При неудачном обновлении очищает сессию и редиректит на /login.
 * - Бросает ApiRequestError при любом не-2xx ответе.
 * - 204 No Content возвращает пустой объект для единообразия типов.
 */
export async function request<T = unknown>(
    path: string,
    options: RequestOptions = {},
): Promise<T> {
    const { body, skipAuth = false, ...fetchOptions } = options;

    // Берём текущий токен из хранилища (null если skipAuth)
    const currentToken = skipAuth ? null : useAuthStore.getState().token;

    let response = await fetch(
        `${BASE_URL}${path}`,
        buildRequestInit(fetchOptions, body, currentToken),
    );

    // Автоматическое обновление токена при 401
    if (response.status === 401 && !skipAuth) {
        const newToken = await useAuthStore.getState().refreshToken();

        if (!newToken) {
            // Refresh не удался — сбрасываем сессию и отправляем на логин
            useAuthStore.getState().clearAuth();
            window.location.href = "/login";
            throw new ApiRequestError(401, "Сессия истекла — перенаправление на страницу входа");
        }

        // Повторяем оригинальный запрос с новым токеном
        response = await fetch(
            `${BASE_URL}${path}`,
            buildRequestInit(fetchOptions, body, newToken),
        );
    }

    if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new ApiRequestError(response.status, message);
    }

    // 204 No Content — возвращаем пустой объект для единообразия типов
    if (response.status === 204) {
        return {} as T;
    }

    return response.json() as Promise<T>;
}

// -------------------------------------------------------------
// Типизированные сокращения для HTTP-методов
// -------------------------------------------------------------

export const get = <T>(path: string, opts?: RequestOptions) =>
    request<T>(path, { method: "GET", ...opts });

export const post = <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { method: "POST", body, ...opts });

export const put = <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { method: "PUT", body, ...opts });

export const patch = <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { method: "PATCH", body, ...opts });

export const del = <T>(path: string, opts?: RequestOptions) =>
    request<T>(path, { method: "DELETE", ...opts });