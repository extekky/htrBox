import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, KeyRound, AlertTriangle } from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormInput } from "@/components/ui/FormInput";
import { ModalActions } from "@/components/ui/ModalActions";
import { CopyButton } from "@/components/ui/CopyButton";
import { ToggleCard } from "@/components/ui/ToggleCard";

import { useCreateUser } from "@/hooks/useUsers";
import { useToast } from "@/hooks/useToast";
import { createUserSchema, type CreateUserFormValues } from "@/lib/validators";
import { fromInputDatetimeLocal, nowMoscowInput } from "@/lib/formatters";
import type { CreateUserResponse } from "@/api/types";

// -------------------------------------------------------------
// Экран успеха — показывает сгенерированный Hysteria-пароль
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

            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 size={18} className="text-primary" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-foreground">Пользователь создан</p>
                    <p className="text-xs text-muted-foreground">{data.username}</p>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <KeyRound size={13} className="text-muted-foreground" />
                    <FormLabel>Hysteria-пароль</FormLabel>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-border bg-input px-3 py-2.5">
                    <code className="flex-1 text-xs font-mono text-foreground break-all leading-relaxed">
                        {data.hyPassword}
                    </code>
                    <CopyButton text={data.hyPassword} />
                </div>

                <p className="flex items-center gap-1.5 text-xs text-amber-500 leading-relaxed">
                    <AlertTriangle size={11} className="shrink-0" />
                    Сохраните пароль — он больше не будет показан.
                </p>
            </div>

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
// Форма создания пользователя
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
            active: false,
            expires_at: null,
        },
    });

    const allowed = watch("allowed");
    const active = watch("active");

    function onSubmit(values: CreateUserFormValues) {
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
            description="Hysteria url будет сгенерирован автоматически"
            footer={
                <ModalActions
                    formId="user-create-form"
                    label="Создать"
                    onCancel={onClose}
                    loading={isPending}
                />
            }
        >
            <form
                id="user-create-form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-4"
            >
                {/* Имя пользователя */}
                <FormInput
                    label="Имя пользователя"
                    placeholder="username"
                    autoFocus
                    autoComplete="off"
                    error={errors.username?.message}
                    {...register("username")}
                />

                {/* Пароль — глазик добавляется автоматически */}
                <FormInput
                    label="Пароль"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    error={errors.password?.message}
                    {...register("password")}
                />

                {/* Дата истечения — нативный datetime-local */}
                <FormInput
                    label="Истекает (необязательно)"
                    id="user-expires"
                    type="datetime-local"
                    min={nowMoscowInput()}
                    error={errors.expires_at?.message}
                    {...register("expires_at")}
                />

                {/* Тоглы доступа */}
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
            </form>
        </Modal>
    );
}