/**
 * FloatingNav — Pill/capsule centered navbar.
 * Inspired by: Linear, Framer, Apple.
 * Desktop: full pill with logo + links + CTA.
 * Mobile: compact pill with hamburger + logo + CTA.
 * Hidden on /exam and /focus.
 */
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
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

  // Hidden on exam/focus (distraction-free)
  const hidden = location.pathname === "/exam" || location.pathname === "/focus";
  if (hidden) return null;

  const isHome = location.pathname === "/";

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4"
    >
      <div
        className={cn(
          "flex items-center gap-1 px-2.5 py-2 rounded-full",
          "border border-white/[0.07]",
          "shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
        )}
        style={{
          background: "rgba(11,15,20,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {/* Hamburger */}
        <HamburgerButton onClick={onMenuOpen} />

        {/* Divider */}
        <div className="w-px h-4 bg-white/[0.08] mx-0.5" />

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-white/[0.04] transition-colors duration-150">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center border border-white/[0.12]"
            style={{ background: "rgba(200,167,93,0.15)" }}
          >
            <span className="text-gold font-bold text-[10px] font-sans">P</span>
          </div>
          <span className="text-text-secondary text-xs font-semibold font-sans hidden sm:block">PC-AP</span>
        </NavLink>

        {/* Divider */}
        <div className="w-px h-4 bg-white/[0.08] mx-0.5 hidden md:block" />

        {/* Nav links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                "px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all duration-150",
                isActive
                  ? "bg-white/[0.08] text-text-primary"
                  : "text-white/45 hover:text-white/75 hover:bg-white/[0.04]"
              )}
            >
              {label}
            </NavLink>
          ))}
          {/* TEC Concursos */}
          <a
            href="https://www.tecconcursos.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-sans font-medium text-blue-400/60 hover:text-blue-400/90 hover:bg-white/[0.04] transition-all duration-150"
          >
            <ExternalLink className="w-3 h-3" />
            TEC
          </a>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-white/[0.08] mx-0.5" />

        {/* CTA */}
        <NavLink
          to="/generator"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold font-sans transition-all duration-150 bg-white text-[#0B0F14] hover:bg-white/90 active:scale-[0.98]"
        >
          Gerar
          <span className="opacity-60">→</span>
        </NavLink>
      </div>
    </motion.nav>
  );
}
