/**
 * Коллекция SVG-аватаров в виде React-компонентов.
 * Каждый аватар — отдельный компонент, принимающий className для стилизации.
 * Используется совместно с pickAvatar() из lib/avatars.ts для детерминированного
 * выбора аватара по имени пользователя.
 */

// -------------------------------------------------------------
// Динозавр
// -------------------------------------------------------------

export function DinoAvatar() {
    return (
        <div className="relative w-14 h-14 shrink-0">
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-md"
            >
                {/* Шипы на спине */}
                <ellipse cx="28" cy="38" rx="7" ry="10" fill="#6BCB77" transform="rotate(-20 28 38)" />
                <ellipse cx="38" cy="28" rx="7" ry="12" fill="#6BCB77" transform="rotate(-10 38 28)" />
                <ellipse cx="50" cy="22" rx="7" ry="13" fill="#6BCB77" transform="rotate(5 50 22)" />

                {/* Хвост */}
                <path d="M20 70 Q8 65 5 55 Q3 50 8 52 Q12 54 18 62" fill="#7ED957" />

                {/* Тело */}
                <ellipse cx="48" cy="62" rx="30" ry="28" fill="#7ED957" />

                {/* Живот */}
                <ellipse cx="50" cy="68" rx="18" ry="16" fill="#B5F09C" />

                {/* Ноги */}
                <ellipse cx="32" cy="88" rx="8" ry="5" fill="#6BCB77" />
                <ellipse cx="62" cy="88" rx="8" ry="5" fill="#6BCB77" />

                {/* Лапы */}
                <ellipse cx="22" cy="60" rx="6" ry="4" fill="#6BCB77" transform="rotate(-30 22 60)" />
                <ellipse cx="76" cy="55" rx="6" ry="4" fill="#6BCB77" transform="rotate(30 76 55)" />

                {/* Голова */}
                <circle cx="62" cy="38" r="24" fill="#7ED957" />

                {/* Румянец */}
                <circle cx="50" cy="46" r="5" fill="#FFB3C1" opacity="0.6" />
                <circle cx="78" cy="42" r="5" fill="#FFB3C1" opacity="0.6" />

                {/* Глаза */}
                <ellipse cx="55" cy="33" rx="7" ry="8" fill="white" />
                <ellipse cx="72" cy="31" rx="8" ry="9" fill="white" />

                {/* Зрачки */}
                <ellipse cx="57" cy="34" rx="3.5" ry="4.5" fill="#2D3748" />
                <ellipse cx="74" cy="32" rx="4" ry="5" fill="#2D3748" />

                {/* Блики в глазах */}
                <circle cx="55" cy="31" r="2" fill="white" />
                <circle cx="72" cy="29" r="2.5" fill="white" />

                {/* Улыбка */}
                <path
                    d="M58 47 Q65 54 75 47"
                    stroke="#2D3748"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* Ноздри */}
                <circle cx="80" cy="37" r="1.5" fill="#5EB83E" />
                <circle cx="84" cy="37" r="1.5" fill="#5EB83E" />
            </svg>
        </div>
    );
}

// -------------------------------------------------------------
// Кот
// -------------------------------------------------------------

export function CatAvatar() {
    return (
        <div className="relative w-14 h-14 shrink-0">
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-md"
            >
                {/* Уши */}
                <polygon points="25,35 15,8 40,25" fill="#FF9B71" />
                <polygon points="75,35 85,8 60,25" fill="#FF9B71" />
                <polygon points="28,33 20,14 38,27" fill="#FFD1DC" />
                <polygon points="72,33 80,14 62,27" fill="#FFD1DC" />

                {/* Тело */}
                <ellipse cx="50" cy="72" rx="25" ry="22" fill="#FF9B71" />
                <ellipse cx="50" cy="78" rx="16" ry="14" fill="#FFDAB3" />

                {/* Голова */}
                <circle cx="50" cy="42" r="26" fill="#FF9B71" />

                {/* Румянец */}
                <circle cx="33" cy="50" r="6" fill="#FFB3C1" opacity="0.5" />
                <circle cx="67" cy="50" r="6" fill="#FFB3C1" opacity="0.5" />

                {/* Глаза */}
                <ellipse cx="40" cy="40" rx="6" ry="7" fill="white" />
                <ellipse cx="60" cy="40" rx="6" ry="7" fill="white" />
                <ellipse cx="41" cy="41" rx="3" ry="4" fill="#2D3748" />
                <ellipse cx="61" cy="41" rx="3" ry="4" fill="#2D3748" />
                <circle cx="39" cy="38" r="2" fill="white" />
                <circle cx="59" cy="38" r="2" fill="white" />

                {/* Нос */}
                <ellipse cx="50" cy="48" rx="3" ry="2.5" fill="#FF6B8A" />

                {/* Рот */}
                <path
                    d="M47 51 Q50 55 53 51"
                    stroke="#2D3748"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* Усы */}
                <line x1="30" y1="47" x2="15" y2="44" stroke="#2D3748" strokeWidth="1.2" />
                <line x1="30" y1="50" x2="15" y2="50" stroke="#2D3748" strokeWidth="1.2" />
                <line x1="70" y1="47" x2="85" y2="44" stroke="#2D3748" strokeWidth="1.2" />
                <line x1="70" y1="50" x2="85" y2="50" stroke="#2D3748" strokeWidth="1.2" />

                {/* Лапы */}
                <ellipse cx="35" cy="92" rx="7" ry="4" fill="#FF9B71" />
                <ellipse cx="65" cy="92" rx="7" ry="4" fill="#FF9B71" />

                {/* Хвост */}
                <path
                    d="M75 72 Q90 60 88 45"
                    stroke="#FF9B71"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                />
            </svg>
        </div>
    );
}

// -------------------------------------------------------------
// Кролик
// -------------------------------------------------------------

export function BunnyAvatar() {
    return (
        <div className="relative w-14 h-14 shrink-0">
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-md"
            >
                {/* Уши */}
                <ellipse cx="38" cy="18" rx="8" ry="22" fill="#F5F5F5" />
                <ellipse cx="62" cy="18" rx="8" ry="22" fill="#F5F5F5" />
                <ellipse cx="38" cy="18" rx="5" ry="16" fill="#FFB3C1" />
                <ellipse cx="62" cy="18" rx="5" ry="16" fill="#FFB3C1" />

                {/* Тело */}
                <ellipse cx="50" cy="75" rx="22" ry="20" fill="#F5F5F5" />
                <ellipse cx="50" cy="80" rx="14" ry="12" fill="#FFF5F5" />

                {/* Голова */}
                <circle cx="50" cy="50" r="24" fill="#F5F5F5" />

                {/* Румянец */}
                <circle cx="34" cy="56" r="5" fill="#FFB3C1" opacity="0.5" />
                <circle cx="66" cy="56" r="5" fill="#FFB3C1" opacity="0.5" />

                {/* Глаза */}
                <ellipse cx="42" cy="47" rx="5" ry="6" fill="white" />
                <ellipse cx="58" cy="47" rx="5" ry="6" fill="white" />
                <ellipse cx="43" cy="48" rx="3" ry="3.5" fill="#2D3748" />
                <ellipse cx="59" cy="48" rx="3" ry="3.5" fill="#2D3748" />
                <circle cx="41" cy="45" r="1.8" fill="white" />
                <circle cx="57" cy="45" r="1.8" fill="white" />

                {/* Нос */}
                <ellipse cx="50" cy="54" rx="3" ry="2" fill="#FF8FAB" />

                {/* Рот */}
                <path
                    d="M47 57 Q50 60 53 57"
                    stroke="#2D3748"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* Зубы */}
                <rect x="48" y="57" width="4" height="4" rx="1" fill="white" />

                {/* Лапы */}
                <ellipse cx="35" cy="93" rx="7" ry="4" fill="#F5F5F5" />
                <ellipse cx="65" cy="93" rx="7" ry="4" fill="#F5F5F5" />
            </svg>
        </div>
    );
}

// -------------------------------------------------------------
// Панда
// -------------------------------------------------------------

export function PandaAvatar() {
    return (
        <div className="relative w-14 h-14 shrink-0">
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-md"
            >
                {/* Уши */}
                <circle cx="28" cy="25" r="12" fill="#2D3748" />
                <circle cx="72" cy="25" r="12" fill="#2D3748" />

                {/* Тело */}
                <ellipse cx="50" cy="75" rx="25" ry="22" fill="white" />
                <ellipse cx="50" cy="80" rx="16" ry="14" fill="#F0F0F0" />

                {/* Голова */}
                <circle cx="50" cy="45" r="28" fill="white" />

                {/* Пятна вокруг глаз */}
                <ellipse cx="38" cy="42" rx="10" ry="11" fill="#2D3748" />
                <ellipse cx="62" cy="42" rx="10" ry="11" fill="#2D3748" />

                {/* Глаза */}
                <ellipse cx="38" cy="42" rx="5" ry="6" fill="white" />
                <ellipse cx="62" cy="42" rx="5" ry="6" fill="white" />
                <ellipse cx="39" cy="43" rx="2.5" ry="3.5" fill="#2D3748" />
                <ellipse cx="63" cy="43" rx="2.5" ry="3.5" fill="#2D3748" />
                <circle cx="37" cy="40" r="1.8" fill="white" />
                <circle cx="61" cy="40" r="1.8" fill="white" />

                {/* Румянец */}
                <circle cx="30" cy="52" r="5" fill="#FFB3C1" opacity="0.4" />
                <circle cx="70" cy="52" r="5" fill="#FFB3C1" opacity="0.4" />

                {/* Нос */}
                <ellipse cx="50" cy="50" rx="4" ry="3" fill="#2D3748" />

                {/* Рот */}
                <path
                    d="M47 54 Q50 58 53 54"
                    stroke="#2D3748"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* Лапы */}
                <ellipse cx="33" cy="94" rx="8" ry="4" fill="#2D3748" />
                <ellipse cx="67" cy="94" rx="8" ry="4" fill="#2D3748" />
            </svg>
        </div>
    );
}

// -------------------------------------------------------------
// Лягушка
// -------------------------------------------------------------

export function FrogAvatar() {
    return (
        <div className="relative w-14 h-14 shrink-0">
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-md"
            >
                {/* Выпуклости для глаз */}
                <circle cx="35" cy="25" r="14" fill="#5CB85C" />
                <circle cx="65" cy="25" r="14" fill="#5CB85C" />

                {/* Тело */}
                <ellipse cx="50" cy="72" rx="28" ry="24" fill="#5CB85C" />
                <ellipse cx="50" cy="78" rx="18" ry="16" fill="#A8E6A1" />

                {/* Голова */}
                <ellipse cx="50" cy="45" rx="30" ry="22" fill="#5CB85C" />

                {/* Глаза */}
                <circle cx="35" cy="24" r="9" fill="white" />
                <circle cx="65" cy="24" r="9" fill="white" />
                <circle cx="36" cy="25" r="5" fill="#2D3748" />
                <circle cx="66" cy="25" r="5" fill="#2D3748" />
                <circle cx="34" cy="22" r="2.5" fill="white" />
                <circle cx="64" cy="22" r="2.5" fill="white" />

                {/* Румянец */}
                <circle cx="30" cy="48" r="6" fill="#FFB3C1" opacity="0.4" />
                <circle cx="70" cy="48" r="6" fill="#FFB3C1" opacity="0.4" />

                {/* Рот */}
                <path
                    d="M30 50 Q50 65 70 50"
                    stroke="#2D3748"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* Лапы */}
                <ellipse cx="30" cy="94" rx="10" ry="4" fill="#5CB85C" />
                <ellipse cx="70" cy="94" rx="10" ry="4" fill="#5CB85C" />

                {/* Пальцы */}
                <circle cx="22" cy="92" r="3" fill="#4CA64C" />
                <circle cx="30" cy="91" r="3" fill="#4CA64C" />
                <circle cx="38" cy="92" r="3" fill="#4CA64C" />
                <circle cx="62" cy="92" r="3" fill="#4CA64C" />
                <circle cx="70" cy="91" r="3" fill="#4CA64C" />
                <circle cx="78" cy="92" r="3" fill="#4CA64C" />
            </svg>
        </div>
    );
}

// -------------------------------------------------------------
// Коала
// -------------------------------------------------------------

export function KoalaAvatar() {
    return (
        <div className="relative w-14 h-14 shrink-0">
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-md"
            >
                {/* Уши */}
                <circle cx="24" cy="30" r="16" fill="#7A8B99" />
                <circle cx="76" cy="30" r="16" fill="#7A8B99" />
                <circle cx="24" cy="30" r="10" fill="#F5E6CC" />
                <circle cx="76" cy="30" r="10" fill="#F5E6CC" />

                {/* Тело */}
                <ellipse cx="50" cy="78" rx="22" ry="18" fill="#7A8B99" />
                <ellipse cx="50" cy="82" rx="14" ry="12" fill="#B0BEC5" />

                {/* Голова */}
                <circle cx="50" cy="48" r="26" fill="#7A8B99" />

                {/* Белая мордочка */}
                <ellipse cx="50" cy="55" rx="16" ry="12" fill="#B0BEC5" />

                {/* Румянец */}
                <circle cx="34" cy="55" r="5" fill="#FFB3C1" opacity="0.4" />
                <circle cx="66" cy="55" r="5" fill="#FFB3C1" opacity="0.4" />

                {/* Глаза */}
                <ellipse cx="40" cy="45" rx="5" ry="6" fill="white" />
                <ellipse cx="60" cy="45" rx="5" ry="6" fill="white" />
                <ellipse cx="41" cy="46" rx="2.5" ry="3.5" fill="#2D3748" />
                <ellipse cx="61" cy="46" rx="2.5" ry="3.5" fill="#2D3748" />
                <circle cx="39" cy="43" r="1.5" fill="white" />
                <circle cx="59" cy="43" r="1.5" fill="white" />

                {/* Нос */}
                <ellipse cx="50" cy="53" rx="6" ry="4" fill="#2D3748" />
                <ellipse cx="50" cy="52" rx="2" ry="1.2" fill="white" opacity="0.3" />

                {/* Рот */}
                <path
                    d="M47 58 Q50 61 53 58"
                    stroke="#2D3748"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* Лапы */}
                <ellipse cx="35" cy="94" rx="7" ry="4" fill="#7A8B99" />
                <ellipse cx="65" cy="94" rx="7" ry="4" fill="#7A8B99" />
            </svg>
        </div>
    );
}

// -------------------------------------------------------------
// Цыпленок
// -------------------------------------------------------------

export function ChickAvatar() {
    return (
        <div className="relative w-14 h-14 shrink-0">
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-md"
            >
                {/* Хохолок */}
                <ellipse cx="50" cy="12" rx="4" ry="8" fill="#FFD93D" />
                <ellipse cx="44" cy="14" rx="3" ry="7" fill="#FFD93D" transform="rotate(-15 44 14)" />
                <ellipse cx="56" cy="14" rx="3" ry="7" fill="#FFD93D" transform="rotate(15 56 14)" />

                {/* Крылья */}
                <ellipse cx="20" cy="60" rx="8" ry="14" fill="#FFEC8A" transform="rotate(-15 20 60)" />
                <ellipse cx="80" cy="60" rx="8" ry="14" fill="#FFEC8A" transform="rotate(15 80 60)" />

                {/* Тело */}
                <ellipse cx="50" cy="62" rx="26" ry="28" fill="#FFD93D" />

                {/* Живот */}
                <ellipse cx="50" cy="68" rx="17" ry="18" fill="#FFF5C0" />

                {/* Голова */}
                <circle cx="50" cy="38" r="22" fill="#FFD93D" />

                {/* Румянец */}
                <circle cx="34" cy="44" r="5" fill="#FFB3C1" opacity="0.5" />
                <circle cx="66" cy="44" r="5" fill="#FFB3C1" opacity="0.5" />

                {/* Глаза */}
                <ellipse cx="42" cy="36" rx="5" ry="6" fill="white" />
                <ellipse cx="58" cy="36" rx="5" ry="6" fill="white" />
                <ellipse cx="43" cy="37" rx="2.5" ry="3.5" fill="#2D3748" />
                <ellipse cx="59" cy="37" rx="2.5" ry="3.5" fill="#2D3748" />
                <circle cx="41" cy="34" r="1.5" fill="white" />
                <circle cx="57" cy="34" r="1.5" fill="white" />

                {/* Клюв */}
                <polygon points="50,42 45,47 55,47" fill="#FF8C42" />

                {/* Рот */}
                <path
                    d="M47 47 Q50 49 53 47"
                    stroke="#E07020"
                    strokeWidth="1"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* Лапки */}
                <path d="M38 90 L32 96 L38 94 L40 98 L42 94 L48 96 L42 90" fill="#FF8C42" />
                <path d="M58 90 L52 96 L58 94 L60 98 L62 94 L68 96 L62 90" fill="#FF8C42" />
            </svg>
        </div>
    );
}

// -------------------------------------------------------------
// Единорог
// -------------------------------------------------------------

export function UnicornAvatar() {
    return (
        <div className="relative w-14 h-14 shrink-0">
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-md"
            >
                {/* Рог */}
                <polygon points="50,2 45,25 55,25" fill="#FFD93D" />
                <line x1="47" y1="10" x2="53" y2="10" stroke="#FFB347" strokeWidth="1.5" />
                <line x1="46" y1="15" x2="54" y2="15" stroke="#FFB347" strokeWidth="1.5" />
                <line x1="46" y1="20" x2="54" y2="20" stroke="#FFB347" strokeWidth="1.5" />

                {/* Уши */}
                <polygon points="32,30 24,12 40,24" fill="#F0E6FF" />
                <polygon points="68,30 76,12 60,24" fill="#F0E6FF" />
                <polygon points="34,28 28,16 39,25" fill="#E0C6FF" />
                <polygon points="66,28 72,16 61,25" fill="#E0C6FF" />

                {/* Грива */}
                <ellipse cx="28" cy="35" rx="6" ry="10" fill="#FF8FAB" transform="rotate(-20 28 35)" />
                <ellipse cx="25" cy="48" rx="5" ry="9" fill="#B388FF" transform="rotate(-10 25 48)" />
                <ellipse cx="26" cy="60" rx="5" ry="8" fill="#81D4FA" transform="rotate(-5 26 60)" />

                {/* Хвост */}
                <path d="M75 72 Q90 60 85 45" stroke="#FF8FAB" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M85 45 Q92 38 88 30" stroke="#B388FF" strokeWidth="4" strokeLinecap="round" fill="none" />

                {/* Тело */}
                <ellipse cx="50" cy="70" rx="25" ry="22" fill="white" />

                {/* Голова */}
                <circle cx="50" cy="40" r="22" fill="white" />

                {/* Румянец */}
                <circle cx="34" cy="47" r="5" fill="#FFB3C1" opacity="0.5" />
                <circle cx="66" cy="47" r="5" fill="#FFB3C1" opacity="0.5" />

                {/* Глаза */}
                <ellipse cx="40" cy="38" rx="5" ry="7" fill="white" stroke="#E0C6FF" strokeWidth="0.5" />
                <ellipse cx="60" cy="38" rx="5" ry="7" fill="white" stroke="#E0C6FF" strokeWidth="0.5" />
                <ellipse cx="41" cy="39" rx="3" ry="4" fill="#7C4DFF" />
                <ellipse cx="61" cy="39" rx="3" ry="4" fill="#7C4DFF" />
                <circle cx="39" cy="36" r="1.8" fill="white" />
                <circle cx="59" cy="36" r="1.8" fill="white" />

                {/* Нос */}
                <ellipse cx="50" cy="47" rx="2.5" ry="1.8" fill="#FFB3C1" />

                {/* Рот */}
                <path
                    d="M47 50 Q50 53 53 50"
                    stroke="#2D3748"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* Ноги */}
                <ellipse cx="35" cy="90" rx="7" ry="4" fill="white" stroke="#E0C6FF" strokeWidth="1" />
                <ellipse cx="65" cy="90" rx="7" ry="4" fill="white" stroke="#E0C6FF" strokeWidth="1" />

                {/* Копыта */}
                <ellipse cx="35" cy="93" rx="4" ry="2" fill="#FFD93D" />
                <ellipse cx="65" cy="93" rx="4" ry="2" fill="#FFD93D" />
            </svg>
        </div>
    );
}