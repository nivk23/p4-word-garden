import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Home from "./pages/Home";

// Lazy load pages for code splitting
const LazyLearnWords = lazy(() => import("./pages/LearnWords"));
const LazySpellIt = lazy(() => import("./pages/SpellIt"));
const LazySayItStep = lazy(() => import("./pages/SayItStep"));
const LazyGrammarLesson = lazy(() => import("./pages/GrammarLesson"));
const LazyMiniRead = lazy(() => import("./pages/MiniRead"));
const LazyQuiz = lazy(() => import("./pages/Quiz"));
const LazyDone = lazy(() => import("./pages/Done"));
const LazyInsights = lazy(() => import("./pages/Insights"));
import PinGate from "./pages/PinGate";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-xl text-gray-600">Loading...</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50" style={{ fontFamily: "Nunito, sans-serif" }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learn-words" element={<LazyLearnWords />} />
            <Route path="/spell-it" element={<LazySpellIt />} />
            <Route path="/say-it" element={<LazySayItStep />} />
            <Route path="/grammar" element={<LazyGrammarLesson />} />
            <Route path="/read" element={<LazyMiniRead />} />
            <Route path="/quiz" element={<LazyQuiz />} />
            <Route path="/done" element={<LazyDone />} />
            <Route path="/insights" element={<PinGate><LazyInsights /></PinGate>} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
