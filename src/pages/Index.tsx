import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, Plus, Swords, BarChart3, User, Focus } from "lucide-react";
import { XPBar } from "@/components/XPBar";
import { Timeline } from "@/components/Timeline";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { DailyScore } from "@/components/DailyScore";
import { StreakDisplay } from "@/components/StreakDisplay";
import { QuickMotivation } from "@/components/QuickMotivation";
import { WeekProgress } from "@/components/WeekProgress";
import { AICoach } from "@/components/AICoach";
import { DateTimeDisplay } from "@/components/DateTimeDisplay";
import { SmartNudge } from "@/components/SmartNudge";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { NavBar } from "@/components/NavBar";
import { FocusMode } from "@/components/FocusMode";
import { MoodInput } from "@/components/MoodInput";
import { LifeAreas } from "@/components/LifeAreas";
import { SmartRescheduleModal } from "@/components/SmartRescheduleModal";
import { useTasks, type Task } from "@/hooks/useTasks";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { addDays } from "date-fns";

const Index = () => {
  const { tasks, isLoading, createTask, completeTask, uncompleteTask, deleteTask, updateTask } = useTasks();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { progress, addXP, xpAnimation } = useGameProgress(user?.id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addHour, setAddHour] = useState<number | undefined>();
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [celebrationTrigger, setCelebrationTrigger] = useState(false);
  const [isFocusOpen, setIsFocusOpen] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [rescheduleTask, setRescheduleTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const result = await completeTask(taskId);
    if (result) {
      const xpResult = await addXP(task.xp_reward);
      setCelebrationTrigger(true);
      setTimeout(() => setCelebrationTrigger(false), 100);
      toast({
        title: `⚡ +${task.xp_reward} XP`,
        description: xpResult?.leveledUp
          ? `🎉 Level Up! You reached Level ${xpResult.newLevel}!`
          : "Quest completed!",
      });
      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...task, completed: true, completed_at: new Date().toISOString() });
      }
    }
  };

  const handleAddTask = async (title: string, description: string, scheduledTime?: string, durationMinutes?: number, priority?: string) => {
    if (!user) return;
    await createTask(title, description, user.id, scheduledTime, durationMinutes, priority);
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    if (selectedTask?.id === id) setSelectedTask(null);
  };

  const handleUpdateTask = async (id: string, updates: Partial<Pick<Task, "title" | "description" | "priority">>) => {
    const result = await updateTask(id, updates);
    if (result && selectedTask?.id === id) setSelectedTask(result);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const handleFocusStart = (task?: Task) => {
    setFocusTask(task || null);
    setIsFocusOpen(true);
  };

  const handleReschedule = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.scheduled_time) return;
    const tomorrow = addDays(new Date(task.scheduled_time), 1);
    await updateTask(taskId, { scheduled_time: tomorrow.toISOString() } as any);
    toast({ title: "📅 Rescheduled", description: "Moved to tomorrow" });
  };

  const handleBreakDown = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !user) return;
    await deleteTask(taskId);
    const base = task.scheduled_time ? new Date(task.scheduled_time) : new Date();
    await createTask(`${task.title} (Part 1)`, "", user.id, base.toISOString(), 15, task.priority);
    const part2Time = new Date(base.getTime() + 20 * 60000);
    await createTask(`${task.title} (Part 2)`, "", user.id, part2Time.toISOString(), 15, task.priority);
    toast({ title: "✂️ Split", description: "Broken into 2 mini quests" });
  };

  // Find missed tasks for reschedule prompt
  const missedTasks = tasks.filter((t) => {
    if (t.completed || !t.scheduled_time) return false;
    const end = new Date(new Date(t.scheduled_time).getTime() + t.duration_minutes * 60000);
    return end < new Date();
  });

  const handleTaskClick = (task: Task) => {
    const isMissed = !task.completed && task.scheduled_time &&
      new Date(new Date(task.scheduled_time).getTime() + task.duration_minutes * 60000) < new Date();
    if (isMissed) {
      setRescheduleTask(task);
    } else {
      setSelectedTask(task);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue/3 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/3 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-border glass-card sticky top-0 z-30 rounded-none">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                <Swords className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="font-display text-lg sm:text-xl font-bold tracking-wider text-gradient-primary">
                QUESTFLOW
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <DateTimeDisplay />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFocusStart()}
                title="Focus Mode"
                className="text-neon-green hover:text-neon-green/80 gap-1.5 hidden sm:flex"
              >
                <Focus className="h-4 w-4" />
                <span className="text-xs font-display">Focus</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/analytics")} title="Analytics" className="text-muted-foreground hover:text-foreground hidden md:flex">
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/profile")} title="Profile" className="text-muted-foreground hover:text-foreground hidden md:flex">
                <User className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out" className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 relative z-10">
        {/* XP Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <XPBar progress={progress} xpAnimation={xpAnimation} />
        </motion.div>

        <div className="grid lg:grid-cols-[1fr,340px] gap-6">
          {/* Left: Timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleFocusStart()}
                    size="sm"
                    variant="outline"
                    className="border-neon-green/30 text-neon-green hover:bg-neon-green/10 sm:hidden"
                  >
                    <Focus className="h-4 w-4 mr-1" /> Focus
                  </Button>
                  <Button
                    onClick={() => { setAddHour(undefined); setIsAddOpen(true); }}
                    size="sm"
                    className="btn-neon"
                  >
                    <Plus className="h-4 w-4 mr-1" /> New Quest
                  </Button>
                </div>
              </div>
              <Timeline
                tasks={tasks}
                onTaskClick={handleTaskClick}
                onAddTask={(hour) => { setAddHour(hour); setIsAddOpen(true); }}
                onCompleteTask={handleCompleteTask}
              />
            </div>

            {/* Task detail panel */}
            {selectedTask && (
              <div className="mt-4">
                <TaskDetailPanel
                  task={selectedTask}
                  onClose={() => setSelectedTask(null)}
                  onComplete={handleCompleteTask}
                  onDelete={handleDeleteTask}
                  onUpdate={handleUpdateTask}
                />
              </div>
            )}
          </motion.div>

          {/* Right: Widgets */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <MoodInput />
            <DailyScore tasks={tasks} />
            <LifeAreas tasks={tasks} />
            <StreakDisplay progress={progress} />
            <WeekProgress />
            <QuickMotivation />
          </motion.aside>
        </div>
      </main>

      {/* Dialogs & Overlays */}
      <AddTaskDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAddTask} defaultHour={addHour} />
      <CelebrationOverlay trigger={celebrationTrigger} />
      <SmartNudge tasks={tasks} />
      <AICoach isOpen={isAIOpen} onToggle={() => setIsAIOpen(!isAIOpen)} />
      <FocusMode isOpen={isFocusOpen} onClose={() => setIsFocusOpen(false)} task={focusTask} onComplete={handleCompleteTask} />
      <SmartRescheduleModal
        task={rescheduleTask}
        isOpen={!!rescheduleTask}
        onClose={() => setRescheduleTask(null)}
        onReschedule={handleReschedule}
        onBreakDown={handleBreakDown}
        onRemove={handleDeleteTask}
      />
      <NavBar />
    </div>
  );
};

export default Index;
