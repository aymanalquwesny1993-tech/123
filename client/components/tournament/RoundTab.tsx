import { useState } from "react";
import {
  Shuffle,
  Trophy,
  Table as TableIcon,
  ArrowRight,
  Zap,
} from "lucide-react";
import {
  POINTS,
  ROUND_NAMES,
  Round,
  Player,
  fetchGeminiContent,
} from "@/lib/tournamentUtils";

interface RoundTabProps {
  currentRoundNum: number;
  round: Round;
  players: Player[];
  onScoreChange: (
    roundIndex: number,
    tableId: string,
    playerId: string,
    rank: string,
  ) => void;
  onUpdateExtraPoints: (playerId: string, points: number) => void;
  onNextRound: () => void;
  roundIndex: number;
}

export default function RoundTab({
  currentRoundNum,
  round,
  players,
  onScoreChange,
  onUpdateExtraPoints,
  onNextRound,
  roundIndex,
}: RoundTabProps) {
  const [hypeText, setHypeText] = useState<string | null>(null);
  const [hypeLoading, setHypeLoading] = useState(false);

  const handleGenerateHypeText = async () => {
    setHypeLoading(true);
    setHypeText(null);
    try {
      // Calculate standings for context
      const scores: { [key: string]: number } = {};
      players.forEach((p) => (scores[p.id] = p.extraPoints || 0));

      // This would need access to all rounds data - for now, simplified
      const currentStandings = players
        .map((p) => ({
          name: p.name,
          score: scores[p.id],
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      const tableDescriptions = round.tables
        .map(
          (t, i) =>
            `Table ${i + 1} (${t.players.length} players): ${t.players.map((p) => p.name).join(", ")}`,
        )
        .join("; ");

      const prompt = `You are a dramatic sports announcer. Generate a short, exciting, single paragraph blurb (max 4 sentences) for the start of ${ROUND_NAMES[currentRoundNum]} in a board game tournament.
      Current top 5 players and scores: ${JSON.stringify(currentStandings)}.
      Current pairings: ${tableDescriptions}.
      Focus on rivalries, the tension of the current round, and the top players' pursuit of victory. Do NOT include any citations.`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
          parts: [
            {
              text: "Act as a highly dramatic, enthusiastic tournament commentator.",
            },
          ],
        },
        tools: [],
      };

      const result = await fetchGeminiContent(payload);
      setHypeText(result.text);
    } catch (e) {
      console.error("Hype text generation failed:", e);
      setHypeText(
        "Failed to generate hype text. Please check your Gemini API key.",
      );
    } finally {
      setHypeLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-lg shadow-sm gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          {round.isFinal ? (
            <Trophy className="w-6 h-6 text-yellow-500" />
          ) : (
            <Shuffle className="w-6 h-6 text-blue-600" />
          )}
          {ROUND_NAMES[currentRoundNum]}
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleGenerateHypeText}
            disabled={hypeLoading}
            className="px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 shadow-md flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {hypeLoading ? "Generating..." : <>✨ Generate Hype Text</>}
          </button>
          <button
            onClick={onNextRound}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md flex items-center gap-2"
          >
            {currentRoundNum === 4 ? "Finish Tournament" : "Next Round"}{" "}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {hypeText && (
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-lg shadow-inner animate-in fade-in duration-500">
          <p className="text-sm italic text-indigo-800 leading-relaxed whitespace-pre-wrap">
            &ldquo;{hypeText}&rdquo;
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {round.tables.map((table) => (
          <div
            key={table.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          >
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <TableIcon className="w-4 h-4" /> {table.name}
              </h3>
              <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-200 rounded-full">
                {table.players.length} Players
              </span>
            </div>
            <div className="p-4 space-y-3">
              {table.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="font-medium text-gray-700 flex-1 truncate">
                    {player.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {parseInt(table.scores[player.id] || "0") === 1 && (
                      <div className="flex items-center gap-1 mr-1 animate-in fade-in slide-in-from-right-4 duration-300">
                        <span className="text-xs font-medium text-green-600">
                          Bonus:
                        </span>
                        <input
                          type="number"
                          className="w-16 p-1.5 text-sm border rounded-md border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500 text-right shadow-sm"
                          value={
                            players.find((p) => p.id === player.id)
                              ?.extraPoints || 0
                          }
                          onChange={(e) =>
                            onUpdateExtraPoints(
                              player.id,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                    )}
                    <select
                      className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-gray-50 border"
                      value={table.scores[player.id] || ""}
                      onChange={(e) =>
                        onScoreChange(
                          roundIndex,
                          table.id,
                          player.id,
                          e.target.value,
                        )
                      }
                    >
                      <option value="">Rank...</option>
                      <option value="1">1st (7pts)</option>
                      <option value="2">2nd (4pts)</option>
                      <option value="3">3rd (3pts)</option>
                      {table.players.length >= 4 && (
                        <option value="4">4th (1pt)</option>
                      )}
                      {table.players.length >= 5 && (
                        <option value="5">5th (0pts)</option>
                      )}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
