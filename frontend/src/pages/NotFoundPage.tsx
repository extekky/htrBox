import { useLocation } from "wouter";
import { AlertCircle, Home } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";

// -------------------------------------------------------------
// Страница 404 — отображается при переходе на несуществующий маршрут
// -------------------------------------------------------------

export function NotFoundPage() {
  const [, navigate] = useLocation();

  return (
    <AppShell>
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="w-full max-w-150 flex flex-col gap-4 animate-fade-in">
          {/* -- Заголовок страницы ------------------------------- */}
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Страница не найдена
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Такого маршрута не существует
            </p>
          </div>

          {/* -- Карточка с ошибкой ------------------------------- */}
          <Card className="p-8 flex flex-col items-center gap-6 text-center">
            {/* Иконка с пульсирующим фоном */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-destructive/10 animate-pulse scale-125" />
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
                <AlertCircle
                  size={32}
                  className="text-destructive"
                  strokeWidth={1.8}
                />
              </div>
            </div>

            {/* Код и описание ошибки */}
            <div className="flex flex-col gap-2">
              <p className="text-6xl font-extrabold text-foreground tracking-tight leading-none">
                404
              </p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Запрашиваемая страница не существует или была перемещена.
              </p>
            </div>

            {/* Кнопка возврата на главную */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors"
            >
              <Home size={14} />
              Вернуться на главную
            </button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
