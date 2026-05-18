import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { FloatingNav } from "./components/layout/FloatingNav";
import { SidePanel } from "./components/layout/SidePanel";
import { NavBar } from "./components/layout/NavBar";
import { Toast } from "./components/ui/Toast";
import { Loading } from "./components/ui/Loading";
import { AnimatedPage } from "./components/motion/AnimatedPage";
import { useQuestions } from "./hooks/useQuestions";
import { useProgress } from "./hooks/useProgress";
import LandingPage     from "./pages/LandingPage";
import DashboardPage   from "./pages/DashboardPage";
import GeneratorPage   from "./pages/GeneratorPage";
import ExamPage        from "./pages/ExamPage";
import ResultsPage     from "./pages/ResultsPage";
import HistoryPage     from "./pages/HistoryPage";
import BankPage        from "./pages/BankPage";
import FocusPage       from "./pages/FocusPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import type { Exam, ExamResult, ToastData } from "./types";

function AppRoutes() {
  const location = useLocation();

  // All hooks called at top level — never conditionally
  const { questions, loading, progress, error } = useQuestions();
  const { history, usedIds, addResult, resetHistory, streak } = useProgress();
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [lastResult,  setLastResult]  = useState<ExamResult | null>(null);
  const [toast,       setToast]       = useState<ToastData | null>(null);
  const [sideOpen,    setSideOpen]    = useState(false);

  const notify = useCallback((msg: string, type: ToastData["type"] = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const startExam = useCallback((exam: Exam) => setCurrentExam(exam), []);

  const finishExam = useCallback((result: ExamResult) => {
    addResult(result);
    setLastResult(result);
    setCurrentExam(null);
    notify(`Finalizado! ${result.score}/${result.total} — ${result.percent}%`);
  }, [addResult, notify]);

  const isLanding      = location.pathname === "/";
  const isExamOrFocus  = location.pathname === "/exam" || location.pathname === "/focus";

  return (
    <div style={{ background: "#0B0F14", minHeight: "100vh" }}>

      {/* ── FloatingNav: always present, hides on exam/focus internally ── */}
      <FloatingNav onMenuOpen={() => setSideOpen(true)} />

      {/* ── SidePanel: global hamburger overlay ─────────────────────── */}
      <SidePanel
        open={sideOpen}
        onClose={() => setSideOpen(false)}
        streak={streak}
        totalQ={questions.length}
        usedQ={usedIds.length}
        history={history}
        onReset={resetHistory}
      />

      {/* ── Content routing ──────────────────────────────────────────── */}
      {isLanding ? (
        // Landing: full-screen cinematic, FloatingNav already rendered above
        <LandingPage />

      ) : loading ? (
        <Loading progress={progress} error={error} />

      ) : (
        <>
          {/* Mobile bottom tabs — desktop handled by FloatingNav */}
          {!isExamOrFocus && <NavBar qCount={questions.length} />}

          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/app" element={
                <AnimatedPage>
                  <DashboardPage history={history} usedIds={usedIds} totalQuestions={questions.length} streak={streak} onReset={resetHistory} />
                </AnimatedPage>
              } />
              <Route path="/generator" element={
                <AnimatedPage>
                  <GeneratorPage questions={questions} usedIds={usedIds} onStartExam={startExam} />
                </AnimatedPage>
              } />
              <Route path="/exam" element={
                currentExam
                  ? <ExamPage exam={currentExam} onFinish={finishExam} />
                  : <Navigate to="/generator" replace />
              } />
              <Route path="/focus" element={
                currentExam
                  ? <FocusPage exam={currentExam} onFinish={finishExam} />
                  : <Navigate to="/generator" replace />
              } />
              <Route path="/results" element={
                <AnimatedPage>
                  <ResultsPage result={lastResult} />
                </AnimatedPage>
              } />
              <Route path="/history" element={
                <AnimatedPage>
                  <HistoryPage history={history} />
                </AnimatedPage>
              } />
              <Route path="/bank" element={
                <AnimatedPage>
                  <BankPage questions={questions} usedIds={usedIds} />
                </AnimatedPage>
              } />
              <Route path="/ai" element={
                <AnimatedPage className="h-screen">
                  <AIAssistantPage />
                </AnimatedPage>
              } />
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
          </AnimatePresence>

          <Toast toast={toast} onClose={() => setToast(null)} />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
