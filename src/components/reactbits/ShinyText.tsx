import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ShinyTextProps {
  text: string;
  speed?: number;
  className?: string;
}

export const ShinyText = ({
  text,
  speed = 3,
  className = "",
}: ShinyTextProps) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(false);
      setTimeout(() => setIsAnimating(true), 100);
    }, speed * 1000);

    return () => clearInterval(interval);
  }, [speed]);

  return (
    <motion.div
      className={`relative inline-block overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <span className="relative z-10 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent font-bold">
        {text}
      </span>

      {/* Shine effect */}
      {isAnimating && (
        <motion.div
          className="absolute inset-0 z-20"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)",
            mixBlendMode: "overlay",
          }}
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: 0,
          }}
        />
      )}

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-amber-400/50 via-yellow-300/50 to-amber-400/50 blur-sm"
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};
