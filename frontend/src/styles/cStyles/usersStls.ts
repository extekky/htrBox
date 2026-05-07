/**
 * usersStls.ts
 *
 * Готовые стили для компонентов из components/users/.
 */

import { loading, transition } from "@/styles/animations";
import { colorScheme } from "@/styles/variants";
import { radius, spacing, typography } from "@/styles/tokens";

// -------------------------------------------------------------
// UserRow — строка таблицы пользователей
// -------------------------------------------------------------

export const userRow = {
  root: "group transition-colors duration-100 cursor-pointer",
  rootSelected: "bg-primary/5",
  rootDefault: "hover:bg-muted/40",

  tdCheck: "pl-4 pr-2 py-3.5 w-10",
  tdCell: "px-4 py-3.5",
  tdStatus: "px-4 py-3.5 w-px whitespace-nowrap align-middle",
  tdActions: "px-4 pr-5 py-3.5",

  userWrap: "flex items-center gap-2.5",
  avatarWrap: "w-7 h-7 shrink-0 overflow-hidden relative",
  avatarInner: "absolute scale-50 origin-top-left",
  initialsAvatar:
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-[11px] font-semibold select-none",
  username: "text-sm font-medium text-foreground truncate max-w-45",

  trafficWrap: "flex flex-col gap-1.5 min-w-30",
  trafficText: "text-xs font-medium text-foreground tabular-nums",

  statusWrap: "flex flex-nowrap items-center gap-1.5",
  statusListInline: "flex-nowrap",
  adminIcon: colorScheme.warning.text,

  expiryWrap: "flex flex-col gap-0.5",
  expiryDate: "text-xs text-foreground tabular-nums",
  expiryToneDanger: `text-xs ${colorScheme.danger.text}`,
  expiryToneWarning: `text-xs ${colorScheme.warning.text}`,
  expiryToneDefault: "text-xs text-muted-foreground",
  expiryNoDate: "text-xs text-muted-foreground",

  actionsWrap: "flex items-center justify-end gap-0.5",
  actionBtn: [
    "h-8 w-8 flex items-center justify-center rounded-md",
    "text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
    transition.colors,
  ].join(" "),
  actionEdit: "hover:text-foreground hover:bg-secondary/80",
  actionDelete: "hover:text-destructive hover:bg-destructive/10",
} as const;

// -------------------------------------------------------------
// UserTableToolbar — фильтры и массовые действия
// -------------------------------------------------------------

export const userTableToolbar = {
  root: "flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3",

  searchWrap: "relative flex-1 sm:max-w-70",
  searchIcon:
    "absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none",
  searchInput: [
    "h-10 w-full rounded-lg border border-border bg-card px-10 py-2.5",
    "text-sm text-foreground placeholder:text-muted-foreground/60",
    "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
    "transition-all duration-150",
  ].join(" "),

  filterTrigger: [
    "inline-flex items-center justify-between gap-2",
    "h-10 min-w-40 rounded-lg border border-border bg-card px-3.5 py-2.5",
    "text-sm text-foreground cursor-pointer",
    "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
    "transition-all duration-150",
  ].join(" "),
  filterChevron: "opacity-50 shrink-0",
  filterContent: "min-w-40",
  filterItemActive:
    "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",

  right: "flex items-center gap-3 sm:ml-auto",

  kickButton: [
    "inline-flex items-center gap-2 px-4 h-9 rounded-xl border",
    `text-sm font-medium ${colorScheme.danger.bg} ${colorScheme.danger.text} ${colorScheme.danger.border}`,
    `${colorScheme.danger.hover} shadow-sm shadow-slate-900/5`,
    "active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
    "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
    transition.colors,
  ].join(" "),
  kickSpinner: colorScheme.danger.text,

  counter: "text-sm text-muted-foreground whitespace-nowrap",
} as const;

// -------------------------------------------------------------
// UserTable — таблица пользователей
// -------------------------------------------------------------

export const userTable = {
  root: "flex flex-col animate-fade-in",
  toolbar: "p-4 border-b border-border/60",

  tableWrap: "overflow-x-auto",
  table: "w-full min-w-225",
  head: "border-b border-border/60 bg-muted/30 sticky top-0 z-10",
  body: "divide-y divide-border/40",

  th: "px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
  thCheck: "pl-4 pr-2 py-3.5 w-10",
  thStatus:
    "px-4 py-3.5 w-px whitespace-nowrap text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
  thActions: "text-right pr-5",

  skeletonRow: loading.pulse,
  skeletonTdCheck: "pl-4 pr-2 py-4 w-10",
  skeletonCheck: "w-4 h-4 rounded bg-muted",

  skeletonTd: "px-4 py-4",
  skeletonUserWrap: "flex items-center gap-2.5",
  skeletonAvatar: "w-7 h-7 rounded-lg bg-muted shrink-0",
  skeletonName: "h-4 w-36 rounded bg-muted",

  skeletonTrafficWrap: "flex flex-col gap-1.5",
  skeletonTrafficText: "h-3 w-24 rounded bg-muted",
  skeletonTrafficBar: "h-2 w-32 rounded bg-muted",

  skeletonStatusWrap: "flex gap-1.5",
  skeletonStatus: "h-5 w-16 rounded-full bg-muted",

  skeletonDate: "h-4 w-20 rounded bg-muted",

  emptyWrap:
    "flex flex-col items-center justify-center py-20 gap-4 text-center",
  emptyIconWrap:
    "flex items-center justify-center w-14 h-14 rounded-full bg-muted/50",
  emptyIcon: "text-muted-foreground/60",
  emptyTitle: "text-base font-medium text-foreground",
  emptyHint: "text-sm text-muted-foreground mt-1",
} as const;

// -------------------------------------------------------------
// UserCreateModal — создание пользователя
// -------------------------------------------------------------

export const userCreateModal = {
  successRoot: "flex flex-col gap-5",
  successHeader: "flex items-center gap-3",
  successIconWrap:
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10",
  successIcon: colorScheme.primary.text,
  successTitle: "text-sm font-semibold text-foreground",
  successSubtitle: "text-xs text-muted-foreground",

  successBlock: "flex flex-col gap-2",
  successLabelRow: "flex items-center gap-2",
  successLabelIcon: "text-muted-foreground",

  successCodeWrap:
    "flex items-center gap-2 rounded-xl border border-border bg-input px-3 py-2.5",
  successCode:
    "flex-1 text-xs font-mono text-foreground break-all leading-relaxed",

  successHint: `flex items-center gap-1.5 text-xs ${colorScheme.warning.text} leading-relaxed`,
  successHintIcon: "shrink-0",

  successClose: [
    "h-9 w-full rounded-lg",
    "bg-primary/10 text-primary border border-primary/20",
    "text-sm font-medium hover:bg-primary/15",
    transition.colors,
  ].join(" "),

  form: "flex flex-col gap-4",
  toggles: "flex flex-col gap-2",
  divider: "h-px bg-border",
} as const;

export const userStatusPicker = {
  root: "flex flex-col gap-3",
  header: "flex flex-col gap-1",
  title: "text-sm font-medium text-foreground",
  hint: "text-xs text-muted-foreground leading-relaxed",
  grid: "grid grid-cols-1 gap-2 sm:grid-cols-2",
  optionBase: [
    "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left",
    "transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50",
  ].join(" "),
  optionDefault: "border-border bg-card text-muted-foreground hover:bg-muted/45",
  optionSelected: "shadow-sm ring-1 ring-current/12",
  optionIcon: "size-4 shrink-0",
  optionLabel: "text-sm font-medium",
  optionMeta: "text-xs text-muted-foreground",
} as const;

// -------------------------------------------------------------
// UserEditModal — редактирование пользователя
// -------------------------------------------------------------

export const userEditModal = {
  root: "flex flex-col gap-4",

  closeButton: [
    "h-9 px-4 rounded-lg text-sm font-medium",
    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    transition.colors,
  ].join(" "),

  summary:
    "flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3",
  summaryInfo: "flex-1 min-w-0",
  summaryName: "text-sm font-medium text-foreground",
  summaryRole: "text-xs text-muted-foreground capitalize",

  summaryTraffic: "flex flex-col items-end gap-1",
  summaryTrafficText: "text-xs font-mono text-muted-foreground tabular-nums",
  summaryTrafficTrack: "w-24 h-1 bg-muted rounded-full overflow-hidden",
  summaryTrafficFill: "h-full rounded-full transition-all",
  summaryTrafficFillDanger: colorScheme.danger.solid,
  summaryTrafficFillWarning: colorScheme.warning.solid,
  summaryTrafficFillPrimary: "bg-primary/60",

  tabs: "flex gap-1 p-0.5 bg-muted rounded-lg",
  tabButton:
    "flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
  tabButtonActive: "bg-card text-foreground shadow-sm",
  tabButtonDefault: "text-muted-foreground hover:text-foreground",

  mainForm: "flex flex-col gap-4",
  mainToggles: "flex flex-col gap-2",

  subscriptionQuick: "flex flex-col gap-2",
  subscriptionActions: "grid grid-cols-2 gap-2",
  subscriptionButton: [
    "inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg",
    "text-xs font-medium bg-primary/10 text-primary border border-primary/20",
    "hover:bg-primary/15 disabled:opacity-50",
    transition.colors,
  ].join(" "),
  subscriptionHint: typography.hintText,
  
  divider: "h-px bg-border",

  accessRoot: "flex flex-col gap-3",

  accessRoleCard:
    "flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/20",
  accessRoleHead: "flex items-center gap-3",
  accessRoleIconWrap:
    "w-9 h-9 rounded-full border flex items-center justify-center shrink-0",
  accessRoleIconAdmin: `${colorScheme.warning.bg} ${colorScheme.warning.text} ${colorScheme.warning.border}`,
  accessRoleIconDefault: "bg-muted/75 text-muted-foreground border-border/80",
  accessRoleTitle: "text-sm font-medium text-foreground",
  accessRoleValueAdmin: colorScheme.warning.text,
  accessRoleValueDefault: "text-muted-foreground",
  accessRoleHint: "text-xs text-muted-foreground mt-0.5",

  accessRoleButton: [
    "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg",
    "text-xs font-medium bg-primary/10 text-primary border border-primary/20",
    "hover:bg-primary/15 disabled:opacity-50",
    transition.colors,
  ].join(" "),

  accessHyCard:
    "flex flex-col gap-2.5 p-3.5 rounded-xl border border-border bg-muted/20",
  accessHyTop: "flex items-center justify-between",
  accessHyHead: "flex items-center gap-3",
  accessHyIconWrap:
    `w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${colorScheme.primary.bg} ${colorScheme.primary.text} ${colorScheme.primary.border}`,
  accessHyTitle: "text-sm font-medium text-foreground",
  accessHyHint: "text-xs text-muted-foreground mt-0.5",

  accessHyButton: [
    "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg",
    `text-xs font-medium ${colorScheme.primary.bg} ${colorScheme.primary.text} border ${colorScheme.primary.border}`,
    `${colorScheme.primary.hover} disabled:opacity-50`,
    transition.colors,
  ].join(" "),

  accessNewPassWrap: `flex items-center gap-2 rounded-lg border ${colorScheme.warning.border} ${colorScheme.warning.bg} px-3 py-2`,
  accessNewPassCode:
    "flex-1 text-xs font-mono text-foreground break-all leading-relaxed",
  accessCopyButton:
    "shrink-0 h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
  accessCopyDoneIcon: colorScheme.success.text,
  accessNewPassHint: `flex items-center gap-1.5 text-xs ${colorScheme.warning.text}`,

  trafficRoot: "flex flex-col gap-3",
  trafficResetCard:
    "flex items-center justify-between p-3.5 rounded-xl border border-destructive/20 bg-destructive/5",
  trafficResetHead: "flex items-center gap-3",
  trafficResetIconWrap:
    "w-9 h-9 rounded-full border border-destructive/30 flex items-center justify-center shrink-0 bg-destructive/12 text-destructive",
  trafficResetTitle: "text-sm font-medium text-foreground",
  trafficResetHint: "text-xs text-muted-foreground mt-0.5",

  trafficResetButton: [
    "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg",
    "text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20",
    "hover:bg-destructive/20 disabled:opacity-50",
    transition.colors,
  ].join(" "),

  spinner: loading.spin,
} as const;

// -------------------------------------------------------------
// UserViewModal — просмотр пользователя
// -------------------------------------------------------------

export const userViewModal = {
  modal: "max-h-[90vh] overflow-y-auto",

  root: "flex flex-col gap-5",

  header: "flex items-center gap-3",
  avatarWrap: "w-10 h-10 shrink-0 overflow-hidden relative",
  avatarInner: "absolute scale-[0.71] origin-top-left",

  headerContent: "flex items-center justify-between gap-2 flex-1",
  userMeta: "flex flex-col gap-0.5",
  userNameRow: "flex items-center gap-1.5",
  userName: "text-base font-semibold text-foreground",
  adminIcon: colorScheme.warning.text,
  badges: "flex items-center gap-1.5",

  expiryText: "text-xs",
  expiryDanger: colorScheme.danger.text,
  expiryWarning: colorScheme.warning.text,
  expiryDefault: "text-muted-foreground",

  trafficCard:
    "flex flex-col gap-2 p-3.5 rounded-xl bg-muted/40 border border-border/50",
  trafficHead: "flex items-center justify-between",
  trafficLabel: "text-xs text-muted-foreground",
  trafficValue: "text-xs font-semibold tabular-nums text-foreground",

  details: "flex flex-col px-0.5",
  infoRow:
    "flex items-center justify-between py-2.5 border-b border-border/50 last:border-0",
  infoLabel: "text-xs text-muted-foreground",
  infoValue: "text-xs font-medium text-foreground",

  allowedTrue: `flex items-center gap-1 ${colorScheme.success.text}`,
  allowedFalse: "flex items-center gap-1 text-destructive",
  activeTrue: "flex items-center gap-1 text-primary",
  activeFalse: "flex items-center gap-1 text-muted-foreground",
} as const;
