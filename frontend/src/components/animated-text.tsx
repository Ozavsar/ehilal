"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const characterVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.05,
    },
  },
};

interface AnimatedTextProps {
  text: string | string[];
  className?: string;
  props?: any;
}

export default function AnimatedText({
  text,
  className,
  ...props
}: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { amount: 0.5, once: true });
  const textArray = Array.isArray(text) ? text : [text];

  return (
    <motion.p
      ref={ref}
      className={`flex flex-wrap ${className}`}
      {...props}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ staggerChildren: 0.03, delayChildren: 0.3 }}
      aria-hidden
    >
      {textArray.map((line, index) => (
        <span key={index} className="block">
          {line.split(" ").map((word, index) => (
            <span key={index} className="inline-block">
              {word.split("").map((char, i) => (
                <motion.span
                  key={char + i}
                  variants={characterVariants}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
              <span className="inline-block">&nbsp;</span>
            </span>
          ))}
        </span>
      ))}
    </motion.p>
  );
}
