import {
  Crown,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { colorScheme } from "@/styles";
import type {
  Role,
  UserResponse,
  UserSessionInfo,
  UserStatusKey,
} from "@/api/types";

export type ResolvedUserStatusKey = UserStatusKey | "admin";

export interface UserStatusCarrier {
  role: Role;
  statuses: UserStatusKey[];
}

export interface ResolvedUserStatus {
  key: ResolvedUserStatusKey;
  label: string;
  description: string;
  tone: string;
  Icon: LucideIcon;
}

export const USER_STATUS_OPTIONS: UserStatusKey[] = [
  "friend",
  "paid",
  "school",
  "trial",
];

const STATUS_ORDER: ResolvedUserStatusKey[] = [
  "admin",
  "paid",
  "school",
  "trial",
  "friend",
];

export function getUserRoleLabel(role: Role) {
  return role === "admin" ? "Администратор" : "Участник";
}

export function getUserStatusDefinition(
  key: ResolvedUserStatusKey,
): ResolvedUserStatus {
  switch (key) {
    case "admin":
      return {
        key,
        label: "Админ",
        description:
          "У пользователя есть полный доступ к панели администратора и служебным функциям сервиса.",
        tone: `${colorScheme.warning.bg} ${colorScheme.warning.border} text-amber-700`,
        Icon: Crown,
      };
    case "paid":
      return {
        key,
        label: "Оплачивает",
        description:
          "Пользователь оплачивает подписку и имеет доступ к платным функциям сервиса.",
        tone: `${colorScheme.cyan.bg} ${colorScheme.cyan.border} ${colorScheme.cyan.text}`,
        Icon: Wallet,
      };
    case "school":
      return {
        key,
        label: "Школьник",
        description:
          "Школьники до 8 класса включительно могут пользоваться сервисом бесплатно.",
        tone: `${colorScheme.purple.bg} ${colorScheme.purple.border} ${colorScheme.purple.text}`,
        Icon: GraduationCap,
      };
    case "trial":
      return {
        key,
        label: "Пробный период",
        description: "Пробный период доступа к сервису.",
        tone: `${colorScheme.info.bg} ${colorScheme.info.border} ${colorScheme.info.text}`,
        Icon: Sparkles,
      };
    case "friend":
      return {
        key,
        label: "Друг",
        description:
          "Неформальный статус для друзей проекта. Спасибо, что вы с нами!",
        tone: `${colorScheme.rose.bg} ${colorScheme.rose.border} ${colorScheme.rose.text}`,
        Icon: HeartHandshake,
      };
  }
}

export function getResolvedUserStatuses(
  user: UserStatusCarrier,
): ResolvedUserStatus[] {
  const collected = new Set<ResolvedUserStatusKey>();

  if (user.role === "admin") {
    collected.add("admin");
  }

  for (const status of user.statuses) {
    collected.add(status);
  }

  return STATUS_ORDER.filter((key) => collected.has(key)).map((key) =>
    getUserStatusDefinition(key),
  );
}

export function getSchoolPrivilegeNote(user: UserStatusCarrier) {
  return user.statuses.includes("school")
    ? "Школьники до 8 класса включительно могут пользоваться сервисом бесплатно."
    : null;
}

export function getStatusPayload(
  user: UserResponse | UserSessionInfo,
): UserStatusCarrier {
  return {
    role: user.role,
    statuses: user.statuses,
  };
}
