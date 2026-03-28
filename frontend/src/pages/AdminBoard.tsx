import {
    Users, Server, Wifi, Clock,
    ChevronRight, AlertTriangle,
    ShieldAlert, Activity, Zap,
} from "lucide-react";

import { Link } from "wouter";

import { AppShell } from "@/components/layout/AppShell";
import { Spinner } from "@/components/ui/Spinner";
import { useUsers } from "@/hooks/useUsers";
import { useServersAdmin } from "@/hooks/useServers";
import { KpiCard } from "@/components/dashboard/KpiCard"
import { useOnlineUsers } from "@/hooks/useHysteria";
import { daysUntil } from "@/lib/formatters";
import { cn } from "@/lib/cn";

import {
    SectionCard,
    SectionRow,
    SectionEmpty
} from "@/components/dashboard/SectionCard"

// -------------------------------------------------------------
// Компонент панели администратора
// -------------------------------------------------------------

/**
 * Главная страница администратора (Dashboard).
 * Отображает ключевые метрики системы, состояние серверов и список активных пользователей.
 * 
 * - Загружает данные о пользователях и серверах.
 * - Рассчитывает статистику (активные, заблокированные, истекающие).
 * - Отображает текущий онлайн через Hysteria API.
 */
export function AdminBoard() {
    // Загрузка данных из хуков
    const { data: users = [], isLoading: usersLoading, isError: usersError } = useUsers();
    const { data: servers = [], isLoading: serversLoading, isError: serversError } = useServersAdmin();
    const { data: online = {}, isError: onlineError } = useOnlineUsers();

    const isLoading = usersLoading || serversLoading;
    const isError = usersError || serversError;

    // -------------------------------------------------------------
    // Расчет статистики
    // -------------------------------------------------------------

    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.active && u.allowed).length;
    const blockedUsers = users.filter((u) => !u.allowed).length;

    // Пользователи, чья подписка истекает в ближайшие 7 дней
    const expiringUsers = users.filter((u) => {
        const d = daysUntil(u.expires_at);
        return d !== null && d >= 0 && d <= 7;
    });

    const activeServers = servers.filter((s) => s.active).length;
    const onlineCount = Object.keys(online).length;

    // -------------------------------------------------------------
    // Состояния загрузки и ошибок
    // -------------------------------------------------------------

    if (isLoading) {
        return (
            <AppShell>
                <div className="flex items-center justify-center flex-1 py-32">
                    <Spinner className="size-6" />
                </div>
            </AppShell>
        );
    }

    if (isError) {
        return (
            <AppShell>
                <div className="flex items-center justify-center flex-1 py-32 px-6">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-destructive/10 border border-destructive/20">
                            <AlertTriangle size={20} className="text-destructive" />
                        </div>
                        <p className="text-sm font-medium text-foreground">Не удалось загрузить данные</p>
                        <p className="text-xs text-muted-foreground">Проверьте соединение или обновите страницу</p>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in">

                {/* Заголовок страницы */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">Дашборд</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Обзор системы в реальном времени</p>
                    </div>
                </div>

                {/* Уведомление об истекающих подписках */}
                {expiringUsers.length > 0 && (
                    <Link href="/users">
                        <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-amber-500/8 border border-amber-500/20 cursor-pointer hover:bg-amber-500/12 transition-colors">
                            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 shrink-0">
                                <ShieldAlert size={15} />
                            </div>
                            <p className="text-sm text-amber-700 dark:text-amber-400 flex-1">
                                <strong className="font-semibold">{expiringUsers.length}</strong> подписок истекают в течение 7 дней
                            </p>
                            <ChevronRight size={14} className="text-amber-500/60 shrink-0" />
                        </div>
                    </Link>
                )}

                {/* Секция KPI: Пользователи */}
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Пользователи</p>
                    <div className="grid grid-cols-4 gap-3">
                        <KpiCard label="Всего" value={totalUsers} sub="аккаунтов" icon={Users} accent="blue" />
                        <KpiCard label="Активных" value={activeUsers} sub="с подпиской" icon={Wifi} accent="green" />
                        <KpiCard label="Заблокировано" value={blockedUsers} icon={ShieldAlert} accent={blockedUsers > 0 ? "red" : "default"} />
                        <KpiCard label="Истекают" value={expiringUsers.length} sub="≤ 7 дней" icon={Clock} accent={expiringUsers.length > 0 ? "amber" : "default"} />
                    </div>
                </div>

                {/* Секция KPI: Инфраструктура */}
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Инфраструктура</p>
                    <div className="grid grid-cols-4 gap-3">
                        <KpiCard label="Серверов" value={servers.length} sub="всего" icon={Server} accent="blue" />
                        <KpiCard label="Активных" value={activeServers} icon={Server} accent="green" />
                        <KpiCard label="Онлайн" value={onlineCount} sub="сейчас" icon={Activity} accent={onlineCount > 0 ? "purple" : "default"} />
                        <KpiCard label="Активация" value={`${activeUsers}/${totalUsers}`} sub="активных" icon={Zap} accent="default" />
                    </div>
                </div>

                {/* Сетка детальных секций */}
                <div className="grid grid-cols-2 gap-4">

                    {/* Список пользователей онлайн */}
                    <SectionCard
                        title="Онлайн сейчас"
                        badge={
                            <span className={cn(
                                "inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-lg font-semibold border",
                                onlineCount > 0
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                    : "bg-muted text-muted-foreground border-border",
                            )}>
                                {onlineCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                {onlineCount}
                            </span>
                        }
                        action={
                            <Link href="/users">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                    Все <ChevronRight size={12} />
                                </span>
                            </Link>
                        }
                    >
                        {onlineError ? (
                            <SectionEmpty label="Нет активных серверов" />
                        ) : onlineCount === 0 ? (
                            <SectionEmpty label="Никого нет онлайн" />
                        ) : (
                            Object.entries(online).map(([username, info]) => (
                                <SectionRow key={username}>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-emerald-500">{username[0].toUpperCase()}</span>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">{username}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground tabular-nums">{info.connections} соед.</span>
                                </SectionRow>
                            ))
                        )}
                    </SectionCard>

                    {/* Список истекающих подписок */}
                    <SectionCard
                        title="Истекают скоро"
                        badge={
                            expiringUsers.length > 0 ? (
                                <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-lg font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    {expiringUsers.length}
                                </span>
                            ) : undefined
                        }
                        action={
                            <Link href="/users">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                    Все <ChevronRight size={12} />
                                </span>
                            </Link>
                        }
                    >
                        {expiringUsers.length === 0 ? (
                            <SectionEmpty label="Все подписки в порядке" />
                        ) : (
                            expiringUsers.slice(0, 6).map((u) => {
                                const days = daysUntil(u.expires_at);
                                const urgent = days !== null && days <= 1;
                                return (
                                    <SectionRow key={u.username}>
                                        <div className="flex items-center gap-2.5">
                                            <div className={cn(
                                                "w-6 h-6 rounded-lg flex items-center justify-center",
                                                urgent ? "bg-rose-500/10 border border-rose-500/20" : "bg-amber-500/10 border border-amber-500/20",
                                            )}>
                                                <span className={cn("text-[10px] font-bold", urgent ? "text-rose-500" : "text-amber-500")}>
                                                    {u.username[0].toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-foreground">{u.username}</span>
                                        </div>
                                        <span className={cn(
                                            "text-xs px-2 py-0.5 rounded-lg border font-semibold",
                                            urgent
                                                ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                                                : "bg-amber-500/10 border-amber-500/20 text-amber-500",
                                        )}>
                                            {days !== null && days <= 0 ? "истекла" : `${days} дн.`}
                                        </span>
                                    </SectionRow>
                                );
                            })
                        )}
                    </SectionCard>
                </div>
            </div>
        </AppShell>
    );
}
