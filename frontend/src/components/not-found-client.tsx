"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/constants/app-routes";

interface NotFoundClientProps {
  imageUrl: string | undefined;
}

export function NotFoundClient({ imageUrl }: NotFoundClientProps) {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);
  const [stars, setStars] = useState<
    { x: number; y: number; size: number; opacity: number }[]
  >([]);
  const [planets, setPlanets] = useState<
    { x: number; y: number; size: number; color: string; speed: number }[]
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageControls = useAnimation();
  const [showTrail, setShowTrail] = useState(false);

  // Generate stars for the space background
  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;

      // Generate stars
      const newStars = Array.from({ length: 100 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.7 + 0.3,
      }));
      setStars(newStars);

      // Generate planets
      const newPlanets = Array.from({ length: 3 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 30 + 20,
        color: ["#0D0E52", "#4C1D95", "#8E44AD", "#00BFFF", "#FFD700"][
          Math.floor(Math.random() * 5)
        ],

        speed: Math.random() * 0.5 + 0.2,
      }));
      setPlanets(newPlanets);
    }
  }, []);

  const handleImageClick = () => {
    setClickCount((prev) => prev + 1);

    // Make the image "fly" in a random direction when clicked
    imageControls
      .start({
        x: Math.random() * 40 - 20,
        y: Math.random() * 40 - 20,
        transition: { type: "spring", stiffness: 300, damping: 10 },
      })
      .then(() => {
        imageControls.start({
          x: 0,
          y: 0,
          transition: { type: "spring", stiffness: 100, damping: 10 },
        });
      });

    // Show rocket trail effect
    setShowTrail(true);
    setTimeout(() => setShowTrail(false), 1000);
  };

  const getImageMessage = () => {
    if (clickCount === 0) return "";
    if (clickCount === 1) return <p>Houston, we have a problem...</p>;
    if (clickCount === 2)
      return <p>This page seems to have drifted into deep space!</p>;
    if (clickCount === 3)
      return <p>Our rocket is searching, but can&apos;t find it anywhere.</p>;
    if (clickCount === 4) return <p>Maybe it got sucked into a black hole?</p>;
    return (
      <p>
        Initiating emergency return protocol. Prepare for lightspeed jump to
        home!
      </p>
    );
  };

  if (clickCount > 5) {
    router.push(ROUTES.INTERNAL.HOME);
  }

  // Glitch effect variants
  const glitchVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
      },
    },
    hover: {
      scale: 1.1,
      textShadow: [
        "0 0 5px #FF9D00, 0 0 10px #FF9D00, 0 0 15px #FF9D00",
        "0 0 5px #A7F0FF, 0 0 10px #A7F0FF, 0 0 15px #A7F0FF",
        "0 0 5px #FFD6A5, 0 0 10px #FFD6A5, 0 0 15px #FFD6A5",
      ],
      transition: {
        textShadow: {
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          duration: 0.5,
        },
      },
    },
  };

  const characters = Array.from("404");

  return (
    <main
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0A0E17] px-4 py-16 text-white max-sm:-my-20 md:py-4"
    >
      {/* Space background with stars */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            }}
            animate={{
              opacity: [star.opacity, star.opacity * 1.5, star.opacity],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: Math.random() * 3 + 2,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Floating planets */}
        {planets.map((planet, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: planet.x,
              top: planet.y,
              width: planet.size,
              height: planet.size,
              background: `radial-gradient(circle at 30% 30%, ${planet.color}, rgba(10, 14, 23, 0.8))`,
              boxShadow: `0 0 20px ${planet.color}50`,
            }}
            animate={{
              x: [0, 30 * planet.speed, 0, -30 * planet.speed, 0],
              y: [0, 20 * planet.speed, 0, -20 * planet.speed, 0],
              rotate: [0, 360],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 20 / planet.speed,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Rocket trail effect */}
      <AnimatePresence>
        {showTrail && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute"
            style={{
              zIndex: 10,
            }}
          >
            <div className="relative">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-orange-500"
                  initial={{
                    x: 0,
                    y: 0,
                    scale: 1,
                    opacity: 0.8,
                  }}
                  animate={{
                    x: Math.random() * 100 - 50,
                    y: Math.random() * 100 - 50,
                    scale: 0,
                    opacity: 0,
                  }}
                  transition={{ duration: 1 }}
                  style={{
                    width: Math.random() * 10 + 5,
                    height: Math.random() * 10 + 5,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center text-center">
        <motion.div
          className="mb-10 flex overflow-visible text-6xl font-bold tracking-tighter sm:text-9xl"
          initial="hidden"
          animate="visible"
          whileHover="hover"
          variants={glitchVariants}
        >
          {characters.map((char, index) => (
            <motion.span
              key={index}
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{
                type: "spring",
                damping: 12,
                stiffness: 200,
                delay: index * 0.1,
              }}
              className={cn(
                "inline-block",
                index === 1 ? "text-primary" : "text-white",
              )}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>

        {/* Astronaut image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="relative mt-8 sm:size-64 size-52 cursor-pointer sm:h-80 sm:w-80"
          onClick={handleImageClick}
        >
          <motion.div
            animate={imageControls}
            className="relative h-full w-full"
          >
            {/* Space helmet effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/50 via-primary/25 to-primary/50 opacity-70 blur-xl"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.7, 0.9, 0.7],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 3,
                ease: "easeInOut",
              }}
            />

            <div className="absolute inset-0 overflow-hidden rounded-full border-2 border-muted bg-primary backdrop-blur-sm">
              {/* Helmet visor reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-transparent to-transparent" />

              {/* Your image */}
              {imageUrl ? (
                <div className="relative h-full w-full">
                  <Image
                    src={imageUrl || "/placeholder.svg"}
                    alt="Astronaut lost in space"
                    fill
                    sizes="(max-width: 768px) 256px, 320px"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-lg text-gray-400">
                    Astronaut missing
                  </span>
                </div>
              )}
            </div>

            {/* Floating elements around the astronaut */}
            <motion.div
              className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-yellow-300"
              animate={{
                x: [0, 10, 0, -10, 0],
                y: [0, -10, 0, 10, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 15,
                ease: "linear",
              }}
              style={{
                boxShadow: "0 0 20px rgba(253, 224, 71, 0.7)",
              }}
            />

            <motion.div
              className="absolute -bottom-2 left-10 h-4 w-4 rounded-full bg-blue-400"
              animate={{
                x: [0, -15, 0, 15, 0],
                y: [0, 10, 0, -10, 0],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 10,
                ease: "linear",
              }}
              style={{
                boxShadow: "0 0 15px rgba(96, 165, 250, 0.7)",
              }}
            />
          </motion.div>

          <AnimatePresence>
            {getImageMessage() && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -top-16 left-0 right-0 rounded-lg bg-primary/80 p-3 text-sm font-medium backdrop-blur-sm"
              >
                <div className="relative">
                  {/* Radio transmission waves */}
                  <motion.div
                    className="absolute -left-6 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary"
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 1.5, 0.5],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 1.5,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute -left-10 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary"
                    animate={{
                      opacity: [0, 0.7, 0],
                      scale: [0.5, 2, 0.5],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 1.5,
                      ease: "easeInOut",
                      delay: 0.2,
                    }}
                  />
                  {getImageMessage()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-4 text-2xl font-semibold tracking-tight sm:mt-6"
        >
          Lost in Space
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-2 sm:mt-4 max-sm:text-xs max-md:text-sm text-gray-400"
        >
          <p>
            The page you&apos;re looking for has drifted beyond our radar.
            <br />
            <span className="text-sm italic">
              (Our rocket has searched the entire galaxy, but found nothing.)
            </span>
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-4 sm:mt-8"
        >
          <Button
            asChild
            variant="outline"
            className="border-primary/75 bg-transparent text-primary hover:bg-primary/20 hover:text-white"
          >
            <Link href="/">
              <motion.span
                animate={{
                  textShadow: [
                    "0 0 3px rgba(255, 157, 0, 0.5)",
                    "0 0 6px rgba(255, 157, 0, 0.8)",
                    "0 0 3px rgba(255, 157, 0, 0.5)",
                  ],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 2,
                }}
              >
                Return to Mission Control
              </motion.span>
            </Link>
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
