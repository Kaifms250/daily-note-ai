import { useState, useEffect } from "react";
import { format } from "date-fns";

export function DateTimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground hidden sm:inline">
        {format(currentTime, "EEE, MMM d")}
      </span>
      <span className="font-mono text-primary font-medium">
        {format(currentTime, "HH:mm:ss")}
      </span>
    </div>
  );
}
