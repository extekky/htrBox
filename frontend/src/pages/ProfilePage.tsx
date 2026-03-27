import { useMemo } from "react";
import { AlertTriangle, Clock, ServerOff } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

import { ConnectionCard } from "@/components/common/ConnectionCard";
// import { OnboardingGuide } from "@/components/common/OnboardingGuide";
import { ProgressBar } from "@/components/common/ProgressBar";
import { ServerSelector } from "@/components/common/ServerSelector";

import { pickAvatar } from "@/lib/avatars";

import { useMe } from "@/hooks/useUsers";

import { useAuthStore } from "@/stores/authStore";
import {
    useServerStore,
    selectSelectedServer,
    selectSetSelectedServer,
} from "@/stores/serverStore";

import {
    formatDate,
    formatTime,
    daysUntil,
    toGB,
    getExpiryTier,
} from "@/lib/formatters";

import { DEFAULT_TRAFFIC_LIMIT_GB } from "@/lib/constants";
import { cn } from "@/lib/cn";

import {
    useLiveCountdown,
    getAccountStatus,
    getSubscriptionValue,
    getExpiryPct,
} from "@/lib/utils";

export function ProfilePage() {
    const { data: me, isLoading: meLoading, isError: meError } = useMe();

    const user = useAuthStore((s) => s.user);
    const selectedServer = useServerStore(selectSelectedServer);
    const setSelectedServer = useServerStore(selectSetSelectedServer);
    const servers = useServerStore((s) => s.servers);
    console.log(servers);
    const activeServers = useMemo(
        () => servers.filter((s) => s.active),
        [servers],
    );

    const profile = me ?? user;
    const expiresAt = profile?.expires_at ?? null;
    const timeLeft = useLiveCountdown(expiresAt);

    if (meLoading) {
        return (
            <AppShell>
                <div className="flex justify-center items-center flex-1 py-20">
                    <Spinner className="size-7" />
                </div>
            </AppShell>
        );
    }

    if (meError && !user) {
        return (
            <AppShell>
                <div className="flex justify-center items-center flex-1 py-20">
                    <div className="flex flex-col items-center gap-3 text-center px-6">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
                            <AlertTriangle size={22} className="text-destructive" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            Не удалось загрузить профиль
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Проверьте соединение или обновите страницу
                        </p>
                    </div>
                </div>
            </AppShell>
        );
    }

    if (!profile) return null;

    const UserAvatar = pickAvatar(profile.username);
    const usedGb = toGB(profile.usedTraffic);
    const trafficPct = Math.min(100, (usedGb / DEFAULT_TRAFFIC_LIMIT_GB) * 100);
    const daysLeft = daysUntil(expiresAt);
    const expiryTier = getExpiryTier(expiresAt);
    const isActive = profile.allowed && profile.active;

    const accountStatus = getAccountStatus(profile);
    const subscriptionValue = getSubscriptionValue(expiresAt, daysLeft, timeLeft, expiryTier);
    const expiryPct = getExpiryPct(daysLeft);

    const expiryDateLine = expiresAt
        ? `${formatDate(expiresAt)}, ${formatTime(expiresAt)}`
        : null;

    return (
        <AppShell>
            <div className="flex justify-center py-8 px-4">
                <div className="w-full max-w-150 flex flex-col gap-4 animate-fade-in">

                    {/* ── Hero: avatar + name + status + expiry date ────────── */}
                    <Card className="p-5 flex items-center gap-4">
                        <UserAvatar />

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                                    <h1 className="text-xl font-bold text-foreground truncate">
                                        {profile.username}
                                    </h1>
                                    <span className={cn(
                                        "text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
                                        accountStatus.color,
                                    )}>
                                        {accountStatus.label}
                                    </span>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className="text-[11px] text-muted-foreground">Подписка до</p>
                                    <p className="text-xs text-foreground mt-0.5">
                                        {expiryDateLine ?? "Не установлена"}
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground mt-0.5">Участник</p>
                        </div>
                    </Card>

                    {/* ── Stats: traffic + subscription ─────────────────────── */}
                    <div className="grid grid-cols-2 gap-3">

                        <Card className="px-4 py-4 flex flex-col gap-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Трафик
                            </p>
                            <div>
                                <p className="text-2xl font-bold text-foreground tabular-nums">
                                    {usedGb.toFixed(2)}
                                    <span className="text-sm font-normal text-muted-foreground ml-1">GB</span>
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    из {DEFAULT_TRAFFIC_LIMIT_GB} GB
                                </p>
                            </div>
                            <ProgressBar value={trafficPct} variant="traffic" />
                        </Card>

                        <Card className="px-4 py-4 flex flex-col gap-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Подписка
                            </p>
                            <div>
                                <div className="flex items-baseline gap-1.5">
                                    {"icon" in subscriptionValue && (
                                        <Clock size={14} className={cn("shrink-0 mb-0.5", subscriptionValue.color)} />
                                    )}
                                    <p className={cn(
                                        "text-2xl font-bold tabular-nums leading-none",
                                        "color" in subscriptionValue ? subscriptionValue.color : "text-foreground",
                                    )}>
                                        {subscriptionValue.text}
                                    </p>
                                    {"unit" in subscriptionValue && (
                                        <span className="text-sm font-normal text-muted-foreground">
                                            {subscriptionValue.unit}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    {subscriptionValue.sub}
                                </p>
                            </div>
                            <ProgressBar value={expiryPct} variant="expiry" />
                        </Card>
                    </div>

                    {/* ── Warning banner ─────────────────────────────────────── */}
                    {profile.allowed && !profile.active && (
                        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/8 px-4 py-3.5 flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 shrink-0">
                                <AlertTriangle size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                    Подписка неактивна
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    VPN-подключение недоступно — обратитесь к администратору
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── Onboarding guide ───────────────────────────────────── */}
                    {/* {!expiresAt && <OnboardingGuide />} */}

                    {/* ── Connection string + server selector ───────────────── */}
                    {isActive && (
                        <Card className="overflow-hidden">
                            <ConnectionCard />

                            <div className="h-px bg-border mx-5" />

                            <div className="p-5 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Сервер
                                    </p>
                                    <span className="text-[11px] text-muted-foreground">
                                        {activeServers.length} доступно
                                    </span>
                                </div>

                                {activeServers.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-6 text-center">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted text-muted-foreground">
                                            <ServerOff size={18} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-foreground">Нет доступных серверов</p>
                                            <p className="text-xs text-muted-foreground px-4">
                                                Активные серверы временно недоступны
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <ServerSelector
                                        servers={activeServers}
                                        selectedServerId={selectedServer?.id ?? null}
                                        onSelect={setSelectedServer}
                                    />
                                )}
                            </div>
                        </Card>
                    )}

                </div>
            </div>
        </AppShell>
    );
}