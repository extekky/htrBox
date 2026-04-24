import { Link, useLocation } from "wouter";
import {
  Send,
  LogOut,
  LayoutDashboard,
  Users,
  Server,
  User,
  Settings,
  BookOpen,
  HelpCircle,
} from "lucide-react";

import { BottomBar } from "./BottomBar";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAuthStore, selectIsAdmin } from "@/stores/authStore";
import { useLogout } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropDownMenu";
import { cn } from "@/lib/cn";
import { styles } from "@/styles";

const s = styles.appShell;

// -------------------------------------------------------------
// Типы
// -------------------------------------------------------------

/** Описывает один пункт навигационного меню. */
interface NavItem {
  /** Отображаемое название пункта. */
  label: string;
  /** Путь для перехода. */
  href: string;
  /** Иконка из lucide-react. */
  icon: React.ComponentType<{ size?: number; className?: string }>;
  /** Если true — пункт виден только администраторам. */
  adminOnly?: boolean;
  /** Если true — пункт скрыт для администраторов. */
  userOnly?: boolean;
}

// -------------------------------------------------------------
// Навигационные пункты (общие для шапки и боковой панели)
// -------------------------------------------------------------

const NAV_ITEMS: NavItem[] = [
  { label: "Дашборд", href: "/admin", icon: LayoutDashboard, adminOnly: true },
  { label: "Польз.", href: "/users", icon: Users, adminOnly: true },
  { label: "Серверы", href: "/servers", icon: Server, adminOnly: true },
  { label: "Профиль", href: "/profile", icon: User, userOnly: true },
  { label: "Настройки", href: "/settings", icon: Settings },
  { label: "Правила", href: "/manual", icon: BookOpen, userOnly: true },
  { label: "ЧеКаво", href: "/chekavo", icon: HelpCircle, userOnly: true },
];

// -------------------------------------------------------------
// Хелпер — определяет, является ли текущий путь активным.
// Считает активным как точное совпадение, так и вложенные маршруты.
// Например: /users/123 -> активен пункт /users.
// -------------------------------------------------------------
function isActivePath(location: string, href: string) {
  return location === href || (href !== "/" && location.startsWith(href + "/"));
}

// -------------------------------------------------------------
// UserAvatarButton — аватар пользователя в шапке.
// Использует ту же систему аватаров, что и ProfilePage.
// -------------------------------------------------------------

function UserAvatarButton() {
  // Получаем текущего пользователя из стора авторизации
  const user = useAuthStore((s) => s.user);

  return (
    <div className={s.avatarWrap}>
      <div className={s.avatarInitial}>
        {user?.username?.[0]?.toUpperCase() ?? "?"}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// DesktopNav — горизонтальная навигация для десктопной шапки.
// Скрыта на мобильных устройствах (md:flex).
// Фильтрует adminOnly-пункты для обычных пользователей.
// -------------------------------------------------------------

function DesktopNav() {
  const [location] = useLocation();
  const isAdmin = useAuthStore(selectIsAdmin);

  // Оставляем только те пункты, которые доступны текущей роли
  const visibleItems = NAV_ITEMS.filter(
    (i) => (!i.adminOnly || isAdmin) && (!i.userOnly || !isAdmin),
  );

  return (
    <nav className={s.desktopNav}>
      {visibleItems.map((item) => {
        const active = isActivePath(location, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              s.navItem,
              // Активный пункт — выделяем фоном и цветом текста
              active ? s.navItemActive : s.navItemDefault,
            )}
          >
            <item.icon size={14} />
            <span>{item.label}</span>

            {/* Точка-индикатор активного пункта под текстом */}
            {active && <span className={s.navDot} />}
          </Link>
        );
      })}
    </nav>
  );
}

// -------------------------------------------------------------
// TopHeader — залипающая шапка приложения.
// Содержит: логотип, десктопную навигацию, бейдж Beta,
// ссылку на Telegram и выпадающее меню пользователя.
// -------------------------------------------------------------

function TopHeader() {
  // Получаем мутацию выхода и флаг загрузки для блокировки кнопки
  const { mutate: doLogout, isPending } = useLogout();

  return (
    <header className={s.header}>
      <div className={s.headerInner}>
        {/* Левая часть — логотип */}
        <div className={s.headerLeft}>
          <Link href="/">
            <div className={s.logoWrap}>
              <span className={s.logoText}>HtrBox</span>
            </div>
          </Link>
        </div>

        {/* Центр — десктопная навигация, абсолютно по центру шапки */}
        <DesktopNav />

        {/* Правая часть — бейдж Beta (десктоп), Telegram, меню пользователя */}
        <div className={s.headerRight}>
          {/* Ссылка на Telegram-канал поддержки */}
          <a
            href="https://t.me/stdoq"
            target="_blank"
            rel="noopener noreferrer"
            className={s.telegramLink}
          >
            <Send size={14} />
            {/* Ник скрыт на маленьких экранах — остаётся только иконка */}
            <span className={s.telegramNick}>@stdoq</span>
          </a>

          {/* Выпадающее меню пользователя — триггер это аватар */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label="Меню пользователя" className={s.avatarBtn}>
                <UserAvatarButton />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={s.dropdownWidth}>
              {/* Пункт выхода — красный, заблокирован во время запроса */}
              <DropdownMenuItem
                onClick={() => doLogout()}
                disabled={isPending}
                className={s.logoutItem}
              >
                <LogOut size={14} />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

// -------------------------------------------------------------
// AppShell — корневая обёртка всех страниц приложения.
// Инициализирует WebSocket-соединение, отрисовывает шапку,
// основной контент и мобильную нижнюю навигацию.
// -------------------------------------------------------------

interface AppShellProps {
  /** Дочерние элементы — содержимое текущей страницы. */
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  // Инициализируем WebSocket один раз на уровне шелла
  // useWebSocket();

  // Определяем мобильный режим для переключения между TopHeader и BottomBar
  const isMobile = useIsMobile();

  // Получаем текущий путь
  const [location] = useLocation();

  // Список всех известных путей (включая главную)
  const KNOWN_PATHS = ["/", ...NAV_ITEMS.map((item) => item.href)];

  // Проверяем, является ли текущий путь известным.
  // Если путь не найден в списке и не начинается с известных путей (для вложенных роутов),
  // считаем это страницей 404.
  const isNotFound = !KNOWN_PATHS.some(
    (path) =>
      location === path || (path !== "/" && location.startsWith(path + "/")),
  );

  return (
    <div className={s.root}>
      {/* Скрываем шапку на странице 404 */}
      {!isNotFound && <TopHeader />}

      <main
        className={cn(
          s.main,
          // На мобильных добавляем отступ снизу, только если виден BottomBar
          isMobile && !isNotFound && s.mainMobilePad,
        )}
      >
        {children}
      </main>

      {/* Нижняя панель навигации — только на мобильных и не на 404 */}
      {isMobile && !isNotFound && <BottomBar />}
    </div>
  );
}
