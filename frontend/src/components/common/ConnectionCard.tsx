import { useState } from "react";
import { Link2, RefreshCw } from "lucide-react";

import {
  useServerStore,
  selectSelectedServer,
  selectUrlMap,
} from "@/stores/serverStore";
import { useAuthStore, selectUser } from "@/stores/authStore";
import { initServerData } from "@/hooks/useServers";
import { ApiRequestError } from "@/api/client";
import { CopyButton } from "@/components/ui/CopyButton";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/cn";
import { styles, loading } from "@/styles";

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
  const connectionUrl = selectedServer
    ? (urlMap[selectedServer.id] ?? null)
    : null;

  const s = styles.connectionCard;

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
    <div className={s.root}>
      {/* -- Заголовок карточки ------------------------------------------ */}
      <div className={s.header}>
        <div className={s.headerLeft}>
          {/* Иконка ссылки в стилизованном контейнере */}
          <div>
            <p className={s.title}>Ключ доступа</p>
          </div>
        </div>

        {/* Кнопка обновления данных */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          title="Обновить ключи"
          aria-label="Обновить ключи"
          className={s.refreshBtn}
        >
          <RefreshCw size={12} className={cn(refreshing && loading.spin)} />
          <span className={s.refreshLabel}>Обновить</span>
        </button>
      </div>

      {/* -- Основная область контента (URL или Состояния) --------------- */}
      {!selectedServer ? (
        // Состояние: Сервер еще не выбран
        <div className={s.statePlaceholder}>
          Выберите сервер для получения ключа
        </div>
      ) : !connectionUrl ? (
        // Состояние: Сервер выбран, но URL еще загружается
        <div className={s.stateLoading}>
          <RefreshCw size={13} className={loading.spin} />
          Загрузка ключа...
        </div>
      ) : (
        // Состояние: URL успешно получен и готов к копированию
        <>
          {/* Блок с отображением URL */}
          <div className={s.urlBox}>
            <p className={s.urlLabel}>Hysteria2 URL</p>
            <code className={s.urlCode}>{connectionUrl}</code>
          </div>

          <CopyButton variant="block" text={connectionUrl} />
        </>
      )}
    </div>
  );
}
