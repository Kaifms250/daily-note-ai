import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Zap, CheckCircle2, Trash2, Edit2, Save } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type Task } from "@/hooks/useTasks";

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Task, "title" | "description" | "priority">>) => void;
}

export function TaskDetailPanel({ task, onClose, onComplete, onDelete, onUpdate }: TaskDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const startEdit = () => {
    if (!task) return;
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!task) return;
    onUpdate(task.id, { title: editTitle, description: editDescription });
    setIsEditing(false);
  };

  return (
    <AnimatePresence>
      {task && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card p-5 border border-primary/20 neon-glow-blue"
        >
          <div className="flex items-start justify-between mb-4">
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="input-dark font-display text-sm"
              />
            ) : (
              <h3 className={`font-display text-base font-semibold ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {task.title}
              </h3>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isEditing ? (
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="input-dark mb-4 min-h-[80px]"
              placeholder="Task description..."
            />
          ) : (
            task.description && (
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {task.description}
              </p>
            )
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-muted-foreground">
            {task.scheduled_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{format(new Date(task.scheduled_time), "h:mm a")}</span>
                <span>· {task.duration_minutes}m</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-neon-green" />
              <span className="text-neon-green">+{task.xp_reward} XP</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={saveEdit} size="sm" className="btn-neon flex-1">
                  <Save className="h-3.5 w-3.5 mr-1" /> Save
                </Button>
                <Button onClick={() => setIsEditing(false)} size="sm" variant="outline" className="border-border">
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {!task.completed && (
                  <Button
                    onClick={() => onComplete(task.id)}
                    size="sm"
                    className="flex-1"
                    style={{ background: 'var(--gradient-success)' }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Complete
                  </Button>
                )}
                <Button onClick={startEdit} size="sm" variant="outline" className="border-border">
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  onClick={() => onDelete(task.id)}
                  size="sm"
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
