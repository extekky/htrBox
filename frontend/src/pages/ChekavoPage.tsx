import { AppShell } from "@/components/layout/AppShell";
import { Guide } from "@/components/common/Guide";
import { styles } from "@/styles";

const s = styles.chekavoPage;

// -------------------------------------------------------------
// Страница "ЧеКаво"
// -------------------------------------------------------------

export function ChekavoPage() {
  return (
    <AppShell>
      <div className={s.root}>
        <div className={s.inner}>
          {/* Заголовок */}
          <div>
            <h1 className={s.title}>ЧеКаво</h1>
            <p className={s.subtitle}>
              Пошаговый гайд — с нуля до работающего YouTube за 5 минут
            </p>
          </div>

          {/* Основной контент — пошаговый гайд */}
          <Guide />
        </div>
      </div>
    </AppShell>
  );
}
