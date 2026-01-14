import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  completed: boolean;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast({
        title: "Error",
        description: "Failed to load notes. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async (title: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .insert({ title, content })
        .select()
        .single();

      if (error) throw error;

      setNotes((prev) => [data, ...prev]);
      toast({
        title: "Note created",
        description: "Your note has been saved successfully.",
      });
      return data;
    } catch (error) {
      console.error("Error creating note:", error);
      toast({
        title: "Error",
        description: "Failed to create note. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateNote = async (id: string, title: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .update({ title, content })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setNotes((prev) =>
        prev.map((note) => (note.id === id ? data : note))
      );
      toast({
        title: "Note updated",
        description: "Your changes have been saved.",
      });
      return data;
    } catch (error) {
      console.error("Error updating note:", error);
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .update({ completed })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setNotes((prev) =>
        prev.map((note) => (note.id === id ? data : note))
      );
      toast({
        title: completed ? "Task completed" : "Task marked as pending",
        description: completed ? "Great job! Keep it up! 🎉" : "Task moved back to pending.",
      });
      return data;
    } catch (error) {
      console.error("Error toggling completion:", error);
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", id);

      if (error) throw error;

      setNotes((prev) => prev.filter((note) => note.id !== id));
      toast({
        title: "Note deleted",
        description: "Your note has been removed.",
      });
      return true;
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchNotes();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("notes-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes" },
        (payload) => {
          console.log("Realtime update:", payload);
          if (payload.eventType === "INSERT") {
            setNotes((prev) => {
              const exists = prev.some((n) => n.id === (payload.new as Note).id);
              if (exists) return prev;
              return [payload.new as Note, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            setNotes((prev) =>
              prev.map((note) =>
                note.id === (payload.new as Note).id ? (payload.new as Note) : note
              )
            );
          } else if (payload.eventType === "DELETE") {
            setNotes((prev) =>
              prev.filter((note) => note.id !== (payload.old as { id: string }).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    toggleComplete,
    refetch: fetchNotes,
  };
}
