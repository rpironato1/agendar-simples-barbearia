import { motion } from "framer-motion";
import { useState } from "react";

interface PillNavItem {
  label: string;
  href: string;
  onClick?: () => void;
}

interface PillNavProps {
  items: PillNavItem[];
  baseColor?: string;
  pillColor?: string;
  className?: string;
}

export const PillNav = ({
  items,
  baseColor = "#1E3A8A",
  pillColor = "#FFD700",
  className = "",
}: PillNavProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative flex items-center space-x-1 bg-black/20 backdrop-blur-md border border-white/10 rounded-full p-2 ${className}`}
      style={{ backgroundColor: `${baseColor}20` }}
    >
      {items.map((item, index) => (
        <motion.div key={item.label} className="relative">
          {activeIndex === index && (
            <motion.div
              layoutId="pill"
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: pillColor }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <motion.a
            href={item.href}
            onClick={(e) => {
              if (item.onClick) {
                e.preventDefault();
                item.onClick();
              }
              setActiveIndex(index);
            }}
            className="relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200"
            style={{
              color: activeIndex === index ? "#000" : "#fff",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {item.label}
          </motion.a>
        </motion.div>
      ))}
    </motion.nav>
  );
};
