import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, Plus, Swords, BarChart3, User } from "lucide-react";
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
import { useTasks, type Task } from "@/hooks/useTasks";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
            <div className="flex items-center gap-3">
              <DateTimeDisplay />
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
                <div /> {/* Timeline has its own header */}
                <Button
                  onClick={() => { setAddHour(undefined); setIsAddOpen(true); }}
                  size="sm"
                  className="btn-neon"
                >
                  <Plus className="h-4 w-4 mr-1" /> New Quest
                </Button>
              </div>
              <Timeline
                tasks={tasks}
                onTaskClick={setSelectedTask}
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
            <DailyScore tasks={tasks} />
            <StreakDisplay progress={progress} />
            <WeekProgress />
            <QuickMotivation />
          </motion.aside>
        </div>
      </main>

      {/* Add Task Dialog */}
      <AddTaskDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddTask}
        defaultHour={addHour}
      />

      {/* AI Coach */}
      <AICoach isOpen={isAIOpen} onToggle={() => setIsAIOpen(!isAIOpen)} />
    </div>
  );
};

export default Index;
