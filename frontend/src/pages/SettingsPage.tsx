/**
 * @file src/pages/SettingsPage.tsx
 * @description Страница настроек аккаунта.
 *
 * Разделы:
 *   - Смена пароля для входа в личный кабинет
 *   - Перегенерация пароля Hysteria2 VPN-подключения
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Loader2, Key, ShieldCheck, RefreshCw, Eye, EyeOff } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/CheckBox";
import { FormInput } from "@/components/ui/FormInput";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

import { useChangePassword, useRegenerateHy } from "@/hooks/useUsers";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/stores/authStore";
import { queryClient } from "@/queryClient";
import { changePasswordSchema, type ChangePasswordFormValues } from "@/lib/validators";
import { cn } from "@/lib/cn";

// -------------------------------------------------------------
// Секция: Hysteria VPN — перегенерация пароля
// -------------------------------------------------------------

function HysteriaSection({ username }: { username: string }) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const { mutate: regenerate, isPending } = useRegenerateHy();
    const { success, error: showError } = useToast();

    const handleRegenerate = () => {
        regenerate(username, {
            onSuccess: () => {
                success("Hysteria-пароль обновлён", "Скопируйте новую строку подключения");
                setConfirmOpen(false);
            },
            onError: (err) => {
                showError("Не удалось обновить пароль", err.message);
                setConfirmOpen(false);
            },
        });
    };

    return (
        <>
            <Card>
                <CardHeader className="flex-row items-start gap-4 p-5 pb-0">
                    {/* Иконка секции */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                        <Key size={18} />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-base">Hysteria VPN пароль</CardTitle>
                        <CardDescription className="mt-1">
                            Пароль используется в VPN-клиенте для подключения.
                            После перегенерации текущая сессия будет прервана.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="p-5 pt-4">
                    <button
                        type="button"
                        onClick={() => setConfirmOpen(true)}
                        disabled={isPending}
                        className={cn(
                            "inline-flex items-center gap-2",
                            "h-10 px-5 rounded-xl text-sm font-medium",
                            "bg-primary/10 text-primary border border-primary/20",
                            "hover:bg-primary/15 transition-colors duration-150",
                            "disabled:opacity-60 disabled:pointer-events-none",
                        )}
                    >
                        {isPending
                            ? <Loader2 size={15} className="animate-spin" />
                            : <RefreshCw size={15} />
                        }
                        Сгенерировать новый
                    </button>
                </CardContent>
            </Card>

            {/* Диалог подтверждения */}
            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleRegenerate}
                title="Обновить Hysteria-пароль?"
                description="Текущая VPN-сессия будет прервана. После генерации потребуется заново скопировать строку подключения."
                confirmLabel="Сгенерировать"
                variant="destructive"
                loading={isPending}
            />
        </>
    );
}

// -------------------------------------------------------------
// Секция: Пароль аккаунта — смена
// -------------------------------------------------------------

function AccountPasswordSection({ username, isAdmin }: { username: string; isAdmin: boolean }) {
    const { mutate: changePassword, isPending } = useChangePassword();
    const { success, error: showError } = useToast();

    const clearAuth = useAuthStore((state) => state.clearAuth);
    const [, navigate] = useLocation();

    // Состояние видимости паролей (единая кнопка для всех полей)
    const [showPasswords, setShowPasswords] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingValues, setPendingValues] = useState<ChangePasswordFormValues | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema) as any,
        defaultValues: { apply_hy: false },
    });

    const applyHy = watch("apply_hy");

    // Тип поля пароля в зависимости от переключателя видимости.
    // Передаём в FormInput через rightSlot, чтобы все три поля
    // управлялись одной кнопкой (а не тремя отдельными).
    const passwordType = showPasswords ? "text" : "password";

    // Шаг 1: валидация прошла — сохранить значения и показать диалог
    const onSubmit = (values: ChangePasswordFormValues) => {
        setPendingValues(values);
        setConfirmOpen(true);
    };

    // Шаг 2: пользователь подтвердил — отправить запрос
    const handleConfirm = () => {
        if (!pendingValues) return;

        const { confirm_password, password, ...rest } = pendingValues;

        changePassword(
            {
                username,
                data: isAdmin
                    ? { new_password: rest.new_password, apply_hy: rest.apply_hy }
                    : { password: password || undefined, ...rest },
            },
            {
                onSuccess: () => {
                    success("Пароль изменён", "Войдите заново");
                    reset();
                    // Полная очистка сессии — аналогично useLogout
                    clearAuth();
                    queryClient.clear();
                    navigate("/login");
                },
                onError: (err) => {
                    showError("Ошибка изменения пароля", err.message);
                    setConfirmOpen(false);
                },
            },
        );
    };

    return (
        <>
            <Card>
                <CardHeader className="flex-row items-start gap-4 p-5 pb-0">
                    {/* Иконка секции */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                        <ShieldCheck size={18} />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-base">Пароль аккаунта</CardTitle>
                        <CardDescription className="mt-1">
                            Пароль для входа в личный кабинет.
                            После смены все активные сессии будут отозваны.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="p-5 pt-5">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                        className="flex flex-col gap-4"
                    >
                        {/* Текущий пароль — только для обычных пользователей */}
                        {!isAdmin && (
                            <FormInput
                                label="Текущий пароль"
                                type={passwordType}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                error={errors.password?.message}
                                // Убираем встроенный глазик — у нас общая кнопка ниже
                                rightSlot={null}
                                {...register("password")}
                            />
                        )}

                        {/* Новый пароль */}
                        <FormInput
                            label="Новый пароль"
                            type={passwordType}
                            autoComplete="new-password"
                            placeholder="Минимум 8 символов"
                            error={errors.new_password?.message}
                            rightSlot={null}
                            {...register("new_password")}
                        />

                        {/* Подтверждение нового пароля */}
                        <FormInput
                            label="Подтверждение"
                            type={passwordType}
                            autoComplete="new-password"
                            placeholder="••••••••"
                            error={errors.confirm_password?.message}
                            rightSlot={null}
                            {...register("confirm_password")}
                        />

                        {/* Чекбокс: синхронизировать с Hysteria-паролем */}
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <Checkbox
                                id="apply-hy"
                                checked={applyHy}
                                onCheckedChange={(checked) => setValue("apply_hy", !!checked)}
                            />
                            <span className="text-sm text-muted-foreground">
                                Также обновить Hysteria-пароль
                            </span>
                        </label>

                        {/* Панель действий */}
                        <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
                            {/* Кнопка показать/скрыть пароли — управляет всеми тремя полями */}
                            <button
                                type="button"
                                onClick={() => setShowPasswords((v) => !v)}
                                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPasswords
                                    ? <><EyeOff size={13} /> Скрыть пароли</>
                                    : <><Eye size={13} /> Показать пароли</>
                                }
                            </button>

                            {/* Кнопка сохранения */}
                            <button
                                type="submit"
                                disabled={isPending}
                                className={cn(
                                    "inline-flex items-center gap-2",
                                    "h-10 px-6 rounded-xl text-sm font-medium",
                                    "bg-primary/10 text-primary border border-primary/20",
                                    "hover:bg-primary/15 transition-colors duration-150",
                                    "disabled:opacity-60 disabled:pointer-events-none",
                                )}
                            >
                                {isPending && <Loader2 size={14} className="animate-spin" />}
                                Сохранить изменения
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Диалог подтверждения */}
            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirm}
                title="Сменить пароль аккаунта?"
                description="Все активные сессии будут отозваны. После смены пароля потребуется войти заново."
                confirmLabel="Сменить пароль"
                variant="destructive"
                loading={isPending}
            />
        </>
    );
}

// -------------------------------------------------------------
// Главный компонент страницы
// -------------------------------------------------------------

export function SettingsPage() {
    const user = useAuthStore((s) => s.user);

    // Пользователь не авторизован — ничего не рендерим (роутер должен редиректить)
    if (!user) return null;

    const isAdmin = user.role === "admin";

    return (
        <AppShell>
            <div className="flex justify-center py-8 px-4">
                <div className="w-full max-w-150 flex flex-col gap-4 animate-fade-in">

                    {/* Заголовок страницы */}
                    <div className="mb-1">
                        <h1 className="text-xl font-bold text-foreground tracking-tight">
                            Настройки
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Управление паролями аккаунта и VPN-подключения
                        </p>
                    </div>

                    {/* Секция: Hysteria VPN */}
                    <HysteriaSection username={user.username} />

                    {/* Секция: Пароль аккаунта */}
                    <AccountPasswordSection username={user.username} isAdmin={isAdmin} />

                </div>
            </div>
        </AppShell>
    );
}