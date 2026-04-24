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

import { progressBar, statusBadge } from "./cStyles/commonStls";

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
} as const;
