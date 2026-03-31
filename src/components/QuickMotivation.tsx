import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

const quotes = [
  { text: "The grind never stops. Neither should you.", author: "Unknown" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Level up or get left behind.", author: "Unknown" },
  { text: "You don't rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Execute. No excuses.", author: "Unknown" },
  { text: "Small daily improvements lead to staggering long-term results.", author: "Unknown" },
  { text: "Your future self is watching you right now through memories.", author: "Unknown" },
  { text: "Don't count the days. Make the days count.", author: "Muhammad Ali" },
];

export function QuickMotivation() {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <div className="glass-card p-4 border-neon-purple/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-neon-purple/5 rounded-full blur-2xl" />
      <div className="relative flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-neon-purple shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-foreground italic leading-relaxed">"{quote.text}"</p>
          <p className="text-xs text-muted-foreground mt-1.5">— {quote.author}</p>
        </div>
      </div>
    </div>
  );
}
