import { motion } from "framer-motion";
import { Scissors } from "lucide-react";

interface FooterProps {
  brandName?: string;
  year?: number;
  description?: string;
  className?: string;
}

export const Footer = ({
  brandName = "Elite Barber",
  year = new Date().getFullYear(),
  description = "Desenvolvido com ❤️ para o homem moderno.",
  className = "",
}: FooterProps) => {
  return (
    <motion.footer
      className={`bg-black/40 border-t border-amber-500/20 py-12 ${className}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.div
            className="flex items-center space-x-3 mb-4 md:mb-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-2 rounded-lg">
              <Scissors className="h-6 w-6 text-black" />
            </div>
            <span className="text-2xl font-bold text-white">{brandName}</span>
          </motion.div>

          <motion.div
            className="text-gray-400 text-center md:text-right"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <p>
              © {year} {brandName}. Todos os direitos reservados.
              <br />
              {description}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
};
