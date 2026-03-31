import { motion, AnimatePresence } from "framer-motion";
import { Zap, Flame, Trophy } from "lucide-react";
import { type GameProgress, getLevelTitle, getXpForNextLevel } from "@/hooks/useGameProgress";

interface XPBarProps {
  progress: GameProgress | null;
  xpAnimation: { amount: number; show: boolean };
}

export function XPBar({ progress, xpAnimation }: XPBarProps) {
  if (!progress) return null;

  const xpNeeded = getXpForNextLevel(progress.level);
  const xpPercent = Math.min((progress.xp / xpNeeded) * 100, 100);
  const title = getLevelTitle(progress.level);

  return (
    <div className="glass-card p-4 relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--neon-blue)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--neon-blue)) 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }} />

      <div className="relative flex items-center gap-4">
        {/* Level badge */}
        <motion.div
          className="shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center neon-glow-blue"
          style={{ background: 'var(--gradient-primary)' }}
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-xs font-sans font-medium text-primary-foreground/80">LVL</span>
          <span className="text-lg font-display font-bold text-primary-foreground leading-none">{progress.level}</span>
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-semibold text-foreground tracking-wider">
                {title}
              </h3>
              <Trophy className="h-3.5 w-3.5 text-neon-purple" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {progress.xp}/{xpNeeded} XP
            </span>
          </div>

          {/* XP Progress bar */}
          <div className="xp-bar h-3 relative">
            <motion.div
              className="xp-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-neon-orange" />
              <span className="text-xs font-medium text-foreground">{progress.current_streak}</span>
              <span className="text-xs text-muted-foreground">streak</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-neon-green" />
              <span className="text-xs font-medium text-foreground">{progress.tasks_completed_today}</span>
              <span className="text-xs text-muted-foreground">today</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-xs text-muted-foreground">Total:</span>
              <span className="text-xs font-mono font-medium text-primary">{progress.total_tasks_completed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* XP gain animation */}
      <AnimatePresence>
        {xpAnimation.show && (
          <motion.div
            className="absolute top-2 right-4 text-neon-green font-display font-bold text-lg"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          >
            +{xpAnimation.amount} XP
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
