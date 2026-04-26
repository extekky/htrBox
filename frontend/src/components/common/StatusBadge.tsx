import { cn } from "@/lib/cn";
import { styles } from "@/styles";
import { getExpiryTier, formatDaysLeft } from "@/lib/formatters";

const s = styles.statusBadge;

// -------------------------------------------------------------
// Базовый примитив для всех статусных чипов
// -------------------------------------------------------------

interface StatusChipProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  ariaLabel?: string;
  interactive?: boolean;
  iconOnly?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export function StatusChip({
  children,
  className = "",
  title,
  ariaLabel,
  interactive = false,
  iconOnly = false,
  compact = false,
  onClick,
}: StatusChipProps) {
  const chipClassName = cn(
    s.pill,
    iconOnly && s.iconOnly,
    compact && s.compact,
    interactive && s.interactive,
    className,
  );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={chipClassName}
        aria-label={ariaLabel}
        title={title}
      >
        {children}
      </button>
    );
  }

  return (
    <span className={chipClassName} aria-label={ariaLabel} title={title}>
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
    <StatusChip className={s.allowed}>Ок</StatusChip>
  ) : (
    <StatusChip className={s.danger}>Бан</StatusChip>
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
    <StatusChip className={s.primary}>Активен</StatusChip>
  ) : (
    <StatusChip className={s.neutral}>Неактивен</StatusChip>
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
    <StatusChip className={s.admin}>Админ</StatusChip>
  ) : (
    <StatusChip className={s.neutral}>Пользователь</StatusChip>
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
    none: s.neutral,
    ok: s.neutral,
    warning: s.warning,
    critical: s.danger,
    expired: s.danger,
  };

  return <StatusChip className={styleMap[tier]}>{label}</StatusChip>;
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
