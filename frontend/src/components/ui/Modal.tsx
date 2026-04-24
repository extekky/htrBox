import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { styles } from "@/styles";

// -------------------------------------------------------------
// Карта размеров модального окна
// -------------------------------------------------------------

type ModalSize = "sm" | "md" | "lg";

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
};

// -------------------------------------------------------------
// Свойства компонента Modal
// -------------------------------------------------------------

interface ModalProps {
  /** Определяет, открыто ли модальное окно. */
  open: boolean;
  /** Функция обратного вызова, вызываемая при закрытии модального окна. */
  onClose: () => void;
  /** Заголовок модального окна. */
  title: string;
  /** Опциональное описание модального окна. */
  description?: string;
  /** Размер модального окна ("sm", "md", "lg"). По умолчанию "md". */
  size?: ModalSize;
  /** Содержимое нижнего колонтитула, отображаемое под основным телом модального окна. */
  footer?: React.ReactNode;
  /** Основное содержимое модального окна. */
  children: React.ReactNode;
  /** Дополнительные классы CSS для панели содержимого. */
  className?: string;
}

// -------------------------------------------------------------
// Основной компонент Modal
// Переиспользуемый диалог, построенный на Radix UI Dialog.
// Управляется через свойства `open` и `onClose` (без внутреннего `Trigger`).
// Слоты: заголовок, опциональное описание, дочерние элементы (тело), опциональный нижний колонтитул.
// Оверлей Radix можно закрыть — используйте `ConfirmDialog` для деструктивных
// действий, где случайное закрытие должно быть предотвращено.
// -------------------------------------------------------------

/**
 * Компонент `Modal` предоставляет переиспользуемое диалоговое окно.
 * Он основан на Radix UI Dialog и управляется внешними свойствами `open` и `onClose`.
 *
 * @param {ModalProps} props - Свойства компонента.
 * @param {boolean} props.open - Состояние открытия/закрытия модального окна.
 * @param {() => void} props.onClose - Обработчик закрытия модального окна.
 * @param {string} props.title - Заголовок модального окна.
 * @param {string} [props.description] - Описание модального окна.
 * @param {ModalSize} [props.size='md'] - Размер модального окна.
 * @param {React.ReactNode} [props.footer] - Содержимое нижнего колонтитула.
 * @param {React.ReactNode} props.children - Основное содержимое модального окна.
 * @param {string} [props.className] - Дополнительные классы CSS.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  children,
  className,
}: ModalProps) {
  const s = styles.modal;
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        {/* Фон */}
        <Dialog.Overlay className={s.overlay} />

        {/* Панель содержимого */}
        <Dialog.Content className={cn(s.content, SIZE_CLASS[size], className)}>
          {/* Заголовок */}
          <div className={s.header}>
            <div>
              <Dialog.Title className={s.title}>{title}</Dialog.Title>
              {description && (
                <Dialog.Description className={s.description}>
                  {description}
                </Dialog.Description>
              )}
            </div>

            <Dialog.Close onClick={onClose} className={s.closeBtn}>
              <X size={15} />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          {/* Тело */}
          <div className={s.body}>{children}</div>

          {/* Нижний колонтитул (опционально) */}
          {footer && <div className={s.footer}>{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
