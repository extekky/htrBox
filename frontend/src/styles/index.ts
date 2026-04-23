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

// --- Компоненты ---------------------------------------------------------------
export { formInput, notifyBanner } from "./components";

// --- styles — главный объект для использования в JSX -------------------------
import { formInput, notifyBanner } from "./components";

export const styles = {
  formInput,
  notifyBanner,
} as const;
