import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Home from "./pages/Home";
import { Loading } from "./components/ui";
import AuthGate from "./components/AuthGate";

// Lazy load pages for code splitting
const LazyLearnWords = lazy(() => import("./pages/LearnWords"));
const LazySpellIt = lazy(() => import("./pages/SpellIt"));
const LazyGrammarLesson = lazy(() => import("./pages/GrammarLesson"));
const LazyMiniRead = lazy(() => import("./pages/MiniRead"));
const LazyQuiz = lazy(() => import("./pages/Quiz"));
const LazyDone = lazy(() => import("./pages/Done"));
const LazyInsights = lazy(() => import("./pages/Insights"));
const LazyCompareChildren = lazy(() => import("./pages/CompareChildren"));
const LazyMyProfile = lazy(() => import("./pages/MyProfile"));
const LazyGrammarPractice = lazy(() => import("./pages/GrammarPractice"));
import PinGate from "./pages/PinGate";

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen">
        <AuthGate>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/learn-words" element={<LazyLearnWords />} />
              <Route path="/spell-it" element={<LazySpellIt />} />
              <Route path="/grammar" element={<LazyGrammarLesson />} />
              <Route path="/read" element={<LazyMiniRead />} />
              <Route path="/quiz" element={<LazyQuiz />} />
              <Route path="/done" element={<LazyDone />} />
              <Route path="/insights" element={<PinGate><LazyInsights /></PinGate>} />
              <Route path="/compare-children" element={<PinGate><LazyCompareChildren /></PinGate>} />
              <Route path="/my-profile" element={<LazyMyProfile />} />
              <Route path="/grammar-practice" element={<LazyGrammarPractice />} />
            </Routes>
          </Suspense>
        </AuthGate>
      </div>
    </Router>
  );
}

export default App;
