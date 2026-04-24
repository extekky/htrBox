import { styles } from "@/styles";

// -------------------------------------------------------------
// Интерфейсы
// -------------------------------------------------------------

interface SectionCardProps {
  title: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}

const s = styles.sectionCard;

// -------------------------------------------------------------
// Компоненты секций
// -------------------------------------------------------------

/**
 * Основной контейнер для секций в админ-панели.
 * Включает заголовок с опциональным бейджем и действием, а также область контента.
 */
export function SectionCard({
  title,
  badge,
  action,
  children,
}: SectionCardProps) {
  return (
    <div className={s.root}>
      {/* Шапка секции */}
      <div className={s.header}>
        <div className={s.headLeft}>
          <span className={s.title}>{title}</span>
          {badge}
        </div>
        {action}
      </div>

      {/* Контент секции с разделителями между дочерними элементами */}
      <div className={s.body}>{children}</div>
    </div>
  );
}

/**
 * Строка внутри SectionCard.
 * Используется для отображения отдельных элементов списка с эффектом наведения.
 */
export function SectionRow({ children }: { children: React.ReactNode }) {
  return <div className={s.row}>{children}</div>;
}

/**
 * Заглушка для пустой секции.
 * Отображает центрированный текст при отсутствии данных.
 */
export function SectionEmpty({ label }: { label: string }) {
  return <div className={s.empty}>{label}</div>;
}
