import React from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';

interface MainMenuProps {
  onNewGame: () => void;
  onContinue: () => void;
  hasSave: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onNewGame, onContinue, hasSave }) => {
  return (
    <div className="fixed inset-0 bg-dark-950 flex flex-col items-center justify-center p-4 z-50 animate-fade-in">
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-hextech-500 shadow-[0_0_30px_rgba(14,165,233,0.3)]">
           <Trophy size={48} className="text-hextech-400" />
        </div>
        <h1 className="text-6xl font-display font-bold text-white mb-2 tracking-tighter">LCK MANAGER</h1>
        <p className="text-xl text-gray-400 tracking-widest uppercase">2025 Season Edition</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {/* Devam Et Butonu */}
        <button
          onClick={onContinue}
          disabled={!hasSave}
          className={`group relative p-6 rounded-xl border-2 text-left transition-all duration-300
            ${hasSave 
              ? 'bg-dark-900 border-hextech-600 hover:bg-hextech-900/20 hover:border-hextech-400 cursor-pointer shadow-lg shadow-hextech-900/10' 
              : 'bg-dark-900/50 border-dark-800 opacity-50 cursor-not-allowed'}`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className={`text-xl font-bold ${hasSave ? 'text-white group-hover:text-hextech-300' : 'text-gray-500'}`}>
                CONTINUE
              </h3>
              <p className="text-sm text-gray-500">Resume your last save</p>
            </div>
            {hasSave && <Play className="text-hextech-500 group-hover:translate-x-1 transition-transform" size={24} fill="currentColor" />}
          </div>
        </button>

        {/* Yeni Oyun Butonu */}
        <button
          onClick={() => {
            if (hasSave && !window.confirm("Starting a new game will overwrite your current save. Are you sure?")) return;
            onNewGame();
          }}
          className="group relative p-6 rounded-xl border-2 border-dark-700 bg-dark-900 hover:border-gold-500 hover:bg-gold-500/10 text-left transition-all duration-300"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-gold-400">NEW GAME</h3>
              <p className="text-sm text-gray-500">Start a new career</p>
            </div>
            <RotateCcw className="text-gray-500 group-hover:text-gold-400 group-hover:rotate-180 transition-transform duration-500" size={24} />
          </div>
        </button>
      </div>
      
      <div className="mt-12 text-gray-600 text-sm font-mono">
        v0.2.1 • Offline Mode • Auto-Save Enabled
      </div>
    </div>
  );
};