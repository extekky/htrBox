import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Server,
  User,
  Settings,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { useAuthStore, selectIsAdmin } from "@/stores/authStore";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/cn";

// ---------------------------------------------------------------------------
// Типы и конфигурация навигации
// ---------------------------------------------------------------------------

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  adminOnly?: boolean; // если true — пункт виден только администраторам
  userOnly?: boolean; // если true — пункт скрыт для администраторов
}

const NAV_ITEMS: NavItem[] = [
  { label: "Дашборд", href: "/admin", icon: LayoutDashboard, adminOnly: true },
  { label: "Польз.", href: "/users", icon: Users, adminOnly: true },
  { label: "Серверы", href: "/servers", icon: Server, adminOnly: true },
  { label: "Профиль", href: "/profile", icon: User, userOnly: true },
  { label: "Настройки", href: "/settings", icon: Settings },
  { label: "Правила", href: "/manual", icon: BookOpen, userOnly: true },
  { label: "ЧеКаво", href: "/chekavo", icon: HelpCircle, userOnly: true },
];

// ---------------------------------------------------------------------------
// Хелпер для определения активного маршрута
// ---------------------------------------------------------------------------

/**
 * Проверяет, является ли текущий путь активным для данного href.
 * Точное совпадение или вложенный маршрут (например /users/123 -> /users активен).
 * Исключение: href="/" не считается активным для вложенных путей.
 */
function isActivePath(location: string, href: string): boolean {
  return location === href || (href !== "/" && location.startsWith(href + "/"));
}

// ---------------------------------------------------------------------------
// Мобильная нижняя панель навигации
// ---------------------------------------------------------------------------

function MobileBottomBar() {
  const [location] = useLocation();
  const isAdmin = useAuthStore(selectIsAdmin);

  // Фильтруем пункты — adminOnly скрываем от обычных пользователей, userOnly от админов
  const visibleItems = NAV_ITEMS.filter(
    (i) => (!i.adminOnly || isAdmin) && (!i.userOnly || !isAdmin),
  );

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30",
        "flex items-stretch",
        "bg-background/90 backdrop-blur-md",
        "border-t border-border/60",
        // pb-safe — отступ для телефонов с вырезом/индикатором (iOS home bar)
        "pb-safe",
      )}
    >
      <div className="flex w-full items-stretch h-16">
        {visibleItems.map((item) => {
          const active = isActivePath(location, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                // flex-1 — каждый пункт занимает равную долю ширины панели
                "flex-1 flex flex-col items-center justify-center gap-1 relative",
                "transition-colors duration-150",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {/* Подсветка активного пункта — скруглённая pill-форма за иконкой */}
              {active && (
                <span className="absolute inset-x-2 top-1.5 bottom-1.5 rounded-xl bg-primary/10" />
              )}

              <item.icon
                size={19}
                className={cn(
                  // z-10 — иконка поверх подсветки
                  "relative z-10 transition-transform duration-150",
                  // Лёгкое увеличение иконки при активном состоянии
                  active && "scale-110",
                )}
              />

              <span
                className={cn(
                  "relative z-10 text-[9px] font-medium tracking-wide leading-none",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Публичный компонент
// ---------------------------------------------------------------------------

/**
 * Рендерит мобильную нижнюю панель навигации.
 * На десктопе возвращает null — навигация там живёт в хедере.
 */
export function BottomBar() {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return <MobileBottomBar />;
}
