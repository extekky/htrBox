/**
 * ModalActions — стандартная пара кнопок «Отмена / Подтвердить» для футера модального окна.
 *
 * Используется во всех формах создания и редактирования.
 * Инкапсулирует единый стиль кнопок и спиннер загрузки.
 *
 * @example
 * <Modal footer={<ModalActions formId="my-form" label="Создать" onCancel={onClose} loading={isPending} />}>
 */

import { cn } from "@/lib/cn";
import { styles } from "@/styles";

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
  const s = styles.modalActions;
  return (
    <>
      <button
        type="button"
        onClick={onCancel}
        className={cn(s.btn, s.btnCancel)}
      >
        {cancelLabel}
      </button>

      <button
        type="submit"
        form={formId}
        disabled={loading}
        className={cn(s.btn, s.btnSubmit)}
      >
        {loading && <span className={s.spinner} />}
        {label}
      </button>
    </>
  );
}
