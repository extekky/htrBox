/**
 * pagesStls.ts
 *
 * Готовые стили для компонентов проекта.
 *
 * Использование:
 *   import { styles } from "@/styles"
 *   className={styles.profilePage.root}
 *
 * Структура каждого компонента:
 *   root      — корневой элемент
 *   [slot]    — именованные слоты внутри
 *
 * ПРАВИЛО: если ты пишешь className="" в JSX — это ошибка.
 */

import { colorScheme } from "@/styles/variants";
import { typography, radius, spacing } from "@/styles/tokens";

// -------------------------------------------------------------
// ProfilePage — страница профиля пользователя
// -------------------------------------------------------------

export const profilePage = {
  // Состояние загрузки / ошибки — центрированная обёртка
  stateWrap: "flex justify-center items-center flex-1 py-20",

  // Внутренний блок состояния ошибки
  stateInner: "flex flex-col items-center gap-3 text-center px-6",

  // Иконка состояния ошибки — круглый контейнер
  stateIconWrap: `flex items-center justify-center w-12 h-12 ${radius.full} ${colorScheme.danger.bg}`,

  // Иконка состояния ошибки — цвет
  stateIcon: colorScheme.danger.text,

  // Заголовок состояния ошибки
  stateTitle: typography.componentMd,

  // Подсказка состояния ошибки
  stateHint: typography.hintText,

  // Внешний контейнер страницы
  root: "flex justify-center py-8 px-4",

  // Внутренняя колонка с контентом
  inner: "w-full max-w-150 flex flex-col gap-4 animate-fade-in",

  // Hero-карточка — отступы + flex
  heroCard: `${spacing.cardPaddingMd} flex items-center gap-4`,

  // Hero — правая колонка
  heroContent: "flex-1 min-w-0",

  // Hero — верхняя строка (имя + дата)
  heroTop: "flex items-start justify-between gap-2",

  // Hero — группа имя + бейдж
  heroNameWrap: "flex items-center gap-2.5 flex-wrap min-w-0",

  // Hero — имя пользователя
  heroName: "text-xl font-bold text-foreground truncate",

  // Hero — бейдж статуса (цвет приходит снаружи через accountStatus.color)
  statusBadge: `text-[11px] font-semibold px-2 py-0.5 ${radius.full} border shrink-0`,

  // Hero — блок даты справа
  heroExpiry: "text-right shrink-0",

  // Hero — метка «Действует до»
  heroExpiryLabel: typography.mutedXs,

  // Hero — значение даты
  heroExpiryDate: "text-xs text-foreground mt-0.5",

  // Hero — роль пользователя
  heroRole: "text-xs text-muted-foreground mt-0.5",

  // Сетка статистики (2 колонки)
  statsGrid: "grid grid-cols-2 gap-3",

  // Карточка-плитка статистики
  statCard: `px-4 py-4 flex flex-col ${spacing.formGapSm}`,

  // Метка плитки — caps-стиль
  // tracking-wider намеренно отличается от labelCaps (tracking-widest) — меньше разрядка
  statLabel:
    "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",

  // Основное значение плитки
  statValue: "text-2xl font-bold text-foreground tabular-nums",

  // Единица измерения основного значения
  statUnit: "text-sm font-normal text-muted-foreground ml-1",

  // Подпись под основным значением (из ... GB)
  statSub: `${typography.mutedXs} mt-0.5`,

  // Строка значения подписки (иконка + число + единица)
  subValueWrap: "flex items-baseline gap-1.5",

  // Значение подписки (цвет приходит снаружи)
  subValue: "text-2xl font-bold tabular-nums leading-none",

  // Единица подписки (дн.)
  subUnit: "text-sm font-normal text-muted-foreground",

  // Подпись под значением подписки
  subValueSub: `${typography.mutedXs} mt-1`,

  // Карточка подключения — скрывает overflow для разделителя
  connectionCard: "overflow-hidden",

  // Разделитель между ConnectionCard и блоком серверов
  connectionDivider: "h-px bg-border mx-5",

  // Секция выбора сервера
  serverSection: "p-5 pt-4",

  // Заголовок блока серверов
  serverHeader: "flex items-center justify-between mb-3",

  // Метка «Сервер»
  serverLabel:
    "text-xs font-semibold uppercase tracking-wider text-muted-foreground",

  // Счётчик доступных серверов
  serverCount: typography.mutedXs,

  // Заглушка — нет серверов
  emptyState: "flex flex-col items-center gap-2 py-6 text-center",

  // Иконка заглушки
  emptyIcon: `flex items-center justify-center w-10 h-10 ${radius.md} bg-muted text-muted-foreground`,

  // Текстовый блок заглушки
  emptyText: "space-y-1",

  // Заголовок заглушки
  emptyTitle: typography.componentMd,

  // Подсказка заглушки
  emptyHint: "text-xs text-muted-foreground px-4",
} as const;
