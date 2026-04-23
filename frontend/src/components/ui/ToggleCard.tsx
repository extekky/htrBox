import { cn } from "@/lib/cn";

// -------------------------------------------------------------
// Свойства компонента ToggleCard
// -------------------------------------------------------------

export interface ToggleCardProps {
  /** Текст метки, отображаемый в карточке. */
  label: string;
  /** Описание, отображаемое под меткой. */
  description: string;
  /** Текущее состояние переключателя (включено/выключено). */
  checked: boolean;
  /** Функция обратного вызова, вызываемая при изменении состояния. */
  onChange: (v: boolean) => void;
}

// -------------------------------------------------------------
// Компонент ToggleCard
// Переключаемая карточка для булевых полей.
// Используется в модальных окнах создания/редактирования пользователей и серверов
// для полей "разрешено" и "активно".
//
// Визуальные состояния:
// - Выбрано   -> основная граница + светлый основной фон
// - Не выбрано -> нейтральная граница + эффект при наведении
// -------------------------------------------------------------

/**
 * Компонент `ToggleCard` представляет собой кликабельную карточку-переключатель
 * для булевых полей, таких как "разрешено" или "активно".
 *
 * @param {ToggleCardProps} props - Свойства компонента.
 * @param {string} props.label - Основная метка карточки.
 * @param {string} props.description - Дополнительное описание карточки.
 * @param {boolean} props.checked - Определяет, находится ли карточка в активном состоянии.
 * @param {(v: boolean) => void} props.onChange - Обработчик события изменения состояния карточки.
 */
export function ToggleCard({
  label,
  description,
  checked,
  onChange,
}: ToggleCardProps) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center justify-between rounded-xl border px-4 py-3 cursor-pointer",
        "transition-colors select-none",
        checked
          ? "border-primary/30 bg-primary/5"
          : "border-border hover:bg-secondary/40",
      )}
    >
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div
        className={cn(
          "h-4 w-4 rounded-full border-2 transition-colors",
          checked
            ? "border-primary bg-primary"
            : "border-border bg-transparent",
        )}
      />
    </div>
  );
}
