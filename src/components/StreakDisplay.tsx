import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { type GameProgress } from "@/hooks/useGameProgress";

interface StreakDisplayProps {
  progress: GameProgress | null;
}

export function StreakDisplay({ progress }: StreakDisplayProps) {
  if (!progress) return null;

  const streak = progress.current_streak;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3">
        <motion.div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: streak > 0 ? 'linear-gradient(135deg, hsl(30 95% 55%), hsl(0 85% 55%))' : 'hsl(var(--muted))' }}
          animate={streak > 0 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Flame className={`h-6 w-6 ${streak > 0 ? "text-white" : "text-muted-foreground"}`} />
        </motion.div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-display font-bold text-foreground">{streak}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">day streak</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Best: {progress.longest_streak} days
          </p>
        </div>
      </div>
    </div>
  );
}
