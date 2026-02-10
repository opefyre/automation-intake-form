'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
}

export const NeuralBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();
    const mouseRef = useRef({ x: 0, y: 0 });
    const lastMouseMoveRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        // Configuration
        // User requested "a bit more nodes" -> 300
        const particleCount = Math.min(window.innerWidth * window.innerHeight / 10000, 300);
        const connectionDistance = 200;
        const mouseDistance = 300;
        // User requested "longer trip" -> Less friction (closer to 1)
        const friction = 0.995; // Was 0.98. This allows much longer gliding.

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 2, // Initial burst
                    vy: (Math.random() - 0.5) * 2,
                    size: Math.random() * 0.9 + 0.3 // 40% smaller (was 1.5+0.5 -> ~0.75 avg)
                });
            }
        };

        const draw = () => {
            const isDark = theme === 'dark' || document.documentElement.classList.contains('dark');
            const color = isDark ? '255, 255, 255' : '5, 5, 5';

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Efficient Glow (Additive Blending) - faster than shadowBlur
            ctx.globalCompositeOperation = isDark ? 'screen' : 'source-over';

            // Remove expensive shadowBlur
            // ctx.shadowBlur = 25;
            // ctx.shadowColor = ...

            particles.forEach((p, i) => {
                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Apply Friction
                p.vx *= friction;
                p.vy *= friction;

                if (Math.abs(p.vx) < 0.01) p.vx = 0;
                if (Math.abs(p.vy) < 0.01) p.vy = 0;

                // Bounce
                if (p.x < 0 || p.x > canvas.width) { p.x = Math.max(0, Math.min(canvas.width, p.x)); p.vx *= -1; }
                if (p.y < 0 || p.y > canvas.height) { p.y = Math.max(0, Math.min(canvas.height, p.y)); p.vy *= -1; }

                // Mouse Interaction (Push)
                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouseDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouseDistance - distance) / mouseDistance;
                    const direction = -1; // Push
                    const strength = 0.5;

                    p.vx += forceDirectionX * force * strength * direction;
                    p.vy += forceDirectionY * force * strength * direction;
                }

                // Draw Connections First (so dots sit on top?) - actually usually lines then dots
                // Optimizing loop: Only check neighbors? 
                // With 200 nodes, N^2 is 40k checks. Browsers handle millions of ops. 
                // The drawing commands (stroke) are the bottleneck.

                // Batch path drawing?
                // No, opacity varies by distance, can't batch easily without generic opacity.
                // We'll keep per-line drawing but it should be fast without shadow.

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        // 0.15 opacity is subtle.
                        ctx.strokeStyle = `rgba(${color}, ${0.08 * (1 - dist / connectionDistance)})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }

                // Draw Particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color}, ${isDark ? 0.3 : 0.25})`;
                ctx.fill();

                // Optional: Fake glow for dark mode using a second larger low-opacity circle?
                // Adds 2x draw calls but much cheaper than shadowBlur.
                if (isDark) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${color}, 0.1)`;
                    ctx.fill();
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
            lastMouseMoveRef.current = Date.now();
        };

        const handleResize = () => {
            init();
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        init();
        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0
            }}
        />
    );
};
