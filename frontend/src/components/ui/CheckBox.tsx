import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/cn";

// -------------------------------------------------------------
// Компонент Checkbox
// Базируется на Radix UI Checkbox Primitive.
// -------------------------------------------------------------

/**
 * Кастомный чекбокс с поддержкой состояний (checked, disabled, invalid).
 * Использует Tailwind CSS для стилизации и Lucide React для иконки галочки.
 */
function Checkbox({
    className,
    ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(
                // Базовые стили и цвета границ
                "peer border-input dark:bg-input/30",
                // Стили для активного состояния (выбрано)
                "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary",
                // Стили фокуса и доступности
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                // Стили для состояния ошибки
                "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
                // Размеры, скругления и анимации
                "size-4 shrink-0 rounded-lg border shadow-xs transition-shadow outline-none",
                // Состояние заблокированного элемента
                "disabled:cursor-not-allowed disabled:opacity-50",
                className,
            )}
            {...props}
        >
            {/* Индикатор выбора (появляется при checked) */}
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="flex items-center justify-center text-current transition-none"
            >
                <CheckIcon className="size-3.5" />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

export { Checkbox };
