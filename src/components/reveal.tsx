import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduced ? {} : { y: [12, 0], opacity: [0.8, 1] }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.45, delay }}
    >
      {children}
    </motion.div>
  );
}
