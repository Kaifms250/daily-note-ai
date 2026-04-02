import { motion } from "framer-motion";
import { Heart, Briefcase, Brain, Users } from "lucide-react";
import { type Task } from "@/hooks/useTasks";

const AREAS = [
  { key: "health", label: "Health", icon: Heart, color: "neon-green" },
  { key: "career", label: "Career", icon: Briefcase, color: "neon-blue" },
  { key: "mind", label: "Mind", icon: Brain, color: "neon-purple" },
  { key: "social", label: "Social", icon: Users, color: "neon-pink" },
];

// Simple keyword-based category mapping
function categorizeTask(title: string): string {
  const t = title.toLowerCase();
  if (/workout|gym|run|health|walk|sleep|meditat|yoga|stretch|water|eat/i.test(t)) return "health";
  if (/work|meet|email|project|code|design|client|deadline|report/i.test(t)) return "career";
  if (/read|learn|study|course|think|journal|plan|reflect|write/i.test(t)) return "mind";
  if (/call|friend|family|social|lunch|dinner|date|party|hang/i.test(t)) return "social";
  return "career"; // default
}

interface LifeAreasProps {
  tasks: Task[];
}

export function LifeAreas({ tasks }: LifeAreasProps) {
  const todayTasks = tasks.filter((t) => {
    if (!t.scheduled_time) return false;
    return new Date(t.scheduled_time).toDateString() === new Date().toDateString();
  });

  const areaCounts = AREAS.map((area) => {
    const areaTasks = todayTasks.filter((t) => categorizeTask(t.title) === area.key);
    const completed = areaTasks.filter((t) => t.completed).length;
    return { ...area, total: areaTasks.length, completed };
  });

  return (
    <div className="glass-card p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-display mb-3">Life Areas</p>
      <div className="grid grid-cols-2 gap-2">
        {areaCounts.map((area, i) => {
          const Icon = area.icon;
          const pct = area.total > 0 ? Math.round((area.completed / area.total) * 100) : 0;
          return (
            <motion.div
              key={area.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-secondary/50 rounded-lg p-3 flex items-center gap-2.5"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${area.color}/15`}>
                <Icon className={`h-4 w-4 text-${area.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground">{area.label}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                      className={`h-full rounded-full bg-${area.color}`}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{area.completed}/{area.total}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
