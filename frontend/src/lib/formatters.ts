const MOSCOW_TZ = "Europe/Moscow";
const DAY_MS = 86_400_000;

// -------------------------------------------------------------
// Трафик / байты
// -------------------------------------------------------------

/**
 * Форматировать значение в гигабайтах в читаемую строку (B, KB, MB, GB, TB).
 * Возвращает "0 B" если значение пустое или некорректное.
 */
export function formatBytes(gb: number | null | undefined): string {
    const valueGb = Number(gb);
    if (!valueGb || valueGb <= 0) return "0 B";

    const bytes = valueGb * 1024 ** 3;
    const units = ["B", "KB", "MB", "GB", "TB"] as const;
    const index = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );
    const value = bytes / 1024 ** index;
    const decimals = index >= 3 ? 2 : index >= 2 ? 1 : 0;

    return `${value.toFixed(decimals)} ${units[index]}`;
}

/**
 * Форматировать гигабайты с точностью до двух знаков.
 * Пример: 1.5 -> "1.50 GB"
 */
export function formatGB(gb: number | null | undefined): string {
    return `${(Number(gb) || 0).toFixed(2)} GB`;
}

/**
 * Привести значение к числу гигабайт.
 * Возвращает 0 если значение пустое или некорректное.
 */
export function toGB(gb: number | null | undefined): number {
    return Number(gb) || 0;
}

// -------------------------------------------------------------
// Даты и время
// -------------------------------------------------------------

/**
 * Форматировать ISO-дату в короткую строку на русском языке.
 * Часовой пояс: UTC. Пример: "5 янв. 2025"
 */
export function formatDate(iso: string | null | undefined): string {
    if (!iso) return "-";
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
}

/**
 * Форматировать ISO-дату в строку времени по московскому времени.
 * Пример: "14:30"
 */
export function formatTime(iso: string | null | undefined): string {
    if (!iso) return "-";
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: MOSCOW_TZ,
    });
}

/**
 * Форматировать ISO-дату в строку с датой и временем по московскому времени.
 * Пример: "5 янв. 2025, 14:30"
 */
export function formatDateTime(iso: string | null | undefined): string {
    if (!iso) return "-";
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: MOSCOW_TZ,
    });
}

// -------------------------------------------------------------
// Срок действия / дни
// -------------------------------------------------------------

/**
 * Получить timestamp полуночи по московскому времени для указанной даты.
 * Используется для корректного подсчёта календарных дней без учёта времени.
 */
function moscowMidnightMs(date: Date): number {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: MOSCOW_TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const get = (type: string) =>
        parts.find((p) => p.type === type)?.value ?? "00";

    return new Date(
        `${get("year")}-${get("month")}-${get("day")}T00:00:00+03:00`,
    ).getTime();
}

/**
 * Вернуть количество миллисекунд до указанной даты.
 * Возвращает null если дата не задана или некорректна.
 * Отрицательное значение означает что дата уже прошла.
 */
export function msUntil(iso: string | null | undefined): number | null {
    if (!iso) return null;
    const t = new Date(iso).getTime();
    return isNaN(t) ? null : t - Date.now();
}

/**
 * Вернуть количество миллисекунд прошедших с указанной даты.
 * Возвращает null если дата не задана или некорректна.
 */
export function msAgo(iso: string | null | undefined): number | null {
    if (!iso) return null;
    const t = new Date(iso).getTime();
    return isNaN(t) ? null : Date.now() - t;
}

/**
 * Вернуть количество календарных дней до истечения срока по московскому времени.
 * Возвращает -1 если срок уже истёк, null если дата не задана.
 */
export function daysUntil(iso: string | null | undefined): number | null {
    if (!iso) return null;
    if (msUntil(iso) === null) return null;  // на случай невалидной даты

    const expiryMs = moscowMidnightMs(new Date(iso));
    const todayMs = moscowMidnightMs(new Date());

    return Math.floor((expiryMs - todayMs) / DAY_MS);
}

/**
 * Форматировать оставшееся время до истечения срока в читаемую строку.
 * Примеры: "Осталось 5 дней", "Истекает сегодня", "Истёк 2 дня назад"
 */
export function formatDaysLeft(iso: string | null | undefined): string {
    const ms = msUntil(iso);
    if (ms === null) return "Срок не установлен";

    if (ms > 0) {
        const days = daysUntil(iso)!;
        if (days === 0) return `Истекает сегодня в ${formatTime(iso)}`;
        if (days === 1) return "Истекает завтра";
        return `Осталось ${days} ${pluralize(days, "день", "дня", "дней")}`;
    }

    const days = Math.abs(daysUntil(iso)!);
    if (days === 0) return `Истёк сегодня в ${formatTime(iso)}`;
    return `Истёк ${days} ${pluralize(days, "день", "дня", "дней")} назад`;
}

/**
 * Склонение существительного в зависимости от числа по правилам русского языка.
 * Пример: pluralize(5, "день", "дня", "дней") -> "дней"
 */
function pluralize(
    count: number,
    one: string,
    few: string,
    many: string,
): string {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod100 >= 11 && mod100 <= 19) return many;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return few;
    return many;
}

// -------------------------------------------------------------
// Уровень срочности срока действия
// -------------------------------------------------------------

export type ExpiryTier = "none" | "expired" | "critical" | "warning" | "ok";

/**
 * Определить уровень срочности истечения срока.
 *
 * none     — срок не задан
 * expired  — срок истёк
 * critical — осталось 3 дня или меньше
 * warning  — осталось 7 дней или меньше
 * ok       — более 7 дней
 */
export function getExpiryTier(iso: string | null | undefined): ExpiryTier {
    const ms = msUntil(iso);
    if (ms === null) return "none";
    if (ms <= 0) return "expired";  // точная проверка по ms

    const days = daysUntil(iso)!;
    if (days <= 3) return "critical";
    if (days <= 7) return "warning";
    return "ok";
}

// -------------------------------------------------------------
// datetime-local <-> ISO (московское время)
// -------------------------------------------------------------

/**
 * Преобразовать ISO-строку в формат для input[type="datetime-local"]
 * с учётом московского часового пояса.
 * Пример: "2025-01-05T14:30"
 */
export function toInputDatetimeLocal(iso: string | null | undefined): string {
    if (!iso) return "";
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "";

    const parts = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: MOSCOW_TZ,
    }).formatToParts(date);

    const get = (type: string) =>
        parts.find((p) => p.type === type)?.value ?? "00";

    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/**
 * Преобразовать значение из input[type="datetime-local"] в ISO-строку UTC.
 * Предполагается что введённое время — московское (UTC+3).
 * Возвращает null если значение пустое или некорректное.
 */
export function fromInputDatetimeLocal(value: string): string | null {
    if (!value) return null;
    const normalized = value.length === 16 ? value + ":00" : value;
    const date = new Date(normalized + "Z");
    if (isNaN(date.getTime())) return null;

    date.setUTCHours(date.getUTCHours() - 3);
    return date.toISOString();
}

/**
 * Получить текущее московское время в формате для input[type="datetime-local"].
 */
export function nowMoscowInput(): string {
    return toInputDatetimeLocal(new Date().toISOString());
}

// -------------------------------------------------------------
// Вспомогательные утилиты для работы со временем
// -------------------------------------------------------------

export interface TimeComponents {
    hours: number;
    minutes: number;
}

/**
 * Разбить количество миллисекунд на часы и минуты.
 * Всегда возвращает неотрицательные значения (модуль).
 */
export function msToTimeComponents(ms: number): TimeComponents {
    const totalMinutes = Math.floor(Math.abs(ms) / 60_000);
    return {
        hours: Math.floor(totalMinutes / 60),
        minutes: totalMinutes % 60,
    };
}

/**
 * Форматировать компоненты времени в читаемую строку.
 * Примеры: "2 дн.", "3 ч 05 мин", "45 мин"
 */
export function formatTimeComponents({
    hours: h,
    minutes: m,
}: TimeComponents): string {
    if (h >= 24) return `${Math.floor(h / 24)} дн.`;
    if (h > 0) return `${h} ч ${String(m).padStart(2, "0")} мин`;
    return `${m} мин`;
}