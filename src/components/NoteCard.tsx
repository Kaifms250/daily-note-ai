import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Sparkles } from "lucide-react";
import type { Note } from "@/hooks/useNotes";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onSummarize: (note: Note) => void;
}

export function NoteCard({ note, onEdit, onDelete, onSummarize }: NoteCardProps) {
  return (
    <div className="card-elevated p-5 group animate-slide-up transition-all duration-200 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-display text-lg font-semibold text-foreground leading-tight line-clamp-2">
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
      
      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
        {note.content}
      </p>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
        <time dateTime={note.created_at}>
          {format(new Date(note.created_at), "MMM d, yyyy")}
        </time>
        {note.updated_at !== note.created_at && (
          <>
            <span>•</span>
            <span>Updated {format(new Date(note.updated_at), "MMM d 'at' h:mm a")}</span>
          </>
        )}
      </div>
    </div>
  );
}
