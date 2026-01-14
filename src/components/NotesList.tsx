import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";
import { NoteCard } from "./NoteCard";
import type { Note } from "@/hooks/useNotes";

interface NotesListProps {
  notes: Note[];
  isLoading: boolean;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onSummarize: (note: Note) => void;
}

export function NotesList({ notes, isLoading, onEdit, onDelete, onSummarize }: NotesListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    
    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            disabled
            placeholder="Search notes..."
            className="pl-10 input-calm"
          />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-elevated p-5 animate-pulse">
              <div className="h-5 bg-muted rounded w-3/4 mb-3" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
              <div className="h-3 bg-muted rounded w-1/4 mt-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className="pl-10 input-calm"
        />
      </div>

      {filteredNotes.length === 0 ? (
        <div className="card-elevated p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-display text-lg font-medium text-foreground mb-1">
            {searchQuery ? "No notes found" : "No notes yet"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search terms"
              : "Create your first note to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={onEdit}
              onDelete={onDelete}
              onSummarize={onSummarize}
            />
          ))}
        </div>
      )}

      {searchQuery && filteredNotes.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {filteredNotes.length} of {notes.length} notes
        </p>
      )}
    </div>
  );
}
