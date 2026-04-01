import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CelebrationOverlayProps {
  trigger: boolean;
  message?: string;
}

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 0.3,
  color: ["hsl(var(--neon-green))", "hsl(var(--neon-blue))", "hsl(var(--neon-purple))", "hsl(var(--neon-orange))"][i % 4],
  size: 4 + Math.random() * 6,
}));

export function CelebrationOverlay({ trigger, message = "Quest Complete!" }: CelebrationOverlayProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
        >
          {/* Particles */}
          {PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, x: "50vw", y: "50vh", scale: 0 }}
              animate={{
                opacity: [1, 1, 0],
                x: `${p.x}vw`,
                y: `${20 + Math.random() * 60}vh`,
                scale: [0, 1.5, 0.5],
              }}
              transition={{ duration: 1.5, delay: p.delay, ease: "easeOut" }}
              className="absolute rounded-full"
              style={{ width: p.size, height: p.size, backgroundColor: p.color }}
            />
          ))}

          {/* Message */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: [0, 1.2, 1], rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="font-display text-2xl font-bold text-gradient-primary">{message}</p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-neon-green mt-1"
            >
              ⚡ +XP earned
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
