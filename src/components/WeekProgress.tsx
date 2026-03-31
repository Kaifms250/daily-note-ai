import { CalendarDays } from "lucide-react";
import { endOfWeek, endOfMonth, differenceInDays, startOfDay } from "date-fns";

export function WeekProgress() {
  const today = startOfDay(new Date());
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const monthEnd = endOfMonth(today);
  const daysLeftWeek = differenceInDays(weekEnd, today);
  const daysLeftMonth = differenceInDays(monthEnd, today);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="h-4 w-4 text-primary" />
        <h3 className="font-display text-xs font-semibold tracking-wider text-foreground uppercase">Time Left</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <div className="text-xl font-display font-bold neon-text-blue">{daysLeftWeek}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">days in week</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <div className="text-xl font-display font-bold neon-text-purple">{daysLeftMonth}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">days in month</div>
        </div>
      </div>
    </div>
  );
}
