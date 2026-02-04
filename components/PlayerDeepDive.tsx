import React from 'react';
import { Player } from '../types';
import { X, TrendingUp, Target, Activity, Award } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface PlayerDeepDiveProps {
  player: Player;
  opponentName: string;
  onClose: () => void;
}

export const PlayerDeepDive: React.FC<PlayerDeepDiveProps> = ({ player, opponentName, onClose }) => {
  // Safe defaults
  const s = player.seasonStats || {};
  const v = player.vsOpponentStats || {};
  const a = player.advanced || {};

  const radarData = [
    { subject: 'PTS', A: s.ppg || 0, fullMark: 30 },
    { subject: 'REB', A: s.rpg || 0, fullMark: 15 },
    { subject: 'AST', A: s.apg || 0, fullMark: 12 },
    { subject: 'PER', A: a.per || 0, fullMark: 30 },
    { subject: 'USG', A: a.usg || 0, fullMark: 40 },
    { subject: 'TS%', A: (a.ts || 0) * 100, fullMark: 100 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden border border-slate-200 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="relative h-48 bg-slate-900 overflow-hidden flex-shrink-0">
             <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-raptors-red/30"></div>
             <img 
                src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${player.id}.png`} 
                className="absolute bottom-0 right-10 h-[120%] object-contain drop-shadow-2xl" 
                alt={player.name}
             />
             <div className="absolute top-0 left-0 p-8">
                 <button onClick={onClose} className="mb-4 text-slate-400 hover:text-white flex items-center gap-2">
                    <X className="w-5 h-5" /> Close Scouting Report
                 </button>
                 <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">{player.name}</h2>
                 <div className="flex gap-4 mt-2 text-xl font-mono text-slate-300">
                    <span>#{player.number}</span>
                    <span>|</span>
                    <span>{player.position}</span>
                 </div>
             </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Col 1: Season Overview */}
               <div className="space-y-6">
                   <h3 className="flex items-center gap-2 text-raptors-red font-bold uppercase tracking-widest border-b border-slate-100 pb-2">
                       <Activity className="w-4 h-4" /> Season Averages
                   </h3>
                   <div className="grid grid-cols-2 gap-4">
                       <StatBox label="PPG" value={s.ppg} />
                       <StatBox label="RPG" value={s.rpg} sub={`${s.oreb || 0} Off / ${s.dreb || 0} Def`} />
                       <StatBox label="APG" value={s.apg} />
                       <StatBox label="+/-" value={s.plusMinus} color={s.plusMinus > 0 ? 'text-green-600' : 'text-red-600'} />
                       <StatBox label="FG%" value={`${s.fgPct}%`} />
                       <StatBox label="3P%" value={`${s.threePtPct}%`} />
                   </div>
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <div className="text-xs text-slate-500 uppercase mb-2 font-bold">Efficiency Metrics</div>
                       <div className="flex justify-between items-center text-sm mb-1">
                           <span className="text-slate-700">PER</span>
                           <span className="font-bold text-slate-900">{a.per}</span>
                       </div>
                       <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                           <div className="bg-raptors-red h-full" style={{width: `${(a.per/35)*100}%`}}></div>
                       </div>
                       
                       <div className="flex justify-between items-center text-sm mt-3 mb-1">
                           <span className="text-slate-700">True Shooting</span>
                           <span className="font-bold text-slate-900">{a.ts}%</span>
                       </div>
                       <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                           <div className="bg-blue-500 h-full" style={{width: `${a.ts}%`}}></div>
                       </div>
                   </div>
               </div>

               {/* Col 2: Vs Opponent */}
               <div className="space-y-6">
                   <h3 className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest border-b border-slate-100 pb-2">
                       <Target className="w-4 h-4" /> VS {opponentName}
                   </h3>
                   <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                       <div className="text-center mb-6">
                           <div className="text-4xl font-black text-slate-900 mb-1">{v.ppg || '-'}</div>
                           <div className="text-xs text-blue-600 uppercase font-bold">Points vs {opponentName}</div>
                       </div>
                       <div className="space-y-4">
                           <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                               <span className="text-slate-500 text-sm font-medium">Rebounds</span>
                               <span className="font-mono font-bold text-slate-900">{v.rpg || '-'}</span>
                           </div>
                           <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                               <span className="text-slate-500 text-sm font-medium">Assists</span>
                               <span className="font-mono font-bold text-slate-900">{v.apg || '-'}</span>
                           </div>
                           <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                               <span className="text-slate-500 text-sm font-medium">Turnovers</span>
                               <span className="font-mono font-bold text-slate-900">{v.turnovers || '-'}</span>
                           </div>
                       </div>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-600 italic leading-relaxed">
                            "{player.analysis || `Key player for the rotation against ${opponentName}. Watch for matchup exploitation.`}"
                        </p>
                   </div>
               </div>

               {/* Col 3: Visuals */}
               <div className="space-y-6">
                   <h3 className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-widest border-b border-slate-100 pb-2">
                       <TrendingUp className="w-4 h-4" /> Impact Profile
                   </h3>
                   <div className="h-64 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                               <PolarGrid stroke="#e2e8f0" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                               <PolarRadiusAxis angle={30} domain={[0, 'fullMark']} tick={false} axisLine={false} />
                               <Radar name={player.name} dataKey="A" stroke="#CE1141" fill="#CE1141" fillOpacity={0.6} />
                               <Tooltip 
                                 contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                 itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                               />
                           </RadarChart>
                       </ResponsiveContainer>
                   </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, sub, color }: any) => (
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
        <div className="text-[10px] text-slate-400 uppercase font-bold">{label}</div>
        <div className={`text-xl font-mono font-bold ${color || 'text-slate-900'}`}>{value !== undefined ? value : '-'}</div>
        {sub && <div className="text-[10px] text-slate-500 mt-1">{sub}</div>}
    </div>
);
