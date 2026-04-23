import { useEffect, useRef } from "react";

import VERT from "@/shaders/background.vert.glsl?raw";
import FRAG from "@/shaders/background.frag.glsl?raw";

// ---------------------------------------------------------------------------
// Утилитарные функции для конвертации цветов из CSS-переменных в RGB
// ---------------------------------------------------------------------------

function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const lc = l_ ** 3,
    mc = m_ ** 3,
    sc = s_ ** 3;

  const r = 4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc;
  const g = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc;
  const bv = -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc;

  return [
    Math.max(0, Math.min(1, r)),
    Math.max(0, Math.min(1, g)),
    Math.max(0, Math.min(1, bv)),
  ];
}

function parseCssOklch(val: string): [number, number, number] {
  const m = val.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (!m) return [0.5, 0.0, 0.0];
  return oklchToRgb(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
}

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

// ---------------------------------------------------------------------------
// Утилитарные функции для компиляции шейдера и создания программы
// ---------------------------------------------------------------------------

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  src: string,
): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) ?? "shader error");
  }
  return s;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog) ?? "link error");
  }
  return prog;
}

// ---------------------------------------------------------------------------
// Закрытый хук для рендера шейдера на канвасе
// ---------------------------------------------------------------------------

export function useShader(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    let prog: WebGLProgram;
    try {
      prog = createProgram(gl);
    } catch (e) {
      console.warn("ShaderBackground: WebGL compile failed", e);
      return;
    }

    gl.useProgram(prog);

    // Fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "aPosition");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uScreen = gl.getUniformLocation(prog, "vScreenSize");
    const uTime = gl.getUniformLocation(prog, "vTime");
    const uScale = gl.getUniformLocation(prog, "vScale");
    const uBg = gl.getUniformLocation(prog, "vColorBackground");
    const uColors = gl.getUniformLocation(prog, "vColor");
    const uRots = gl.getUniformLocation(prog, "vRotation");

    function buildColors(): Float32Array {
      const primary = parseCssOklch(getCssVar("--primary"));
      const accent = parseCssOklch(getCssVar("--accent"));
      const muted = parseCssOklch(getCssVar("--muted-foreground"));
      const bg = parseCssOklch(getCssVar("--background"));

      const blend = (
        c: [number, number, number],
        t: number,
      ): [number, number, number] => [
        c[0] * t + bg[0] * (1 - t),
        c[1] * t + bg[1] * (1 - t),
        c[2] * t + bg[2] * (1 - t),
      ];

      return new Float32Array([
        ...blend(primary, 0.35),
        ...blend(accent, 0.25),
        ...blend(muted, 0.2),
        ...blend(primary, 0.2),
        ...blend(accent, 0.15),
        ...blend(muted, 0.12),
      ]);
    }

    function buildBg(): Float32Array {
      return new Float32Array(parseCssOklch(getCssVar("--background")));
    }

    const rotations = new Float32Array([0.6, 0.8, -0.7, 0.5, 0.3, -0.9]);

    const start = performance.now();

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas!.width = canvas!.clientWidth * dpr;
      canvas!.height = canvas!.clientHeight * dpr;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function render() {
      const t = (performance.now() - start) / 1000;

      gl!.uniform2f(uScreen, canvas!.width, canvas!.height);
      gl!.uniform1f(uTime, t);
      gl!.uniform1f(uScale, 1.2);
      gl!.uniform3fv(uBg, buildBg());
      gl!.uniform3fv(uColors, buildColors());
      gl!.uniform2fv(uRots, rotations);

      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, [canvasRef]);
}
