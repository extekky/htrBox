import { getExpiryTier, formatDaysLeft } from "@/lib/formatters";

// -------------------------------------------------------------
// Базовый компонент для "пилюль" (pill-shaped badge)
// -------------------------------------------------------------

interface PillProps {
    children: React.ReactNode;
    className?: string;
}

function Pill({ children, className = "" }: PillProps) {
    return (
        <span
            className={`
        inline-flex items-center rounded-full px-2.5 py-0.5
        text-xs font-medium whitespace-nowrap border
        ${className}
      `}
        >
            {children}
        </span>
    );
}

// -------------------------------------------------------------
// Статус "Разрешён / Заблокирован"
// -------------------------------------------------------------

interface AllowedBadgeProps {
    value: boolean;
}

function AllowedBadge({ value }: AllowedBadgeProps) {
    return value ? (
        <Pill className="bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20">
            Разрешён
        </Pill>
    ) : (
        <Pill className="bg-destructive/10 text-destructive border-destructive/20">
            Заблокирован
        </Pill>
    );
}

// -------------------------------------------------------------
// Статус "Активен / Неактивен"
// -------------------------------------------------------------

interface ActiveBadgeProps {
    value: boolean;
}

function ActiveBadge({ value }: ActiveBadgeProps) {
    return value ? (
        <Pill className="bg-primary/10 text-primary border-primary/20">
            Активен
        </Pill>
    ) : (
        <Pill className="bg-muted text-muted-foreground border-muted">
            Неактивен
        </Pill>
    );
}

// -------------------------------------------------------------
// Роль пользователя (Админ / Пользователь)
// -------------------------------------------------------------

interface RoleBadgeProps {
    role: "admin" | "user";
}

function RoleBadge({ role }: RoleBadgeProps) {
    return role === "admin" ? (
        <Pill className="bg-primary/10 text-primary border-primary/20">
            Админ
        </Pill>
    ) : (
        <Pill className="bg-muted text-muted-foreground border-muted">
            Пользователь
        </Pill>
    );
}

// -------------------------------------------------------------
// Срок действия аккаунта с цветовой индикацией
// -------------------------------------------------------------

interface ExpiryBadgeProps {
    iso: string | null | undefined;
}

function ExpiryBadge({ iso }: ExpiryBadgeProps) {
    const tier = getExpiryTier(iso);
    const label = formatDaysLeft(iso);

    const styleMap: Record<typeof tier, string> = {
        none: "bg-muted text-muted-foreground border-muted",
        ok: "bg-muted text-muted-foreground border-muted",
        warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
        critical: "bg-destructive/10 text-destructive border-destructive/20",
        expired: "bg-destructive/10 text-destructive border-destructive/20",
    };

    return <Pill className={styleMap[tier]}>{label}</Pill>;
}

// -------------------------------------------------------------
// Основной публичный компонент — дискриминированный union
// -------------------------------------------------------------

/**
 * Универсальный компонент для отображения различных статусов в виде "пилюль".
 * Поддерживает: разрешён/заблокирован, активен/неактивен, роль и срок действия.
 */
export type StatusBadgeProps =
    | { type: "allowed"; value: boolean }
    | { type: "active"; value: boolean }
    | { type: "role"; role: "admin" | "user" }
    | { type: "expiry"; iso: string | null | undefined };

export function StatusBadge(props: StatusBadgeProps) {
    switch (props.type) {
        case "allowed":
            return <AllowedBadge value={props.value} />;
        case "active":
            return <ActiveBadge value={props.value} />;
        case "role":
            return <RoleBadge role={props.role} />;
        case "expiry":
            return <ExpiryBadge iso={props.iso} />;
    }
}