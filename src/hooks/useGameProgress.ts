import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GameProgress {
  id: string;
  user_id: string;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  tasks_completed_today: number;
  total_tasks_completed: number;
}

const XP_PER_LEVEL = 100;

export function getLevelTitle(level: number): string {
  if (level <= 2) return "Beginner";
  if (level <= 5) return "Apprentice";
  if (level <= 10) return "Warrior";
  if (level <= 15) return "Champion";
  if (level <= 20) return "Master";
  if (level <= 30) return "Legend";
  return "Mythic";
}

export function getXpForNextLevel(level: number): number {
  return level * XP_PER_LEVEL;
}

export function useGameProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [xpAnimation, setXpAnimation] = useState<{ amount: number; show: boolean }>({ amount: 0, show: false });

  const fetchProgress = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Create initial progress
        const { data: newData, error: createError } = await supabase
          .from("user_progress")
          .insert({ user_id: userId })
          .select()
          .single();

        if (createError) throw createError;
        setProgress(newData as unknown as GameProgress);
      } else {
        setProgress(data as unknown as GameProgress);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const addXP = useCallback(async (amount: number) => {
    if (!progress || !userId) return;

    const newXp = progress.xp + amount;
    const xpNeeded = getXpForNextLevel(progress.level);
    let newLevel = progress.level;
    let remainingXp = newXp;

    while (remainingXp >= getXpForNextLevel(newLevel)) {
      remainingXp -= getXpForNextLevel(newLevel);
      newLevel++;
    }

    const today = new Date().toISOString().split("T")[0];
    const isNewDay = progress.last_active_date !== today;
    const newStreak = isNewDay
      ? (progress.last_active_date === new Date(Date.now() - 86400000).toISOString().split("T")[0]
        ? progress.current_streak + 1
        : 1)
      : progress.current_streak;

    try {
      const { data, error } = await supabase
        .from("user_progress")
        .update({
          xp: remainingXp,
          level: newLevel,
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, progress.longest_streak),
          last_active_date: today,
          tasks_completed_today: isNewDay ? 1 : progress.tasks_completed_today + 1,
          total_tasks_completed: progress.total_tasks_completed + 1,
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      setProgress(data as unknown as GameProgress);

      // Trigger XP animation
      setXpAnimation({ amount, show: true });
      setTimeout(() => setXpAnimation({ amount: 0, show: false }), 1500);

      return { leveledUp: newLevel > progress.level, newLevel };
    } catch (error) {
      console.error("Error adding XP:", error);
      return null;
    }
  }, [progress, userId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { progress, isLoading, addXP, xpAnimation, refetch: fetchProgress };
}
