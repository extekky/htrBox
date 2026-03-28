import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Modal } from "@/components/ui/Modal";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormField } from "@/components/ui/FormField";
import { ModalActions } from "@/components/ui/ModalActions";
import { ToggleCard } from "@/components/ui/ToggleCard";

import { useCreateServer } from "@/hooks/useServers";
import { useToast } from "@/hooks/useToast";
import { createServerSchema, type CreateServerFormValues } from "@/lib/validators";

// -------------------------------------------------------------
// Форма создания сервера
// -------------------------------------------------------------

interface ServerCreateModalProps {
    onClose: () => void;
}

export function ServerCreateModal({ onClose }: ServerCreateModalProps) {
    const { mutate: createServer, isPending } = useCreateServer();
    const { success, error } = useToast();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateServerFormValues>({
        resolver: zodResolver(createServerSchema),
        defaultValues: {
            port: 443,
            label: "VPN",
            protocol: "hysteria2",
            active: true,
        },
    });

    const active = watch("active");
    const ip = watch("ip");

    // Автозаполнение hysteria_url при изменении IP
    useEffect(() => {
        if (!ip) return;
        setValue("hysteria_url", `http://${ip}:8080`);
    }, [ip, setValue]);

    function onSubmit(values: CreateServerFormValues) {
        createServer(
            {
                ...values,
                domain: values.domain || null,
                hysteria_url: values.hysteria_url || null,
                label: values.label || "VPN",
            },
            {
                onSuccess: () => { success("Сервер добавлен"); onClose(); },
                onError: (e) => error("Ошибка добавления сервера", e.message),
            },
        );
    }

    return (
        <Modal
            open
            onClose={onClose}
            title="Новый сервер"
            description="Регистрация VPN-сервера Hysteria2"
            size="lg"
            footer={
                <ModalActions
                    formId="server-create-form"
                    label="Добавить"
                    onCancel={onClose}
                    loading={isPending}
                />
            }
        >
            <form
                id="server-create-form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-4"
            >
                {/* Страна / Город */}
                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        label="Страна"
                        placeholder="Россия"
                        autoFocus
                        error={errors.country?.message}
                        {...register("country")}
                    />
                    <FormField
                        label="Город"
                        placeholder="Москва"
                        error={errors.city?.message}
                        {...register("city")}
                    />
                </div>

                {/* IP */}
                <FormField
                    label="IP-адрес"
                    placeholder="1.2.3.4"
                    error={errors.ip?.message}
                    {...register("ip")}
                />

                {/* Домен / Порт */}
                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        label="Домен (необязательно)"
                        placeholder="vpn.example.com"
                        error={errors.domain?.message}
                        {...register("domain")}
                    />
                    <FormField
                        label="Порт"
                        type="number"
                        placeholder="443"
                        error={errors.port?.message}
                        {...register("port", { valueAsNumber: true })}
                    />
                </div>

                {/* Название / Протокол */}
                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        label="Название"
                        placeholder="VPN"
                        error={errors.label?.message}
                        {...register("label")}
                    />
                    <FormField
                        label="Протокол"
                        placeholder="hysteria2"
                        error={errors.protocol?.message}
                        {...register("protocol")}
                    />
                </div>

                {/* Hysteria URL */}
                <div className="flex flex-col gap-1.5">
                    <FormLabel htmlFor="server-create-hy-url">Hysteria URL (внутренний)</FormLabel>
                    <input
                        id="server-create-hy-url"
                        {...register("hysteria_url")}
                        placeholder="http://1.2.3.4:8080"
                        className="h-9 w-full rounded-lg border border-border bg-input px-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                    />
                    {errors.hysteria_url && (
                        <p className="text-xs text-destructive">{errors.hysteria_url.message}</p>
                    )}
                </div>

                {/* Активен */}
                <ToggleCard
                    label="Активен сразу"
                    description="Сервер будет доступен для подключений сразу после добавления"
                    checked={!!active}
                    onChange={(v) => setValue("active", v)}
                />
            </form>
        </Modal>
    );
}