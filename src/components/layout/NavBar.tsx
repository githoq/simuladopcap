import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Layers, BookOpen, Clock, Bot } from "lucide-react";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { to: "/app",       label: "Início",     icon: LayoutDashboard },
  { to: "/generator", label: "Simular",    icon: Layers },
  { to: "/bank",      label: "Banco",      icon: BookOpen },
  { to: "/history",   label: "Histórico",  icon: Clock },
  { to: "/ai",        label: "IA",         icon: Bot },
] as const;

/**
 * NavBar — Mobile bottom tabs only.
 * Desktop navigation is handled by FloatingNav (pill).
 */
export function NavBar({ qCount = 0 }: { qCount?: number }) {
  const location = useLocation();
  const hide = ["/", "/focus", "/exam"].includes(location.pathname);
  if (hide) return null;

  return (
    // Mobile only — hidden on md+
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.05] pb-safe"
      style={{ background: "rgba(11,15,20,0.96)", backdropFilter: "blur(12px)" }}
    >
      <div className="flex items-center justify-around px-1 py-1.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => cn(
              "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl",
              isActive ? "text-gold" : "text-text-muted"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "rgba(200,167,93,0.08)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-4.5 h-4.5 relative" />
                <span className="text-[10px] font-sans font-medium relative leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
