/**
 * serversStls.ts
 *
 * Готовые стили для компонентов из components/servers/.
 */

import { transition } from "@/styles/animations";
import { colorScheme } from "@/styles/variants";

// -------------------------------------------------------------
// ServerRow — строка таблицы серверов
// -------------------------------------------------------------

export const serverRow = {
  root: "group transition-colors duration-100 hover:bg-muted/40",

  tdCell: "px-4 py-3.5",
  tdActions: "px-4 pr-5 py-3.5",

  locationWrap: "flex items-start gap-2.5",
  locationIconWrap:
    "flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 shrink-0 mt-0.5",
  locationIcon: colorScheme.primary.text,
  locationTitle: "text-sm font-semibold text-foreground leading-snug",
  locationMeta: "text-xs text-muted-foreground mt-0.5",

  hostWrap: "flex items-center gap-1.5",
  hostIcon: "text-muted-foreground shrink-0",
  hostCode:
    "rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-mono text-foreground tabular-nums",

  protocolBadge:
    "inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground",

  updatedAt: "text-xs text-muted-foreground whitespace-nowrap tabular-nums",

  actionsWrap: "flex items-center justify-end gap-0.5",
  actionButton: [
    "h-8 w-8 flex items-center justify-center rounded-md",
    "text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
    transition.colors,
  ].join(" "),
  actionEdit: "hover:text-foreground hover:bg-secondary/80",
  actionDelete: "hover:text-destructive hover:bg-destructive/10",
} as const;

// -------------------------------------------------------------
// ServerTable — таблица серверов
// -------------------------------------------------------------

export const serverTable = {
  root: "flex flex-col animate-fade-in",

  headCard: "p-4 border-b border-border/60",
  headInner: "flex items-center justify-between gap-3",
  title: "text-sm font-medium text-foreground",
  counter: "text-sm text-muted-foreground",

  tableWrap: "overflow-x-auto",
  table: "w-full min-w-225",
  thead: "border-b border-border/60 bg-muted/30 sticky top-0 z-10",
  tbody: "divide-y divide-border/40",

  th: "px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide",
  thActions: "text-right pr-5",

  skeletonRow: "animate-pulse",
  skeletonTd: "px-4 py-4",
  skeletonServerWrap: "flex items-center gap-3",
  skeletonServerIcon: "w-8 h-8 rounded-lg bg-muted shrink-0",
  skeletonServerText: "h-4 w-32 rounded bg-muted",
  skeletonAddr: "h-4 w-28 rounded bg-muted",
  skeletonProtocol: "h-5 w-20 rounded-full bg-muted",
  skeletonUpdated: "h-4 w-24 rounded bg-muted",
  skeletonActive: "h-5 w-16 rounded-full bg-muted",

  emptyWrap:
    "flex flex-col items-center justify-center py-20 gap-4 text-center",
  emptyIconWrap:
    "flex items-center justify-center w-14 h-14 rounded-full bg-muted/50",
  emptyIcon: "text-muted-foreground/60",
  emptyTitle: "text-base font-medium text-foreground",
  emptyHint: "text-sm text-muted-foreground mt-1",
} as const;

// -------------------------------------------------------------
// Server forms — create/edit
// -------------------------------------------------------------

export const serverForm = {
  form: "flex flex-col gap-4",
  gridTwo: "grid grid-cols-2 gap-3",

  hyWrap: "flex flex-col gap-1.5",
  hyTop: "flex items-center justify-between",
  hyLabel: "text-xs font-medium text-muted-foreground",

  tlsButton:
    "text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border transition-colors",
  tlsButtonOn: `${colorScheme.success.bg} ${colorScheme.success.text} ${colorScheme.success.border} ${colorScheme.success.hover}`,
  tlsButtonOff:
    "bg-muted text-muted-foreground border-border hover:bg-muted/80",

  hyInput: "font-mono bg-muted/50 text-muted-foreground cursor-default",
} as const;
