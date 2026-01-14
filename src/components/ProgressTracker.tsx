import { CheckCircle2, Circle } from "lucide-react";
import type { Note } from "@/hooks/useNotes";

interface ProgressTrackerProps {
  notes: Note[];
}

export function ProgressTracker({ notes }: ProgressTrackerProps) {
  const completedCount = notes.filter((n) => n.completed).length;
  const totalCount = notes.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Generate calendar-like grid for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  // Group notes by date and check if any are completed
  const getDateStatus = (date: Date) => {
    const dateStr = date.toDateString();
    const dayNotes = notes.filter(
      (n) => new Date(n.created_at).toDateString() === dateStr
    );
    if (dayNotes.length === 0) return "empty";
    const hasCompleted = dayNotes.some((n) => n.completed);
    return hasCompleted ? "completed" : "pending";
  };

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="card-elevated p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Task Progress</h3>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{totalCount} completed
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Calendar-like view */}
      <div className="grid grid-cols-7 gap-1">
        {last7Days.map((date, index) => {
          const status = getDateStatus(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div key={index} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">
                {dayNames[date.getDay()]}
              </span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors
                  ${status === "completed" 
                    ? "bg-emerald-500 text-white" 
                    : status === "pending"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-muted text-muted-foreground"
                  }
                  ${isToday ? "ring-2 ring-primary ring-offset-1" : ""}
                `}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-900/30" />
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
}
