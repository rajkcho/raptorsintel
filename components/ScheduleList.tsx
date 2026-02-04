import React from 'react';
import { Game } from '../types';
import { Calendar } from 'lucide-react';

interface ScheduleListProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
  selectedGameId?: string;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({ games, onSelectGame, selectedGameId }) => {
  
  const formatDate = (dateStr: string) => {
    try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
             return {
                 month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
                 day: d.getDate().toString()
             };
        }
    } catch(e) {}

    const parts = dateStr.trim().split(' ');
    if (parts.length >= 2) {
         return {
             month: parts[0].slice(0, 3).toUpperCase(),
             day: parts[1].replace(/[^0-9]/g, '') || '?'
         };
    }
    return { month: 'GAME', day: '' };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
      <div className="p-3 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight">
          <Calendar className="text-raptors-red w-4 h-4" />
          25-26 Schedule
        </h2>
      </div>
      
      <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
        {games.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-xs animate-pulse">Loading...</div>
        ) : (
          games.map((game) => {
            const { month, day } = formatDate(game.date);
            const isSelected = selectedGameId === game.id;
            
            return (
            <div
              key={game.id}
              onClick={() => onSelectGame(game)}
              className={`px-3 py-2 cursor-pointer transition-all hover:bg-slate-50 group relative ${
                isSelected ? 'bg-slate-100' : ''
              }`}
            >
              {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-raptors-red"></div>}
              
              <div className="flex items-center gap-2">
                 {/* Date Box - Compressed */}
                 <div className="flex-shrink-0 w-8 text-center">
                    <div className="text-[9px] uppercase font-bold text-slate-400 leading-none">{month}</div>
                    <div className="text-sm font-black text-slate-800 leading-none mt-0.5">{day}</div>
                 </div>

                 {/* Matchup */}
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-[10px] font-bold uppercase ${game.isHome ? 'text-slate-400' : 'text-slate-500'}`}>{game.isHome ? 'VS' : '@'}</span>
                        <div className="flex items-center gap-1.5 min-w-0">
                             {game.opponentId ? (
                                 <img src={`https://cdn.nba.com/logos/nba/${game.opponentId}/primary/L/logo.svg`} className="w-4 h-4 object-contain" alt={game.opponent} />
                             ) : (
                                 <div className="w-4 h-4 rounded-full bg-slate-200"></div>
                             )}
                             <span className="font-bold text-slate-900 text-xs truncate leading-none">{game.opponent}</span>
                        </div>
                    </div>
                 </div>

                 {/* Status/Result */}
                 <div className="text-right">
                    {game.status === 'completed' && game.result ? (
                        <div className={`text-[10px] font-bold ${game.result.startsWith('W') ? 'text-green-600' : 'text-red-600'}`}>{game.result}</div>
                    ) : game.status === 'live' ? (
                        <div className="text-[9px] bg-raptors-red text-white px-1.5 py-0.5 rounded animate-pulse">LIVE</div>
                    ) : (
                        <div className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">UP</div>
                    )}
                 </div>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
};
