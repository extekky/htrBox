# Миграция компонента на дизайн-систему

## Шаг 0 — прочитай файлы

Прочитай все шесть файлов, не делай ничего до этого:

- `src/styles/tokens.ts`
- `src/styles/animations.ts`
- `src/styles/variants.ts`
- `src/styles/components.ts`
- `src/styles/index.ts`
- `src/components/[PATH]/[NAME].tsx`

---

## Задача

Убери все сырые Tailwind-классы из `[NAME].tsx`. После миграции компонент обращается только к `styles` и `colorScheme`:

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

## Алгоритм

**1. Проанализируй** — пройдись по каждому `className=` в компоненте. Для каждого паттерна: есть ли уже подходящий токен или цветовая схема в системе?

**2. Реши — нужен ли новый токен.** Это самый важный шаг. Новый токен создаётся только если выполнены оба условия:

- в `tokens.ts` нет ничего подходящего по смыслу
- паттерн несёт уникальную семантическую роль в дизайн-системе

Если класс — просто общий текст, цвет или отступ без особой роли, **не создавай токен**. Оставь сырой класс в слоте `components.ts`. Цель токенов — смысловые константы (`errorText`, `cardTitle`), а не перечисление всех встречающихся классов.

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

**4. Допиши `components.ts`** — добавь объект компонента. Правила структуры:

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

**5. Обнови `index.ts`** — добавь экспорт и включи в объект `styles`.

**6. Перепиши `[NAME].tsx`** — `const s = styles.myComponent`, замени все `className`. Для динамических классов: `cn(s.base, condition && s.modifier)`. Для цветовых вариантов: `cn(s.root, v.bg, v.border)`.

---

## Правила — нельзя нарушать

- `transition` импортировать **только из `animations.ts`**, не из `tokens.ts`
- В JSX после миграции — **ноль** сырых Tailwind-классов
- Если токен уже есть — **использовать его**, не создавать дубль
- Новый токен — только если есть реальная семантическая роль, не просто потому что класс встретился
- Цветовые варианты компонента — через `colorScheme` из `variants.ts`, не через локальный `variantStyles`
- Логику компонента не трогать — только `className`
- Комментарии в компоненте не трогать — удалять или переписывать только если комментарий описывал сырой класс которого больше нет
- Стиль кода не менять — форматирование, структуру файла, порядок блоков оставлять как в оригинале
- `as const` на каждом объекте в `components.ts`

---

## Формат ответа

Одно предложение что изменилось → полный файл целиком.
Порядок: `tokens.ts` → `variants.ts` → `components.ts` → `index.ts` → `[NAME].tsx`

Если `tokens.ts` или `variants.ts` не менялись — пропустить, не выводить.
