import { useNavigate, useLocation } from "react-router-dom";

export default function Done() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { score?: number; total?: number } | null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <h1 className="text-5xl font-bold text-purple-600">Great Job!</h1>

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-7xl mb-6">⭐</div>

        <h2 className="text-3xl font-bold text-blue-600 mb-4">Well Done!</h2>

        {state && state.score !== undefined && (
          <div className="mb-6">
            <p className="text-2xl font-bold text-purple-600 mb-2">
              {state.score} / {state.total}
            </p>
            <p className="text-gray-600">questions correct</p>
          </div>
        )}

        <p className="text-lg text-gray-700 mb-8">
          See you tomorrow for the next lesson!
        </p>

        <button
          onClick={() => navigate("/")}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-lg"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
