/**
 * DashboardPage — Premium analytics workspace.
 *
 * Design intent: Stripe Atlas × Linear Insights.
 *  - Cinematic ambient backdrop
 *  - Hero stat row with gradient backgrounds
 *  - Premium chart card
 *  - Asymmetric quick-action grid
 *  - Polished discipline progress bars
 *  - Activity heatmap with gold gradient
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Layers, Clock, TrendingUp, Zap, BookOpen,
  ChevronRight, RotateCcw, Award, Target, Flame,
  Focus, Sparkles,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { AmbientBackground } from "../components/ui/AmbientBackground";
import { StaggerList, StaggerItem } from "../components/motion/StaggerList";
import { fmtDate, fmtTime, cn } from "../lib/utils";
import { DISCIPLINE_ORDER } from "../lib/constants";
import type { ProgressEntry } from "../types";

interface DashboardPageProps {
  history: ProgressEntry[];
  usedIds: string[];
  totalQuestions: number;
  streak: number;
  onReset: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2.5 text-xs font-sans"
      style={{
        background: "linear-gradient(180deg, rgba(20,26,34,0.95), rgba(11,15,20,0.98))",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      }}
    >
      <p style={{ color: "rgba(255,255,255,0.45)" }} className="mb-1 text-[10px] uppercase tracking-wider">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono font-semibold text-sm tabular-nums">
          {p.value}{p.name === "%" ? "%" : ""}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage({ history, usedIds, totalQuestions, streak, onReset }: DashboardPageProps) {
  const navigate = useNavigate();

  const avg = useMemo(() =>
    history.length ? Math.round(history.reduce((s, e) => s + e.percent, 0) / history.length) : 0,
    [history]);
  const best = useMemo(() =>
    history.length ? Math.max(...history.map((e) => e.percent)) : 0,
    [history]);
  const totalAnswered = useMemo(() =>
    history.reduce((s, e) => s + e.total, 0), [history]);
  const usedPct = totalQuestions > 0 ? Math.round((usedIds.length / totalQuestions) * 100) : 0;

  const trendData = useMemo(() =>
    [...history].slice(0, 10).reverse().map((e, i) => ({
      n: i + 1, "%": e.percent, score: e.score, total: e.total,
    })), [history]);

  const discData = useMemo(() =>
    DISCIPLINE_ORDER.map((disc) => {
      const stats = history.flatMap((h) => h.disciplineStats[disc] ? [h.disciplineStats[disc]] : []);
      if (!stats.length) return null;
      const total = stats.reduce((s, x) => s + x.total, 0);
      const correct = stats.reduce((s, x) => s + x.correct, 0);
      return { disc: disc.length > 14 ? disc.slice(0, 13) + "…" : disc, pct: total > 0 ? Math.round((correct / total) * 100) : 0, total, correct };
    }).filter(Boolean).sort((a, b) => b!.pct - a!.pct),
    [history]);

  const heatmap = useMemo(() => {
    const days: { date: number; count: number; pct: number }[] = [];
    const now = Date.now();
    const byDay = new Map<number, { count: number; pctSum: number }>();
    history.forEach((e) => {
      const d = new Date(e.date); d.setHours(0, 0, 0, 0);
      const key = d.getTime();
      const cur = byDay.get(key) ?? { count: 0, pctSum: 0 };
      byDay.set(key, { count: cur.count + 1, pctSum: cur.pctSum + e.percent });
    });
    for (let i = 62; i >= 0; i--) {
      const d = new Date(now - i * 86400000); d.setHours(0, 0, 0, 0);
      const key = d.getTime();
      const data = byDay.get(key);
      days.push({ date: key, count: data?.count ?? 0, pct: data ? Math.round(data.pctSum / data.count) : 0 });
    }
    return days;
  }, [history]);

  return (
    <div className="min-h-screen relative" style={{ background: "#06080B" }}>
      <AmbientBackground variant="workspace" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pb-24 pt-24 md:pb-12">
        <StaggerList className="space-y-6">

          {/* Header */}
          <StaggerItem>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-text-muted font-sans mb-1.5">
                  Workspace
                </div>
                <h1 className="text-3xl sm:text-4xl font-sans font-semibold tracking-tightest text-gradient-muted">
                  Seu progresso
                </h1>
                <p className="text-text-tertiary text-sm mt-1.5 font-sans tracking-tight">
                  {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </div>
              {streak > 0 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-sans"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.03) 100%)",
                    border: "1px solid rgba(249,115,22,0.25)",
                    color: "#fb923c",
                    boxShadow: "0 0 24px -8px rgba(249,115,22,0.4)",
                  }}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span className="font-bold tabular-nums">{streak}</span>
                  <span className="opacity-70">dias</span>
                </motion.div>
              )}
            </div>
          </StaggerItem>

          {/* Hero stat cards — premium gradient surfaces */}
          <StaggerItem>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: Target,     label: "Média geral",  value: `${avg}%`,   color: "#c8a75d", glow: "rgba(200,167,93,0.18)", sub: `${history.length} provas` },
                { icon: Award,      label: "Melhor prova", value: `${best}%`,  color: "#22c55e", glow: "rgba(34,197,94,0.18)",  sub: "recorde" },
                { icon: BookOpen,   label: "Respondidas",  value: totalAnswered.toLocaleString("pt-BR"), color: "#8fa5bf", glow: "rgba(143,165,191,0.18)", sub: "questões totais" },
                { icon: TrendingUp, label: "Banco usado",  value: `${usedPct}%`, color: "#a698ff", glow: "rgba(124,92,255,0.18)", sub: `${usedIds.length} questões` },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="relative rounded-2xl p-4 overflow-hidden group"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 12px rgba(0,0,0,0.3)",
                    }}
                  >
                    {/* Corner glow */}
                    <div
                      aria-hidden
                      className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-500"
                      style={{ background: `radial-gradient(circle, ${stat.glow}, transparent 70%)` }}
                    />
                    <div className="relative">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center mb-3"
                        style={{
                          background: `linear-gradient(180deg, ${stat.glow}, rgba(255,255,255,0.02))`,
                          border: `1px solid ${stat.glow}`,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                      </div>
                      <div
                        className="text-2xl font-mono font-semibold tabular-nums tracking-tight"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </div>
                      <div className="text-[10px] text-text-tertiary uppercase tracking-wider font-sans font-medium mt-0.5">
                        {stat.label}
                      </div>
                      <div className="text-[10px] font-sans mt-0.5" style={{ color: "rgba(255,255,255,0.30)" }}>
                        {stat.sub}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </StaggerItem>

          {/* Quick actions — asymmetric premium grid */}
          <StaggerItem>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PRIMARY action — bigger, gold-tinted */}
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate("/generator")}
                className="sm:col-span-2 group relative overflow-hidden flex items-center gap-5 p-5 rounded-2xl text-left transition-all duration-300"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(200,167,93,0.10) 0%, rgba(200,167,93,0.02) 100%)",
                  border: "1px solid rgba(200,167,93,0.22)",
                  boxShadow:
                    "inset 0 1px 0 rgba(200,167,93,0.10), 0 4px 16px -4px rgba(200,167,93,0.18)",
                }}
              >
                {/* Halo */}
                <div
                  aria-hidden
                  className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-500"
                  style={{ background: "radial-gradient(circle, rgba(200,167,93,0.30), transparent 70%)" }}
                />
                <div
                  className="relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(228,204,149,0.20), rgba(200,167,93,0.08))",
                    border: "1px solid rgba(200,167,93,0.30)",
                    boxShadow: "0 0 24px -6px rgba(200,167,93,0.40)",
                  }}
                >
                  <Layers className="w-5 h-5 text-gold" />
                </div>
                <div className="relative flex-1">
                  <div className="text-text-primary font-semibold text-base font-sans tracking-tight">
                    Gerar novo simulado
                  </div>
                  <div className="text-text-secondary text-xs mt-0.5 font-sans">
                    Configure disciplinas, modo e tempo
                  </div>
                </div>
                <ChevronRight className="relative w-4 h-4 text-gold transition-transform group-hover:translate-x-1" />
              </motion.button>

              {[
                { icon: Clock,   label: "Histórico",         desc: `${history.length} simulados`,    to: "/history" },
                { icon: BookOpen,label: "Banco de Questões", desc: `${totalQuestions} questões FCC`, to: "/bank" },
                { icon: Focus,   label: "Modo Foco",         desc: "Leitura sem distração",          to: "/generator" },
                { icon: Sparkles,label: "Assistente IA",     desc: "Tira dúvidas em tempo real",     to: "/ai" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.label}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate(action.to)}
                    className="group relative overflow-hidden flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.004) 100%)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <Icon className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-text-primary font-semibold text-sm font-sans tracking-tight">{action.label}</div>
                      <div className="text-text-muted text-xs mt-0.5 font-sans truncate">{action.desc}</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-40 group-hover:opacity-100 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all duration-300" />
                  </motion.button>
                );
              })}
            </div>
          </StaggerItem>

          {/* Trend chart — premium */}
          {trendData.length >= 2 && (
            <StaggerItem>
              <PremiumCard>
                <CardHeader title="Evolução" subtitle={`Últimas ${trendData.length} provas`} icon={TrendingUp} />
                <div className="p-5 pt-3">
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="evolutionGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#e4cc95" />
                          <stop offset="100%" stopColor="#c8a75d" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="n" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(200,167,93,0.20)", strokeWidth: 1, strokeDasharray: "3 3" }} />
                      <Line
                        type="monotone"
                        dataKey="%"
                        stroke="url(#evolutionGradient)"
                        strokeWidth={2}
                        dot={{ fill: "#c8a75d", r: 3, strokeWidth: 0 }}
                        activeDot={{ fill: "#e4cc95", r: 5, strokeWidth: 2, stroke: "rgba(200,167,93,0.4)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </PremiumCard>
            </StaggerItem>
          )}

          {/* Discipline breakdown */}
          {discData.length > 0 && (
            <StaggerItem>
              <PremiumCard>
                <CardHeader title="Por disciplina" subtitle={`${discData.length} disciplinas com dados`} icon={Layers} />
                <div className="p-5 pt-3 space-y-3">
                  {discData.slice(0, 6).map((r, i) => (
                    <motion.div
                      key={r!.disc}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      <div className="flex justify-between text-xs mb-1.5 font-sans tracking-tight">
                        <span className="text-text-secondary">{r!.disc}</span>
                        <span className={cn("font-mono font-medium tabular-nums",
                          r!.pct >= 70 ? "text-[#22c55e]" : r!.pct >= 50 ? "text-yellow-400" : "text-[#ef4444]"
                        )}>{r!.correct}/{r!.total} · {r!.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden relative" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <motion.div
                          className="h-full rounded-full relative"
                          style={{
                            background:
                              r!.pct >= 70 ? "linear-gradient(90deg, #16a34a, #22c55e)"
                                : r!.pct >= 50 ? "linear-gradient(90deg, #d97706, #f59e0b)"
                                : "linear-gradient(90deg, #dc2626, #ef4444)",
                            boxShadow:
                              r!.pct >= 70 ? "0 0 8px rgba(34,197,94,0.3)"
                                : r!.pct >= 50 ? "0 0 8px rgba(245,158,11,0.3)"
                                : "0 0 8px rgba(239,68,68,0.3)",
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${r!.pct}%` }}
                          transition={{ duration: 0.9, delay: 0.2 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </PremiumCard>
            </StaggerItem>
          )}

          {/* Activity heatmap */}
          <StaggerItem>
            <PremiumCard>
              <CardHeader title="Atividade" subtitle="Últimos 63 dias" icon={Flame} />
              <div className="p-5 pt-3 overflow-x-auto">
                <div className="flex gap-1.5 min-w-max">
                  {Array.from({ length: 9 }).map((_, week) => (
                    <div key={week} className="flex flex-col gap-1.5">
                      {heatmap.slice(week * 7, week * 7 + 7).map((day, d) => {
                        const intensity = day.count === 0 ? 0
                          : day.pct >= 70 ? 4 : day.pct >= 50 ? 3 : day.pct >= 30 ? 2 : 1;
                        const bgs = [
                          "rgba(255,255,255,0.03)",
                          "rgba(200,167,93,0.15)",
                          "rgba(200,167,93,0.30)",
                          "rgba(200,167,93,0.50)",
                          "rgba(228,204,149,0.80)",
                        ];
                        const glow = intensity >= 3 ? `0 0 8px ${bgs[intensity]}` : "none";
                        return (
                          <motion.div
                            key={d}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: (week * 7 + d) * 0.005 }}
                            title={day.count > 0 ? `${new Date(day.date).toLocaleDateString("pt-BR")}: ${day.count} prova(s), ${day.pct}%` : ""}
                            className="w-3 h-3 rounded-[3px] cursor-default"
                            style={{ background: bgs[intensity], boxShadow: glow }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4 text-[10px] text-text-muted font-sans">
                  <span>Menos</span>
                  {[0,1,2,3,4].map(i => {
                    const bgs = ["rgba(255,255,255,0.03)","rgba(200,167,93,0.15)","rgba(200,167,93,0.30)","rgba(200,167,93,0.50)","rgba(228,204,149,0.80)"];
                    return <div key={i} className="w-2.5 h-2.5 rounded-[2px]" style={{ background: bgs[i] }} />;
                  })}
                  <span>Mais</span>
                </div>
              </div>
            </PremiumCard>
          </StaggerItem>

          {/* Recent history */}
          {history.length > 0 && (
            <StaggerItem>
              <PremiumCard>
                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.08]">
                      <Clock className="w-3.5 h-3.5 text-text-secondary" />
                    </div>
                    <h2 className="text-sm font-semibold text-text-primary font-sans tracking-tight">Recentes</h2>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/history")} iconRight={<ChevronRight className="w-3 h-3" />}>
                    Ver todos
                  </Button>
                </div>
                <div>
                  {history.slice(0, 5).map((e, i) => (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 px-5 py-3.5 border-b last:border-0 hover:bg-white/[0.02] transition-colors duration-200"
                      style={{ borderColor: "rgba(255,255,255,0.03)" }}
                    >
                      <div
                        className="w-1 h-8 rounded-full shrink-0"
                        style={{
                          background:
                            e.percent >= 70 ? "linear-gradient(180deg, #4ade80, #16a34a)"
                              : e.percent >= 50 ? "linear-gradient(180deg, #fbbf24, #d97706)"
                              : "linear-gradient(180deg, #f87171, #dc2626)",
                          boxShadow: e.percent >= 70 ? "0 0 8px rgba(34,197,94,0.4)" : "none",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-text-primary font-semibold font-sans tabular-nums">{e.score}/{e.total}</span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-md font-sans font-medium tracking-tight"
                            style={{
                              background: e.mode === "prova" ? "rgba(200,167,93,0.12)" : "rgba(255,255,255,0.04)",
                              color: e.mode === "prova" ? "#c8a75d" : "rgba(255,255,255,0.4)",
                              border: e.mode === "prova" ? "1px solid rgba(200,167,93,0.18)" : "1px solid rgba(255,255,255,0.05)",
                            }}
                          >
                            {e.mode}
                          </span>
                        </div>
                        <div className="text-xs text-text-muted mt-0.5 font-sans">{fmtDate(e.date)} · {fmtTime(e.timeSpent)}</div>
                      </div>
                      <div className={cn(
                        "text-xl font-bold font-mono tabular-nums",
                        e.percent >= 70 ? "text-[#22c55e]" : e.percent >= 50 ? "text-yellow-400" : "text-[#ef4444]"
                      )}>{e.percent}%</div>
                    </motion.div>
                  ))}
                </div>
              </PremiumCard>
            </StaggerItem>
          )}

          {/* Empty state */}
          {history.length === 0 && (
            <StaggerItem>
              <PremiumCard>
                <div className="p-12 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{
                      background: "linear-gradient(135deg, rgba(228,204,149,0.18), rgba(200,167,93,0.04))",
                      border: "1px solid rgba(200,167,93,0.25)",
                      boxShadow: "0 0 32px -8px rgba(200,167,93,0.4)",
                    }}
                  >
                    <Zap className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="text-xl font-sans font-semibold text-gradient-muted mb-2 tracking-tight">
                    Comece sua preparação
                  </h3>
                  <p className="text-text-secondary text-sm mb-7 font-sans max-w-xs mx-auto leading-relaxed">
                    Crie seu primeiro simulado e acompanhe sua evolução em tempo real.
                  </p>
                  <Button variant="gold" size="lg" onClick={() => navigate("/generator")} icon={<Layers className="w-4 h-4" />}>
                    Criar primeiro simulado
                  </Button>
                </div>
              </PremiumCard>
            </StaggerItem>
          )}

          {/* Reset */}
          {(history.length > 0 || usedIds.length > 0) && (
            <StaggerItem className="flex justify-center pt-2">
              <Button
                variant="ghost" size="sm"
                className="text-text-muted hover:text-[#ef4444]"
                onClick={() => { if (confirm("Resetar todo histórico e progresso?")) onReset(); }}
                icon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Resetar progresso
              </Button>
            </StaggerItem>
          )}
        </StaggerList>
      </div>
    </div>
  );
}

/* ── Reusable premium components ──────────────────────────────────── */

function PremiumCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 16px -4px rgba(0,0,0,0.35)",
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon: any }) {
  return (
    <div className="flex items-center gap-2.5 px-5 pt-5 pb-3 border-b border-white/[0.04]">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.08]">
        <Icon className="w-3.5 h-3.5 text-text-secondary" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-text-primary font-sans tracking-tight">{title}</h2>
        {subtitle && <p className="text-[11px] text-text-tertiary mt-0.5 font-sans">{subtitle}</p>}
      </div>
    </div>
  );
}
