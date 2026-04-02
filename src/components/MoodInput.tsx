import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MOODS = [
  { emoji: "🔥", label: "On Fire", value: "fire" },
  { emoji: "😊", label: "Good", value: "good" },
  { emoji: "😐", label: "Neutral", value: "neutral" },
  { emoji: "😴", label: "Low", value: "low" },
  { emoji: "😤", label: "Stressed", value: "stressed" },
];

interface MoodInputProps {
  onMoodSelect?: (mood: string) => void;
}

export function MoodInput({ onMoodSelect }: MoodInputProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelected(value);
    onMoodSelect?.(value);
  };

  return (
    <div className="glass-card p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-display mb-3">
        How are you feeling?
      </p>
      <div className="flex gap-2 justify-between">
        {MOODS.map((mood) => (
          <motion.button
            key={mood.value}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSelect(mood.value)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              selected === mood.value
                ? "bg-primary/15 ring-1 ring-primary/30"
                : "hover:bg-secondary"
            }`}
          >
            <span className="text-xl">{mood.emoji}</span>
            <span className={`text-[10px] ${
              selected === mood.value ? "text-primary" : "text-muted-foreground"
            }`}>
              {mood.label}
            </span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {selected && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-muted-foreground mt-2 text-center"
          >
            {selected === "fire" && "Let's crush it today! 🚀"}
            {selected === "good" && "Great energy — keep it up!"}
            {selected === "neutral" && "Start small, build momentum."}
            {selected === "low" && "Take it easy. One task at a time."}
            {selected === "stressed" && "Focus on what matters most."}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
