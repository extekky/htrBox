import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

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
    return (
        <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
            <Dialog.Portal>
                {/* Фон */}
                <Dialog.Overlay
                    className={cn(
                        "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm",
                        "data-[state=open]:animate-in data-[state=open]:fade-in-0",
                        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
                    )}
                />

                {/* Панель содержимого */}
                <Dialog.Content
                    className={cn(
                        // Позиционирование
                        "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                        // Форма
                        "w-full bg-card border border-border rounded-xl shadow-2xl",
                        // Анимация
                        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
                        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                        "duration-150",
                        // Размер
                        SIZE_CLASS[size],
                        className,
                    )}
                >
                    {/* Заголовок */}
                    <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
                        <div>
                            <Dialog.Title className="text-sm font-semibold text-foreground leading-snug">
                                {title}
                            </Dialog.Title>
                            {description && (
                                <Dialog.Description className="text-xs text-muted-foreground mt-0.5">
                                    {description}
                                </Dialog.Description>
                            )}
                        </div>

                        <Dialog.Close
                            onClick={onClose}
                            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            <X size={15} />
                            <span className="sr-only">Close</span>
                        </Dialog.Close>
                    </div>

                    {/* Тело */}
                    <div className="px-5 py-4">{children}</div>

                    {/* Нижний колонтитул (опционально) */}
                    {footer && (
                        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
                            {footer}
                        </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
