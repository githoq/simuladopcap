/**
 * FloatingNav — Premium pill/capsule centered navbar.
 *
 * Refinements:
 *  - Gradient border (Linear/Vercel signature)
 *  - Deeper blur (24px + saturation)
 *  - Active link with subtle glow indicator
 *  - Hover micro-interactions on links
 *  - Refined CTA with shimmer
 */
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
import { HamburgerButton } from "./SidePanel";

const NAV_LINKS = [
  { to: "/app",       label: "Início" },
  { to: "/generator", label: "Simular" },
  { to: "/bank",      label: "Banco" },
  { to: "/history",   label: "Histórico" },
] as const;

interface FloatingNavProps {
  onMenuOpen: () => void;
}

export function FloatingNav({ onMenuOpen }: FloatingNavProps) {
  const location = useLocation();

  const hidden = location.pathname === "/exam" || location.pathname === "/focus";
  if (hidden) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
      className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4"
    >
      {/* Outer glow halo */}
      <div className="relative">
        <div
          aria-hidden
          className="absolute inset-0 rounded-full blur-xl opacity-60 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(124,92,255,0.15), rgba(200,167,93,0.12), rgba(62,215,194,0.10))",
          }}
        />

        <div
          className={cn(
            "relative flex items-center gap-1 px-2.5 py-2 rounded-full",
            "border-gradient"
          )}
          style={{
            background:
              "linear-gradient(180deg, rgba(15,20,27,0.85) 0%, rgba(11,15,20,0.92) 100%)",
            backdropFilter: "blur(18px) saturate(160%)",
            WebkitBackdropFilter: "blur(18px) saturate(160%)",
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.06) inset, " +
              "0 24px 64px -16px rgba(0,0,0,0.7), " +
              "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {/* Hamburger */}
          <HamburgerButton onClick={onMenuOpen} />

          {/* Divider */}
          <div className="w-px h-4 bg-white/[0.08] mx-0.5" />

          {/* Logo wordmark */}
          <NavLink
            to="/"
            className="group flex items-center gap-2 px-2 py-1 rounded-full hover:bg-white/[0.04] transition-colors duration-200"
          >
            <div
              className="relative w-5 h-5 rounded-md flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(228,204,149,0.30) 0%, rgba(200,167,93,0.15) 100%)",
                boxShadow:
                  "0 0 0 1px rgba(200,167,93,0.30) inset, 0 0 12px -2px rgba(200,167,93,0.40)",
              }}
            >
              <span
                className="font-bold text-[10px] font-sans"
                style={{ color: "#e4cc95" }}
              >
                P
              </span>
            </div>
            <span className="text-text-secondary text-xs font-semibold font-sans tracking-tight hidden sm:block group-hover:text-text-primary transition-colors">
              PC-AP
            </span>
          </NavLink>

          {/* Divider */}
          <div className="w-px h-4 bg-white/[0.08] mx-0.5 hidden md:block" />

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-0.5 relative">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === "/app"}>
                {({ isActive }: { isActive: boolean }) => (
                  <span
                    className={cn(
                      "relative inline-flex px-3 py-1.5 rounded-full text-xs font-sans font-medium tracking-tight transition-colors duration-200",
                      isActive
                        ? "text-text-primary"
                        : "text-white/45 hover:text-white/80"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill-active"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
                          boxShadow:
                            "0 1px 0 rgba(255,255,255,0.10) inset, 0 0 0 1px rgba(255,255,255,0.06)",
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative">{label}</span>
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-white/[0.08] mx-0.5" />

          {/* CTA — Premium shimmer */}
          <NavLink
            to="/generator"
            className="group relative overflow-hidden flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold font-sans tracking-tight transition-all duration-300"
            style={{
              background:
                "linear-gradient(180deg, #ffffff 0%, #e4e4e7 100%)",
              color: "#06080B",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.6) inset, " +
                "0 0 0 1px rgba(255,255,255,0.20), " +
                "0 4px 16px -4px rgba(255,255,255,0.20), " +
                "0 0 24px -8px rgba(200,167,93,0.35)",
            }}
          >
            <span className="relative z-10">Gerar</span>
            <Sparkles className="relative z-10 w-3 h-3 opacity-70 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-300" />
            {/* Shimmer */}
            <span
              aria-hidden
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s ease-in-out infinite",
              }}
            />
          </NavLink>
        </div>
      </div>
    </motion.nav>
  );
}
