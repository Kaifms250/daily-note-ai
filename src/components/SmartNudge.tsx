import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb } from "lucide-react";
import { type Task } from "@/hooks/useTasks";

interface SmartNudgeProps {
  tasks: Task[];
}

const NUDGES = [
  { condition: (tasks: Task[]) => tasks.filter(t => !t.completed && t.priority === "high").length >= 3, message: "You have 3+ high-priority quests. Focus on one at a time for better flow." },
  { condition: (tasks: Task[]) => { const hour = new Date().getHours(); const upcoming = tasks.filter(t => !t.completed && t.scheduled_time && new Date(t.scheduled_time).getHours() === hour + 1); return upcoming.length > 0; }, message: "A quest starts in the next hour. Time to prepare!" },
  { condition: (tasks: Task[]) => { const completed = tasks.filter(t => t.completed).length; return completed >= 3; }, message: "Great momentum! You've completed 3+ quests today. Keep the streak alive!" },
  { condition: (tasks: Task[]) => tasks.filter(t => !t.completed).length === 0 && tasks.length > 0, message: "All quests completed! You're a legend today. 🎉" },
  { condition: () => new Date().getHours() >= 14 && new Date().getHours() <= 15, message: "Afternoon energy dip? Try a quick 5-minute walk before your next quest." },
];

export function SmartNudge({ tasks }: SmartNudgeProps) {
  const [visible, setVisible] = useState(false);
  const [nudgeMsg, setNudgeMsg] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const activeNudge = NUDGES.find((n) => n.condition(tasks));
      if (activeNudge) {
        setNudgeMsg(activeNudge.message);
        setVisible(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [tasks]);

  useEffect(() => {
    if (visible) {
      const hide = setTimeout(() => setVisible(false), 8000);
      return () => clearTimeout(hide);
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-6 z-40 max-w-xs glass-card p-4 border-neon-purple/20 neon-glow-purple"
        >
          <button onClick={() => setVisible(false)} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-neon-purple/20 flex items-center justify-center shrink-0">
              <Lightbulb className="h-4 w-4 text-neon-purple" />
            </div>
            <p className="text-xs text-foreground leading-relaxed pr-4">{nudgeMsg}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
