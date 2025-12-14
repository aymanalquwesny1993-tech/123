import { Medal } from "lucide-react";
import { Player } from "@/lib/tournamentUtils";

interface StandingsTabProps {
  standings: (Player & { totalScore: number })[];
}

export default function StandingsTab({ standings }: StandingsTabProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Medal className="w-5 h-5" /> Live Standings
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Rank
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                Player
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">
                Base Points
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">
                Extra
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {standings.map((p, idx) => (
              <tr
                key={p.id}
                className={`hover:bg-gray-50 ${idx < 4 ? "bg-yellow-50/30" : ""}`}
              >
                <td className="px-6 py-3 text-sm font-medium text-gray-600">
                  #{idx + 1}
                </td>
                <td className="px-6 py-3 text-sm font-semibold text-gray-800">
                  {p.name}
                </td>
                <td className="px-6 py-3 text-sm text-gray-600 text-right">
                  {p.totalScore - (p.extraPoints || 0)}
                </td>
                <td className="px-6 py-3 text-sm text-gray-500 text-right">
                  {p.extraPoints > 0 ? `+${p.extraPoints}` : "-"}
                </td>
                <td className="px-6 py-3 text-sm font-bold text-indigo-600 text-right">
                  {p.totalScore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
