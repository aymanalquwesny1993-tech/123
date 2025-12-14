import { useState } from "react";
import { Trophy, Zap } from "lucide-react";
import { Player, fetchGeminiContent } from "@/lib/tournamentUtils";

interface TournamentCompletedModalProps {
  standings: (Player & { totalScore: number })[];
  totalRounds: number;
  onNewTournament: () => void;
  onViewStandings: () => void;
}

interface SummaryReport {
  text: string;
  sources: Array<{ uri: string; title: string }>;
}

export default function TournamentCompletedModal({
  standings,
  totalRounds,
  onNewTournament,
  onViewStandings,
}: TournamentCompletedModalProps) {
  const [summaryReport, setSummaryReport] = useState<SummaryReport | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setSummaryReport(null);
    try {
      const winner = standings[0];
      const standingsString = standings
        .map((p, i) => `#${i + 1}: ${p.name} (${p.totalScore} pts)`)
        .join(", ");

      const prompt = `Write a compelling, analytical sports report (max 2 paragraphs) summarizing a ${totalRounds}-round board game tournament that just concluded.
      The champion is ${winner.name} with ${winner.totalScore} total points.
      Full final standings: ${standingsString}.
      Mention the winner's dominance or resilience. Include a fun comparison or context to a major, current professional sports event or championship (e.g., Chess, e-sports, poker, etc.) using grounded search results.`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
          parts: [
            {
              text: "Act as a professional, authoritative sports commentator for a major competitive gaming league.",
            },
          ],
        },
        tools: [{ google_search: {} }],
      };

      const result = await fetchGeminiContent(payload);
      setSummaryReport(result);
    } catch (e) {
      console.error("Summary report generation failed:", e);
      setSummaryReport({
        text: "Failed to generate the final tournament report. Please check the console for details.",
        sources: [],
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center overflow-y-auto max-h-screen">
        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Tournament Complete!
        </h2>
        <p className="text-gray-600 mb-6">The results are in.</p>

        <div className="space-y-3 mb-8">
          {standings.slice(0, 3).map((p, idx) => (
            <div
              key={p.id}
              className={`p-3 rounded-lg flex items-center justify-between ${
                idx === 0 ? "bg-yellow-100 border border-yellow-200" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`font-bold ${
                    idx === 0 ? "text-yellow-700" : "text-gray-500"
                  }`}
                >
                  #{idx + 1}
                </span>
                <span className="font-semibold">{p.name}</span>
              </div>
              <span className="font-bold">{p.totalScore} pts</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {!summaryReport && (
            <button
              onClick={handleGenerateSummary}
              disabled={summaryLoading}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {summaryLoading ? (
                "Generating Final Report..."
              ) : (
                <>✨ Generate Final Report</>
              )}
            </button>
          )}

          {summaryReport && (
            <div className="mt-4 p-4 text-left bg-gray-50 rounded-lg border border-purple-200">
              <h4 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" /> AI-Generated
                Tournament Report
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {summaryReport.text}
              </p>
              {summaryReport.sources.length > 0 && (
                <div className="mt-4 pt-2 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    Sources:
                  </p>
                  <ul className="text-xs space-y-1">
                    {summaryReport.sources.map((source, index) => (
                      <li key={index} className="text-blue-500 hover:text-blue-700 truncate">
                        <a
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={source.title}
                        >
                          {source.title || "Source Link"}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onNewTournament}
            className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            Start New Tournament
          </button>
          <button
            onClick={onViewStandings}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            View Final Standings
          </button>
        </div>
      </div>
    </div>
  );
}
