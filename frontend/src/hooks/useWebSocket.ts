import { useEffect, useRef, useCallback } from "react";

import { useAuthStore } from "@/stores/authStore";
import { queryClient } from "@/queryClient";

import { getMe } from "@/api/auth";
import { USER_KEYS } from "./useUsers";
import { SERVER_KEYS } from "./useServers";
import { HYSTERIA_KEYS } from "./useHysteria";

// -------------------------------------------------------------
// Типы событий WebSocket
// -------------------------------------------------------------

/**
 * Дискриминантный union — каждый тип события имеет уникальное поле type.
 * TypeScript автоматически сужает тип внутри switch/case по этому полю.
 */
type WsEvent =
    | { type: "ping" }                               // сердцебиение — сервер проверяет соединение
    | { type: "online_changed" }                     // изменилось число онлайн-пользователей
    | { type: "traffic_updated"; username: string }  // обновился трафик конкретного пользователя
    | { type: "user_updated"; username: string }     // данные пользователя изменились на сервере
    | { type: "users_changed" }                      // изменился список пользователей (создание/удаление)
    | { type: "servers_changed" };                   // изменился список серверов

// -------------------------------------------------------------
// Константы переподключения
// -------------------------------------------------------------

// Начальная задержка перед первой попыткой переподключения
const INITIAL_RECONNECT_DELAY_MS = 3000;

// Максимальная задержка — экспоненциальный backoff не превысит это значение
const MAX_RECONNECT_DELAY_MS = 30000;

// -------------------------------------------------------------
// Хук
// -------------------------------------------------------------

export function useWebSocket() {
    const token = useAuthStore((state) => state.token);

    // Ref на текущий экземпляр WebSocket — не вызывает ре-рендер при смене
    const wsRef = useRef<WebSocket | null>(null);

    // Текущая задержка переподключения — растёт экспоненциально при каждом обрыве
    const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY_MS);

    // ID таймера переподключения — храним чтобы можно было отменить при размонтировании
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Флаг-страж: true = компонент размонтирован, все операции нужно прекратить
    const cleanupGuardRef = useRef(false);

    // -------------------------------------------------------------------------
    // Обработчик входящих сообщений
    // -------------------------------------------------------------------------

    const handleMessage = useCallback((event: MessageEvent<string>) => {
        try {
            const data: WsEvent = JSON.parse(event.data);

            switch (data.type) {
                case "ping":
                    // Heartbeat от сервера — просто игнорируем, соединение живо
                    break;

                case "online_changed":
                    // Кто-то подключился или отключился — обновляем список онлайн
                    queryClient.invalidateQueries({ queryKey: HYSTERIA_KEYS.online });
                    break;

                case "traffic_updated":
                    // Обновляем весь трафик (широкий префикс ["traffic"]) и список
                    // пользователей, чтобы обновились бейджи трафика в таблице
                    queryClient.invalidateQueries({ queryKey: ["traffic"] });
                    queryClient.invalidateQueries({ queryKey: USER_KEYS.list });
                    break;

                case "user_updated":
                    // Данные пользователя изменились — обновляем список
                    queryClient.invalidateQueries({ queryKey: USER_KEYS.list });

                    // Проверяем: изменился ли текущий авторизованный пользователь?
                    const currentUser = useAuthStore.getState().user;
                    if (data.username === currentUser?.username) {
                        // Инвалидируем кэш профиля текущего пользователя
                        queryClient.invalidateQueries({ queryKey: USER_KEYS.me });

                        // Запрашиваем свежий профиль через API (с заголовком авторизации)
                        getMe()
                            .then((freshUser) => {
                                // Если пользователь заблокирован или не найден — разлогиниваем
                                if (!freshUser || !freshUser.allowed) {
                                    useAuthStore.getState().clearAuth();
                                    return;
                                }
                                // Обновляем пользователя в store без ре-логина
                                useAuthStore.getState().setUser(freshUser);
                            })
                            .catch(() => {
                                // Сетевая ошибка — оставляем устаревшие данные,
                                // не разлогиниваем агрессивно из-за временного сбоя
                            });
                    }
                    break;

                case "users_changed":
                    // Кто-то создан или удалён — полностью обновляем список
                    queryClient.invalidateQueries({ queryKey: USER_KEYS.list });
                    break;

                case "servers_changed":
                    // Изменился список серверов — инвалидируем все серверные запросы
                    // (SERVER_KEYS.all покрывает и публичные, и админские endpoints)
                    queryClient.invalidateQueries({ queryKey: SERVER_KEYS.all });
                    break;

                default:
                    // Неизвестный тип события — безопасно игнорируем
                    break;
            }
        } catch {
            // Невалидный JSON или неожиданный формат — тихо игнорируем
        }
    }, []);

    // -------------------------------------------------------------------------
    // Установка WebSocket-соединения
    // -------------------------------------------------------------------------

    const connect = useCallback(() => {
        // Не подключаемся если нет токена или компонент уже размонтирован
        if (!token || cleanupGuardRef.current) return;

        // Выбираем протокол в зависимости от текущего (http -> ws, https -> wss)
        const protocol = location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${location.host}/api/ws?token=${encodeURIComponent(token)}`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            // Соединение установлено — сбрасываем задержку переподключения до начальной
            reconnectDelayRef.current = INITIAL_RECONNECT_DELAY_MS;
        };

        ws.onmessage = handleMessage;

        ws.onclose = (event) => {
            // Если компонент размонтирован — не переподключаемся
            if (cleanupGuardRef.current) return;

            // Код 4001 — сервер отклонил соединение из-за истёкшего/невалидного токена
            if (event.code === 4001) {
                // Запрашиваем обновление токена через auth store (запросы дедуплицированы)
                useAuthStore.getState().refreshToken().then((newToken) => {
                    if (!newToken) {
                        // Рефреш не удался — полностью разлогиниваем пользователя
                        useAuthStore.getState().clearAuth();
                        return;
                    }
                    // Токен обновлён — useEffect сработает повторно и вызовет connect()
                });
                return;
            }

            // Обычный обрыв соединения — планируем переподключение с backoff
            reconnectTimerRef.current = setTimeout(() => {
                if (cleanupGuardRef.current) return;

                // Экспоненциальный backoff: удваиваем задержку, но не более MAX
                reconnectDelayRef.current = Math.min(
                    reconnectDelayRef.current * 2,
                    MAX_RECONNECT_DELAY_MS,
                );
                connect();
            }, reconnectDelayRef.current);
        };

        ws.onerror = () => {
            // При любой ошибке закрываем сокет — onclose сам запланирует переподключение
            ws.close();
        };
    }, [token, handleMessage]);

    // -------------------------------------------------------------------------
    // Жизненный цикл: подключение и очистка
    // -------------------------------------------------------------------------

    useEffect(() => {
        // Сбрасываем флаг размонтирования при каждом новом запуске эффекта
        cleanupGuardRef.current = false;

        // Откладываем соединение на один тик — чтобы React StrictMode успел
        // выполнить cleanup предыдущего рендера прежде чем мы откроем сокет
        const initTimer = setTimeout(() => {
            if (!cleanupGuardRef.current) {
                connect();
            }
        }, 0);

        // Функция очистки — вызывается при размонтировании или смене токена
        return () => {
            // Выставляем флаг: все асинхронные операции должны прекратиться
            cleanupGuardRef.current = true;

            // Отменяем отложенный connect()
            clearTimeout(initTimer);

            // Отменяем таймер переподключения если он был запланирован
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }

            // Закрываем WebSocket и очищаем ref
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [token, connect]); // Пересоздаём соединение при смене токена
}