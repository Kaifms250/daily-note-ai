import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Calendar, Scissors, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { type Task } from "@/hooks/useTasks";

interface SmartRescheduleModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (taskId: string) => void;
  onBreakDown: (taskId: string) => void;
  onRemove: (taskId: string) => void;
}

export function SmartRescheduleModal({
  task, isOpen, onClose, onReschedule, onBreakDown, onRemove,
}: SmartRescheduleModalProps) {
  const [confirming, setConfirming] = useState<string | null>(null);

  if (!task) return null;

  const handleAction = (action: string) => {
    if (confirming === action) {
      if (action === "reschedule") onReschedule(task.id);
      if (action === "break") onBreakDown(task.id);
      if (action === "remove") onRemove(task.id);
      setConfirming(null);
      onClose();
    } else {
      setConfirming(action);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); setConfirming(null); } }}>
      <DialogContent className="sm:max-w-[400px] glass-card border-neon-orange/20 bg-card [&>button]:hidden p-0 overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-orange/15 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-neon-orange" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground">Missed Quest</h3>
                <p className="text-xs text-muted-foreground">This keeps coming back</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Task info */}
        <div className="px-5 pb-4">
          <div className="glass-card p-3 border-border">
            <p className="text-sm font-medium text-foreground">{task.title}</p>
            {task.description && <p className="text-xs text-muted-foreground mt-1">{task.description}</p>}
          </div>

          <p className="text-sm text-muted-foreground mt-4 mb-4">
            Still important to you? What should we do?
          </p>

          {/* Options */}
          <div className="space-y-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleAction("reschedule")}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                confirming === "reschedule"
                  ? "bg-primary/15 border border-primary/30"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {confirming === "reschedule" ? "Tap again to confirm" : "Reschedule for tomorrow"}
                </p>
                <p className="text-xs text-muted-foreground">Move to the same time slot</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleAction("break")}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                confirming === "break"
                  ? "bg-neon-purple/15 border border-neon-purple/30"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              <Scissors className="h-4 w-4 text-neon-purple shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {confirming === "break" ? "Tap again to confirm" : "Break into smaller tasks"}
                </p>
                <p className="text-xs text-muted-foreground">Split into 2-3 mini quests</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleAction("remove")}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                confirming === "remove"
                  ? "bg-destructive/15 border border-destructive/30"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              <Trash2 className="h-4 w-4 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {confirming === "remove" ? "Tap again to remove" : "Remove it"}
                </p>
                <p className="text-xs text-muted-foreground">It's no longer relevant</p>
              </div>
            </motion.button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
