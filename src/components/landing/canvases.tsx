/** Fondos animados de la landing (canvas 2D, sin assets externos):
 *  partículas flotantes, grilla de puntos con onda, gráfico de puntos y ondas. */
"use client";

import { useEffect, useRef } from "react";

/** Partículas flotantes que reaccionan al mouse (hero y tarjeta grande). */
export function ParticleField({ count = 70 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const mouse = { x: 0.5, y: 0.5 };
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / rect.width;
      mouse.y = (e.clientY - rect.top) / rect.height;
    };
    canvas.addEventListener("mousemove", onMove);

    const particles = Array.from({ length: count }, (_, i) => {
      const seed = i * 1.618;
      return {
        bx: (seed * 127.1) % 1,
        by: (seed * 311.7) % 1,
        phase: seed * Math.PI * 2,
        speed: 0.4 + (seed % 0.4),
        radius: 1.2 + (seed % 2.2),
      };
    });

    let time = 0;
    let frame = 0;
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        const flowX = Math.sin(time * p.speed * 0.4 + p.phase) * 38;
        const flowY = Math.cos(time * p.speed * 0.3 + p.phase * 0.7) * 24;
        const dx = p.bx - mouse.x;
        const dy = p.by - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist * 2.8);

        const x = p.bx * w + flowX + influence * Math.cos(time + p.phase) * 36;
        const y = p.by * h + flowY + influence * Math.sin(time + p.phase) * 36;
        const pulse = Math.sin(time * p.speed + p.phase) * 0.5 + 0.5;
        const alpha = 0.08 + pulse * 0.18 + influence * 0.3;

        ctx.beginPath();
        ctx.arc(x, y, p.radius + pulse * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }

      time += 0.016;
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [count]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
  );
}

/** Grilla de puntos con onda que respira (fondo de la sección de métricas). */
export function GridDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let time = 0;
    let frame = 0;
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);
      const grid = 60;
      for (let x = 0; x < w; x += grid) {
        for (let y = 0; y < h; y += grid) {
          const wave = Math.sin(x * 0.01 + y * 0.01 + time) * 0.5 + 0.5;
          ctx.beginPath();
          ctx.arc(x, y, 1 + wave * 2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
          ctx.fill();
        }
      }
      const pulseY = (time * 30) % h;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.beginPath();
      ctx.moveTo(0, pulseY);
      ctx.lineTo(w, pulseY);
      ctx.stroke();
      time += 0.02;
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
  );
}

/** Serie de puntos ondulante estilo sparkline (tarjetas de métricas). */
export function DotGraph({
  accent = false,
  height = 32,
  freq1 = 0.35,
  freq2 = 0.12,
  speed = 0.02,
}: {
  accent?: boolean;
  height?: number;
  freq1?: number;
  freq2?: number;
  speed?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.offsetWidth || 300;
    canvas.width = W * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let time = Math.random() * 100;
    let frame = 0;
    const render = () => {
      ctx.clearRect(0, 0, W, height);
      const cols = Math.floor(W / 8);
      for (let i = 0; i < cols; i++) {
        const raw = 0.32 + 0.52 * Math.sin(i * freq1 + time) * Math.cos(i * freq2 + time * 0.7);
        const v = Math.max(0, Math.min(1, raw));
        const y = height - 4 - v * (height - 8);
        const alpha = 0.15 + v * 0.55;
        ctx.beginPath();
        ctx.arc(i * 8 + 4, y, 1.5 + v * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = accent
          ? `rgba(236, 168, 214, ${alpha})`
          : `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }
      time += speed;
      frame = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(frame);
  }, [accent, height, freq1, freq2, speed]);

  return <canvas ref={canvasRef} style={{ width: "100%", height, display: "block" }} aria-hidden />;
}

/** Ondas superpuestas (franja superior del footer). */
export function WaveField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let time = 0;
    let frame = 0;
    const palette = [
      "rgba(236, 168, 214, 0.25)",
      "rgba(167, 139, 250, 0.20)",
      "rgba(103, 232, 249, 0.15)",
    ];
    const render = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      palette.forEach((color, wave) => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 5) {
          const y =
            h * 0.55 +
            Math.sin(x * 0.008 + time + wave * 0.6) * 34 +
            Math.sin(x * 0.02 + time * 1.5 + wave) * 18;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      time += 0.015;
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden />;
}
