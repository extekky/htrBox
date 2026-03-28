import { useState } from "react";
import { Link2, RefreshCw } from "lucide-react";

import { useServerStore, selectSelectedServer, selectUrlMap } from "@/stores/serverStore";
import { useAuthStore, selectUser } from "@/stores/authStore";
import { initServerData } from "@/hooks/useServers";
import { ApiRequestError } from "@/api/client";
import { CopyButton } from "@/components/ui/CopyButton";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/cn";

/**
 * Компонент карточки подключения (ConnectionCard).
 * 
 * Основные задачи:
 * - Отображение текущего выбранного VPN-сервера.
 * - Генерация и показ ссылки для подключения (Hysteria2 URL).
 * - Предоставление интерфейса для копирования ключа и ручного обновления данных.
 * 
 * Логика состояний:
 * - Если сервер не выбран: показывается предложение выбрать сервер.
 * - Если сервер выбран, но URL еще не загружен: показывается индикатор загрузки.
 * - Если данные доступны: отображается URL и кнопка копирования.
 */
export function ConnectionCard() {
    // Состояние индикации процесса обновления данных серверов
    const [refreshing, setRefreshing] = useState(false);

    // Извлекаем данные из глобальных хранилищ (Zustand)
    const selectedServer = useServerStore(selectSelectedServer);
    const urlMap = useServerStore(selectUrlMap);
    const user = useAuthStore(selectUser);
    const { success, error } = useToast();

    // Вычисляем URL подключения на основе выбранного сервера и карты доступных URL
    const connectionUrl = selectedServer ? (urlMap[selectedServer.id] ?? null) : null;

    /**
     * Обработчик принудительного обновления данных серверов.
     * Перезапрашивает список серверов и генерирует новые URL для текущего пользователя.
     */
    async function handleRefresh() {
        // Защита от повторных кликов и вызова без авторизации
        if (!user || refreshing) return;
        
        setRefreshing(true);
        try {
            // Вызываем хук инициализации данных серверов
            await initServerData(user.username);
            success("Ключи обновлены");
        } catch (e) {
            if (e instanceof ApiRequestError && e.status === 429) {
                error("Слишком много запросов", "Подождите немного и попробуйте снова");
            } else {
                error("Ошибка", "Не удалось обновить ключи");
            }
        } finally {
            setRefreshing(false);
        }
    }

    return (
        <div className="p-4.5 flex flex-col gap-3">

            {/* -- Заголовок карточки ------------------------------------------ */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    {/* Иконка ссылки в стилизованном контейнере */}
                    <div className="flex items-center justify-center w-7.5 h-7.5 rounded-[9px] bg-primary/10 text-primary shrink-0">
                        <Link2 size={13} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground leading-none">Ключ доступа</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Скопируйте в VPN-клиент</p>
                    </div>
                </div>

                {/* Кнопка обновления данных */}
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    title="Обновить ключи"
                    aria-label="Обновить ключи"
                    className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-lg",
                        "border border-border/60 text-muted-foreground",
                        "hover:bg-muted/60 hover:text-foreground",
                        "transition-colors disabled:opacity-40",
                    )}
                >
                    <RefreshCw size={12} className={cn(refreshing && "animate-spin")} />
                </button>
            </div>

            {/* -- Информация о выбранном сервере ------------------------------ */}
            {selectedServer && (
                <div className="inline-flex items-center gap-1.5 self-start px-2 py-1 rounded-full bg-muted/50 border border-border/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs text-foreground font-medium">{selectedServer.country}</span>
                    <span className="text-xs text-muted-foreground">—</span>
                    <span className="text-xs text-muted-foreground">{selectedServer.city}</span>
                </div>
            )}

            {/* -- Основная область контента (URL или Состояния) --------------- */}
            {!selectedServer ? (
                // Состояние: Сервер еще не выбран
                <div className="flex items-center justify-center h-10 rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                    Выберите сервер для получения ключа
                </div>
            ) : !connectionUrl ? (
                // Состояние: Сервер выбран, но URL еще загружается
                <div className="flex items-center justify-center h-10 rounded-xl text-sm text-muted-foreground gap-2">
                    <RefreshCw size={13} className="animate-spin" />
                    Загрузка ключа...
                </div>
            ) : (
                // Состояние: URL успешно получен и готов к копированию
                <>
                    {/* Блок с отображением URL */}
                    <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5">
                        <p className="text-[9px] font-medium uppercase tracking-[0.09em] text-muted-foreground mb-1.5">
                            Hysteria2 URL
                        </p>
                        <code className="text-[11px] font-mono text-foreground break-all leading-relaxed select-all">
                            {connectionUrl}
                        </code>
                    </div>

                    <CopyButton
                        variant="block"
                        text={connectionUrl}
                        label="Скопировать ключ"
                    />
                </>
            )}
        </div>
    );
}
