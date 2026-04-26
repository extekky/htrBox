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
  spinner,
  checkbox,
  copyButton,
  toggleCard,
  activeToggle,
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
  userStatusList,
  toaster,
  serverSelector,
  connectionCard,
  guide,
  trafficChart,
  confirmDialog,
  notifyBanner,
} from "./cStyles/commonStls";

// -------------------------------------------------------------
// layoutStls.ts
// -------------------------------------------------------------

import { bottomBar, appShell } from "./cStyles/layoutStls";

// -------------------------------------------------------------
// pagesStls.ts
// -------------------------------------------------------------

import {
  loginPage,
  registerPage,
  profilePage,
  settingsPage,
  manualPage,
  adminBoardPage,
  userManagePage,
  serversPage,
  chekavoPage,
  notFoundPage,
} from "./cStyles/pagesStls";

// -------------------------------------------------------------
// dashboardStls.ts
// -------------------------------------------------------------

import { kpiCard, sectionCard } from "./cStyles/dashboardStls";

// -------------------------------------------------------------
// usersStls.ts
// -------------------------------------------------------------

import {
  userRow,
  userTableToolbar,
  userTable,
  userCreateModal,
  userStatusPicker,
  userEditModal,
  userViewModal,
} from "./cStyles/usersStls";

// -------------------------------------------------------------
// serversStls.ts
// -------------------------------------------------------------

import { serverRow, serverTable, serverForm } from "./cStyles/serversStls";

export const styles = {
  formLabel,
  formInput,
  notifyBanner,
  spinner,
  checkbox,
  copyButton,
  toggleCard,
  activeToggle,
  modalActions,
  card,
  modal,
  dropdownMenu,
  progressBar,
  statusBadge,
  userStatusList,
  toaster,
  serverSelector,
  connectionCard,
  guide,
  trafficChart,
  confirmDialog,
  bottomBar,
  appShell,
  loginPage,
  registerPage,
  profilePage,
  settingsPage,
  manualPage,
  adminBoardPage,
  userManagePage,
  serversPage,
  chekavoPage,
  notFoundPage,
  kpiCard,
  sectionCard,
  userRow,
  userTableToolbar,
  userTable,
  userCreateModal,
  userStatusPicker,
  userEditModal,
  userViewModal,
  serverRow,
  serverTable,
  serverForm,
} as const;
