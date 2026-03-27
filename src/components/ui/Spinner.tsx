import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { type ComponentPropsWithoutRef } from "react";

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

/**
 * Анимированный индикатор загрузки на базе иконки Loader2.
 *
 * @example
 * <Spinner size="lg" className="text-primary" />
 */
function Spinner({ className, size = "md", ...props }: SpinnerProps) {
    const sizeMap = {
        sm: "size-4",
        md: "size-5",
        lg: "size-6",
        xl: "size-8",
    };

    return (
        <Loader2
            role="status"
            aria-label="Загрузка"
            className={cn(sizeMap[size], "animate-spin", className)}
            {...props}
        />
    );
}

export { Spinner };