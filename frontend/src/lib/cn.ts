import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Объединяет несколько имён классов в одну оптимизированную строку.
 * Поддерживает условные классы, массивы, объекты и автоматически разрешает 
 * конфликты между Tailwind-классами.
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}