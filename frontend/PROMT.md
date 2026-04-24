# Миграция компонента на дизайн-систему

## Структура дизайн-системы

```
src/styles/
├── tokens.ts        — атомарные токены (typography, surface, radius, …)
├── animations.ts    — transition, hover, press, enter, loading
├── variants.ts      — colorScheme + тип ColorScheme
├── index.ts         — единая точка входа, реэкспортирует всё
└── cStyles/         — стили компонентов, разбитые по папкам src/components/
    ├── uiStls.ts        → компоненты из components/ui/
    ├── commonStls.ts    → компоненты из components/common/
    ├── layoutStls.ts    → компоненты из components/layout/
    ├── dashboardStls.ts → компоненты из components/dashboard/
    ├── usersStls.ts     → компоненты из components/users/
    ├── serversStls.ts   → компоненты из components/servers/
    └── pagesStls.ts     → компоненты из pages/
```

### Правило маппинга: какой файл cStyles/ для какого компонента

| Компонент находится в…  | Стили идут в…              |
| ----------------------- | -------------------------- |
| `components/ui/`        | `cStyles/uiStls.ts`        |
| `components/common/`    | `cStyles/commonStls.ts`    |
| `components/layout/`    | `cStyles/layoutStls.ts`    |
| `components/dashboard/` | `cStyles/dashboardStls.ts` |
| `components/users/`     | `cStyles/usersStls.ts`     |
| `components/servers/`   | `cStyles/serversStls.ts`   |
| `pages/`                | `cStyles/pagesStls.ts`     |

Если файл `cStyles/xStls.ts` ещё не существует — создай его.

### Использование в JSX

```tsx
import { styles, colorScheme } from "@/styles";
import type { ColorScheme } from "@/styles";

const s = styles.myComponent;
const v = colorScheme[variant]; // если компонент имеет цветовые варианты

<div className={cn(s.root, v.bg, v.border)}>
  <p className={cn(s.title, v.text)}>{title}</p>
</div>;
```

---

## Задача

Убери все сырые Tailwind-классы из файла компонента. После миграции компонент должен обращаться только к `styles` и `colorScheme`.

---

## Алгоритм

**1. Проанализируй** — пройдись по каждому `className=` в компоненте и выведи таблицу:

| className                  | решение                                |
| -------------------------- | -------------------------------------- |
| `flex flex-col gap-1.5`    | токен уже есть: `spacing.inlineGapSm`  |
| `text-xs text-destructive` | токен уже есть: `typography.errorText` |
| `absolute left-3 top-1/2`  | слот в `xStls.ts`                      |
| ...                        | ...                                    |

Только после того как таблица выведена — переходи к шагам 2–6.

**2. Реши — нужен ли новый токен.** Это самый важный шаг. Новый токен создаётся только если выполнены оба условия:

- в `tokens.ts` нет ничего подходящего по смыслу
- паттерн несёт уникальную семантическую роль в дизайн-системе

Если класс — просто общий текст, цвет или отступ без особой роли, **не создавай токен**. Оставь сырой класс в слоте `xStls.ts`. Цель токенов — смысловые константы (`errorText`, `cardTitle`), а не перечисление всех встречающихся классов.

Частые ошибки которых нужно избегать:

- `text-sm text-foreground` → не нужен новый токен, проверь `typography.bodySm` или `typography.bodyMd`
- `gap-2` → не нужен новый токен если `spacing.inlineGap` уже есть
- `text-muted-foreground` → не нужен токен для одного цвет-класса
- `font-medium` → не нужен токен для одного модификатора шрифта

**3. Реши — нужен ли `colorScheme`.** Если компонент имеет цветовые варианты со смысловой ролью (предупреждение, ошибка, успех) — используй `colorScheme` из `variants.ts`. Не создавай локальный `variantStyles` в компоненте.

Тип варианта компонента должен быть `ColorScheme` или его подмножеством:

```ts
import type { ColorScheme } from "@/styles";
variant?: ColorScheme;
// или подмножество:
type MyVariant = "warning" | "danger";
```

**4. Допиши нужный файл `cStyles/xStls.ts`** — добавь объект компонента. Правила структуры:

- `root` — всегда первый, корневой элемент
- структурные слоты — части с layout-ролью (`header`, `body`, `inputWrap`)
- вариантные слоты — модификаторы одного элемента (`inputDefault` / `inputError`)
- слоты состояний — иконки, кнопки внутри компонента (`iconLeft`, `eyeBtn`)
- текстовые слоты — последними (`errorText`, `label`, `hint`)

Три паттерна записи значений:

```ts
// шаблонная строка — токен + свои классы
root: `${radius.lg} border px-4 py-3.5 flex items-center ${spacing.inlineGap}`,

// массив — несколько токенов
input: [
  "w-full h-10 rounded-lg border",
  focus.input,
  transition.colors,
].join(" "),

// прямая ссылка — слот равен ровно одному токену
errorText: typography.errorText,
```

**5. Обнови `index.ts`** — добавь новый экспорт в нужный импорт-блок и включи в объект `styles`.

Структура `index.ts` — отдельный `import` на каждый файл `cStyles/`, затем единый `styles`:

```ts
import {
  formLabel,
  formInput,
  spinner,
  // … все ui-компоненты
} from "./cStyles/uiStls";

import {
  notifyBanner,
  // … все common-компоненты
} from "./cStyles/commonStls";

import {
  appShell,
  // … все layout-компоненты
} from "./cStyles/layoutStls";

// и т.д. для каждого xStls.ts

export const styles = {
  formLabel,
  formInput,
  spinner,
  notifyBanner,
  appShell,
  // …
} as const;
```

Правила редактирования `index.ts`:

- Добавляй новый компонент в уже существующий `import`-блок своего файла
- Если файл `xStls.ts` новый — добавляй новый `import`-блок после остальных импортов `cStyles/`
- Комментарии внутри `styles = { … }` не нужны — порядок определяется порядком импортов

**6. Перепиши `[NAME].tsx`** — `const s = styles.myComponent`, замени все `className`. Для динамических классов: `cn(s.base, condition && s.modifier)`. Для цветовых вариантов: `cn(s.root, v.bg, v.border)`.

Используй `cn(s.base, condition && s.modifier)` только если у элемента есть два семантически разных состояния с отдельными слотами (`inputDefault` / `inputError`). Если просто добавляется один класс по условию — `cn(s.base, condition && "opacity-50")` допустимо только если этот класс не имеет смысла как именованный слот.

---

## Правило B — уникальные layout-классы

Если класс не покрывается токеном — перед тем как добавить его в слот `xStls.ts`, пройди три проверки по порядку:

1. **Токен** — есть подходящий в `tokens.ts`? → использовать
2. **Избыточность** — класс лишний в контексте (`w-full` внутри `flex`, `mx-auto` когда центрирует grid-родитель)? → убрать
3. **Консистентность** — посмотри на соседние компоненты в той же папке. Есть ли похожий паттерн который уже решён в другом слоте того же `xStls.ts`? → использовать тот слот

Только если все три проверки дали «нет» — класс идёт в слот как есть.

---

## Правило C — повторяющийся паттерн без семантики

Если один и тот же паттерн встречается в 2+ местах, но не несёт именованной роли в дизайн-системе — он не становится токеном. Он становится отдельным слотом в каждом компоненте своего `xStls.ts`. Дублирование внутри `cStyles/` — допустимо. Раздувание `tokens.ts` случайными паттернами — нет.

---

## Правила — нельзя нарушать

- `transition` импортировать **только из `animations.ts`**, не из `tokens.ts`
- Стили компонента — **только в файл `cStyles/` соответствующий его папке** (см. таблицу маппинга выше)
- В JSX после миграции — **ноль** сырых Tailwind-классов
- Если токен уже есть — **использовать его**, не создавать дубль
- Новый токен — только если есть реальная семантическая роль, не просто потому что класс встретился
- Цветовые варианты компонента — через `colorScheme` из `variants.ts`, не через локальный `variantStyles`
- Логику компонента не трогать — только `className`
- Комментарии в компоненте не трогать — удалять или переписывать только если комментарий описывал сырой класс которого больше нет
- Стиль кода не менять — форматирование, структуру файла, порядок блоков оставлять как в оригинале
- `as const` на каждом объекте в `cStyles/*.ts`

---

## Порядок работы

1. **Найди и прочитай `TODO.md`** в корне проекта. В нём находится список файлов для миграции. Если файл не найден — сообщи и остановись.
2. **Прочитай файлы дизайн-системы**: `src/styles/tokens.ts`, `src/styles/animations.ts`, `src/styles/variants.ts`, `src/styles/index.ts`, и нужный `src/styles/cStyles/xStls.ts` (если уже существует).
3. **Выполни миграцию** для первого незавершённого файла из `TODO.md`.
4. **Отметь выполненный файл** в `TODO.md`, поставив `[x]` напротив его имени.
5. **Предоставь отчёт** по формату ниже.

## Формат ответа

За один раз — только 1 файл, после чего выдать результат.

Таблица анализа → одно предложение что изменилось → полный файл целиком.  
Порядок вывода: `tokens.ts` → `variants.ts` → `cStyles/xStls.ts` → `index.ts` → `[NAME].tsx`

Если `tokens.ts` или `variants.ts` не менялись — пропустить, не выводить.
