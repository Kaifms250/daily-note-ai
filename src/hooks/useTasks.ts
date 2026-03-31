import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  scheduled_time: string | null;
  duration_minutes: number;
  completed: boolean;
  completed_at: string | null;
  xp_reward: number;
  priority: string;
  created_at: string;
  updated_at: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("scheduled_time", { ascending: true, nullsFirst: false });

      if (error) throw error;
      setTasks((data as Task[]) || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (
    title: string,
    description: string,
    userId: string,
    scheduledTime?: string,
    durationMinutes?: number,
    priority?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title,
          description,
          user_id: userId,
          scheduled_time: scheduledTime || null,
          duration_minutes: durationMinutes || 30,
          priority: priority || "medium",
        })
        .select()
        .single();

      if (error) throw error;
      setTasks((prev) => [...prev, data as Task]);
      return data as Task;
    } catch (error) {
      console.error("Error creating task:", error);
      toast({ title: "Error", description: "Failed to create task.", variant: "destructive" });
      return null;
    }
  };

  const completeTask = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setTasks((prev) => prev.map((t) => (t.id === id ? (data as Task) : t)));
      return data as Task;
    } catch (error) {
      console.error("Error completing task:", error);
      return null;
    }
  };

  const uncompleteTask = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({ completed: false, completed_at: null })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setTasks((prev) => prev.map((t) => (t.id === id ? (data as Task) : t)));
      return data as Task;
    } catch (error) {
      console.error("Error uncompleting task:", error);
      return null;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      return false;
    }
  };

  const updateTask = async (id: string, updates: Partial<Pick<Task, "title" | "description" | "scheduled_time" | "duration_minutes" | "priority">>) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setTasks((prev) => prev.map((t) => (t.id === id ? (data as Task) : t)));
      return data as Task;
    } catch (error) {
      console.error("Error updating task:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel("tasks-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setTasks((prev) => {
            const exists = prev.some((t) => t.id === (payload.new as Task).id);
            return exists ? prev : [...prev, payload.new as Task];
          });
        } else if (payload.eventType === "UPDATE") {
          setTasks((prev) => prev.map((t) => (t.id === (payload.new as Task).id ? (payload.new as Task) : t)));
        } else if (payload.eventType === "DELETE") {
          setTasks((prev) => prev.filter((t) => t.id !== (payload.old as { id: string }).id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { tasks, isLoading, createTask, completeTask, uncompleteTask, deleteTask, updateTask, refetch: fetchTasks };
}
