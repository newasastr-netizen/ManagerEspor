import React, { useState, useMemo } from 'react';
import { GameState, TeamData, PlayerCard, Role } from '../types';
import { Card } from './Card';
import { TeamLogo } from './TeamLogo';

interface TeamStatsViewProps {
  teams: TeamData[];
  userTeamId: string;
  userRoster: GameState['roster'];
  aiRosters: GameState['aiRosters'];
}

export const TeamStatsView: React.FC<TeamStatsViewProps> = ({ teams, userTeamId, userRoster, aiRosters }) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(userTeamId);

  const getTeamPower = (roster: Record<Role, PlayerCard | null>): number => {
    const players = Object.values(roster).filter((p): p is PlayerCard => p !== null && p.role !== Role.COACH);
    if (players.length === 0) return 0;
    return Math.round(players.reduce((acc, p) => acc + p.overall, 0) / players.length);
  };

  const selectedRoster = useMemo(() => {
    if (selectedTeamId === userTeamId) {
      return userRoster;
    }
    return aiRosters[selectedTeamId] || null;
  }, [selectedTeamId, userTeamId, userRoster, aiRosters]);

  const selectedTeamData = useMemo(() => {
    return teams.find(t => t.id === selectedTeamId);
  }, [selectedTeamId, teams]);

  const allTeamStats = teams.map(team => {
    const roster = team.id === userTeamId ? userRoster : aiRosters[team.id];
    const power = roster ? getTeamPower(roster) : 0;
    const players = roster ? Object.values(roster).filter((p): p is PlayerCard => p !== null && p.role !== Role.COACH) : [];
    const avgAge = players.length > 0 ? players.reduce((acc, p) => acc + p.age, 0) / players.length : 0;
    return {
      id: team.id,
      name: team.name,
      power,
      avgAge,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-dark-900 border border-dark-800 rounded-xl p-6">
        <h2 className="text-2xl font-bold font-display text-white mb-6">League Power Rankings</h2>
        <table className="w-full text-sm text-left">
          <thead className="bg-dark-950 text-gray-500 font-bold uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3 text-center">Power</th>
              <th className="px-4 py-3 text-center">Avg. Age</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800">
            {allTeamStats.sort((a, b) => b.power - a.power).map((stat, index) => (
              <tr key={stat.id} onClick={() => setSelectedTeamId(stat.id)} className={`cursor-pointer transition-colors ${selectedTeamId === stat.id ? 'bg-hextech-600/10' : 'hover:bg-dark-800/50'}`}>
                <td className="px-4 py-3 font-mono text-gray-500">{index + 1}</td>
                <td className="px-4 py-3 font-bold text-white">{stat.name}</td>
                <td className="px-4 py-3 text-center font-mono font-bold text-lg text-blue-400">{stat.power}</td>
                <td className="px-4 py-3 text-center font-mono text-gray-400">{stat.avgAge.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          {selectedTeamData && <TeamLogo team={selectedTeamData} size="w-10 h-10" />}
          <h2 className="text-2xl font-bold font-display text-white">
            {selectedTeamData?.name || 'Select a Team'}
          </h2>
        </div>

        <div className="space-y-2">
          {selectedRoster ? (
            Object.values(Role).filter(r => r !== Role.COACH).map(role => {
              const player = selectedRoster[role];
              return (
                <div key={role} className="transition-transform hover:scale-[1.02]">
                  {player ? (
                    <Card player={player} team={selectedTeamData} compact isOwned={selectedTeamId === userTeamId} />
                  ) : (
                    <div className="h-16 border-2 border-dashed border-dark-700 rounded-lg flex items-center justify-center text-gray-600 font-bold bg-dark-900/50">
                      Vacant {role}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 italic py-8">No roster data available for this team.</p>
          )}
        </div>
      </div>
    </div>
  );
};