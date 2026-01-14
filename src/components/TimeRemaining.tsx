import { Calendar, CalendarDays } from "lucide-react";
import {
  endOfWeek,
  endOfMonth,
  differenceInDays,
  startOfDay,
} from "date-fns";

export function TimeRemaining() {
  const today = startOfDay(new Date());
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Week starts on Monday
  const monthEnd = endOfMonth(today);

  const daysLeftInWeek = differenceInDays(weekEnd, today);
  const daysLeftInMonth = differenceInDays(monthEnd, today);

  return (
    <div className="card-elevated p-4">
      <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-primary" />
        Time Remaining
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-primary">{daysLeftInWeek}</div>
          <div className="text-xs text-muted-foreground">days left in week</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-accent-foreground">{daysLeftInMonth}</div>
          <div className="text-xs text-muted-foreground">days left in month</div>
        </div>
      </div>
    </div>
  );
}
