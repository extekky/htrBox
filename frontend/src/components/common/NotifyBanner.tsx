import { X, LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { useNotifyBanner } from "@/hooks/useNotify";
import { styles, colorScheme } from "@/styles";
import type { ColorScheme } from "@/styles";

// -------------------------------------------------------------
// Типы
// -------------------------------------------------------------

interface NotifyBannerProps {
  /** Уникальный ключ баннера — используется для хранения в sessionStorage */
  bannerId: string;
  /** Условие отображения баннера (например, !profile.active) */
  visible: boolean;
  /** Иконка из lucide-react */
  icon: LucideIcon;
  /** Заголовок */
  title: string;
  /** Подпись под заголовком */
  description?: string;
  /** Цветовая схема */
  variant?: ColorScheme;
  className?: string;
}

// -------------------------------------------------------------
// Компонент
// -------------------------------------------------------------

const s = styles.notifyBanner;

export function NotifyBanner({
  bannerId,
  visible: isEligible,
  icon: Icon,
  title,
  description,
  variant = "warning",
  className,
}: NotifyBannerProps) {
  const { visible, dismiss } = useNotifyBanner(bannerId, isEligible);
  const v = colorScheme[variant];

  if (!visible) return null;

  return (
    <div className={cn(s.root, v.bg, v.border, className)}>
      {/* Иконка */}
      <div className={cn(s.iconWrap, v.bg, v.text)}>
        <Icon size={16} />
      </div>

      {/* Текст */}
      <div className={s.body}>
        <p className={cn(s.title, v.text)}>{title}</p>

        {description && <p className={s.description}>{description}</p>}
      </div>

      {/* Крестик */}
      <button
        onClick={dismiss}
        aria-label="Закрыть"
        className={cn(s.closeBtn, v.textMuted, v.hover)}
      >
        <X size={15} />
      </button>
    </div>
  );
}
