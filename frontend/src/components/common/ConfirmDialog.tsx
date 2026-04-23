import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

// -------------------------------------------------------------
// Интерфейсы
// -------------------------------------------------------------

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "destructive" (красный) | "default" (основной синий) */
  variant?: "destructive" | "default";
  loading?: boolean;
}

// -------------------------------------------------------------
// Компонент диалога подтверждения
// -------------------------------------------------------------

/**
 * Универсальное модальное окно для подтверждения важных действий.
 *
 * - Использует Radix UI Alert Dialog для доступности.
 * - Поддерживает два варианта оформления: обычный и деструктивный (для удаления).
 * - Отображает индикатор загрузки при выполнении асинхронных операций.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Подтвердить",
  cancelLabel = "Отмена",
  variant = "destructive",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialog.Portal>
        {/* Затемнение фона (Backdrop) */}
        <AlertDialog.Overlay
          className={cn(
            "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        />

        {/* Панель диалога */}
        <AlertDialog.Content
          className={cn(
            "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "duration-150 p-5 flex flex-col gap-4",
          )}
        >
          {/* Текстовое содержимое: заголовок и описание */}
          <div className="flex flex-col gap-1.5">
            <AlertDialog.Title className="text-sm font-semibold text-foreground">
              {title}
            </AlertDialog.Title>
            {description && (
              <AlertDialog.Description className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </AlertDialog.Description>
            )}
          </div>

          {/* Кнопки действий */}
          <div className="flex items-center justify-end gap-2">
            {/* Кнопка отмены — всегда безопасна */}
            <AlertDialog.Cancel asChild>
              <button
                onClick={onClose}
                disabled={loading}
                className={cn(
                  "h-8 px-3 rounded-lg text-xs font-medium",
                  "bg-secondary text-secondary-foreground",
                  "hover:bg-secondary/80 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>

            {/* Кнопка подтверждения */}
            <AlertDialog.Action asChild>
              <button
                onClick={(e) => {
                  // Предотвращаем автоматическое закрытие Radix,
                  // так как мы закрываем окно вручную после завершения действия.
                  e.preventDefault();
                  onConfirm();
                }}
                disabled={loading}
                className={cn(
                  "h-8 px-3 rounded-lg text-xs font-medium",
                  "inline-flex items-center gap-1.5",
                  "transition-colors active:scale-[0.97]",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  variant === "destructive"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15",
                )}
              >
                {loading && <Loader2 size={12} className="animate-spin" />}
                {confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
