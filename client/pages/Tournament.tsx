import { useState } from "react";
import { Trophy, RotateCcw } from "lucide-react";
import RegistrationPhase from "@/components/tournament/RegistrationPhase";
import RoundTab from "@/components/tournament/RoundTab";
import StandingsTab from "@/components/tournament/StandingsTab";
import ResetConfirmModal from "@/components/tournament/ResetConfirmModal";
import TournamentCompletedModal from "@/components/tournament/TournamentCompletedModal";
import {
  Player,
  Round,
  POINTS,
  getTableStructure,
  generatePairings,
} from "@/lib/tournamentUtils";

export default function Tournament() {
  const [phase, setPhase] = useState<"registration" | "active" | "completed">(
    "registration",
  );
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRoundNum, setCurrentRoundNum] = useState(1);
  const [activeTab, setActiveTab] = useState<"round" | "standings">("round");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const getPointsForRank = (rank: number) =>
    POINTS[rank as keyof typeof POINTS] || 0;

  const calculateTotalScores = () => {
    const scores: { [key: string]: number } = {};
    players.forEach((p) => (scores[p.id] = p.extraPoints || 0));

    rounds.forEach((round) => {
      round.tables.forEach((table) => {
        table.players.forEach((player) => {
          const rank = table.scores[player.id];
          if (rank) {
            scores[player.id] =
              (scores[player.id] || 0) + getPointsForRank(rank);
          }
        });
      });
    });

    return players
      .map((p) => ({
        ...p,
        totalScore: scores[p.id] || 0,
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  };

  const handleAddPlayers = (newPlayers: Player[]) => {
    setPlayers([...players, ...newPlayers]);
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  const handleStartTournament = () => {
    if (players.length < 3) {
      console.warn("Need at least 3 players to start the tournament.");
      return;
    }
    const structure = getTableStructure(players.length);
    if (!structure) return;
    const tables = generatePairings(players, structure, []);

    setRounds([{ roundNum: 1, tables, isFinal: false }]);
    setPhase("active");
    setCurrentRoundNum(1);
  };

  const handleScoreChange = (
    roundIndex: number,
    tableId: string,
    playerId: string,
    rank: string,
  ) => {
    const newRounds = [...rounds];
    const table = newRounds[roundIndex].tables.find((t) => t.id === tableId);
    if (table) {
      table.scores[playerId] = parseInt(rank);
    }
    setRounds(newRounds);
  };

  const handleUpdateExtraPoints = (playerId: string, points: number) => {
    setPlayers(
      players.map((p) =>
        p.id === playerId ? { ...p, extraPoints: points } : p,
      ),
    );
  };

  const handleNextRound = () => {
    const currentRoundData = rounds[currentRoundNum - 1];
    let allScored = true;
    currentRoundData.tables.forEach((t) => {
      if (Object.keys(t.scores).length !== t.players.length) allScored = false;
    });

    if (
      !allScored &&
      !window.confirm(
        "WARNING: Not all players have been scored. Proceed anyway?",
      )
    ) {
      return;
    }

    if (currentRoundNum < 3) {
      const structure = getTableStructure(players.length);
      if (!structure) return;
      const newTables = generatePairings(players, structure, rounds);
      setRounds([
        ...rounds,
        { roundNum: currentRoundNum + 1, tables: newTables, isFinal: false },
      ]);
      setCurrentRoundNum(currentRoundNum + 1);
    } else if (currentRoundNum === 3) {
      const standings = calculateTotalScores();
      const top4 = standings.slice(0, 4);
      const finalTable = {
        id: Math.random().toString(36).substr(2, 9),
        name: "Final Table",
        players: top4,
        scores: {},
      };
      setRounds([
        ...rounds,
        { roundNum: 4, tables: [finalTable], isFinal: true },
      ]);
      setCurrentRoundNum(4);
    } else {
      setPhase("completed");
    }
  };

  const handleResetTournament = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setPhase("registration");
    setPlayers([]);
    setRounds([]);
    setCurrentRoundNum(1);
    setShowResetConfirm(false);
    setActiveTab("round");
  };

  const standings = calculateTotalScores();
  const currentRound = rounds[currentRoundNum - 1];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans pb-10">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              TournamentOS
            </h1>
          </div>
          {phase !== "registration" && (
            <button
              onClick={handleResetTournament}
              className="px-3 py-1 text-sm text-red-500 border border-red-300 rounded-lg hover:bg-red-50 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset Tournament
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {phase === "registration" ? (
          <RegistrationPhase
            players={players}
            onAddPlayers={handleAddPlayers}
            onRemovePlayer={handleRemovePlayer}
            onStartTournament={handleStartTournament}
          />
        ) : (
          <div className="space-y-6">
            {/* Nav Tabs */}
            <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm w-fit mx-auto md:mx-0">
              <button
                onClick={() => setActiveTab("round")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "round"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Current Round
              </button>
              <button
                onClick={() => setActiveTab("standings")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "standings"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Standings
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "round" && currentRound && (
              <RoundTab
                currentRoundNum={currentRoundNum}
                round={currentRound}
                players={players}
                onScoreChange={handleScoreChange}
                onUpdateExtraPoints={handleUpdateExtraPoints}
                onNextRound={handleNextRound}
                roundIndex={currentRoundNum - 1}
              />
            )}
            {activeTab === "standings" && (
              <StandingsTab standings={standings} />
            )}
          </div>
        )}
      </main>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <ResetConfirmModal
          onConfirm={confirmReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      {/* Completion Modal */}
      {phase === "completed" && (
        <TournamentCompletedModal
          standings={standings}
          totalRounds={rounds.length}
          onNewTournament={confirmReset}
          onViewStandings={() => {
            setPhase("active");
            setActiveTab("standings");
          }}
        />
      )}
    </div>
  );
}
