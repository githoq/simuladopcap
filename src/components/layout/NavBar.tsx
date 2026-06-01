/**
 * NavBar — Mobile bottom tabs only. Premium glass surface with active indicator.
 */
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

export function NavBar({ qCount = 0 }: { qCount?: number }) {
  const location = useLocation();
  const hide = ["/", "/focus", "/exam"].includes(location.pathname);
  if (hide) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe"
      style={{
        background:
          "linear-gradient(180deg, rgba(6,8,11,0.65) 0%, rgba(6,8,11,0.95) 60%, rgba(6,8,11,1) 100%)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Top hairline glow */}
      <div
        aria-hidden
        className="absolute top-0 left-[15%] right-[15%] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(200,167,93,0.30), transparent)",
        }}
      />

      <div className="relative flex items-center justify-around px-2 py-1.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/app"}
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl flex-1",
                "transition-colors duration-200",
                isActive ? "text-gold" : "text-text-muted hover:text-text-secondary"
              )
            }
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(200,167,93,0.13) 0%, rgba(200,167,93,0.03) 100%)",
                      boxShadow:
                        "inset 0 0 0 1px rgba(200,167,93,0.22)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-4 h-4 relative shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-[10px] font-sans font-medium relative leading-none tracking-tight">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
