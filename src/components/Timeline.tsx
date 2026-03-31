import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { format, isWithinInterval, addMinutes, isBefore, isAfter, startOfDay, endOfDay } from "date-fns";
import { type Task } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";

interface TimelineProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (hour: number) => void;
  onCompleteTask: (taskId: string) => void;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

export function Timeline({ tasks, onTaskClick, onAddTask, onCompleteTask }: TimelineProps) {
  const now = new Date();
  const currentHour = now.getHours();

  const tasksByHour = useMemo(() => {
    const map: Record<number, Task[]> = {};
    HOURS.forEach((h) => { map[h] = []; });

    tasks.forEach((task) => {
      if (task.scheduled_time) {
        const taskDate = new Date(task.scheduled_time);
        const today = new Date();
        if (taskDate.toDateString() === today.toDateString()) {
          const hour = taskDate.getHours();
          if (map[hour]) {
            map[hour].push(task);
          }
        }
      }
    });
    return map;
  }, [tasks]);

  const getTaskStatus = (task: Task) => {
    if (task.completed) return "completed";
    if (task.scheduled_time) {
      const endTime = addMinutes(new Date(task.scheduled_time), task.duration_minutes);
      if (isBefore(endTime, now)) return "missed";
      const startTime = new Date(task.scheduled_time);
      if (isWithinInterval(now, { start: startTime, end: endTime })) return "current";
    }
    return "upcoming";
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-semibold tracking-wider text-foreground uppercase">
          Today's Timeline
        </h3>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[52px] top-0 bottom-0 w-px bg-border" />

        {HOURS.map((hour, index) => {
          const isCurrent = hour === currentHour;
          const hourTasks = tasksByHour[hour] || [];
          const isPast = hour < currentHour;

          return (
            <motion.div
              key={hour}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`flex gap-3 py-1.5 group relative ${isCurrent ? "z-10" : ""}`}
            >
              {/* Time label */}
              <div className={`w-12 text-right text-xs font-mono shrink-0 pt-1 ${
                isCurrent ? "text-primary font-bold" : isPast ? "text-muted-foreground/50" : "text-muted-foreground"
              }`}>
                {format(new Date().setHours(hour, 0), "h a")}
              </div>

              {/* Dot */}
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 z-10 ${
                isCurrent ? "bg-primary animate-pulse-glow ring-4 ring-primary/20" :
                isPast ? "bg-muted-foreground/30" : "bg-muted"
              }`} />

              {/* Tasks or empty slot */}
              <div className="flex-1 min-w-0">
                {hourTasks.length > 0 ? (
                  <div className="space-y-1.5">
                    {hourTasks.map((task) => {
                      const status = getTaskStatus(task);
                      return (
                        <motion.div
                          key={task.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => onTaskClick(task)}
                          className={`glass-card-hover px-3 py-2 cursor-pointer flex items-center gap-2 ${
                            status === "completed" ? "task-completed-glow" :
                            status === "missed" ? "task-missed-fade" :
                            status === "current" ? "task-current" : ""
                          }`}
                        >
                          {status === "completed" ? (
                            <CheckCircle2 className="h-4 w-4 text-neon-green shrink-0" />
                          ) : status === "missed" ? (
                            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); onCompleteTask(task.id); }}
                              className="h-4 w-4 rounded-full border-2 border-muted-foreground/40 hover:border-primary shrink-0 transition-colors"
                            />
                          )}

                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-medium truncate ${
                              status === "completed" ? "line-through text-muted-foreground" : "text-foreground"
                            }`}>
                              {task.title}
                            </p>
                          </div>

                          <span className={`text-[10px] font-mono shrink-0 ${
                            status === "completed" ? "text-neon-green" :
                            status === "missed" ? "text-destructive" :
                            "text-muted-foreground"
                          }`}>
                            {task.duration_minutes}m
                          </span>

                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            task.priority === "high" ? "bg-destructive/20 text-destructive" :
                            task.priority === "low" ? "bg-neon-green/10 text-neon-green" :
                            "bg-primary/10 text-primary"
                          }`}>
                            {task.priority === "high" ? "!" : task.priority === "low" ? "○" : "●"}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    onClick={() => onAddTask(hour)}
                    className="h-8 flex items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-muted-foreground/50 hover:text-primary transition-colors">
                      <Plus className="h-3 w-3" />
                      <span className="text-xs">Add task</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Current time indicator */}
        {currentHour >= 6 && currentHour <= 21 && (
          <div
            className="absolute left-[52px] right-0 h-px bg-primary/60 z-20 pointer-events-none"
            style={{
              top: `${((currentHour - 6 + now.getMinutes() / 60) / 16) * 100}%`,
            }}
          >
            <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
