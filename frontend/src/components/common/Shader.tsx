import { useRef } from "react";
import { useShader } from "@/hooks/useShader";

/**
 * Компонент для рендера шейдера на фоне страницы.
 * - Использует хук `useShader` для инициализации WebGL и рендера анимации.
 * - Рендерит канвас, который занимает весь экран, с абсолютным позиционированием.
 * - Устанавливает `aria-hidden="true"`, чтобы не мешать скринридерам.
 */
export function Shader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useShader(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}
