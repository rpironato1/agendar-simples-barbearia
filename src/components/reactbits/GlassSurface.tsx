import { motion } from 'framer-motion';

interface GlassSurfaceProps {
  children: React.ReactNode;
  borderRadius?: number;
  backgroundOpacity?: number;
  className?: string;
}

export const GlassSurface = ({ 
  children, 
  borderRadius = 20,
  backgroundOpacity = 0.1,
  className = ''
}: GlassSurfaceProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
      className={`relative backdrop-blur-md border border-white/20 shadow-2xl ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
        background: `linear-gradient(135deg, 
          rgba(255, 255, 255, ${backgroundOpacity}) 0%, 
          rgba(255, 255, 255, ${backgroundOpacity * 0.5}) 100%)`,
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(255, 255, 255, 0.1)
        `,
      }}
    >
      {/* Glass shine effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: `${borderRadius}px`,
          background: `linear-gradient(135deg, 
            rgba(255, 255, 255, 0.2) 0%, 
            transparent 50%)`
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          repeatDelay: 3,
          ease: "easeInOut"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};