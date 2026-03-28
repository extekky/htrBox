import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, KeyRound } from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import { FormLabel } from "@/components/ui/FormLabel";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToggleCard } from "@/components/ui/ToggleCard";
import { useCreateUser } from "@/hooks/useUsers";
import { useToast } from "@/hooks/useToast";

import {
    createUserSchema,
    type CreateUserFormValues,
} from "@/lib/validators";

import {
    fromInputDatetimeLocal,
    nowMoscowInput,
} from "@/lib/formatters";

import { cn } from "@/lib/cn";
import type { CreateUserResponse } from "@/api/types";

// -------------------------------------------------------------
// Экран успеха
// Отображается после успешного создания пользователя.
// Показывает сгенерированный пароль Hysteria.
// -------------------------------------------------------------

function SuccessScreen({
    data,
    onClose,
}: {
    data: CreateUserResponse;
    onClose: () => void;
}) {
    return (
        <div className="flex flex-col gap-5">

            {/* Заголовок */}
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 size={18} className="text-primary" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-foreground">
                        Пользователь создан
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {data.username}
                    </p>
                </div>
            </div>

            {/* Пароль Hysteria */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <KeyRound size={13} className="text-muted-foreground" />
                    <FormLabel>Hysteria пароль</FormLabel>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-border bg-input px-3 py-2.5">
                    <code className="flex-1 text-xs font-mono text-foreground break-all leading-relaxed">
                        {data.hyPassword}
                    </code>
                    <CopyButton text={data.hyPassword} />
                </div>

                <p className="text-xs text-amber-500 leading-relaxed">
                    Сохраните пароль — он больше не будет показан.
                    Используется для подключения через Hysteria 2.
                </p>
            </div>

            {/* Кнопка закрытия */}
            <button
                onClick={onClose}
                className="h-9 w-full rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm font-medium hover:bg-primary/15 transition-colors"
            >
                Готово
            </button>

        </div>
    );
}

// -------------------------------------------------------------
// Основной компонент создания пользователя
// -------------------------------------------------------------

interface UserCreateModalProps {
    onClose: () => void;
}

export function UserCreateModal({ onClose }: UserCreateModalProps) {
    const { mutate: createUser, isPending } = useCreateUser();
    const { success, error } = useToast();
    const [created, setCreated] = useState<CreateUserResponse | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            allowed: true,
            active: true,
            expires_at: null,
        },
    });

    const allowed = watch("allowed");
    const active = watch("active");

    /** Обрабатывает отправку формы создания нового пользователя. */
    function onSubmit(values: CreateUserFormValues) {
        // Преобразование локальной даты в UTC ISO
        const payload = {
            ...values,
            expires_at: values.expires_at
                ? fromInputDatetimeLocal(values.expires_at as string)
                : null,
        };

        createUser(payload, {
            onSuccess: (data) => {
                setCreated(data);
                success("Пользователь создан", data.username);
            },
            onError: (e) => error("Ошибка создания", e.message),
        });
    }

    // Отображение экрана успеха при наличии данных о созданном пользователе
    if (created) {
        return (
            <Modal open onClose={onClose} title="Пользователь создан">
                <SuccessScreen data={created} onClose={onClose} />
            </Modal>
        );
    }

    return (
        <Modal
            open
            onClose={onClose}
            title="Новый пользователь"
            description="Hysteria-пароль будет сгенерирован автоматически"
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 px-4 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        form="user-create-form"
                        disabled={isPending}
                        className="h-9 px-4 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                    >
                        {isPending && (
                            <span className="h-3.5 w-3.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                        )}
                        Создать
                    </button>
                </>
            }
        >
            <form
                id="user-create-form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-4"
            >
                {/* Имя пользователя */}
                <div className="flex flex-col gap-1.5">
                    <FormLabel>Имя пользователя</FormLabel>
                    <input
                        {...register("username")}
                        type="text"
                        autoFocus
                        autoComplete="off"
                        placeholder="username"
                        className={cn(
                            "h-9 w-full rounded-lg border bg-input px-3 text-sm text-foreground",
                            "placeholder:text-muted-foreground/40",
                            "focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors",
                            errors.username ? "border-destructive" : "border-border",
                        )}
                    />
                    {errors.username && (
                        <p className="text-xs text-destructive">{errors.username.message}</p>
                    )}
                </div>

                {/* Пароль */}
                <div className="flex flex-col gap-1.5">
                    <FormLabel>Пароль</FormLabel>
                    <input
                        {...register("password")}
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className={cn(
                            "h-9 w-full rounded-lg border bg-input px-3 text-sm text-foreground",
                            "placeholder:text-muted-foreground/40",
                            "focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors",
                            errors.password ? "border-destructive" : "border-border",
                        )}
                    />
                    {errors.password && (
                        <p className="text-xs text-destructive">{errors.password.message}</p>
                    )}
                </div>

                {/* Дата истечения */}
                <div className="flex flex-col gap-1.5">
                    <FormLabel>Истекает (необязательно)</FormLabel>
                    <input
                        {...register("expires_at")}
                        type="datetime-local"
                        min={nowMoscowInput()}
                        className={cn(
                            "h-9 w-full rounded-lg border bg-input px-3 text-sm text-foreground",
                            "focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors",
                            "border-border",
                        )}
                    />
                </div>

                {/* Переключатели статуса */}
                <div className="flex flex-col gap-2">
                    <ToggleCard
                        label="Разрешён"
                        description="Аккаунт не заблокирован администратором"
                        checked={!!allowed}
                        onChange={(v) => setValue("allowed", v)}
                    />
                    <ToggleCard
                        label="Активен"
                        description="Подписка активна, VPN доступен"
                        checked={!!active}
                        onChange={(v) => setValue("active", v)}
                    />
                </div>
            </form>
        </Modal>
    );
}
