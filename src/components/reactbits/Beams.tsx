import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface BeamsProps {
  color1?: string;
  color2?: string;
  opacity?: number;
  className?: string;
}

export const Beams = ({ 
  color1 = '#FFD700', 
  color2 = '#1E3A8A', 
  opacity = 0.3,
  className = ''
}: BeamsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `${color1}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, `${color2}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);

      // Draw animated beams
      for (let i = 0; i < 5; i++) {
        const x = (canvas.width / 5) * i + Math.sin(time + i) * 50;
        const y = Math.cos(time + i * 0.5) * 30;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.sin(time + i) * 0.1);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-2, 0, 4, canvas.height);
        ctx.restore();
      }

      time += 0.01;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [color1, color2, opacity]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ filter: 'blur(1px)' }}
      />
    </motion.div>
  );
};