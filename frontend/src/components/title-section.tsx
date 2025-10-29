"use client";

import { motion, AnimatePresence } from "framer-motion";

interface TitleSectionProps {
  text: string;
  backgroundText: string;
}

export default function TitleSection({
  text,
  backgroundText,
}: TitleSectionProps) {
  const words = text.trim().split(" ");
  const lastWord = words.pop() || "";
  const plainWord = words.join(" ");

  return (
    <section>
      {/* Desktop */}
      <div className="relative flex flex-col items-center justify-center overflow-visible py-[70px] max-sm:hidden">
        {/* Background text animation */}
        <motion.span
          initial={{ opacity: 0, scale: 1.2, y: 40 }}
          animate={{ opacity: 0.25, scale: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -z-10 -translate-y-[50%] text-[110px] font-extrabold uppercase tracking-[5px] text-muted-foreground/25 dark:text-card"
        >
          {backgroundText}
        </motion.span>

        {/* Foreground title animation */}
        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
          className="text-[56px] font-black uppercase"
        >
          {plainWord}{" "}
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={plainWord ? "inline-block text-primary" : ""}
          >
            {lastWord}
          </motion.span>
        </motion.h2>
      </div>

      {/* Mobile */}
      <AnimatePresence mode="wait">
        <motion.div className="fixed left-0 top-0 z-20 w-full bg-muted py-4 pl-6 shadow-lg sm:hidden">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.85, filter: "blur(10px)" }}
            transition={{
              duration: 0.7,
              ease: [0.25, 1, 0.5, 1],
            }}
            className="text-2xl font-black uppercase"
          >
            {plainWord}{" "}
            <span className={plainWord ? "text-primary" : ""}>{lastWord}</span>
          </motion.h2>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
