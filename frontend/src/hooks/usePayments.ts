import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSbpPayment,
  getCurrentPaymentOrder,
  getPaymentPlans,
} from "@/api/payments";
import type { CreatePaymentRequest } from "@/api/types";
import { USER_KEYS } from "@/hooks/useUsers";

// -------------------------------------------------------------
// Фабрика ключей запросов — единый источник истины для инвалидации
// -------------------------------------------------------------

export const PAYMENT_KEYS = {
  all: ["payments"] as const,
  plans: ["payments", "plans"] as const,
  currentOrder: ["payments", "orders", "current"] as const,
} as const;

// -------------------------------------------------------------
// Запросы
// -------------------------------------------------------------

/**
 * Загружает активные тарифные планы.
 * Используется на странице профиля для отображения цены и периода доступа.
 */
export function usePaymentPlans() {
  return useQuery({
    queryKey: PAYMENT_KEYS.plans,
    queryFn: getPaymentPlans,
  });
}

/**
 * Загружает текущий pending-счёт пользователя.
 * Если счёт есть, кнопка оплаты продолжает уже созданную оплату.
 */
export function useCurrentPaymentOrder() {
  return useQuery({
    queryKey: PAYMENT_KEYS.currentOrder,
    queryFn: getCurrentPaymentOrder,
  });
}

// -------------------------------------------------------------
// Мутации
// -------------------------------------------------------------

/**
 * Создаёт СБП-счёт через Lava.
 * После успеха обновляет текущий счёт и профиль пользователя.
 */
export function useCreateSbpPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePaymentRequest | undefined) =>
      createSbpPayment(payload ?? {}),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.currentOrder });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.me });
    },
  });
}
