import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";

export function DateTimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span className="font-medium text-foreground">
        {format(currentTime, "EEEE, MMMM d, yyyy")}
      </span>
      <span className="text-primary font-mono">
        {format(currentTime, "h:mm:ss a")}
      </span>
    </div>
  );
}
