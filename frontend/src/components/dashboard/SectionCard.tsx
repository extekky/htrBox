import { styles } from "@/styles";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

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
    <Card className={s.root}>
      {/* Шапка секции */}
      <CardHeader className={s.header}>
        <div className={s.headLeft}>
          <span className={s.title}>{title}</span>
          {badge}
        </div>
        {action}
      </CardHeader>

      {/* Контент секции с разделителями между дочерними элементами */}
      <CardContent className={s.body}>{children}</CardContent>
    </Card>
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
