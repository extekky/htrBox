/**
 * styles/index.ts
 *
 * Единая точка входа для всей дизайн-системы.
 *
 * Использование:
 *   import { styles } from "@/styles"
 *   className={styles.formInput.root}
 */

// --- Токены — для составления новых компонентов -------------------------------
export {
  typography,
  surface,
  radius,
  shadow,
  spacing,
  focus,
  disabled,
  divider,
} from "./tokens";

export { transition, hover, press, enter, loading } from "./animations";
export { colorScheme } from "./variants";
export type { ColorScheme } from "./variants";

// -------------------------------------------------------------
// uiStls.ts
// -------------------------------------------------------------

import {
  formLabel,
  formInput,
  notifyBanner,
  spinner,
  checkbox,
  copyButton,
  toggleCard,
  modalActions,
  card,
  modal,
  dropdownMenu,
} from "./cStyles/uiStls";

// -------------------------------------------------------------
// commonStls.ts
// -------------------------------------------------------------

import {
  progressBar,
  statusBadge,
  toaster,
  serverSelector,
  connectionCard,
  guide,
  confirmDialog,
} from "./cStyles/commonStls";

// -------------------------------------------------------------
// layoutStls.ts
// -------------------------------------------------------------

import { bottomBar, appShell } from "./cStyles/layoutStls";

// -------------------------------------------------------------
// pagesStls.ts
// -------------------------------------------------------------

import { profilePage } from "./cStyles/pagesStls";

export const styles = {
  formLabel,
  formInput,
  notifyBanner,
  spinner,
  checkbox,
  copyButton,
  toggleCard,
  modalActions,
  card,
  modal,
  dropdownMenu,
  progressBar,
  statusBadge,
  toaster,
  serverSelector,
  connectionCard,
  guide,
  confirmDialog,
  bottomBar,
  appShell,
  profilePage,
} as const;
