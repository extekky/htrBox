import type { ComponentType } from "react";
import {
    DinoAvatar,
    CatAvatar,
    BunnyAvatar,
    PandaAvatar,
    FoxAvatar,
    OwlAvatar,
    PenguinAvatar,
    BearAvatar,
    FrogAvatar,
    KoalaAvatar,
    ChickAvatar,
    UnicornAvatar,
} from "@/components/common/Avatars";

// -------------------------------------------------------------
// Все доступные компоненты аватаров 
// (порядок важен — хэш выбирает по индексу)
// -------------------------------------------------------------
export const AVATARS: ComponentType[] = [
    DinoAvatar,
    CatAvatar,
    BunnyAvatar,
    PandaAvatar,
    FoxAvatar,
    OwlAvatar,
    PenguinAvatar,
    BearAvatar,
    FrogAvatar,
    KoalaAvatar,
    ChickAvatar,
    UnicornAvatar,
];

// -------------------------------------------------------------
// Хэш FNV-1a 32-bit 
// (не криптографический, отлично подходит для коротких строк)
// -------------------------------------------------------------

function fnv1a(str: string): number {
    let hash = 0x811c9dc5 >>> 0;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = (hash * 0x01000193) >>> 0; // беззнаковое умножение 32-bit
    }
    return hash;
}

// -------------------------------------------------------------
// Публичное API — детерминированный выбор аватара
// -------------------------------------------------------------

/**
 * Возвращает компонент аватара, который всегда одинаков для одного username.
 * Корректно обрабатывает null/undefined (возвращает первый аватар).
 */
export function pickAvatar(username: string | null | undefined): ComponentType {
    const input = username ?? "";
    const hash = fnv1a(input);
    const index = hash % AVATARS.length;
    return AVATARS[index];
}