import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, X, Sparkles } from "lucide-react";
import type { Note } from "@/hooks/useNotes";

interface NoteFormProps {
  editingNote: Note | null;
  onSave: (title: string, content: string) => Promise<void>;
  onCancel: () => void;
  onAIImprove?: (content: string) => void;
}

export function NoteForm({ editingNote, onSave, onCancel, onAIImprove }: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [editingNote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);
    try {
      await onSave(title.trim(), content.trim());
      if (!editingNote) {
        setTitle("");
        setContent("");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = title.trim() && content.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-foreground">
          Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's on your mind today?"
          className="input-calm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="content" className="text-sm font-medium text-foreground">
            Content
          </label>
          {content.trim() && onAIImprove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onAIImprove(content)}
              className="text-primary hover:text-primary/80 hover:bg-accent"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Improve with AI
            </Button>
          )}
        </div>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your thoughts, plans, or activities..."
          className="input-calm min-h-[180px] resize-none"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={!isValid || isSaving}
          className="flex-1 btn-primary-gradient"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : editingNote ? "Update Note" : "Save Note"}
        </Button>
        {editingNote && (
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
