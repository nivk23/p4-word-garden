import { useNavigate, useLocation } from "react-router-dom";
import { Page, Card, Button } from "../components/ui";

export default function Done() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { score?: number; total?: number } | null;

  return (
    <Page>
      <Card className="text-center mt-6">
        <div className="text-7xl mb-4">⭐</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-secondary-dark mb-2">
          Great job!
        </h1>

        {state && state.score !== undefined && (
          <div className="my-6">
            <p className="text-5xl font-extrabold text-accent mb-1">
              {state.score} / {state.total}
            </p>
            <p className="text-ink/60 font-semibold">questions correct</p>
          </div>
        )}

        <p className="text-lg text-ink/70 mb-8">
          See you tomorrow for the next lesson! 🌙
        </p>

        <Button onClick={() => navigate("/")}>Go Home</Button>
      </Card>
    </Page>
  );
}
