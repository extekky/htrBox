import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DEFAULT_TOAST_DURATION } from "@/lib/constants";
import { useToastStore } from "@/stores/toastStore";
import type { ToastItem, ToastVariant } from "@/stores/toastStore";
import { cn } from "@/lib/cn";
import { styles } from "@/styles";

const s = styles.toaster;

// -------------------------------------------------------------
// Стили по вариантам — фон, рамка, цвет текста
// Палитра совпадает с токенами из getAccountStatus (@/lib/utils)
// -------------------------------------------------------------

const VARIANT_ROOT: Record<ToastVariant, string> = {
  default: s.variantDefault,
  destructive: s.variantDestructive,
  success: s.variantSuccess,
};

// Прогресс-бар внизу тоста
const VARIANT_PROGRESS: Record<ToastVariant, string> = {
  default: s.progressDefault,
  destructive: s.progressDestructive,
  success: s.progressSuccess,
};

// -------------------------------------------------------------
// ToastViewport — точка монтирования уведомлений в DOM
// -------------------------------------------------------------

function ToastViewport() {
  return <ToastPrimitives.Viewport className={s.viewport} />;
}

// -------------------------------------------------------------
// ToastItem — одно уведомление
// -------------------------------------------------------------

type ToastItemProps = Required<Pick<ToastItem, "id" | "variant" | "duration">> &
  Pick<ToastItem, "title" | "description"> & { onRemove: (id: string) => void };

function ToastItem({
  id,
  title,
  description,
  variant = "default",
  duration = DEFAULT_TOAST_DURATION,
  onRemove,
}: ToastItemProps) {
  const [open, setOpen] = useState(true);
  const removeTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (removeTimerRef.current) {
        window.clearTimeout(removeTimerRef.current);
      }
    },
    [],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      removeTimerRef.current = window.setTimeout(() => onRemove(id), 220);
    }
  };

  return (
    <ToastPrimitives.Root
      open={open}
      duration={duration}
      onOpenChange={handleOpenChange}
      className={cn(s.root, s.animate, VARIANT_ROOT[variant])}
    >
      {/* Прогресс-бар (требует @keyframes shrink в глобальных стилях) */}
      <div
        className={cn(s.progress, VARIANT_PROGRESS[variant])}
        style={{ "--toast-duration": `${duration}ms` } as React.CSSProperties}
      />

      <div className={s.header}>
        {/* Текстовый блок */}
        <div className={s.body}>
          {title && (
            <ToastPrimitives.Title className={s.title}>
              {title}
            </ToastPrimitives.Title>
          )}
          {description && (
            <ToastPrimitives.Description className={s.description}>
              {description}
            </ToastPrimitives.Description>
          )}
        </div>

        {/* Кнопка закрытия */}
        <ToastPrimitives.Close
          aria-label="Закрыть уведомление"
          className={s.closeBtn}
        >
          <X className={s.closeIcon} />
        </ToastPrimitives.Close>
      </div>
    </ToastPrimitives.Root>
  );
}

// -------------------------------------------------------------
// Toaster — корневой компонент; монтируется один раз в App.tsx
// -------------------------------------------------------------

export function Toaster() {
  const { toasts, remove } = useToastStore();

  return (
    <ToastPrimitives.Provider swipeDirection="right">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant ?? "default"}
          duration={toast.duration ?? DEFAULT_TOAST_DURATION}
          onRemove={remove}
        />
      ))}
      <ToastViewport />
    </ToastPrimitives.Provider>
  );
}
