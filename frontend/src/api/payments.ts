import { get, post } from "@/api/client";
import type {
  CreatePaymentRequest,
  PaymentOrderResponse,
  PlanResponse,
} from "@/api/types";

// -------------------------------------------------------------
// Платежи — планы, текущий счёт, создание СБП оплаты
// -------------------------------------------------------------

/**
 * Получить список активных тарифных планов.
 * Требует авторизованного пользователя.
 */
export function getPaymentPlans(): Promise<PlanResponse[]> {
  return get<PlanResponse[]>("/payments/plans");
}

/**
 * Получить текущий неоплаченный счёт пользователя.
 * Возвращает null, если живого pending счёта нет или он уже истёк.
 */
export function getCurrentPaymentOrder(): Promise<PaymentOrderResponse | null> {
  return get<PaymentOrderResponse | null>("/payments/orders/current");
}

/**
 * Создать новый счёт на оплату через СБП.
 *
 * Backend может вернуть уже существующий живой счёт, чтобы не плодить
 * несколько pending инвойсов на одного пользователя.
 */
export function createSbpPayment(
  payload: CreatePaymentRequest = {},
): Promise<PaymentOrderResponse> {
  return post<PaymentOrderResponse>("/payments/sbp", payload);
}
