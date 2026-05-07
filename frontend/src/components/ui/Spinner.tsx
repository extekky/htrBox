import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { type ComponentPropsWithoutRef } from "react";
import { styles } from "@/styles";

// -------------------------------------------------------------
// Типы
// -------------------------------------------------------------

interface SpinnerProps extends ComponentPropsWithoutRef<"svg"> {
  /** Размер спиннера — маппится на Tailwind size-классы */
  size?: "sm" | "md" | "lg" | "xl";
}

// -------------------------------------------------------------
// Компонент
// -------------------------------------------------------------

const s = styles.spinner;

/**
 * Анимированный индикатор загрузки на базе иконки Loader2.
 *
 * @example
 * <Spinner size="lg" className="text-primary" />
 */
function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-label="Загрузка"
      className={cn(s[size], s.base, className)}
      {...props}
    />
  );
}

export { Spinner };
