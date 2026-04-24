import { cn } from "@/lib/cn";
import { styles } from "@/styles";

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
  const s = styles.toggleCard;
  return (
    <div
      onClick={() => onChange(!checked)}
      className={cn(s.root, checked ? s.rootChecked : s.rootUnchecked)}
    >
      <div>
        <p className={s.label}>{label}</p>
        <p className={s.description}>{description}</p>
      </div>
      <div
        className={cn(
          s.indicator,
          checked ? s.indicatorChecked : s.indicatorUnchecked,
        )}
      />
    </div>
  );
}
