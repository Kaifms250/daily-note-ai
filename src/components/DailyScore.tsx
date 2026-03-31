import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { type Task } from "@/hooks/useTasks";

interface DailyScoreProps {
  tasks: Task[];
}

export function DailyScore({ tasks }: DailyScoreProps) {
  const today = new Date().toDateString();
  const todayTasks = tasks.filter(
    (t) => t.scheduled_time && new Date(t.scheduled_time).toDateString() === today
  );
  const completed = todayTasks.filter((t) => t.completed).length;
  const total = todayTasks.length;
  const score = total > 0 ? Math.round((completed / total) * 100) : 0;

  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card p-4 flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="4"
          />
          <motion.circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="scoreGradient">
              <stop offset="0%" stopColor="hsl(var(--neon-blue))" />
              <stop offset="100%" stopColor="hsl(var(--neon-purple))" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-display font-bold text-foreground">{score}%</span>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <Target className="h-3.5 w-3.5 text-primary" />
          <h3 className="font-display text-xs font-semibold tracking-wider text-foreground uppercase">Daily Score</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          {completed}/{total} quests completed
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {total === 0 ? "Add quests to start" : score === 100 ? "🎯 Perfect day!" : score >= 70 ? "🔥 Great progress!" : "Keep pushing!"}
        </p>
      </div>
    </div>
  );
}
