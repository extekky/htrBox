import { z } from "zod";

// -------------------------------------------------------------
// Переиспользуемые схемы полей
// -------------------------------------------------------------

const usernameSchema = z
    .string()
    .min(1, "Введите имя пользователя")
    .max(64, "Не более 64 символов")
    .regex(
        /^[a-zA-Z0-9_]+$/,
        "Только латинские буквы, цифры и подчёркивание (_)",
    );

const passwordSchema = z
    .string()
    .min(8, "Минимум 8 символов")
    .max(128, "Не более 128 символов");

const passwordOptionalSchema = z
    .string()
    .max(128, "Не более 128 символов")
    .optional()
    .or(z.literal(""));

const expiresAtSchema = z
    .string()
    .nullable()
    .optional()
    .or(z.literal(""));

// -------------------------------------------------------------
// Логин
// -------------------------------------------------------------

export const loginSchema = z.object({
    username: usernameSchema,
    // Ограничение по длине пароля не ставим — валидация лежит на бэкенде.
    // Если поставить .min(8) здесь, пользователи со старыми короткими паролями не смогут войти.
    password: z.string().min(1, "Введите пароль"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// -------------------------------------------------------------
// Публичная регистрация
// -------------------------------------------------------------

export const registerSchema = z
    .object({
        username: usernameSchema,
        password: passwordSchema,
        confirm_password: z.string().min(1, "Подтвердите пароль"),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: "Пароли не совпадают",
        path: ["confirm_password"],
    });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// -------------------------------------------------------------
// Админ: Создание нового пользователя
// -------------------------------------------------------------

export const createUserSchema = z.object({
    username: usernameSchema,
    password: passwordSchema,
    allowed: z.boolean(),
    active: z.boolean(),
    expires_at: expiresAtSchema,
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

// -------------------------------------------------------------
// Админ: Обновление существующего пользователя 
// (PATCH — большинство полей опциональны)
// -------------------------------------------------------------

export const updateUserSchema = z.object({
    // username не редактируется в UI и не отправляется на API
    password: passwordOptionalSchema,
    allowed: z.boolean(),
    active: z.boolean(),
    expires_at: expiresAtSchema,
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

// -------------------------------------------------------------
// Смена пароля (самостоятельно пользователем или администратором)
// Для пользователя требуется текущий пароль, для админа — нет
// -------------------------------------------------------------

export const changePasswordSchema = z
    .object({
        password: z.string().optional().or(z.literal("")), // текущий пароль (только для пользователя)
        new_password: passwordSchema,
        confirm_password: z.string().min(1, "Подтвердите пароль"),
        apply_hy: z.boolean().default(false),
    })
    .refine((data) => data.new_password === data.confirm_password, {
        message: "Пароли не совпадают",
        path: ["confirm_password"],
    });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// -------------------------------------------------------------
// Админ: Создание нового сервера
// -------------------------------------------------------------

export const createServerSchema = z.object({
    country: z
        .string()
        .min(1, "Введите страну")
        .max(64, "Не более 64 символов"),
    city: z
        .string()
        .min(1, "Введите город")
        .max(64, "Не более 64 символов"),
    ip: z
        .string()
        .min(1, "Введите IP-адрес")
        .regex(
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
            "Неверный формат IPv4 (пример: 192.168.1.1)",
        ),
    domain: z
        .string()
        .max(253, "Не более 253 символов")
        .regex(
            /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|)$/,
            "Неверный формат домена",
        )
        .optional()
        .or(z.literal("")),
    port: z
        .number({ error: "Порт должен быть числом" })
        .int("Порт должен быть целым числом")
        .min(1, "Порт: 1–65535")
        .max(65535, "Порт: 1–65535"),
    label: z.string().max(64, "Не более 64 символов").optional().or(z.literal("")),
    protocol: z.string().max(32).optional().or(z.literal("")),
    active: z.boolean(),
    hysteria_url: z
        .string()
        .max(512, "Не более 512 символов")
        .url({ message: "Неверный формат URL" })
        .optional()
        .or(z.literal("")),
});

export type CreateServerFormValues = z.infer<typeof createServerSchema>;

// -------------------------------------------------------------
// Админ: Обновление сервера (PATCH — частичное обновление)
// IP, страна и город остаются обязательными для удобства формы
// -------------------------------------------------------------

export const updateServerSchema = createServerSchema.partial().extend({
    country: z.string().min(1, "Введите страну").max(64),
    city: z.string().min(1, "Введите город").max(64),
    ip: z
        .string()
        .min(1, "Введите IP-адрес")
        .regex(
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
            "Неверный формат IPv4",
        ),
});

export type UpdateServerFormValues = z.infer<typeof updateServerSchema>;