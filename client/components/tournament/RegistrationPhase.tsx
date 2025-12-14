import { useState } from "react";
import { Users, Plus, ArrowRight } from "lucide-react";
import { Player, generateId } from "@/lib/tournamentUtils";

interface RegistrationPhaseProps {
  players: Player[];
  onAddPlayers: (players: Player[]) => void;
  onRemovePlayer: (id: string) => void;
  onStartTournament: () => void;
}

export default function RegistrationPhase({
  players,
  onAddPlayers,
  onRemovePlayer,
  onStartTournament,
}: RegistrationPhaseProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAddPlayers = () => {
    const names = inputValue.split("\n").filter((n) => n.trim() !== "");
    const newPlayers = names.map((name) => ({
      id: generateId(),
      name: name.trim(),
      baseScore: 0,
      extraPoints: 0,
    }));
    onAddPlayers(newPlayers);
    setInputValue("");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Users className="w-6 h-6 text-blue-600" />
        Player Registration
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Players (One per line)
        </label>
        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-40"
          placeholder="Alice&#10;Bob&#10;Charlie..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          onClick={handleAddPlayers}
          disabled={!inputValue.trim()}
          className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Players
        </button>
      </div>

      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Registered Players ({players.length})
          </h3>
          {players.length >= 3 && (
            <button
              onClick={onStartTournament}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-lg flex items-center gap-2 transition-transform active:scale-95"
            >
              Start Tournament <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {players.map((p) => (
            <div
              key={p.id}
              className="bg-gray-50 px-3 py-2 rounded-md flex justify-between items-center group border border-gray-100"
            >
              <span className="truncate">{p.name}</span>
              <button
                onClick={() => onRemovePlayer(p.id)}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
