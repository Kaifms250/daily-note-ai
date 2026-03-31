import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Clock, Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, description: string, scheduledTime?: string, durationMinutes?: number, priority?: string) => void;
  defaultHour?: number;
}

export function AddTaskDialog({ isOpen, onClose, onAdd, defaultHour }: AddTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState("medium");
  const [time, setTime] = useState(() => {
    const h = defaultHour ?? new Date().getHours();
    return `${h.toString().padStart(2, "0")}:00`;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const today = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    today.setHours(hours, minutes, 0, 0);

    onAdd(title.trim(), description.trim(), today.toISOString(), duration, priority);
    setTitle("");
    setDescription("");
    setDuration(30);
    setPriority("medium");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] glass-card border-primary/20 bg-card [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="font-display text-lg tracking-wider text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            New Quest
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="input-dark"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              className="input-dark min-h-[80px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Time
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input-dark"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Duration</label>
              <div className="flex gap-1">
                {[15, 30, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-2 text-xs rounded-md font-mono transition-all ${
                      duration === d
                        ? "bg-primary text-primary-foreground neon-glow-blue"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Flag className="h-3 w-3" /> Priority
            </label>
            <div className="flex gap-2">
              {[
                { value: "low", label: "Low", color: "neon-green" },
                { value: "medium", label: "Medium", color: "primary" },
                { value: "high", label: "High", color: "destructive" },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 py-2 text-xs rounded-md font-medium transition-all ${
                    priority === p.value
                      ? p.value === "high"
                        ? "bg-destructive text-destructive-foreground"
                        : p.value === "low"
                        ? "bg-neon-green/20 text-neon-green border border-neon-green/30"
                        : "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={!title.trim()} className="flex-1 btn-neon">
              <Zap className="h-4 w-4 mr-1" />
              Create Quest
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="border-border">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
