import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, RotateCcw, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Task } from "@/hooks/useTasks";

interface FocusModeProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onComplete: (taskId: string) => void;
}

export function FocusMode({ isOpen, onClose, task, onComplete }: FocusModeProps) {
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 min default
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(5);

  const totalTime = selectedDuration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
      setTimeLeft(selectedDuration * 60);
    }
  }, [isOpen, selectedDuration]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (task) onComplete(task.id);
    }
  }, [timeLeft, isRunning, task, onComplete]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
  }, [selectedDuration]);

  const setDuration = (mins: number) => {
    setSelectedDuration(mins);
    setTimeLeft(mins * 60);
    setIsRunning(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center"
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ scale: isRunning ? [1, 1.2, 1] : 1, opacity: isRunning ? [0.05, 0.1, 0.05] : 0.03 }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary blur-[150px]"
            />
          </div>

          {/* Close */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-6 right-6 text-muted-foreground hover:text-foreground z-10"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full px-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-xs uppercase tracking-[0.2em] text-primary font-display font-semibold">
                  Focus Mission
                </span>
              </div>
              <h2 className="text-xl font-display font-bold text-foreground">
                {task?.title || "Quick Focus Session"}
              </h2>
              {task?.description && (
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              )}
            </motion.div>

            {/* Circular Timer */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <svg width="260" height="260" className="transform -rotate-90">
                <circle cx="130" cy="130" r="120" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                <motion.circle
                  cx="130" cy="130" r="120" fill="none"
                  stroke="url(#focusGradient)" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ filter: "drop-shadow(0 0 8px hsl(var(--neon-blue) / 0.5))" }}
                />
                <defs>
                  <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(210, 100%, 60%)" />
                    <stop offset="100%" stopColor="hsl(270, 80%, 65%)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-display font-bold text-foreground tabular-nums">
                  {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
                </span>
                <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                  {isRunning ? "In progress" : timeLeft === 0 ? "Complete!" : "Ready"}
                </span>
              </div>
            </motion.div>

            {/* Duration presets */}
            {!isRunning && timeLeft === selectedDuration * 60 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                {[5, 15, 25, 45].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                      selectedDuration === d
                        ? "bg-primary text-primary-foreground neon-glow-blue"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d}m
                  </button>
                ))}
              </motion.div>
            )}

            {/* Controls */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex gap-3"
            >
              {timeLeft === 0 ? (
                <Button onClick={onClose} className="btn-neon px-8 py-3 text-base">
                  <Zap className="h-5 w-5 mr-2" /> Mission Complete
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => setIsRunning(!isRunning)}
                    className="btn-neon px-8 py-3 text-base"
                  >
                    {isRunning ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                    {isRunning ? "Pause" : "Start Mission"}
                  </Button>
                  <Button variant="outline" size="icon" onClick={resetTimer} className="border-border h-12 w-12">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
