/**
 * dashboardStls.ts
 *
 * Готовые стили для компонентов из components/dashboard/.
 */

import { transition } from "@/styles/animations";
import { colorScheme } from "@/styles/variants";
import { radius, spacing } from "@/styles/tokens";

// -------------------------------------------------------------
// KpiCard — карточка KPI
// -------------------------------------------------------------

export const kpiCard = {
  root: [
    `relative ${radius.lg} border p-5 flex flex-col ${spacing.formGapSm} overflow-hidden gradient-surface`,
    transition.base,
    "hover:shadow-md",
  ].join(" "),

  header: "flex items-center justify-between",
  label:
    "text-[11px] font-semibold uppercase tracking-widest text-muted-foreground",

  iconWrap: `w-8 h-8 ${radius.md} flex items-center justify-center shrink-0`,

  value: "text-3xl font-black tabular-nums leading-none",
  sub: "text-xs text-muted-foreground mt-1",

  accentBlueBg: `${colorScheme.info.bg} ${colorScheme.info.border}`,
  accentBlueIcon: `${colorScheme.info.bg} ${colorScheme.info.text}`,
  accentBlueValue: colorScheme.info.text,

  accentGreenBg: `${colorScheme.success.bg} ${colorScheme.success.border}`,
  accentGreenIcon: `${colorScheme.success.bg} ${colorScheme.success.text}`,
  accentGreenValue: colorScheme.success.text,

  accentRedBg: `${colorScheme.danger.bg} ${colorScheme.danger.border}`,
  accentRedIcon: `${colorScheme.danger.bg} ${colorScheme.danger.text}`,
  accentRedValue: colorScheme.danger.text,

  accentAmberBg: `${colorScheme.warning.bg} ${colorScheme.warning.border}`,
  accentAmberIcon: `${colorScheme.warning.bg} ${colorScheme.warning.text}`,
  accentAmberValue: colorScheme.warning.text,

  accentPurpleBg: `${colorScheme.primary.bg} ${colorScheme.primary.border}`,
  accentPurpleIcon: `${colorScheme.primary.bg} ${colorScheme.primary.text}`,
  accentPurpleValue: colorScheme.primary.text,

  accentDefaultBg: "bg-card border-border",
  accentDefaultIcon: "bg-muted text-muted-foreground",
  accentDefaultValue: colorScheme.neutral.text,
} as const;

// -------------------------------------------------------------
// SectionCard — контейнер секции
// -------------------------------------------------------------

export const sectionCard = {
  root: `${radius.lg} border border-border bg-card gradient-surface overflow-hidden flex flex-col`,

  header:
    "flex flex-row items-center justify-between gap-3 px-5 py-3.5 border-b border-border/60",
  headLeft: `flex items-center ${spacing.inlineGap}`,
  title: "text-sm font-semibold text-foreground",

  body: "p-0 pt-0 flex-1 divide-y divide-border/40",

  row: `flex items-center justify-between px-5 py-2.5 hover:bg-muted/30 ${transition.colors}`,

  empty: "flex items-center justify-center py-8 text-xs text-muted-foreground",
} as const;
