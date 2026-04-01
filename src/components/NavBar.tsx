import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, BarChart3, User } from "lucide-react";

const NAV_ITEMS = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-border rounded-none md:hidden">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center gap-0.5 px-4 py-1"
            >
              {active && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -top-0.5 w-8 h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[10px] ${active ? "text-primary font-medium" : "text-muted-foreground"}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
