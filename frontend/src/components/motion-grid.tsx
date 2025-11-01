"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AnimatedGridProps {
  children: ReactNode;
  staggerDelay?: number;
  delay?: number;
  className?: string;
}

export default function MotionGrid({
  children,
  delay,
  staggerDelay = 0.15,
  className,
}: AnimatedGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delay: delay || 0,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={cn(
        `grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3`,
        className,
      )}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div key={index} variants={item} className="h-full">
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={item} className="grid">
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
