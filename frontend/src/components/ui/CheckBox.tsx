import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { styles } from "@/styles";

// -------------------------------------------------------------
// Компонент Checkbox
// Базируется на Radix UI Checkbox Primitive.
// -------------------------------------------------------------

const s = styles.checkbox;

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
        s.root,
        s.checked,
        s.focus,
        s.invalid,
        s.disabled,
        className,
      )}
      {...props}
    >
      {/* Индикатор выбора (появляется при checked) */}
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={s.indicator}
      >
        <CheckIcon className={s.icon} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
