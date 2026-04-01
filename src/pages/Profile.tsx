import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Shield, Flame, Star, Zap, Target, Award, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGameProgress, getLevelTitle, getXpForNextLevel } from "@/hooks/useGameProgress";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";

const BADGE_DEFINITIONS = [
  { name: "First Quest", icon: "⚔️", description: "Complete your first task", check: (p: any) => p.total_tasks_completed >= 1 },
  { name: "Five Streak", icon: "🔥", description: "Reach a 5-day streak", check: (p: any) => p.longest_streak >= 5 },
  { name: "Task Master", icon: "🏆", description: "Complete 25 tasks", check: (p: any) => p.total_tasks_completed >= 25 },
  { name: "Century", icon: "💯", description: "Complete 100 tasks", check: (p: any) => p.total_tasks_completed >= 100 },
  { name: "Level 5", icon: "⭐", description: "Reach Level 5", check: (p: any) => p.level >= 5 },
  { name: "Level 10", icon: "🌟", description: "Reach Level 10", check: (p: any) => p.level >= 10 },
  { name: "Dedicated", icon: "💎", description: "10-day streak", check: (p: any) => p.longest_streak >= 10 },
  { name: "Legendary", icon: "👑", description: "Reach Level 20", check: (p: any) => p.level >= 20 },
];

const Profile = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { progress } = useGameProgress(user?.id);
  const { tasks } = useTasks();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  const badges = useMemo(() => {
    if (!progress) return BADGE_DEFINITIONS.map((b) => ({ ...b, earned: false }));
    return BADGE_DEFINITIONS.map((b) => ({ ...b, earned: b.check(progress) }));
  }, [progress]);

  const levelProgress = useMemo(() => {
    if (!progress) return [];
    return Array.from({ length: Math.min(progress.level + 3, 30) }, (_, i) => ({
      level: i + 1,
      title: getLevelTitle(i + 1),
      reached: i + 1 <= progress.level,
      current: i + 1 === progress.level,
    }));
  }, [progress]);

  if (!user || !progress) return null;

  const xpNeeded = getXpForNextLevel(progress.level);
  const xpPercent = Math.min((progress.xp / xpNeeded) * 100, 100);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-neon-green/3 rounded-full blur-[120px]" />
      </div>

      <header className="border-b border-border glass-card sticky top-0 z-30 rounded-none">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Shield className="h-5 w-5 text-neon-purple" />
          <h1 className="font-display text-lg font-bold tracking-wider text-gradient-primary">PROFILE</h1>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 sm:px-6 py-6 relative z-10 space-y-6">
        {/* Hero Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 text-center">
          <motion.div
            className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center neon-glow-purple"
            style={{ background: 'var(--gradient-primary)' }}
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Crown className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          <h2 className="font-display text-xl font-bold text-foreground">{getLevelTitle(progress.level)}</h2>
          <p className="text-sm text-muted-foreground mb-4">Level {progress.level} • {user.email}</p>

          {/* XP bar */}
          <div className="max-w-sm mx-auto">
            <div className="flex justify-between text-xs font-mono text-muted-foreground mb-1">
              <span>XP</span>
              <span>{progress.xp}/{xpNeeded}</span>
            </div>
            <div className="xp-bar h-3">
              <motion.div className="xp-bar-fill" initial={{ width: 0 }} animate={{ width: `${xpPercent}%` }} transition={{ duration: 1 }} />
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex justify-center gap-6 mt-5">
            {[
              { icon: Flame, value: progress.current_streak, label: "Streak", color: "text-neon-orange" },
              { icon: Zap, value: progress.total_tasks_completed, label: "Completed", color: "text-neon-green" },
              { icon: Star, value: progress.longest_streak, label: "Best Streak", color: "text-neon-purple" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className={`h-5 w-5 ${s.color} mx-auto mb-1`} />
                <p className="text-lg font-display font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Level Progression */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <h2 className="font-display text-sm font-semibold tracking-wider text-foreground mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> LEVEL PROGRESSION
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {levelProgress.map((lp) => (
              <motion.div
                key={lp.level}
                whileHover={{ scale: 1.1 }}
                className={`shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center text-xs font-mono transition-all ${
                  lp.current ? "neon-glow-blue border border-primary/50" :
                  lp.reached ? "bg-neon-green/20 border border-neon-green/30" :
                  "bg-secondary/50 border border-border"
                }`}
                style={lp.current ? { background: 'var(--gradient-primary)' } : {}}
              >
                <span className={`font-bold ${lp.current ? "text-primary-foreground" : lp.reached ? "text-neon-green" : "text-muted-foreground"}`}>
                  {lp.level}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <h2 className="font-display text-sm font-semibold tracking-wider text-foreground mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-neon-orange" /> ACHIEVEMENTS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {badges.map((badge, i) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className={`p-3 rounded-xl text-center transition-all ${
                  badge.earned ? "glass-card-hover neon-glow-green" : "bg-secondary/30 opacity-50"
                }`}
              >
                <span className="text-2xl">{badge.icon}</span>
                <p className="text-xs font-medium text-foreground mt-1">{badge.name}</p>
                <p className="text-[10px] text-muted-foreground">{badge.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
