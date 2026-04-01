import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Clock, Target, Calendar, ArrowLeft, Flame, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { useGameProgress } from "@/hooks/useGameProgress";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";

const Analytics = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { tasks } = useTasks();
  const { progress } = useGameProgress(user?.id);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, []);

  const weeklyStats = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });

    const weekTasks = tasks.filter((t) => {
      if (!t.scheduled_time) return false;
      return isWithinInterval(new Date(t.scheduled_time), { start, end });
    });

    const completed = weekTasks.filter((t) => t.completed);
    const totalMinutes = completed.reduce((acc, t) => acc + (t.duration_minutes || 30), 0);
    const productivity = weekTasks.length > 0 ? Math.round((completed.length / weekTasks.length) * 100) : 0;

    // Per-day breakdown
    const dailyData = weekDays.map((day) => {
      const dayTasks = weekTasks.filter((t) => t.scheduled_time && isSameDay(new Date(t.scheduled_time), day));
      const dayCompleted = dayTasks.filter((t) => t.completed);
      return {
        day: format(day, "EEE"),
        total: dayTasks.length,
        completed: dayCompleted.length,
        isToday: isSameDay(day, new Date()),
      };
    });

    const bestDay = dailyData.reduce((best, d) => (d.completed > best.completed ? d : best), dailyData[0]);

    return { total: weekTasks.length, completed: completed.length, productivity, totalMinutes, dailyData, bestDay };
  }, [tasks, weekDays]);

  // Consistency score based on streak and tasks
  const consistencyScore = useMemo(() => {
    if (!progress) return 0;
    const streakFactor = Math.min(progress.current_streak / 7, 1) * 50;
    const taskFactor = Math.min(progress.tasks_completed_today / 5, 1) * 50;
    return Math.round(streakFactor + taskFactor);
  }, [progress]);

  // Priority breakdown
  const priorityBreakdown = useMemo(() => {
    const high = tasks.filter((t) => t.priority === "high").length;
    const medium = tasks.filter((t) => t.priority === "medium").length;
    const low = tasks.filter((t) => t.priority === "low").length;
    const total = tasks.length || 1;
    return [
      { label: "High", count: high, pct: Math.round((high / total) * 100), color: "bg-destructive" },
      { label: "Medium", count: medium, pct: Math.round((medium / total) * 100), color: "bg-primary" },
      { label: "Low", count: low, pct: Math.round((low / total) * 100), color: "bg-neon-green" },
    ];
  }, [tasks]);

  if (!user) return null;

  const maxBarValue = Math.max(...weeklyStats.dailyData.map((d) => d.total), 1);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-neon-purple/3 rounded-full blur-[120px]" />
      </div>

      <header className="border-b border-border glass-card sticky top-0 z-30 rounded-none">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <BarChart3 className="h-5 w-5 text-primary" />
          <h1 className="font-display text-lg font-bold tracking-wider text-gradient-primary">ANALYTICS</h1>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 sm:px-6 py-6 relative z-10 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Target, label: "Productivity", value: `${weeklyStats.productivity}%`, color: "text-neon-green" },
            { icon: Zap, label: "Tasks Done", value: `${weeklyStats.completed}/${weeklyStats.total}`, color: "text-primary" },
            { icon: Clock, label: "Time Invested", value: `${Math.round(weeklyStats.totalMinutes / 60)}h ${weeklyStats.totalMinutes % 60}m`, color: "text-neon-purple" },
            { icon: Flame, label: "Best Day", value: weeklyStats.bestDay?.day || "—", color: "text-neon-orange" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-4">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Weekly Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          <h2 className="font-display text-sm font-semibold tracking-wider text-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> WEEKLY OVERVIEW
          </h2>
          <div className="flex items-end gap-3 h-40">
            {weeklyStats.dailyData.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-0.5 flex-1 justify-end">
                  {/* Total bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.total / maxBarValue) * 100}%` }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.6 }}
                    className={`w-full max-w-[32px] rounded-t-md ${d.isToday ? "bg-primary/30" : "bg-secondary"} relative`}
                  >
                    {/* Completed overlay */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: d.total > 0 ? `${(d.completed / d.total) * 100}%` : "0%" }}
                      transition={{ delay: 0.7 + i * 0.05, duration: 0.6 }}
                      className={`absolute bottom-0 w-full rounded-t-md ${d.isToday ? "bg-primary neon-glow-blue" : "bg-neon-green/70"}`}
                    />
                  </motion.div>
                </div>
                <span className={`text-[10px] font-mono ${d.isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>{d.day}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{d.completed}/{d.total}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Consistency Score */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-5">
            <h2 className="font-display text-sm font-semibold tracking-wider text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-neon-green" /> CONSISTENCY
            </h2>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <motion.circle
                    cx="50" cy="50" r="42" fill="none" stroke="url(#consistencyGrad)" strokeWidth="8"
                    strokeLinecap="round" strokeDasharray={2 * Math.PI * 42}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - consistencyScore / 100) }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                  />
                  <defs>
                    <linearGradient id="consistencyGrad">
                      <stop offset="0%" stopColor="hsl(var(--neon-green))" />
                      <stop offset="100%" stopColor="hsl(var(--neon-blue))" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-display font-bold text-foreground">{consistencyScore}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Score</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Priority Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card p-5">
            <h2 className="font-display text-sm font-semibold tracking-wider text-foreground mb-4">PRIORITY SPLIT</h2>
            <div className="space-y-3">
              {priorityBreakdown.map((p) => (
                <div key={p.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{p.label}</span>
                    <span className="font-mono text-foreground">{p.count} ({p.pct}%)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.pct}%` }}
                      transition={{ duration: 0.8, delay: 0.9 }}
                      className={`h-full rounded-full ${p.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
