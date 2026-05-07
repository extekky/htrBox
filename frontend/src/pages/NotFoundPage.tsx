import { useLocation } from "wouter";
import { AlertCircle, Home } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { styles } from "@/styles";

const s = styles.notFoundPage;

// -------------------------------------------------------------
// Страница 404 — отображается при переходе на несуществующий маршрут
// -------------------------------------------------------------

export function NotFoundPage() {
  const [, navigate] = useLocation();

  return (
    <AppShell>
      <div className={s.root}>
        <div className={s.inner}>
          {/* -- Заголовок страницы ------------------------------- */}
          <div>
            <h1 className={s.title}>Страница не найдена</h1>
            <p className={s.subtitle}>
              Проверьте ссылку или вернитесь на главную страницу
            </p>
          </div>

          {/* -- Карточка с ошибкой ------------------------------- */}
          <Card className={s.card}>
            {/* Иконка с пульсирующим фоном */}
            <div className={s.iconWrap}>
              <div className={s.iconPulse} />
              <div className={s.iconInner}>
                <AlertCircle size={32} className={s.icon} strokeWidth={1.8} />
              </div>
            </div>

            {/* Код и описание ошибки */}
            <div className={s.codeWrap}>
              <p className={s.code}>404</p>
              <p className={s.description}>
                Запрашиваемая страница не существует или была перемещена.
              </p>
            </div>

            {/* Кнопка возврата на главную */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className={s.backButton}
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
