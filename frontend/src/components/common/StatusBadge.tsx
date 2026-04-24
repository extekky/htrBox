import { cn } from "@/lib/cn";
import { styles } from "@/styles";
import { getExpiryTier, formatDaysLeft } from "@/lib/formatters";

const s = styles.statusBadge;

// -------------------------------------------------------------
// Базовый компонент для "пилюль" (pill-shaped badge)
// -------------------------------------------------------------

interface PillProps {
  children: React.ReactNode;
  className?: string;
}

function Pill({ children, className = "" }: PillProps) {
  return <span className={cn(s.pill, className)}>{children}</span>;
}

// -------------------------------------------------------------
// Статус "Разрешён / Заблокирован"
// -------------------------------------------------------------

interface AllowedBadgeProps {
  value: boolean;
}

function AllowedBadge({ value }: AllowedBadgeProps) {
  return value ? (
    <Pill className={s.allowed}>Ок</Pill>
  ) : (
    <Pill className={s.danger}>Бан</Pill>
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
    <Pill className={s.primary}>Активен</Pill>
  ) : (
    <Pill className={s.neutral}>Неактивен</Pill>
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
    <Pill className={s.admin}>Админ</Pill>
  ) : (
    <Pill className={s.neutral}>Пользователь</Pill>
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
