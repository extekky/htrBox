import { useState } from "react";
import {
    ExternalLink, MessageCircle, Download,
    Copy, Check, CheckCircle2, Plus,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { 
    WINDOWS_ICON_PATH,
    APPLE_ICON_PATH,
    ANDROID_ICON_PATH,
    LINUX_ICON_PATH,
} from "@/lib/constants"
// -------------------------------------------------------------
// Иконки платформ
// -------------------------------------------------------------

function IconWindows({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-label="Windows">
            <path d={WINDOWS_ICON_PATH} />
        </svg>
    );
}

function IconApple({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-label="Apple">
            <path d={APPLE_ICON_PATH} />
        </svg>
    );
}

function IconLinux({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-label="Linux">
      <path d={LINUX_ICON_PATH} />
    </svg>
  );
}

function IconAndroid({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 512 512" fill="currentColor" aria-label="Android">
            <path d={ANDROID_ICON_PATH} />
        </svg>
    );
} 

// -------------------------------------------------------------
// Данные платформ
// -------------------------------------------------------------

type PlatformId = "windows" | "linux" | "macos" | "ios" | "android";

interface Platform {
    id: PlatformId;
    name: string;
    Icon: React.ComponentType<{ size?: number }>;
    clientName: string;
    clientDescription: string;
    downloadUrl: string;
    downloadLabel: string;
}

const PLATFORMS: Platform[] = [
    {
        id: "ios",
        name: "iPhone",
        Icon: IconApple,
        clientName: "Streisand",
        clientDescription: "Удобный и функциональный клиент для iOS",
        downloadUrl: "https://apps.apple.com/app/streisand/id6450534064",
        downloadLabel: "App Store",
    },
    {
        id: "android",
        name: "Android",
        Icon: IconAndroid,
        clientName: "v2RayTun",
        clientDescription: "Поддерживает все современные протоколы, включая Hysteria2",
        downloadUrl: "https://play.google.com/store/apps/details?id=com.v2raytun.android",
        downloadLabel: "Google Play",
    },
    {
        id: "macos",
        name: "macOS",
        Icon: IconApple,
        clientName: "Streisand",
        clientDescription: "Родное приложение для macOS из App Store",
        downloadUrl: "https://apps.apple.com/app/streisand/id6450534064",
        downloadLabel: "Mac App Store",
    },
    {
        id: "windows",
        name: "Windows",
        Icon: IconWindows,
        clientName: "Hiddify",
        clientDescription: "Полная поддержка Hysteria2, установщик AppImage / exe",
        downloadUrl: "https://github.com/hiddify/hiddify-next/releases/latest",
        downloadLabel: "GitHub",
    },
    {
        id: "linux",
        name: "Linux",
        Icon: IconLinux,
        clientName: "Hiddify",
        clientDescription: "AppImage / .deb — простота установки",
        downloadUrl: "https://github.com/hiddify/hiddify-next/releases/latest",
        downloadLabel: "GitHub",
    },
];

// -------------------------------------------------------------
// Вспомогательные компоненты
// -------------------------------------------------------------

/** Строка с иконкой и текстом — всегда выровнены по центру. */
function Row({
    icon,
    children,
    className,
}: {
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <span className="shrink-0 flex items-center">{icon}</span>
            <span className="leading-none">{children}</span>
        </div>
    );
}

/** Бейдж с иконкой — используется inline в тексте. */
function Badge({
    icon,
    children,
}: {
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary leading-none">
            <span className="shrink-0 flex items-center">{icon}</span>
            <span>{children}</span>
        </span>
    );
}

// -------------------------------------------------------------
// Шаг онбординга
// -------------------------------------------------------------

interface StepProps {
    number: number;
    icon: React.ReactNode;
    title: string;
    last?: boolean;
    children: React.ReactNode;
}

function Step({ number, icon, title, last = false, children }: StepProps) {
    return (
        <div className="flex gap-4">
            {/* Номер шага и вертикальная линия */}
            <div className="flex flex-col items-center">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-sm font-semibold text-primary">
                    {number}
                </div>
                {!last && (
                    <div className="mt-1 w-0.5 flex-1 min-h-6 rounded-full bg-primary/20" />
                )}
            </div>

            {/* Содержимое шага */}
            <div className={cn("flex-1 pb-6", last && "pb-2")}>
                <Row icon={<span className="text-primary flex items-center">{icon}</span>} className="mb-2.5">
                    <span className="text-sm font-semibold text-foreground">{title}</span>
                </Row>
                {children}
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// Кнопка выбора платформы
// -------------------------------------------------------------

function PlatformButton({
    platform,
    isSelected,
    onClick,
}: {
    platform: Platform;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all shrink-0",
                isSelected
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border/50 bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/50",
            )}
        >
            <span className="flex items-center justify-center">
                <platform.Icon size={20} />
            </span>
            <span className="text-[11px] font-medium leading-none">{platform.name}</span>
        </button>
    );
}

// -------------------------------------------------------------
// Карточка клиента
// -------------------------------------------------------------

function ClientCard({ platform }: { platform: Platform }) {
    return (
        <div className="animate-fade-in flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
            <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-none mb-1">
                    {platform.clientName}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    {platform.clientDescription}
                </p>
            </div>
            <a
                href={platform.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline shrink-0"
            >
                <ExternalLink size={11} className="shrink-0" />
                <span>{platform.downloadLabel}</span>
            </a>
        </div>
    );
}

// -------------------------------------------------------------
// Блок с текстом
// -------------------------------------------------------------

function InfoBlock({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn(
            "rounded-xl border border-border/50 bg-muted/30 px-4 py-3.5 text-sm text-muted-foreground leading-relaxed space-y-2.5",
            className,
        )}>
            {children}
        </div>
    );
}

// -------------------------------------------------------------
// Основной компонент
// -------------------------------------------------------------

export function Guide() {
    const [selectedId, setSelectedId] = useState<PlatformId | null>(null);
    const platform = PLATFORMS.find((p) => p.id === selectedId) ?? null;

    return (
        <div className="rounded-2xl border border-border bg-card p-5 glass">
            <h2 className="mb-5 text-base font-semibold text-foreground tracking-tight">
                Как начать пользоваться
            </h2>

            <div className="space-y-2">

                {/* Шаг 1 — связаться с администратором */}
                <Step number={1} icon={<MessageCircle size={15} />} title="Связаться с администратором">
                    <InfoBlock>
                        <p>Напишите администратору — он активирует аккаунт и сообщит цену</p>
                        <a
                            href="https://t.me/stdoq"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/8 px-3 py-2.5 hover:bg-primary/12 transition-colors"
                        >
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                <MessageCircle size={15} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-primary leading-none mb-1">@stdoq</p>
                                <p className="text-xs text-muted-foreground leading-none">Telegram</p>
                            </div>
                            <ExternalLink size={13} className="shrink-0 text-primary/50" />
                        </a>
                    </InfoBlock>
                </Step>

                {/* Шаг 2 — установить клиент */}
                <Step number={2} icon={<Download size={15} />} title="Установить клиент">
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Выберите Вашу платформу — мы подберём подходящее приложение:
                        </p>
                        <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-3 gap-2">
                                {PLATFORMS.slice(0, 3).map((p) => (
                                    <PlatformButton
                                        key={p.id}
                                        platform={p}
                                        isSelected={selectedId === p.id}
                                        onClick={() => setSelectedId((prev) => (prev === p.id ? null : p.id))}
                                    />
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {PLATFORMS.slice(3).map((p) => (
                                    <PlatformButton
                                        key={p.id}
                                        platform={p}
                                        isSelected={selectedId === p.id}
                                        onClick={() => setSelectedId((prev) => (prev === p.id ? null : p.id))}
                                    />
                                ))}
                            </div>
                        </div>
                        {platform && <ClientCard platform={platform} />}
                    </div>
                </Step>

                {/* Шаг 3 — получить ключ */}
                {platform && (
                    <Step number={3} icon={<Copy size={15} />} title="Скопировать ключ">
                        <InfoBlock>
                            <p>
                                Ключ подключения — это адрес сервера и Ваши данные доступа, упакованные в одну строку.
                            </p>
                            <div className="h-px bg-border/40" />
                            <p>
                                На странице профиля выберите{" "}
                                <strong className="text-foreground">сервер</strong>{" "}
                                из списка доступных — каждый сервер имеет свой ключ.
                            </p>
                            <p className="flex flex-wrap items-center gap-1.5">
                                После выбора нажмите{" "}
                                <Badge icon={<Copy size={11} />}>Скопировать ключ</Badge>.
                            </p>
                        </InfoBlock>
                    </Step>
                )}

                {/* Шаг 4 — открыть приложение */}
                {platform && (
                    <Step number={4} icon={<Plus size={15} />} title={`Открыть ${platform.clientName}`}>
                        <InfoBlock>
                            <p className="flex flex-wrap items-center gap-1.5">
                                Откройте{" "}
                                <strong className="text-foreground">{platform.clientName}</strong>.
                                Найдите кнопку{" "}
                                <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                                    <Plus size={11} strokeWidth={2.5} />
                                </span>
                                {" "}— обычно она находится вверху экрана.
                            </p>
                            <p>Эта кнопка открывает меню добавления нового подключения.</p>
                        </InfoBlock>
                    </Step>
                )}

                {/* Шаг 5 — импортировать конфигурацию */}
                {platform && (
                    <Step number={5} icon={<Download size={15} />} title="Импортировать конфигурацию">
                        <InfoBlock>
                            <p className="flex flex-wrap items-center gap-1.5">
                                В открывшемся меню выберите{" "}
                                <Badge icon={null}>Импорт из буфера обмена</Badge>
                            </p>
                            <div className="h-px bg-border/40" />
                            <p>
                                Приложение само прочитает скопированный ключ и создаст профиль —
                                вам ничего вводить вручную не нужно.
                            </p>
                            <Row
                                icon={<Check size={13} className="text-emerald-500" />}
                                className="rounded-lg bg-emerald-500/6 border border-emerald-500/25 px-3 py-2 text-emerald-500 text-sm"
                            >
                                Профиль появится в списке подключений
                            </Row>
                        </InfoBlock>
                    </Step>
                )}

                {/* Шаг 6 — подключиться */}
                {platform && (
                    <Step number={6} icon={<CheckCircle2 size={15} />} title="Подключиться" last>
                        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/6 px-4 py-4 space-y-3">
                            <Row icon={
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                                    <CheckCircle2 size={15} />
                                </div>
                            }>
                                <span className="text-sm font-semibold text-emerald-500">Готово!</span>
                            </Row>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Выберите созданный профиль и включите соединение —
                                интернет без ограничений.
                            </p>
                        </div>
                    </Step>
                )}

            </div>
        </div>
    );
}