import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    RefreshCw, Shield, ShieldOff, KeyRound,
    Check, Copy, Settings, Loader2, AlertTriangle,
    Activity, RotateCcw,
} from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormInput } from "@/components/ui/FormInput";
import { ModalActions } from "@/components/ui/ModalActions";
import { ToggleCard } from "@/components/ui/ToggleCard";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

import {
    useUpdateUser,
    useSetRole,
    useRegenerateHy,
    useResetTraffic,
} from "@/hooks/useUsers";
import { useToast } from "@/hooks/useToast";
import { updateUserSchema, type UpdateUserFormValues } from "@/lib/validators";
import {
    toInputDatetimeLocal,
    fromInputDatetimeLocal,
    toGB,
} from "@/lib/formatters";
import { DEFAULT_TRAFFIC_LIMIT_GB } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { UserResponse } from "@/api/types";

type Tab = "main" | "access" | "traffic";

// -------------------------------------------------------------
// Вкладка «Доступ» — роль и Hysteria-пароль
// -------------------------------------------------------------

function AccessTab({ user }: { user: UserResponse }) {
    const { mutate: setRole, isPending: rolePending } = useSetRole();
    const { mutate: regenerateHy, isPending: regenPending } = useRegenerateHy();
    const { success, error } = useToast();

    const [confirmRole, setConfirmRole] = useState(false);
    const [confirmRegen, setConfirmRegen] = useState(false);
    const [newHyPass, setNewHyPass] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    function handleRoleToggle() {
        const newRole = user.role === "admin" ? "user" : "admin";
        setRole(
            { username: user.username, data: { role: newRole } },
            {
                onSuccess: () => { success(`Роль изменена -> ${newRole}`, user.username); setConfirmRole(false); },
                onError: (e) => { error("Ошибка смены роли", e.message); setConfirmRole(false); },
            },
        );
    }

    function handleRegen() {
        regenerateHy(user.username, {
            onSuccess: (data) => {
                setNewHyPass(data.hyPassword);
                success("Hysteria-пароль обновлён", user.username);
                setConfirmRegen(false);
            },
            onError: (e) => { error("Ошибка регенерации", e.message); setConfirmRegen(false); },
        });
    }

    function copyHyPass() {
        if (!newHyPass) return;
        navigator.clipboard.writeText(newHyPass).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    const isAdmin = user.role === "admin";

    return (
        <div className="flex flex-col gap-3">

            {/* Смена роли */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        isAdmin ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground",
                    )}>
                        {isAdmin ? <Shield size={15} /> : <ShieldOff size={15} />}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Роль:{" "}
                            <span className={isAdmin ? "text-amber-500" : "text-muted-foreground"}>
                                {user.role}
                            </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {isAdmin ? "Полный доступ к панели" : "Обычный пользователь"}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setConfirmRole(true)}
                    disabled={rolePending}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 disabled:opacity-50 transition-colors"
                >
                    {rolePending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    Сменить
                </button>
            </div>

            {/* Регенерация Hysteria-пароля */}
            <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-500">
                            <KeyRound size={15} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">Hysteria-пароль</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Инвалидирует текущую строку подключения
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setConfirmRegen(true)}
                        disabled={regenPending}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/15 disabled:opacity-50 transition-colors"
                    >
                        {regenPending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                        Сгенерировать
                    </button>
                </div>

                {newHyPass && (
                    <>
                        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                            <code className="flex-1 text-xs font-mono text-foreground break-all leading-relaxed">
                                {newHyPass}
                            </code>
                            <button
                                type="button"
                                onClick={copyHyPass}
                                className="shrink-0 h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                {copied
                                    ? <Check size={13} className="text-emerald-500" />
                                    : <Copy size={13} />
                                }
                            </button>
                        </div>
                        <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                            <AlertTriangle size={11} />
                            Сохраните пароль — он больше не будет показан
                        </p>
                    </>
                )}
            </div>

            <ConfirmDialog
                open={confirmRole}
                onClose={() => setConfirmRole(false)}
                onConfirm={handleRoleToggle}
                title={`Сменить роль на «${isAdmin ? "user" : "admin"}»?`}
                description={
                    isAdmin
                        ? `«${user.username}» потеряет доступ к панели администратора.`
                        : `«${user.username}» получит полный доступ к панели администратора.`
                }
                confirmLabel="Сменить"
                loading={rolePending}
            />

            <ConfirmDialog
                open={confirmRegen}
                onClose={() => setConfirmRegen(false)}
                onConfirm={handleRegen}
                title="Обновить Hysteria-пароль?"
                description={`Текущая строка подключения «${user.username}» перестанет работать. Потребуется скопировать новую.`}
                confirmLabel="Обновить"
                loading={regenPending}
            />
        </div>
    );
}

// -------------------------------------------------------------
// Вкладка «Трафик» — сброс счётчика
// -------------------------------------------------------------

function TrafficTab({ user }: { user: UserResponse }) {
    const { mutate: resetTraffic, isPending } = useResetTraffic();
    const { success, error } = useToast();

    const [confirmReset, setConfirmReset] = useState(false);

    const usedGb = toGB(user.usedTraffic);
    const trafficPct = Math.min(100, (usedGb / DEFAULT_TRAFFIC_LIMIT_GB) * 100);

    function handleReset() {
        resetTraffic(user.username, {
            onSuccess: () => {
                success("Трафик сброшен", user.username);
                setConfirmReset(false);
            },
            onError: (e) => {
                error("Ошибка сброса трафика", e.message);
                setConfirmReset(false);
            },
        });
    }

    return (
        <div className="flex flex-col gap-3">

            {/* Кнопка сброса */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-destructive/20 bg-destructive/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-destructive/10 text-destructive">
                        <RotateCcw size={15} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">Сбросить счётчик</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Обнулить траффик пользователя. Исторические данные графика сохранятся.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 disabled:opacity-50 transition-colors"
                >
                    {isPending ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                    Сбросить
                </button>
            </div>

            <ConfirmDialog
                open={confirmReset}
                onClose={() => setConfirmReset(false)}
                onConfirm={handleReset}
                title="Сбросить трафик?"
                description={`Счётчик трафика «${user.username}» будет обнулён. Исторические данные графика сохранятся.`}
                confirmLabel="Сбросить"
                loading={isPending}
            />
        </div>
    );
}

// -------------------------------------------------------------
// Модальное окно редактирования пользователя
// -------------------------------------------------------------

interface UserEditModalProps {
    user: UserResponse;
    onClose: () => void;
}

export function UserEditModal({ user, onClose }: UserEditModalProps) {
    const [tab, setTab] = useState<Tab>("main");

    const { mutate: updateUser, isPending } = useUpdateUser();
    const { success, error } = useToast();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<UpdateUserFormValues>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: {
            allowed: user.allowed,
            active: user.active,
            password: "",
            expires_at: toInputDatetimeLocal(user.expires_at) || toInputDatetimeLocal(new Date().toISOString()),
        },
    });

    const allowed = watch("allowed");
    const active = watch("active");

    function onSubmit(values: UpdateUserFormValues) {
        const data: UpdateUserFormValues = {
            allowed: values.allowed,
            active: values.active,
            expires_at: values.expires_at
                ? fromInputDatetimeLocal(values.expires_at as string)
                : null,
        };
        if (values.password) data.password = values.password;

        updateUser(
            { username: user.username, data },
            {
                onSuccess: () => { success("Сохранено", user.username); onClose(); },
                onError: (e) => error("Ошибка сохранения", e.message),
            },
        );
    }

    const usedGb = toGB(user.usedTraffic);
    const trafficPct = Math.min(100, (usedGb / DEFAULT_TRAFFIC_LIMIT_GB) * 100);

    const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: "main", label: "Основное", icon: <Settings size={13} /> },
        { id: "access", label: "Доступ", icon: <Shield size={13} /> },
        { id: "traffic", label: "Трафик", icon: <Activity size={13} /> },
    ];

    return (
        <Modal
            open
            onClose={onClose}
            title="Редактировать пользователя"
            footer={
                tab === "main" ? (
                    <ModalActions
                        formId="user-edit-form"
                        label="Сохранить"
                        onCancel={onClose}
                        loading={isPending}
                    />
                ) : (
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 px-4 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                        Закрыть
                    </button>
                )
            }
        >
            <div className="flex flex-col gap-4">

                {/* Карточка пользователя с мини-баром трафика */}
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{user.username}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-mono text-muted-foreground tabular-nums">
                            {usedGb.toFixed(2)} / {DEFAULT_TRAFFIC_LIMIT_GB} GB
                        </span>
                        <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all",
                                    trafficPct > 90 ? "bg-rose-500" : trafficPct > 70 ? "bg-amber-500" : "bg-primary/60",
                                )}
                                style={{ width: `${trafficPct}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Вкладки */}
                <div className="flex gap-1 p-0.5 bg-muted rounded-lg">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            className={cn(
                                "flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                tab === t.id
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {t.icon}
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Основная вкладка */}
                {tab === "main" && (
                    <form
                        id="user-edit-form"
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col gap-2">
                            <ToggleCard
                                label="Доступ к сервису"
                                description={allowed ? "Не забанен" : "Будет забанен"}
                                checked={!!allowed}
                                onChange={(v) => setValue("allowed", v)}
                            />
                            <ToggleCard
                                label="Подписка"
                                description={active ? "Будет активирована" : "Будет отключена"}
                                checked={!!active}
                                onChange={(v) => setValue("active", v)}
                            />
                        </div>

                        <div className="h-px bg-border" />

                        {/* Дата истечения — нативный datetime-local */}
                        <div className="flex flex-col gap-1.5">
                            <FormLabel htmlFor="user-edit-expires">Истекает</FormLabel>
                            <input
                                id="user-edit-expires"
                                {...register("expires_at")}
                                type="datetime-local"
                                className="h-9 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                            />
                            {errors.expires_at && (
                                <p className="text-xs text-destructive">{errors.expires_at.message}</p>
                            )}
                        </div>

                        {/* Новый пароль — глазик добавляется автоматически */}
                        <FormInput
                            label="Новый пароль"
                            type="password"
                            placeholder="Оставьте пустым, чтобы не менять"
                            autoComplete="new-password"
                            error={errors.password?.message}
                            {...register("password")}
                        />
                    </form>
                )}

                {tab === "access" && <AccessTab user={user} />}
                {tab === "traffic" && <TrafficTab user={user} />}
            </div>
        </Modal>
    );
}