import React, { useState } from 'react';
import { PlayerCard, Role } from '../src/types/types';
import { Card } from './Card';
import { Dumbbell, Brain, Target, Zap, Users, ArrowUp, Lock, Shield } from 'lucide-react';

interface TrainingViewProps {
  roster: Record<Role, PlayerCard | null>;
  inventory: PlayerCard[];
  coins: number;
  trainingSlotsUsed: number;
  onTrainPlayer: (playerId: string, activityId: string, cost: number, stats: Partial<PlayerCard['stats']>) => void;
}

const MAX_WEEKLY_SLOTS = 3;

const ACTIVITIES = [
  {
    id: 'soloq',
    name: 'Solo Queue Grind',
    description: 'Intense mechanical practice in Ranked.',
    cost: 50,
    slots: 1,
    icon: <Zap className="text-yellow-400" />,
    gains: { mechanics: 2, lane: 1 },
    risk: 'Low'
  },
  {
    id: 'vods',
    name: 'VOD Review',
    description: 'Analyzing past games to improve decision making.',
    cost: 100,
    slots: 1,
    icon: <Brain className="text-blue-400" />,
    gains: { macro: 2, teamfight: 1 },
    risk: 'None'
  },
  {
    id: '1v1',
    name: '1v1 Drills',
    description: 'Laning phase simulation against a coach.',
    cost: 150,
    slots: 1,
    icon: <Target className="text-red-400" />,
    gains: { lane: 3 },
    risk: 'Low'
  },
  {
    id: 'scrim',
    name: 'Private Scrim Block',
    description: 'High intensity team practice.',
    cost: 500,
    slots: 2,
    icon: <Users className="text-green-400" />,
    gains: { mechanics: 1, macro: 1, lane: 1, teamfight: 1 },
    risk: 'Medium'
  }
];

export const TrainingView: React.FC<TrainingViewProps> = ({ roster, inventory, coins, trainingSlotsUsed, onTrainPlayer }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerCard | null>(null);

  const starters = Object.values(roster).filter((p): p is PlayerCard => p !== null);
  const bench = inventory;

  const handleTrain = (activity: typeof ACTIVITIES[0]) => {
    if (!selectedPlayer) return;
    if (coins < activity.cost) return;
    if (trainingSlotsUsed + activity.slots > MAX_WEEKLY_SLOTS) return;

    onTrainPlayer(selectedPlayer.id, activity.id, activity.cost, activity.gains);
    setSelectedPlayer(null);
  };

  const slotsRemaining = MAX_WEEKLY_SLOTS - trainingSlotsUsed;

  const renderPlayerItem = (p: PlayerCard, isStarter: boolean) => (
    <div 
      key={p.id}
      onClick={() => setSelectedPlayer(p)}
      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3
        ${selectedPlayer?.id === p.id 
           ? 'bg-hextech-600/20 border-hextech-500 shadow-[0_0_15px_rgba(14,165,233,0.3)]' 
           : 'bg-dark-950 border-dark-800 hover:border-gray-600'}`}
    >
       <div className="w-10 h-10 rounded-full overflow-hidden bg-black/50 border border-white/10 shrink-0 relative">
          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover grayscale" />
          {isStarter && (
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border border-black rounded-full" title="Starter"></div>
          )}
       </div>
       <div className="flex-1 min-w-0">
          <div className="flex justify-between">
             <span className={`font-bold truncate ${selectedPlayer?.id === p.id ? 'text-hextech-300' : 'text-white'}`}>{p.name}</span>
             <span className="font-mono text-xs text-gray-500">{p.role}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
             <span>OVR: <span className="text-white font-bold">{p.overall}</span></span>
             <span className="text-dark-700">|</span>
             <span>Age: {p.age}</span>
          </div>
       </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-dark-900 p-6 rounded-2xl border border-dark-800">
        <div>
          <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Dumbbell className="text-hextech-400" /> Training Center
          </h2>
          <p className="text-gray-400">Develop your team's skills through focused practice sessions.</p>
        </div>
        <div className="bg-dark-950 px-6 py-3 rounded-xl border border-dark-700 flex items-center gap-6">
           <div className="text-center">
              <div className="text-xs text-gray-500 font-bold uppercase">Weekly Slots</div>
              <div className={`text-2xl font-mono font-bold ${slotsRemaining > 0 ? 'text-green-400' : 'text-red-500'}`}>
                {slotsRemaining} <span className="text-gray-600 text-lg">/ {MAX_WEEKLY_SLOTS}</span>
              </div>
           </div>
           <div className="w-px h-10 bg-dark-800"></div>
           <div className="text-center">
              <div className="text-xs text-gray-500 font-bold uppercase">Budget</div>
              <div className="text-xl font-mono font-bold text-gold-400">
                {coins} G
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Player Selection List */}
        <div className="lg:col-span-1 bg-dark-900 border border-dark-800 rounded-2xl p-4 overflow-hidden flex flex-col h-[600px]">
           <h3 className="text-lg font-bold text-white mb-4 px-2">Your Roster</h3>
           <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              
              {/* Starters */}
              <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase px-2 mb-2 flex items-center gap-2 border-b border-white/5 pb-1">
                     <Shield size={12} /> Starting Lineup
                  </h4>
                  <div className="space-y-2">
                      {starters.length === 0 && <div className="text-xs text-gray-600 px-2 italic">No starters assigned.</div>}
                      {starters.map(p => renderPlayerItem(p, true))}
                  </div>
              </div>

              {/* Bench */}
              <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase px-2 mb-2 flex items-center gap-2 border-b border-white/5 pb-1">
                     <Users size={12} /> Bench
                  </h4>
                  <div className="space-y-2">
                      {bench.length === 0 && <div className="text-xs text-gray-600 px-2 italic">Bench is empty.</div>}
                      {bench.map(p => renderPlayerItem(p, false))}
                  </div>
              </div>

           </div>
        </div>

        {/* Training Area */}
        <div className="lg:col-span-2">
           {selectedPlayer ? (
             <div className="space-y-6 animate-fade-in">
                {/* Selected Player Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="md:col-span-1">
                      <Card player={selectedPlayer} isOwned disabled />
                   </div>
                   <div className="md:col-span-2 bg-dark-900 border border-dark-800 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4">Available Activities</h3>
                      
                      {slotsRemaining <= 0 ? (
                         <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl text-center flex flex-col items-center gap-2">
                            <Lock size={24} />
                            <span className="font-bold">No Training Slots Remaining This Week</span>
                            <span className="text-xs">Wait for next week to train again.</span>
                         </div>
                      ) : (
                         <div className="grid grid-cols-1 gap-3">
                            {ACTIVITIES.map(activity => {
                               const canAfford = coins >= activity.cost;
                               const hasSlots = slotsRemaining >= activity.slots;
                               const isDisabled = !canAfford || !hasSlots;

                               return (
                                  <button
                                    key={activity.id}
                                    onClick={() => handleTrain(activity)}
                                    disabled={isDisabled}
                                    className={`relative flex items-center gap-4 p-4 rounded-xl border text-left transition-all group
                                       ${isDisabled 
                                          ? 'bg-dark-950 border-dark-800 opacity-50 cursor-not-allowed' 
                                          : 'bg-dark-950 border-dark-700 hover:border-hextech-500 hover:bg-hextech-900/10'}`}
                                  >
                                     <div className={`p-3 rounded-lg ${isDisabled ? 'bg-dark-900 text-gray-600' : 'bg-dark-900 text-white group-hover:scale-110 transition-transform'}`}>
                                        {activity.icon}
                                     </div>
                                     <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                           <span className="font-bold text-white">{activity.name}</span>
                                           <div className="flex items-center gap-3">
                                              <span className="text-xs font-bold text-gray-500 uppercase">{activity.slots} Slot{activity.slots > 1 && 's'}</span>
                                              <span className={`text-sm font-mono font-bold ${canAfford ? 'text-gold-400' : 'text-red-500'}`}>
                                                 {activity.cost} G
                                              </span>
                                           </div>
                                        </div>
                                        <p className="text-xs text-gray-400">{activity.description}</p>
                                        <div className="flex gap-2 mt-2">
                                           {Object.entries(activity.gains).map(([stat, val]) => (
                                              <span key={stat} className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                                                 +{val} {stat}
                                              </span>
                                           ))}
                                        </div>
                                     </div>
                                     <ArrowUp className={`absolute right-4 bottom-4 text-hextech-500 opacity-0 group-hover:opacity-100 transition-all ${isDisabled ? 'hidden' : ''}`} />
                                  </button>
                               )
                            })}
                         </div>
                      )}
                   </div>
                </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center bg-dark-900/50 border border-dashed border-dark-800 rounded-2xl text-gray-500 p-10">
                <Target size={48} className="mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">No Player Selected</h3>
                <p>Select a player from your roster to assign training.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};