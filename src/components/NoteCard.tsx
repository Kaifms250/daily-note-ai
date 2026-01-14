import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2, Trash2, Sparkles } from "lucide-react";
import type { Note } from "@/hooks/useNotes";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onSummarize: (note: Note) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
}

export function NoteCard({ note, onEdit, onDelete, onSummarize, onToggleComplete }: NoteCardProps) {
  return (
    <div className={`card-elevated p-5 group animate-slide-up transition-all duration-200 hover:shadow-soft ${note.completed ? 'border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10' : ''}`}>
      <div className="flex items-start gap-3 mb-3">
        <Checkbox
          checked={note.completed}
          onCheckedChange={(checked) => onToggleComplete(note.id, checked as boolean)}
          className={`mt-1 h-5 w-5 shrink-0 ${note.completed ? 'border-emerald-500 bg-emerald-500 text-white data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500' : ''}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className={`font-display text-lg font-semibold leading-tight line-clamp-2 ${note.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
              {note.title}
            </h3>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-accent"
                onClick={() => onSummarize(note)}
                title="Summarize with AI"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                onClick={() => onEdit(note)}
                title="Edit note"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(note.id)}
                title="Delete note"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <p className={`text-sm leading-relaxed line-clamp-3 mb-4 ml-8 ${note.completed ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
        {note.content}
      </p>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground/70 ml-8">
        <time dateTime={note.created_at}>
          {format(new Date(note.created_at), "MMM d, yyyy")}
        </time>
        {note.updated_at !== note.created_at && (
          <>
            <span>•</span>
            <span>Updated {format(new Date(note.updated_at), "MMM d 'at' h:mm a")}</span>
          </>
        )}
        {note.completed && (
          <>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Completed ✓</span>
          </>
        )}
      </div>
    </div>
  );
}
