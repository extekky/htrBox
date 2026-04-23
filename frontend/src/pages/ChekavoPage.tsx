import { AppShell } from "@/components/layout/AppShell";
import { Guide } from "@/components/common/Guilde";

// -------------------------------------------------------------
// Страница "ЧеКаво"
// -------------------------------------------------------------

export function ChekavoPage() {
  return (
    <AppShell>
      <div className="flex justify-center py-8 px-4">
        <div className="w-full max-w-150 flex flex-col gap-4 animate-fade-in">
          {/* Заголовок */}
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              ЧеКаво
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
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
