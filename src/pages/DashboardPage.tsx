import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Layers, Clock, TrendingUp, Zap, BookOpen,
  ChevronRight, RotateCcw, Award, Target, Flame,
  Focus,
} from "lucide-react";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Button } from "../components/ui/Button";
import { BackgroundPaths } from "../components/ui/BackgroundPaths";
import { StaggerList, StaggerItem } from "../components/motion/StaggerList";
import { fmtDate, fmtTime, cn } from "../lib/utils";
import { DISCIPLINE_ORDER, DISC_COLORS } from "../lib/constants";
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
      className="border rounded-xl px-3 py-2.5 text-xs font-sans shadow-elevated"
      style={{ background: "rgba(17,24,39,0.95)", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <p style={{ color: "rgba(255,255,255,0.4)" }} className="mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono font-semibold">
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
    <div className="min-h-screen relative" style={{ background: "#0B0F14" }}>
      {/* BackgroundPaths — very subtle workspace ambiance */}
      <BackgroundPaths opacity={0.18} />

      {/* Content layer */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 pb-24 pt-20 md:pb-8">
        <StaggerList className="space-y-4">

          {/* Header */}
          <StaggerItem>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-xl font-sans font-semibold text-text-primary tracking-tight">
                  Seu progresso
                </h1>
                <p className="text-text-tertiary text-sm mt-0.5 font-sans">
                  {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </div>
              {streak > 0 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-sans"
                  style={{ background: "rgba(249,115,22,0.08)", borderColor: "rgba(249,115,22,0.18)", color: "#fb923c" }}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span className="font-bold">{streak}</span>
                  <span className="opacity-70">dias</span>
                </motion.div>
              )}
            </div>
          </StaggerItem>

          {/* Stat cards */}
          <StaggerItem>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { icon: Target,     label: "Média",       value: `${avg}%`,   color: "#c8a75d", sub: `${history.length} provas` },
                { icon: Award,      label: "Melhor",      value: `${best}%`,  color: "#22c55e", sub: "recorde" },
                { icon: BookOpen,   label: "Respondidas", value: totalAnswered.toLocaleString("pt-BR"), color: "#8fa5bf", sub: "questões" },
                { icon: TrendingUp, label: "Banco usado", value: `${usedPct}%`, color: "#7a60a0", sub: `${usedIds.length}q` },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.18 }}
                    className="rounded-xl p-4 border"
                    style={{
                      background: "rgba(255,255,255,0.018)",
                      borderColor: "rgba(255,255,255,0.05)",
                    }}
                  >
                    <Icon className="w-4 h-4 opacity-60 mb-2.5" style={{ color: stat.color }} />
                    <div className="text-2xl font-mono font-bold tabular-nums" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-text-tertiary uppercase tracking-wider font-sans font-medium mt-0.5">
                      {stat.label}
                    </div>
                    <div className="text-[10px] font-sans" style={{ color: "rgba(255,255,255,0.22)" }}>{stat.sub}</div>
                  </motion.div>
                );
              })}
            </div>
          </StaggerItem>

          {/* Quick actions */}
          <StaggerItem>
            <div className="grid grid-cols-2 gap-2.5">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate("/generator")}
                className="group relative flex items-center gap-4 p-4 rounded-xl border text-left overflow-hidden"
                style={{ background: "rgba(200,167,93,0.07)", borderColor: "rgba(200,167,93,0.16)" }}
              >
                <div className="absolute right-0 top-0 w-28 h-28 rounded-full pointer-events-none blur-2xl"
                  style={{ background: "rgba(200,167,93,0.06)" }} />
                <div className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
                  style={{ background: "rgba(200,167,93,0.12)", borderColor: "rgba(200,167,93,0.22)" }}>
                  <Layers className="w-4 h-4 text-gold" />
                </div>
                <div className="flex-1">
                  <div className="text-text-primary font-semibold text-sm font-sans">Novo Simulado</div>
                  <div className="text-text-muted text-xs mt-0.5 font-sans">Configurar e iniciar</div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gold opacity-50 group-hover:opacity-100 transition-opacity" />
              </motion.button>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate("/history")}
                className="group flex items-center gap-4 p-4 rounded-xl border text-left"
                style={{ background: "rgba(255,255,255,0.018)", borderColor: "rgba(255,255,255,0.05)" }}
              >
                <div className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.07)" }}>
                  <Clock className="w-4 h-4 text-text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="text-text-primary font-semibold text-sm font-sans">Histórico</div>
                  <div className="text-text-muted text-xs mt-0.5 font-sans">{history.length} simulados</div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-40 group-hover:opacity-70 transition-opacity" />
              </motion.button>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate("/bank")}
                className="group flex items-center gap-4 p-4 rounded-xl border text-left"
                style={{ background: "rgba(255,255,255,0.018)", borderColor: "rgba(255,255,255,0.05)" }}
              >
                <div className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.07)" }}>
                  <BookOpen className="w-4 h-4 text-text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="text-text-primary font-semibold text-sm font-sans">Banco de Questões</div>
                  <div className="text-text-muted text-xs mt-0.5 font-sans">{totalQuestions} questões FCC</div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-40 group-hover:opacity-70 transition-opacity" />
              </motion.button>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate("/generator")}
                className="group flex items-center gap-4 p-4 rounded-xl border text-left"
                style={{
                  background: "rgba(255,255,255,0.018)",
                  borderColor: "rgba(255,255,255,0.05)",
                }}
              >
                <div className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.07)" }}>
                  <Focus className="w-4 h-4 text-text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="text-text-primary font-semibold text-sm font-sans">Modo Foco</div>
                  <div className="text-text-muted text-xs mt-0.5 font-sans">Leitura sem distração</div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-40 group-hover:opacity-70 transition-opacity" />
              </motion.button>
            </div>
          </StaggerItem>

          {/* Trend chart */}
          {trendData.length >= 2 && (
            <StaggerItem>
              <div className="rounded-xl border overflow-hidden"
                style={{ background: "rgba(255,255,255,0.018)", borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  <h2 className="text-sm font-semibold text-text-primary font-sans">Evolução</h2>
                  <p className="text-xs text-text-tertiary mt-0.5 font-sans">Últimas {trendData.length} provas</p>
                </div>
                <div className="p-4">
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={trendData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="n" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(200,167,93,0.12)", strokeWidth: 1 }} />
                      <Line type="monotone" dataKey="%" stroke="#c8a75d" strokeWidth={1.5}
                        dot={{ fill: "#c8a75d", r: 2.5, strokeWidth: 0 }}
                        activeDot={{ fill: "#c8a75d", r: 4, strokeWidth: 2, stroke: "rgba(200,167,93,0.3)" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </StaggerItem>
          )}

          {/* Discipline breakdown */}
          {discData.length > 0 && (
            <StaggerItem>
              <div className="rounded-xl border overflow-hidden"
                style={{ background: "rgba(255,255,255,0.018)", borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  <h2 className="text-sm font-semibold text-text-primary font-sans">Por disciplina</h2>
                </div>
                <div className="p-4 space-y-2.5">
                  {discData.slice(0, 6).map((r) => (
                    <div key={r!.disc}>
                      <div className="flex justify-between text-xs mb-1 font-sans">
                        <span className="text-text-secondary">{r!.disc}</span>
                        <span className={cn("font-mono font-medium tabular-nums",
                          r!.pct >= 70 ? "text-[#22c55e]" : r!.pct >= 50 ? "text-yellow-400" : "text-[#ef4444]"
                        )}>{r!.correct}/{r!.total}</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: r!.pct >= 70 ? "#22c55e" : r!.pct >= 50 ? "#f59e0b" : "#ef4444" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${r!.pct}%` }}
                          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>
          )}

          {/* Activity heatmap */}
          <StaggerItem>
            <div className="rounded-xl border overflow-hidden"
              style={{ background: "rgba(255,255,255,0.018)", borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                <h2 className="text-sm font-semibold text-text-primary font-sans">Atividade — 63 dias</h2>
              </div>
              <div className="p-4 overflow-x-auto">
                <div className="flex gap-1 min-w-max">
                  {Array.from({ length: 9 }).map((_, week) => (
                    <div key={week} className="flex flex-col gap-1">
                      {heatmap.slice(week * 7, week * 7 + 7).map((day, d) => {
                        const intensity = day.count === 0 ? 0
                          : day.pct >= 70 ? 4 : day.pct >= 50 ? 3 : day.pct >= 30 ? 2 : 1;
                        const bgs = [
                          "rgba(255,255,255,0.03)",
                          "rgba(200,167,93,0.10)",
                          "rgba(200,167,93,0.22)",
                          "rgba(200,167,93,0.40)",
                          "rgba(200,167,93,0.65)",
                        ];
                        return (
                          <div
                            key={d}
                            title={day.count > 0 ? `${new Date(day.date).toLocaleDateString("pt-BR")}: ${day.count} prova(s), ${day.pct}%` : ""}
                            className="w-3 h-3 rounded-sm transition-colors cursor-default"
                            style={{ background: bgs[intensity] }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </StaggerItem>

          {/* Recent history */}
          {history.length > 0 && (
            <StaggerItem>
              <div className="rounded-xl border overflow-hidden"
                style={{ background: "rgba(255,255,255,0.018)", borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  <h2 className="text-sm font-semibold text-text-primary font-sans">Recentes</h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/history")} iconRight={<ChevronRight className="w-3 h-3" />}>
                    Ver todos
                  </Button>
                </div>
                <div>
                  {history.slice(0, 5).map((e, i) => (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 px-4 py-3 border-b last:border-0"
                      style={{ borderColor: "rgba(255,255,255,0.03)" }}
                    >
                      <div className={cn(
                        "w-1.5 h-7 rounded-full shrink-0",
                        e.percent >= 70 ? "bg-[#22c55e]" : e.percent >= 50 ? "bg-yellow-500" : "bg-[#ef4444]"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-text-primary font-medium font-sans">{e.score}/{e.total}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-sans"
                            style={{
                              background: e.mode === "prova" ? "rgba(200,167,93,0.1)" : "rgba(255,255,255,0.05)",
                              color: e.mode === "prova" ? "#c8a75d" : "rgba(255,255,255,0.3)",
                            }}>{e.mode}</span>
                        </div>
                        <div className="text-xs text-text-muted mt-0.5 font-sans">{fmtDate(e.date)} · {fmtTime(e.timeSpent)}</div>
                      </div>
                      <div className={cn(
                        "text-lg font-bold font-mono tabular-nums",
                        e.percent >= 70 ? "text-[#22c55e]" : e.percent >= 50 ? "text-yellow-400" : "text-[#ef4444]"
                      )}>{e.percent}%</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </StaggerItem>
          )}

          {/* Empty state */}
          {history.length === 0 && (
            <StaggerItem>
              <div className="rounded-xl border p-12 text-center"
                style={{ background: "rgba(255,255,255,0.018)", borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="w-12 h-12 rounded-xl border flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(200,167,93,0.08)", borderColor: "rgba(200,167,93,0.15)" }}>
                  <Zap className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2 font-sans">Comece sua preparação</h3>
                <p className="text-text-secondary text-sm mb-6 font-sans">
                  Crie seu primeiro simulado e acompanhe seu progresso.
                </p>
                <Button variant="primary" size="lg" onClick={() => navigate("/generator")} icon={<Layers className="w-4 h-4" />}>
                  Criar primeiro simulado
                </Button>
              </div>
            </StaggerItem>
          )}

          {/* Reset */}
          {(history.length > 0 || usedIds.length > 0) && (
            <StaggerItem className="flex justify-center">
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
