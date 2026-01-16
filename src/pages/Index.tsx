import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, LogOut, Loader2 } from "lucide-react";
import { NoteForm } from "@/components/NoteForm";
import { NotesList } from "@/components/NotesList";
import { AIAssistant } from "@/components/AIAssistant";
import { DateTimeDisplay } from "@/components/DateTimeDisplay";
import { MotivationalQuote } from "@/components/MotivationalQuote";
import { TimeRemaining } from "@/components/TimeRemaining";
import { ProgressTracker } from "@/components/ProgressTracker";
import { useNotes, type Note } from "@/hooks/useNotes";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { notes, isLoading, createNote, updateNote, deleteNote, toggleComplete } = useNotes();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  // AI Assistant state
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>();
  const [aiNoteContent, setAiNoteContent] = useState<string | undefined>();
  const [aiAction, setAiAction] = useState<"summarize" | "rewrite" | "improve" | "chat">("chat");

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSave = async (title: string, content: string) => {
    if (!user) return;
    
    if (editingNote) {
      await updateNote(editingNote.id, title, content);
      setEditingNote(null);
    } else {
      await createNote(title, content, user.id);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    await deleteNote(id);
    if (editingNote?.id === id) {
      setEditingNote(null);
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    await toggleComplete(id, completed);
  };

  const handleSummarize = (note: Note) => {
    setAiInitialPrompt(`Summarize this note titled "${note.title}"`);
    setAiNoteContent(note.content);
    setAiAction("summarize");
    setIsAIOpen(true);
  };

  const handleAIImprove = (content: string) => {
    setAiInitialPrompt("Improve and rewrite this content to make it clearer");
    setAiNoteContent(content);
    setAiAction("improve");
    setIsAIOpen(true);
  };

  const openAIChat = () => {
    setAiInitialPrompt(undefined);
    setAiNoteContent(undefined);
    setAiAction("chat");
    setIsAIOpen(true);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      navigate("/auth", { replace: true });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
                Daily Activity Notes
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <DateTimeDisplay />
              <Button
                onClick={openAIChat}
                className="btn-primary-gradient shadow-soft"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="icon"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[400px,1fr] gap-8">
          {/* Left: Note Form + Widgets */}
          <aside className="space-y-6">
            <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
              <div className="card-elevated p-6">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  {editingNote ? "Edit Note" : "Create Note"}
                </h2>
                <NoteForm
                  editingNote={editingNote}
                  onSave={handleSave}
                  onCancel={() => setEditingNote(null)}
                  onAIImprove={handleAIImprove}
                />
              </div>

              {/* Motivational Quote */}
              <MotivationalQuote />

              {/* Time Remaining */}
              <TimeRemaining />

              {/* Progress Tracker */}
              <ProgressTracker notes={notes} />
            </div>
          </aside>

          {/* Right: Notes List */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Your Notes
              </h2>
              <span className="text-sm text-muted-foreground">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </span>
            </div>
            <NotesList
              notes={notes}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSummarize={handleSummarize}
              onToggleComplete={handleToggleComplete}
            />
          </section>
        </div>
      </main>

      {/* AI Assistant Modal */}
      <AIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        initialPrompt={aiInitialPrompt}
        noteContent={aiNoteContent}
        action={aiAction}
      />
    </div>
  );
};

export default Index;
