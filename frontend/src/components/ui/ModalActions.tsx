/**
 * ModalActions — стандартная пара кнопок «Отмена / Подтвердить» для футера модального окна.
 *
 * Используется во всех формах создания и редактирования.
 * Инкапсулирует единый стиль кнопок и спиннер загрузки.
 *
 * @example
 * <Modal footer={<ModalActions formId="my-form" label="Создать" onCancel={onClose} loading={isPending} />}>
 */

interface ModalActionsProps {
    /** id формы, к которой привязана кнопка submit (form="..."). */
    formId: string;
    /** Текст кнопки подтверждения. */
    label: string;
    /** Вызывается при нажатии «Отмена». */
    onCancel: () => void;
    /** Блокирует кнопку и показывает спиннер. */
    loading?: boolean;
    /** Текст кнопки «Отмена». По умолчанию «Отмена». */
    cancelLabel?: string;
}

export function ModalActions({
    formId,
    label,
    onCancel,
    loading,
    cancelLabel = "Отмена",
}: ModalActionsProps) {
    return (
        <>
            <button
                type="button"
                onClick={onCancel}
                className="h-9 px-4 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
                {cancelLabel}
            </button>

            <button
                type="submit"
                form={formId}
                disabled={loading}
                className="h-9 px-4 rounded-lg text-sm font-medium inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {loading && (
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                )}
                {label}
            </button>
        </>
    );
}