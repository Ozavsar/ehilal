"use client";
import Link from "next/link";
import { MENUS } from "@/config/constants/app-routes";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 flex w-full justify-around border-t bg-background sm:hidden"
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex w-full justify-around"
      >
        {MENUS.NAV.map(({ key, label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <motion.div
              key={key}
              variants={item}
              className="relative flex flex-1 items-center justify-center"
            >
              <Link
                href={href}
                className="relative flex w-full flex-col items-center gap-1 p-2 transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBg"
                    className="absolute inset-0 bg-primary/10"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="relative z-10"
                >
                  <Icon
                    className={cn(
                      "size-5",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                </motion.div>
                <span
                  className={cn(
                    "relative z-10 text-[10px] font-bold",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </Link>

              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0.5 h-1 w-8 rounded-full bg-primary"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
