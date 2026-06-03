import React, { useEffect, useRef } from 'react';

interface ValueStreamCanvasProps {
  isStreaming: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  hue: number;
}

/**
 * High-fidelity HTML5 Canvas value stream animator.
 * Spawns dynamic fluid-flow HSL particles drifting contextualizing money flow visually.
 * Respects 'prefers-reduced-motion' query preferences to support physical accessibility guidelines.
 */
export const ValueStreamCanvas: React.FC<ValueStreamCanvasProps> = ({ isStreaming }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Check user browser system setting regarding physical reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animationId: number;
    let particles: Particle[] = [];
    
    // Set explicit size attributes
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle spawning metrics
    const MAX_PARTICLES = 32;

    const createParticle = (spawnAtBottom = false): Particle => {
      const w = canvas.width;
      const h = canvas.height;
      return {
        x: Math.random() * w,
        y: spawnAtBottom ? h + 10 : Math.random() * h,
        size: Math.random() * 3 + 1.5,
        speedY: -(Math.random() * 0.8 + 0.4), // Float upwards
        speedX: Math.random() * 0.4 - 0.2, // Subtle horizontal sway
        opacity: Math.random() * 0.5 + 0.1,
        // HSL Hue selection: 140-165 (Emerald green streams) or 260-280 (Royal purple highlights)
        hue: Math.random() > 0.3 ? Math.floor(Math.random() * 25 + 140) : Math.floor(Math.random() * 20 + 260)
      };
    };

    // Initialize baseline starting particles array
    for (let i = 0; i < 15; i++) {
      particles.push(createParticle());
    }

    // 2. Continuous Animation Render Loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Loop backward to safely remove array elements during iterations
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Render current particle as glowing arc glow sphere
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.opacity})`;
        ctx.shadowBlur = p.size * 2;
        ctx.shadowColor = `hsl(${p.hue}, 90%, 65%)`;
        
        ctx.fill();
        ctx.restore();

        // Telemetry update step
        p.y += p.speedY;
        p.x += p.speedX;
        
        // Slowly decay opacity as particles drift upwards
        if (p.y < 50) {
          p.opacity -= 0.01;
        }

        // Garbage collection: rebuild dead off-screen instances
        if (p.y < 0 || p.opacity <= 0 || p.x < 0 || p.x > canvas.width) {
          if (isStreaming && particles.length < MAX_PARTICLES) {
            particles[i] = createParticle(true); // Spawn replacements at bottom edge
          } else {
            particles.splice(i, 1); // Shrink pool if flow is inactive
          }
        }
      }

      // Populate new particles when stream is highly active
      if (isStreaming && particles.length < MAX_PARTICLES && Math.random() < 0.08) {
        particles.push(createParticle(true));
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    // 3. Destructor and cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [isStreaming]);

  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Allow cursor interactions to bleed through elements
        zIndex: 3, // Layer above backdrop and under defensive overlays
        opacity: isStreaming ? 0.7 : 0.15,
        transition: 'opacity 1.5s ease-in-out'
      }}
    />
  );
};
export default ValueStreamCanvas;
