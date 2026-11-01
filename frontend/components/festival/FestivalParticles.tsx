'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface FestivalParticlesProps {
  festivalName: string;
}

const festivalColors: Record<string, string[]> = {
  'Diwali': ['#FF9800', '#FFA726', '#FFB74D', '#FFD54F', '#FF6F00'],
  'Holi': ['#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FFEB3B', '#FF5722'],
  'Chhath Puja': ['#FF9800', '#FFA726', '#FF6F00', '#F57C00', '#FFD54F'],
  'Christmas': ['#C62828', '#2E7D32', '#FFFFFF', '#FFD700', '#1565C0'],
  'New Year': ['#9C27B0', '#E91E63', '#2196F3', '#00BCD4', '#FFD700'],
  'Independence Day': ['#FF9933', '#FFFFFF', '#138808', '#000080'],
  'Default': ['#2196F3', '#1976D2', '#1565C0', '#0D47A1'],
};

const FestivalParticles: React.FC<FestivalParticlesProps> = ({ festivalName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    updateCanvasSize();

    // Get festival colors
    const colors = festivalColors[festivalName] || festivalColors['Default'];

    // Initialize particles
    const particleCount = 60;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      // Draw connections
      particlesRef.current.forEach((particleA, i) => {
        particlesRef.current.slice(i + 1).forEach((particleB) => {
          const dx = particleA.x - particleB.x;
          const dy = particleA.y - particleB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particleA.x, particleA.y);
            ctx.lineTo(particleB.x, particleB.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      updateCanvasSize();
      // Reposition particles within new bounds
      particlesRef.current.forEach((particle) => {
        particle.x = Math.min(particle.x, canvas.width);
        particle.y = Math.min(particle.y, canvas.height);
      });
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [festivalName]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
};

export default FestivalParticles;
