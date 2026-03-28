import { Link, useLocation } from "wouter";
import {
    Send, LogOut, LayoutDashboard,
    Users, Server, User, Settings,
    BookOpen, HelpCircle
} from "lucide-react";

import { BottomBar } from "./BottomBar";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAuthStore, selectIsAdmin } from "@/stores/authStore";
import { useLogout } from "@/hooks/useAuth";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/DropDownMenu";
import { pickAvatar } from "@/lib/avatars";
import { cn } from "@/lib/cn";

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

    // Подбираем компонент аватара по имени пользователя (детерминировано)
    // const Avatar = user ? pickAvatar(user.username) : null;

    return (
        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-border bg-muted flex items-center justify-center">
            {/* {Avatar ? (
                // Масштабируем аватар, чтобы он красиво вписался в круглый контейнер
                <div className="scale-[0.72] w-[140%] h-[140%] -translate-x-1">
                    <Avatar />
                </div>
            ) : (
                // Фолбэк — первая буква имени пользователя, если аватар не найден
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {user?.username?.[0]?.toUpperCase() ?? "?"}
                </div>
            )} */}
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
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
    const visibleItems = NAV_ITEMS.filter((i) =>
        (!i.adminOnly || isAdmin) && (!i.userOnly || !isAdmin)
    );

    return (
        <nav className="hidden md:flex items-center gap-0.5 ml-6">
            {visibleItems.map((item) => {
                const active = isActivePath(location, item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "relative flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium transition-colors",
                            // Активный пункт — выделяем фоном и цветом текста
                            active
                                ? "text-foreground bg-muted"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                        )}
                    >
                        <item.icon size={14} />
                        <span>{item.label}</span>

                        {/* Точка-индикатор активного пункта под текстом */}
                        {active && (
                            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                        )}
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
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
            <div className="relative flex items-center justify-between h-14 px-4 sm:px-6">

                {/* Левая часть — логотип и десктопная навигация */}
                <div className="flex items-center">
                    <Link href="/">
                        <div className="flex items-center gap-2.5 cursor-pointer group shrink-0">
                            <span className="font-bold text-base tracking-tight text-foreground group-hover:text-primary transition-colors">
                                HtrBox
                            </span>
                        </div>
                    </Link>
                    <DesktopNav />
                </div>

                {/* Центр — бейдж Beta, только на мобильных (где нет навигации).
                    pointer-events-none чтобы не перехватывать клики. */}
                <div className="md:hidden absolute left-1/2 -translate-x-1/2 pointer-events-none">
                    <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium",
                        "bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400",
                    )}>
                        {/* Пульсирующая точка-индикатор */}
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                        </span>
                        Beta
                    </div>
                </div>

                {/* Правая часть — бейдж Beta (десктоп), Telegram, меню пользователя */}
                <div className="flex items-center gap-2 sm:gap-3">

                    {/* Бейдж Beta на десктопе — вынесен вправо, чтобы не загромождать навигацию */}
                    <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                        </span>
                        Beta
                    </div>

                    {/* Ссылка на Telegram-канал поддержки */}
                    <a
                        href="https://t.me/stdoq"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-lg text-xs font-medium",
                            "bg-primary/10 text-primary hover:bg-primary/20 transition-colors",
                        )}
                    >
                        <Send size={14} />
                        {/* Ник скрыт на маленьких экранах — остаётся только иконка */}
                        <span className="hidden sm:inline">@stdoq</span>
                    </a>

                    {/* Выпадающее меню пользователя — триггер это аватар */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                aria-label="Меню пользователя"
                                className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <UserAvatarButton />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {/* Пункт выхода — красный, заблокирован во время запроса */}
                            <DropdownMenuItem
                                onClick={() => doLogout()}
                                disabled={isPending}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
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
    useWebSocket();

    // Определяем мобильный режим для переключения между TopHeader и BottomBar
    const isMobile = useIsMobile();

    // Получаем текущий путь
    const [location] = useLocation();

    // Список всех известных путей (включая главную)
    const KNOWN_PATHS = ["/", ...NAV_ITEMS.map(item => item.href)];

    // Проверяем, является ли текущий путь известным.
    // Если путь не найден в списке и не начинается с известных путей (для вложенных роутов),
    // считаем это страницей 404.
    const isNotFound = !KNOWN_PATHS.some(path => 
        location === path || (path !== "/" && location.startsWith(path + "/"))
    );

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Скрываем шапку на странице 404 */}
            {!isNotFound && <TopHeader />}

            <main
                className={cn(
                    "flex-1 flex flex-col min-h-0 overflow-x-hidden",
                    // На мобильных добавляем отступ снизу, только если виден BottomBar
                    isMobile && !isNotFound && "pb-20",
                )}
            >
                {children}
            </main>

            {/* Нижняя панель навигации — только на мобильных и не на 404 */}
            {isMobile && !isNotFound && <BottomBar />}
        </div>
    );
}