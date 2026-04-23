/**
 * Коллекция SVG-аватаров в виде React-компонентов.
 * Каждый аватар — отдельный компонент, принимающий className для стилизации.
 * Используется совместно с pickAvatar() из lib/avatars.ts для детерминированного
 * выбора аватара по имени пользователя.
 */

export function DinoAvatar() {
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Spikes on back */}
        <ellipse
          cx="28"
          cy="38"
          rx="7"
          ry="10"
          fill="#6BCB77"
          transform="rotate(-20 28 38)"
        />
        <ellipse
          cx="38"
          cy="28"
          rx="7"
          ry="12"
          fill="#6BCB77"
          transform="rotate(-10 38 28)"
        />
        <ellipse
          cx="50"
          cy="22"
          rx="7"
          ry="13"
          fill="#6BCB77"
          transform="rotate(5 50 22)"
        />

        {/* Tail */}
        <path d="M20 70 Q8 65 5 55 Q3 50 8 52 Q12 54 18 62" fill="#7ED957" />

        {/* Body */}
        <ellipse cx="48" cy="62" rx="30" ry="28" fill="#7ED957" />

        {/* Belly */}
        <ellipse cx="50" cy="68" rx="18" ry="16" fill="#B5F09C" />

        {/* Legs */}
        <ellipse cx="32" cy="88" rx="8" ry="5" fill="#6BCB77" />
        <ellipse cx="62" cy="88" rx="8" ry="5" fill="#6BCB77" />

        {/* Arms */}
        <ellipse
          cx="22"
          cy="60"
          rx="6"
          ry="4"
          fill="#6BCB77"
          transform="rotate(-30 22 60)"
        />
        <ellipse
          cx="76"
          cy="55"
          rx="6"
          ry="4"
          fill="#6BCB77"
          transform="rotate(30 76 55)"
        />

        {/* Head */}
        <circle cx="62" cy="38" r="24" fill="#7ED957" />

        {/* Blush */}
        <circle cx="50" cy="46" r="5" fill="#FFB3C1" opacity="0.6" />
        <circle cx="78" cy="42" r="5" fill="#FFB3C1" opacity="0.6" />

        {/* Eyes */}
        <ellipse cx="55" cy="33" rx="7" ry="8" fill="white" />
        <ellipse cx="72" cy="31" rx="8" ry="9" fill="white" />

        {/* Pupils */}
        <ellipse cx="57" cy="34" rx="3.5" ry="4.5" fill="#2D3748" />
        <ellipse cx="74" cy="32" rx="4" ry="5" fill="#2D3748" />

        {/* Eye highlights */}
        <circle cx="55" cy="31" r="2" fill="white" />
        <circle cx="72" cy="29" r="2.5" fill="white" />

        {/* Smile */}
        <path
          d="M58 47 Q65 54 75 47"
          stroke="#2D3748"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Nostrils */}
        <circle cx="80" cy="37" r="1.5" fill="#5EB83E" />
        <circle cx="84" cy="37" r="1.5" fill="#5EB83E" />
      </svg>
    </div>
  );
}

export function CatAvatar() {
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Ears */}
        <polygon points="25,35 15,8 40,25" fill="#FF9B71" />
        <polygon points="75,35 85,8 60,25" fill="#FF9B71" />
        <polygon points="28,33 20,14 38,27" fill="#FFD1DC" />
        <polygon points="72,33 80,14 62,27" fill="#FFD1DC" />

        {/* Body */}
        <ellipse cx="50" cy="72" rx="25" ry="22" fill="#FF9B71" />
        <ellipse cx="50" cy="78" rx="16" ry="14" fill="#FFDAB3" />

        {/* Head */}
        <circle cx="50" cy="42" r="26" fill="#FF9B71" />

        {/* Blush */}
        <circle cx="33" cy="50" r="6" fill="#FFB3C1" opacity="0.5" />
        <circle cx="67" cy="50" r="6" fill="#FFB3C1" opacity="0.5" />

        {/* Eyes */}
        <ellipse cx="40" cy="40" rx="6" ry="7" fill="white" />
        <ellipse cx="60" cy="40" rx="6" ry="7" fill="white" />
        <ellipse cx="41" cy="41" rx="3" ry="4" fill="#2D3748" />
        <ellipse cx="61" cy="41" rx="3" ry="4" fill="#2D3748" />
        <circle cx="39" cy="38" r="2" fill="white" />
        <circle cx="59" cy="38" r="2" fill="white" />

        {/* Nose */}
        <ellipse cx="50" cy="48" rx="3" ry="2.5" fill="#FF6B8A" />

        {/* Mouth */}
        <path
          d="M47 51 Q50 55 53 51"
          stroke="#2D3748"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Whiskers */}
        <line
          x1="30"
          y1="47"
          x2="15"
          y2="44"
          stroke="#2D3748"
          strokeWidth="1.2"
        />
        <line
          x1="30"
          y1="50"
          x2="15"
          y2="50"
          stroke="#2D3748"
          strokeWidth="1.2"
        />
        <line
          x1="70"
          y1="47"
          x2="85"
          y2="44"
          stroke="#2D3748"
          strokeWidth="1.2"
        />
        <line
          x1="70"
          y1="50"
          x2="85"
          y2="50"
          stroke="#2D3748"
          strokeWidth="1.2"
        />

        {/* Paws */}
        <ellipse cx="35" cy="92" rx="7" ry="4" fill="#FF9B71" />
        <ellipse cx="65" cy="92" rx="7" ry="4" fill="#FF9B71" />

        {/* Tail */}
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

export function BunnyAvatar() {
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Ears */}
        <ellipse cx="38" cy="18" rx="8" ry="22" fill="#F5F5F5" />
        <ellipse cx="62" cy="18" rx="8" ry="22" fill="#F5F5F5" />
        <ellipse cx="38" cy="18" rx="5" ry="16" fill="#FFB3C1" />
        <ellipse cx="62" cy="18" rx="5" ry="16" fill="#FFB3C1" />

        {/* Body */}
        <ellipse cx="50" cy="75" rx="22" ry="20" fill="#F5F5F5" />
        <ellipse cx="50" cy="80" rx="14" ry="12" fill="#FFF5F5" />

        {/* Head */}
        <circle cx="50" cy="50" r="24" fill="#F5F5F5" />

        {/* Blush */}
        <circle cx="34" cy="56" r="5" fill="#FFB3C1" opacity="0.5" />
        <circle cx="66" cy="56" r="5" fill="#FFB3C1" opacity="0.5" />

        {/* Eyes */}
        <ellipse cx="42" cy="47" rx="5" ry="6" fill="white" />
        <ellipse cx="58" cy="47" rx="5" ry="6" fill="white" />
        <ellipse cx="43" cy="48" rx="3" ry="3.5" fill="#2D3748" />
        <ellipse cx="59" cy="48" rx="3" ry="3.5" fill="#2D3748" />
        <circle cx="41" cy="45" r="1.8" fill="white" />
        <circle cx="57" cy="45" r="1.8" fill="white" />

        {/* Nose */}
        <ellipse cx="50" cy="54" rx="3" ry="2" fill="#FF8FAB" />

        {/* Mouth */}
        <path
          d="M47 57 Q50 60 53 57"
          stroke="#2D3748"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Teeth */}
        <rect x="48" y="57" width="4" height="4" rx="1" fill="white" />

        {/* Paws */}
        <ellipse cx="35" cy="93" rx="7" ry="4" fill="#F5F5F5" />
        <ellipse cx="65" cy="93" rx="7" ry="4" fill="#F5F5F5" />
      </svg>
    </div>
  );
}

export function PandaAvatar() {
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Ears */}
        <circle cx="28" cy="25" r="12" fill="#2D3748" />
        <circle cx="72" cy="25" r="12" fill="#2D3748" />

        {/* Body */}
        <ellipse cx="50" cy="75" rx="25" ry="22" fill="white" />
        <ellipse cx="50" cy="80" rx="16" ry="14" fill="#F0F0F0" />

        {/* Head */}
        <circle cx="50" cy="45" r="28" fill="white" />

        {/* Eye patches */}
        <ellipse cx="38" cy="42" rx="10" ry="11" fill="#2D3748" />
        <ellipse cx="62" cy="42" rx="10" ry="11" fill="#2D3748" />

        {/* Eyes */}
        <ellipse cx="38" cy="42" rx="5" ry="6" fill="white" />
        <ellipse cx="62" cy="42" rx="5" ry="6" fill="white" />
        <ellipse cx="39" cy="43" rx="2.5" ry="3.5" fill="#2D3748" />
        <ellipse cx="63" cy="43" rx="2.5" ry="3.5" fill="#2D3748" />
        <circle cx="37" cy="40" r="1.8" fill="white" />
        <circle cx="61" cy="40" r="1.8" fill="white" />

        {/* Blush */}
        <circle cx="30" cy="52" r="5" fill="#FFB3C1" opacity="0.4" />
        <circle cx="70" cy="52" r="5" fill="#FFB3C1" opacity="0.4" />

        {/* Nose */}
        <ellipse cx="50" cy="50" rx="4" ry="3" fill="#2D3748" />

        {/* Mouth */}
        <path
          d="M47 54 Q50 58 53 54"
          stroke="#2D3748"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Paws */}
        <ellipse cx="33" cy="94" rx="8" ry="4" fill="#2D3748" />
        <ellipse cx="67" cy="94" rx="8" ry="4" fill="#2D3748" />
      </svg>
    </div>
  );
}

export function FoxAvatar() {
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Ears */}
        <polygon points="25,38 12,5 42,28" fill="#E87830" />
        <polygon points="75,38 88,5 58,28" fill="#E87830" />
        <polygon points="27,35 18,12 40,30" fill="#2D3748" />
        <polygon points="73,35 82,12 60,30" fill="#2D3748" />

        {/* Tail */}
        <path d="M20 75 Q5 60 10 45 Q12 40 16 48 Q18 55 25 65" fill="#E87830" />
        <path d="M12 47 Q14 42 17 50" fill="white" />

        {/* Body */}
        <ellipse cx="50" cy="75" rx="24" ry="20" fill="#E87830" />
        <ellipse cx="50" cy="80" rx="15" ry="13" fill="#FFF5E6" />

        {/* Head */}
        <circle cx="50" cy="45" r="25" fill="#E87830" />

        {/* White snout */}
        <ellipse cx="50" cy="52" rx="16" ry="14" fill="#FFF5E6" />

        {/* Blush */}
        <circle cx="34" cy="50" r="4" fill="#FFB3C1" opacity="0.5" />
        <circle cx="66" cy="50" r="4" fill="#FFB3C1" opacity="0.5" />

        {/* Eyes */}
        <ellipse cx="40" cy="42" rx="5" ry="6" fill="white" />
        <ellipse cx="60" cy="42" rx="5" ry="6" fill="white" />
        <ellipse cx="41" cy="43" rx="2.5" ry="3.5" fill="#2D3748" />
        <ellipse cx="61" cy="43" rx="2.5" ry="3.5" fill="#2D3748" />
        <circle cx="39" cy="40" r="1.5" fill="white" />
        <circle cx="59" cy="40" r="1.5" fill="white" />

        {/* Nose */}
        <ellipse cx="50" cy="50" rx="3.5" ry="2.5" fill="#2D3748" />

        {/* Mouth */}
        <path
          d="M47 53 Q50 56 53 53"
          stroke="#2D3748"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Paws */}
        <ellipse cx="35" cy="93" rx="7" ry="4" fill="#E87830" />
        <ellipse cx="65" cy="93" rx="7" ry="4" fill="#E87830" />
      </svg>
    </div>
  );
}

export function OwlAvatar() {
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Ear tufts */}
        <polygon points="28,30 18,8 38,22" fill="#8B6F47" />
        <polygon points="72,30 82,8 62,22" fill="#8B6F47" />

        {/* Wings */}
        <ellipse
          cx="20"
          cy="65"
          rx="10"
          ry="18"
          fill="#A0845C"
          transform="rotate(-10 20 65)"
        />
        <ellipse
          cx="80"
          cy="65"
          rx="10"
          ry="18"
          fill="#A0845C"
          transform="rotate(10 80 65)"
        />

        {/* Body */}
        <ellipse cx="50" cy="65" rx="26" ry="28" fill="#C4A06A" />

        {/* Chest */}
        <ellipse cx="50" cy="72" rx="16" ry="18" fill="#F5E6CC" />

        {/* Chest pattern */}
        <path
          d="M42 65 Q50 70 58 65"
          stroke="#DFC49A"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M40 72 Q50 77 60 72"
          stroke="#DFC49A"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M42 79 Q50 84 58 79"
          stroke="#DFC49A"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Head */}
        <circle cx="50" cy="40" r="24" fill="#C4A06A" />

        {/* Facial disc */}
        <ellipse cx="40" cy="40" rx="12" ry="13" fill="#F5E6CC" />
        <ellipse cx="60" cy="40" rx="12" ry="13" fill="#F5E6CC" />

        {/* Eyes */}
        <circle cx="40" cy="38" r="8" fill="white" />
        <circle cx="60" cy="38" r="8" fill="white" />
        <circle cx="41" cy="39" r="4.5" fill="#E8A317" />
        <circle cx="61" cy="39" r="4.5" fill="#E8A317" />
        <circle cx="41" cy="39" r="2.5" fill="#2D3748" />
        <circle cx="61" cy="39" r="2.5" fill="#2D3748" />
        <circle cx="39" cy="37" r="1.5" fill="white" />
        <circle cx="59" cy="37" r="1.5" fill="white" />

        {/* Beak */}
        <polygon points="50,44 47,50 53,50" fill="#E8A317" />

        {/* Blush */}
        <circle cx="32" cy="46" r="4" fill="#FFB3C1" opacity="0.4" />
        <circle cx="68" cy="46" r="4" fill="#FFB3C1" opacity="0.4" />

        {/* Feet */}
        <ellipse cx="40" cy="93" rx="6" ry="3" fill="#E8A317" />
        <ellipse cx="60" cy="93" rx="6" ry="3" fill="#E8A317" />
      </svg>
    </div>
  );
}

export function PenguinAvatar() {
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Wings */}
        <ellipse
          cx="20"
          cy="60"
          rx="8"
          ry="18"
          fill="#2D3748"
          transform="rotate(-15 20 60)"
        />
        <ellipse
          cx="80"
          cy="60"
          rx="8"
          ry="18"
          fill="#2D3748"
          transform="rotate(15 80 60)"
        />

        {/* Body */}
        <ellipse cx="50" cy="62" rx="26" ry="32" fill="#2D3748" />

        {/* White belly */}
        <ellipse cx="50" cy="68" rx="18" ry="24" fill="white" />

        {/* Head */}
        <circle cx="50" cy="35" r="24" fill="#2D3748" />

        {/* White face */}
        <ellipse cx="50" cy="40" rx="16" ry="14" fill="white" />

        {/* Eyes */}
        <ellipse cx="42" cy="36" rx="5" ry="6" fill="white" />
        <ellipse cx="58" cy="36" rx="5" ry="6" fill="white" />
        <ellipse cx="43" cy="37" rx="2.5" ry="3.5" fill="#2D3748" />
        <ellipse cx="59" cy="37" rx="2.5" ry="3.5" fill="#2D3748" />
        <circle cx="41" cy="34" r="1.5" fill="white" />
        <circle cx="57" cy="34" r="1.5" fill="white" />

        {/* Blush */}
        <circle cx="35" cy="44" r="4" fill="#FFB3C1" opacity="0.5" />
        <circle cx="65" cy="44" r="4" fill="#FFB3C1" opacity="0.5" />

        {/* Beak */}
        <ellipse cx="50" cy="44" rx="5" ry="3" fill="#FFB347" />

        {/* Mouth */}
        <path
          d="M47 46 Q50 48 53 46"
          stroke="#E8971E"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Feet */}
        <ellipse cx="38" cy="93" rx="8" ry="4" fill="#FFB347" />
        <ellipse cx="62" cy="93" rx="8" ry="4" fill="#FFB347" />

        {/* Bow tie */}
        <polygon points="50,52 44,48 44,56" fill="#FF6B8A" />
        <polygon points="50,52 56,48 56,56" fill="#FF6B8A" />
        <circle cx="50" cy="52" r="2" fill="#FF4571" />
      </svg>
    </div>
  );
}

export function BearAvatar() {
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Ears */}
        <circle cx="28" cy="22" r="12" fill="#8B6245" />
        <circle cx="72" cy="22" r="12" fill="#8B6245" />
        <circle cx="28" cy="22" r="7" fill="#C49A6C" />
        <circle cx="72" cy="22" r="7" fill="#C49A6C" />

        {/* Body */}
        <ellipse cx="50" cy="75" rx="25" ry="22" fill="#8B6245" />
        <ellipse cx="50" cy="80" rx="16" ry="14" fill="#C49A6C" />

        {/* Head */}
        <circle cx="50" cy="45" r="27" fill="#8B6245" />

        {/* Snout */}
        <ellipse cx="50" cy="52" rx="14" ry="10" fill="#C49A6C" />

        {/* Blush */}
        <circle cx="33" cy="52" r="5" fill="#FFB3C1" opacity="0.4" />
        <circle cx="67" cy="52" r="5" fill="#FFB3C1" opacity="0.4" />

        {/* Eyes */}
        <ellipse cx="40" cy="42" rx="5" ry="6" fill="white" />
        <ellipse cx="60" cy="42" rx="5" ry="6" fill="white" />
        <ellipse cx="41" cy="43" rx="2.5" ry="3.5" fill="#2D3748" />
        <ellipse cx="61" cy="43" rx="2.5" ry="3.5" fill="#2D3748" />
        <circle cx="39" cy="40" r="1.5" fill="white" />
        <circle cx="59" cy="40" r="1.5" fill="white" />

        {/* Nose */}
        <ellipse cx="50" cy="50" rx="4" ry="3" fill="#2D3748" />
        <ellipse cx="50" cy="49" rx="1.5" ry="1" fill="white" opacity="0.4" />

        {/* Mouth */}
        <path
          d="M47 54 Q50 58 53 54"
          stroke="#2D3748"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Paws */}
        <ellipse cx="33" cy="94" rx="8" ry="4" fill="#8B6245" />
        <ellipse cx="67" cy="94" rx="8" ry="4" fill="#8B6245" />
      </svg>
    </div>
  );
}

export function FrogAvatar() {
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Eye bulges */}
        <circle cx="35" cy="25" r="14" fill="#5CB85C" />
        <circle cx="65" cy="25" r="14" fill="#5CB85C" />

        {/* Body */}
        <ellipse cx="50" cy="72" rx="28" ry="24" fill="#5CB85C" />
        <ellipse cx="50" cy="78" rx="18" ry="16" fill="#A8E6A1" />

        {/* Head */}
        <ellipse cx="50" cy="45" rx="30" ry="22" fill="#5CB85C" />

        {/* Eyes */}
        <circle cx="35" cy="24" r="9" fill="white" />
        <circle cx="65" cy="24" r="9" fill="white" />
        <circle cx="36" cy="25" r="5" fill="#2D3748" />
        <circle cx="66" cy="25" r="5" fill="#2D3748" />
        <circle cx="34" cy="22" r="2.5" fill="white" />
        <circle cx="64" cy="22" r="2.5" fill="white" />

        {/* Blush */}
        <circle cx="30" cy="48" r="6" fill="#FFB3C1" opacity="0.4" />
        <circle cx="70" cy="48" r="6" fill="#FFB3C1" opacity="0.4" />

        {/* Mouth */}
        <path
          d="M30 50 Q50 65 70 50"
          stroke="#2D3748"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Feet */}
        <ellipse cx="30" cy="94" rx="10" ry="4" fill="#5CB85C" />
        <ellipse cx="70" cy="94" rx="10" ry="4" fill="#5CB85C" />

        {/* Toes */}
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

export function KoalaAvatar() {
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Ears */}
        <circle cx="24" cy="30" r="16" fill="#7A8B99" />
        <circle cx="76" cy="30" r="16" fill="#7A8B99" />
        <circle cx="24" cy="30" r="10" fill="#F5E6CC" />
        <circle cx="76" cy="30" r="10" fill="#F5E6CC" />

        {/* Body */}
        <ellipse cx="50" cy="78" rx="22" ry="18" fill="#7A8B99" />
        <ellipse cx="50" cy="82" rx="14" ry="12" fill="#B0BEC5" />

        {/* Head */}
        <circle cx="50" cy="48" r="26" fill="#7A8B99" />

        {/* White snout */}
        <ellipse cx="50" cy="55" rx="16" ry="12" fill="#B0BEC5" />

        {/* Blush */}
        <circle cx="34" cy="55" r="5" fill="#FFB3C1" opacity="0.4" />
        <circle cx="66" cy="55" r="5" fill="#FFB3C1" opacity="0.4" />

        {/* Eyes */}
        <ellipse cx="40" cy="45" rx="5" ry="6" fill="white" />
        <ellipse cx="60" cy="45" rx="5" ry="6" fill="white" />
        <ellipse cx="41" cy="46" rx="2.5" ry="3.5" fill="#2D3748" />
        <ellipse cx="61" cy="46" rx="2.5" ry="3.5" fill="#2D3748" />
        <circle cx="39" cy="43" r="1.5" fill="white" />
        <circle cx="59" cy="43" r="1.5" fill="white" />

        {/* Nose */}
        <ellipse cx="50" cy="53" rx="6" ry="4" fill="#2D3748" />
        <ellipse cx="50" cy="52" rx="2" ry="1.2" fill="white" opacity="0.3" />

        {/* Mouth */}
        <path
          d="M47 58 Q50 61 53 58"
          stroke="#2D3748"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Paws */}
        <ellipse cx="35" cy="94" rx="7" ry="4" fill="#7A8B99" />
        <ellipse cx="65" cy="94" rx="7" ry="4" fill="#7A8B99" />
      </svg>
    </div>
  );
}

export function ChickAvatar() {
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Tuft */}
        <ellipse cx="50" cy="12" rx="4" ry="8" fill="#FFD93D" />
        <ellipse
          cx="44"
          cy="14"
          rx="3"
          ry="7"
          fill="#FFD93D"
          transform="rotate(-15 44 14)"
        />
        <ellipse
          cx="56"
          cy="14"
          rx="3"
          ry="7"
          fill="#FFD93D"
          transform="rotate(15 56 14)"
        />

        {/* Wings */}
        <ellipse
          cx="20"
          cy="60"
          rx="8"
          ry="14"
          fill="#FFEC8A"
          transform="rotate(-15 20 60)"
        />
        <ellipse
          cx="80"
          cy="60"
          rx="8"
          ry="14"
          fill="#FFEC8A"
          transform="rotate(15 80 60)"
        />

        {/* Body */}
        <ellipse cx="50" cy="62" rx="26" ry="28" fill="#FFD93D" />

        {/* Belly */}
        <ellipse cx="50" cy="68" rx="17" ry="18" fill="#FFF5C0" />

        {/* Head */}
        <circle cx="50" cy="38" r="22" fill="#FFD93D" />

        {/* Blush */}
        <circle cx="34" cy="44" r="5" fill="#FFB3C1" opacity="0.5" />
        <circle cx="66" cy="44" r="5" fill="#FFB3C1" opacity="0.5" />

        {/* Eyes */}
        <ellipse cx="42" cy="36" rx="5" ry="6" fill="white" />
        <ellipse cx="58" cy="36" rx="5" ry="6" fill="white" />
        <ellipse cx="43" cy="37" rx="2.5" ry="3.5" fill="#2D3748" />
        <ellipse cx="59" cy="37" rx="2.5" ry="3.5" fill="#2D3748" />
        <circle cx="41" cy="34" r="1.5" fill="white" />
        <circle cx="57" cy="34" r="1.5" fill="white" />

        {/* Beak */}
        <polygon points="50,42 45,47 55,47" fill="#FF8C42" />

        {/* Mouth */}
        <path
          d="M47 47 Q50 49 53 47"
          stroke="#E07020"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />

        {/* Legs */}
        <path
          d="M38 90 L32 96 L38 94 L40 98 L42 94 L48 96 L42 90"
          fill="#FF8C42"
        />
        <path
          d="M58 90 L52 96 L58 94 L60 98 L62 94 L68 96 L62 90"
          fill="#FF8C42"
        />
      </svg>
    </div>
  );
}

export function UnicornAvatar() {
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Horn */}
        <polygon points="50,2 45,25 55,25" fill="#FFD93D" />
        <line
          x1="47"
          y1="10"
          x2="53"
          y2="10"
          stroke="#FFB347"
          strokeWidth="1.5"
        />
        <line
          x1="46"
          y1="15"
          x2="54"
          y2="15"
          stroke="#FFB347"
          strokeWidth="1.5"
        />
        <line
          x1="46"
          y1="20"
          x2="54"
          y2="20"
          stroke="#FFB347"
          strokeWidth="1.5"
        />

        {/* Ears */}
        <polygon points="32,30 24,12 40,24" fill="#F0E6FF" />
        <polygon points="68,30 76,12 60,24" fill="#F0E6FF" />
        <polygon points="34,28 28,16 39,25" fill="#E0C6FF" />
        <polygon points="66,28 72,16 61,25" fill="#E0C6FF" />

        {/* Mane */}
        <ellipse
          cx="28"
          cy="35"
          rx="6"
          ry="10"
          fill="#FF8FAB"
          transform="rotate(-20 28 35)"
        />
        <ellipse
          cx="25"
          cy="48"
          rx="5"
          ry="9"
          fill="#B388FF"
          transform="rotate(-10 25 48)"
        />
        <ellipse
          cx="26"
          cy="60"
          rx="5"
          ry="8"
          fill="#81D4FA"
          transform="rotate(-5 26 60)"
        />

        {/* Tail */}
        <path
          d="M75 72 Q90 60 85 45"
          stroke="#FF8FAB"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M85 45 Q92 38 88 30"
          stroke="#B388FF"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Body */}
        <ellipse cx="50" cy="70" rx="25" ry="22" fill="white" />

        {/* Head */}
        <circle cx="50" cy="40" r="22" fill="white" />

        {/* Blush */}
        <circle cx="34" cy="47" r="5" fill="#FFB3C1" opacity="0.5" />
        <circle cx="66" cy="47" r="5" fill="#FFB3C1" opacity="0.5" />

        {/* Eyes */}
        <ellipse
          cx="40"
          cy="38"
          rx="5"
          ry="7"
          fill="white"
          stroke="#E0C6FF"
          strokeWidth="0.5"
        />
        <ellipse
          cx="60"
          cy="38"
          rx="5"
          ry="7"
          fill="white"
          stroke="#E0C6FF"
          strokeWidth="0.5"
        />
        <ellipse cx="41" cy="39" rx="3" ry="4" fill="#7C4DFF" />
        <ellipse cx="61" cy="39" rx="3" ry="4" fill="#7C4DFF" />
        <circle cx="39" cy="36" r="1.8" fill="white" />
        <circle cx="59" cy="36" r="1.8" fill="white" />

        {/* Nose */}
        <ellipse cx="50" cy="47" rx="2.5" ry="1.8" fill="#FFB3C1" />

        {/* Mouth */}
        <path
          d="M47 50 Q50 53 53 50"
          stroke="#2D3748"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Legs */}
        <ellipse
          cx="35"
          cy="90"
          rx="7"
          ry="4"
          fill="white"
          stroke="#E0C6FF"
          strokeWidth="1"
        />
        <ellipse
          cx="65"
          cy="90"
          rx="7"
          ry="4"
          fill="white"
          stroke="#E0C6FF"
          strokeWidth="1"
        />

        {/* Hooves */}
        <ellipse cx="35" cy="93" rx="4" ry="2" fill="#FFD93D" />
        <ellipse cx="65" cy="93" rx="4" ry="2" fill="#FFD93D" />
      </svg>
    </div>
  );
}
