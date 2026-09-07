import type { ComponentType } from "react";
import {
  CakeAvatar,
  CatAvatar,
  OrangeAvatar,
  DonatAvatar,
  СactusAvatar,
  CloudAvatar,
  MoustacheAvatar,
  PillowAvatar,
  ThreadsAvatar,
  StoneAvatar,
  MushroomAvatar,
  SockAvatar,
} from "@/components/common/Avatars";

// -------------------------------------------------------------
// Все доступные компоненты аватаров
// (порядок важен — хэш выбирает по индексу)
// -------------------------------------------------------------
export const AVATARS: ComponentType[] = [
  MoustacheAvatar,
  CatAvatar,
  OrangeAvatar,
  DonatAvatar,
  СactusAvatar,
  CloudAvatar,
  CakeAvatar,
  StoneAvatar,
  ThreadsAvatar,
  PillowAvatar,
  MushroomAvatar,
  SockAvatar,
];

// -------------------------------------------------------------
// Хэш djb2
// -------------------------------------------------------------

function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0; // беззнаковый 32-bit
  }
  return hash;
}

// -------------------------------------------------------------
// Публичное API — детерминированный выбор аватара
// -------------------------------------------------------------

interface AvatarProps {
  size?: "sm" | "md" | "lg";
}

/**
 * Возвращает компонент аватара, который всегда одинаков для одного username.
 * Корректно обрабатывает null/undefined (возвращает первый аватар).
 */
export function pickAvatar(
  username: string | null | undefined,
): ComponentType<AvatarProps> {
  const input = `av:${username ?? ""}`;
  const index = djb2(input) % AVATARS.length;
  return AVATARS[index];
}
