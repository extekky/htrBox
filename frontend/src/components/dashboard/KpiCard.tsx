import { cn } from "@/lib/cn";
import { styles } from "@/styles";
import { Card } from "@/components/ui/Card";

// -------------------------------------------------------------
// Интерфейсы
// -------------------------------------------------------------

interface KpiProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent?: "blue" | "green" | "red" | "amber" | "purple" | "default";
}

const s = styles.kpiCard;

// -------------------------------------------------------------
// Конфигурация акцентов
// Определяет цвета фона, границ, иконок и значений для разных типов карточек.
// -------------------------------------------------------------

const ACCENT_MAP = {
  blue: {
    bg: s.accentBlueBg,
    icon: s.accentBlueIcon,
    val: s.accentBlueValue,
  },
  green: {
    bg: s.accentGreenBg,
    icon: s.accentGreenIcon,
    val: s.accentGreenValue,
  },
  red: {
    bg: s.accentRedBg,
    icon: s.accentRedIcon,
    val: s.accentRedValue,
  },
  amber: {
    bg: s.accentAmberBg,
    icon: s.accentAmberIcon,
    val: s.accentAmberValue,
  },
  purple: {
    bg: s.accentPurpleBg,
    icon: s.accentPurpleIcon,
    val: s.accentPurpleValue,
  },
  default: {
    bg: s.accentDefaultBg,
    icon: s.accentDefaultIcon,
    val: s.accentDefaultValue,
  },
} as const;

// -------------------------------------------------------------
// Компонент карточки KPI
// -------------------------------------------------------------

/**
 * Отображает ключевой показатель эффективности (KPI) с иконкой и опциональной подписью.
 * Поддерживает различные цветовые акценты через пропс accent.
 */
export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "default",
}: KpiProps) {
  const c = ACCENT_MAP[accent];

  return (
    <Card className={cn(s.root, c.bg)}>
      <div className={s.header}>
        <span className={s.label}>{label}</span>
        <div className={cn(s.iconWrap, c.icon)}>
          <Icon size={15} />
        </div>
      </div>

      <div>
        <p className={cn(s.value, c.val)}>{value}</p>
        {/* Дополнительная информация под основным значением */}
        {sub && <p className={s.sub}>{sub}</p>}
      </div>
    </Card>
  );
}
