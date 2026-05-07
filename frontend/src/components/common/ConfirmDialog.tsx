import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { styles } from "@/styles";
import {
  ModalStackProvider,
  useModalStackLayer,
} from "@/components/ui/ModalStack";

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
  /** "destructive" (красный) | "default" */
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
  const s = styles.confirmDialog;
  const { nextDepth, overlayStyle, contentStyle } = useModalStackLayer();

  return (
    <AlertDialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <ModalStackProvider depth={nextDepth}>
        <AlertDialog.Portal>
          {/* Затемнение фона (Backdrop) */}
          <AlertDialog.Overlay className={s.overlay} style={overlayStyle} />

          {/* Панель диалога */}
          <AlertDialog.Content className={s.content} style={contentStyle}>
            {/* Текстовое содержимое: заголовок и описание */}
            <div className={s.textBlock}>
              <AlertDialog.Title className={s.title}>{title}</AlertDialog.Title>
              {description && (
                <AlertDialog.Description className={s.description}>
                  {description}
                </AlertDialog.Description>
              )}
            </div>

            {/* Кнопки действий */}
            <div className={s.actions}>
              {/* Кнопка отмены — всегда безопасна */}
              <AlertDialog.Cancel asChild>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className={s.cancelBtn}
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
                    s.confirmBtnBase,
                    variant === "destructive"
                      ? s.confirmBtnDestructive
                      : s.confirmBtnDefault,
                  )}
                >
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  {confirmLabel}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </ModalStackProvider>
    </AlertDialog.Root>
  );
}
