import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Modal } from "@/components/ui/Modal";
import { FormInput } from "@/components/ui/FormInput";
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
                    <FormInput
                        label="Страна"
                        placeholder="Россия"
                        autoFocus
                        error={errors.country?.message}
                        {...register("country")}
                    />
                    <FormInput
                        label="Город"
                        placeholder="Москва"
                        error={errors.city?.message}
                        {...register("city")}
                    />
                </div>

                {/* IP */}
                <FormInput
                    label="IP-адрес"
                    placeholder="1.2.3.4"
                    error={errors.ip?.message}
                    {...register("ip")}
                />

                {/* Домен / Порт */}
                <div className="grid grid-cols-2 gap-3">
                    <FormInput
                        label="Домен (необязательно)"
                        placeholder="vpn.example.com"
                        error={errors.domain?.message}
                        {...register("domain")}
                    />
                    <FormInput
                        label="Порт"
                        type="number"
                        placeholder="443"
                        error={errors.port?.message}
                        {...register("port", { valueAsNumber: true })}
                    />
                </div>

                {/* Название / Протокол */}
                <div className="grid grid-cols-2 gap-3">
                    <FormInput
                        label="Название"
                        placeholder="VPN"
                        error={errors.label?.message}
                        {...register("label")}
                    />
                    <FormInput
                        label="Протокол"
                        placeholder="hysteria2"
                        error={errors.protocol?.message}
                        {...register("protocol")}
                    />
                </div>

                {/* Hysteria URL — автозаполняется по IP, моноширинный */}
                <FormInput
                    label="Hysteria URL (внутренний)"
                    placeholder="http://1.2.3.4:8080"
                    error={errors.hysteria_url?.message}
                    className="font-mono"
                    {...register("hysteria_url")}
                />

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