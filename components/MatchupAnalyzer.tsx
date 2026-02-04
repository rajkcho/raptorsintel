import React, { useEffect, useState } from 'react';
import { Game, MatchupAnalysis, Player, Play } from '../types';
import { analyzeGameMatchup } from '../services/gemini';
import { Brain, Trophy, Activity, Shield, Zap, RotateCcw, ChevronRight, LayoutTemplate, MessageSquare, AlertTriangle, TrendingUp, Radio, Users, Heart, Share, MessageCircle, MoveVertical, RefreshCcw, BarChart3, ArrowUpDown, Swords, Info } from 'lucide-react';
import { CourtDiagram } from './CourtDiagram';
import { PlayerDeepDive } from './PlayerDeepDive';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface MatchupAnalyzerProps {
  game: Game;
}

export const MatchupAnalyzer: React.FC<MatchupAnalyzerProps> = ({ game }) => {
  const [analysis, setAnalysis] = useState<MatchupAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Interactive Lineup State
  const [activeRaptorsLineup, setActiveRaptorsLineup] = useState<Player[]>([]);
  const [activeOpponentLineup, setActiveOpponentLineup] = useState<Player[]>([]);
  
  // Bench Pools
  const [raptorsBench, setRaptorsBench] = useState<Player[]>([]);
  const [opponentBench, setOpponentBench] = useState<Player[]>([]);

  // Selection for Swapping
  const [selectedSlot, setSelectedSlot] = useState<{team: 'raptors'|'opponent', index: number} | null>(null);

  // Playbook State
  const [selectedPlay, setSelectedPlay] = useState<Play | null>(null);

  // Deep Dive Modal
  const [selectedPlayerForDeepDive, setSelectedPlayerForDeepDive] = useState<Player | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchAnalysis = async () => {
      setLoading(true);
      setAnalysis(null);
      const result = await analyzeGameMatchup(game.opponent);
      if (mounted && result.analysis) {
        setAnalysis(result.analysis);
        
        const raptors = result.analysis.raptorsRoster || [];
        const opponents = result.analysis.opponentRoster || [];

        // Initial Lineups (First 5)
        const rapStarters = raptors.slice(0, 5);
        const oppStarters = opponents.slice(0, 5);

        setActiveRaptorsLineup(rapStarters);
        setActiveOpponentLineup(oppStarters);
        
        setRaptorsBench(raptors.filter(p => !rapStarters.find(s => s.id === p.id)));
        setOpponentBench(opponents.filter(p => !oppStarters.find(s => s.id === p.id)));
        
        // Default play
        if (result.analysis.playbook?.length > 0) {
            setSelectedPlay(result.analysis.playbook[0]);
        }
        setLoading(false);
      }
    };
    fetchAnalysis();
    return () => { mounted = false; };
  }, [game]);

  const handleBenchClick = (player: Player, team: 'raptors' | 'opponent') => {
      // If a slot is selected on the court, swap
      if (selectedSlot && selectedSlot.team === team) {
          if (team === 'raptors') {
              const currentActive = activeRaptorsLineup[selectedSlot.index];
              const newActive = [...activeRaptorsLineup];
              newActive[selectedSlot.index] = player;
              setActiveRaptorsLineup(newActive);
              
              setRaptorsBench(prev => [...prev.filter(p => p.id !== player.id), currentActive]);
          } else {
              const currentActive = activeOpponentLineup[selectedSlot.index];
              const newActive = [...activeOpponentLineup];
              newActive[selectedSlot.index] = player;
              setActiveOpponentLineup(newActive);

              setOpponentBench(prev => [...prev.filter(p => p.id !== player.id), currentActive]);
          }
          setSelectedSlot(null);
      } else {
          // Optional: Show detail or prompt to select slot first
      }
  };

  const applyRaptorsPreset = (presetName: string) => {
      if (!analysis) return;
      const allRaptors = analysis.raptorsRoster || [];
      let newActive: Player[] = [];

      if (presetName === 'starters') {
        newActive = allRaptors.slice(0, 5);
      } else if (presetName === 'second') {
        newActive = allRaptors.slice(5, 10);
        if (newActive.length < 5) {
          const needed = 5 - newActive.length;
          const others = allRaptors.filter(p => !newActive.includes(p)).slice(0, needed);
          newActive = [...newActive, ...others];
        }
      } else if (presetName === 'speed') {
        newActive = [...allRaptors].filter(p => p.position.includes('G') || p.position.includes('SF')).slice(0, 5);
        if (newActive.length < 5) {
          const needed = 5 - newActive.length;
          const others = allRaptors.filter(p => !newActive.includes(p)).slice(0, needed);
          newActive = [...newActive, ...others];
        }
      } else if (presetName === 'big') {
        newActive = [...allRaptors].filter(p => p.position.includes('C') || p.position.includes('PF') || p.position.includes('F')).slice(0, 5);
        if (newActive.length < 5) {
          const needed = 5 - newActive.length;
          const others = allRaptors.filter(p => !newActive.includes(p)).slice(0, needed);
          newActive = [...newActive, ...others];
        }
      }

      if (newActive.length < 5) {
        newActive = allRaptors.slice(0, 5);
      }

      setActiveRaptorsLineup(newActive.slice(0, 5));
      setRaptorsBench(allRaptors.filter(p => !newActive.find(a => a.id === p.id)));
      setSelectedSlot(null);
  };

  const applyPreset = (presetName: string) => {
      if (!analysis || !analysis.lineupPresets) return;
      
      const allOpponents = analysis.opponentRoster || [];
      let newActive: Player[] = [];

      // Find preset
      const preset = analysis.lineupPresets.find(p => p.name.toLowerCase().includes(presetName.toLowerCase()));

      if (preset && preset.playerIds && preset.playerIds.length > 0) {
         newActive = allOpponents.filter(p => preset.playerIds.includes(p.id));
      }

      // Fallback
      if (newActive.length < 5) {
          if (presetName === 'bench' || presetName === 'second') {
             newActive = allOpponents.slice(5, 10);
          } else if (presetName === 'speed') {
             newActive = [...allOpponents].filter(p => p.position.includes('G') || p.position.includes('F')).slice(0,5);
          } else {
             newActive = allOpponents.slice(0, 5);
          }
      }

      // Ensure 5
      if (newActive.length < 5) {
          const needed = 5 - newActive.length;
          const others = allOpponents.filter(p => !newActive.includes(p)).slice(0, needed);
          newActive = [...newActive, ...others];
      }

      setActiveOpponentLineup(newActive.slice(0, 5));
      setOpponentBench(allOpponents.filter(p => !newActive.find(a => a.id === p.id)));
  };

  const calculateAggregates = (players: Player[]) => {
    if (!players.length) return { ortg: 0, drtg: 0, per: 0, net: 0 };
    const avg = (key: 'advanced', subKey: string) => 
        players.reduce((sum, p) => sum + ((p as any)[key]?.[subKey] || 0), 0) / players.length;
    
    const ortg = avg('advanced', 'ortg');
    const drtg = avg('advanced', 'drtg');
    const net = ortg - drtg;
    
    return { ortg, drtg, per: avg('advanced', 'per'), net };
  };

  const raptorsAgg = calculateAggregates(activeRaptorsLineup);
  const opponentAgg = calculateAggregates(activeOpponentLineup);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 animate-pulse p-12">
         <div className="w-24 h-24 border-4 border-raptors-red border-t-transparent rounded-full animate-spin"></div>
         <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wider">Scouting {game.opponent}...</h2>
            <p className="text-slate-500 mt-2">Gathering injury reports, film study, and social sentiment.</p>
         </div>
      </div>
    );
  }

  if (!analysis) return <div className="p-8 text-center text-slate-500">Select a game to begin scouting.</div>;

  return (
    <div className="space-y-6 pb-20 animate-fade-in relative">
      
      {/* 1. MATCHUP HEADER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 relative overflow-hidden shadow-sm">
         <div className="absolute top-0 right-0 p-4 opacity-5">
            <img src={`https://cdn.nba.com/logos/nba/${game.opponentId}/primary/L/logo.svg`} className="w-64 h-64" alt="logo" />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row gap-8">
             <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <span className="bg-raptors-red text-white px-2 py-0.5 rounded text-xs font-bold uppercase">Game Prep</span>
                    <span className="text-slate-400 text-sm font-mono">{game.date} • {game.venue}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 italic uppercase tracking-tighter mb-4">
                    Raptors vs {game.opponent}
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl leading-relaxed border-l-4 border-raptors-red pl-4">
                    {analysis.summary}
                </p>
             </div>
             <div className="flex gap-4 items-end">
                <div className="text-center">
                    <div className="text-4xl font-black text-slate-900">{analysis.winProbability}%</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">Win Prob</div>
                </div>
                <div className="h-12 w-px bg-slate-200"></div>
                <div className="text-center">
                    <div className="text-4xl font-black text-slate-900">{(raptorsAgg.per).toFixed(1)}</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">TOR PER</div>
                </div>
                <div className="h-12 w-px bg-slate-200"></div>
                <div className="text-center">
                    <div className="text-4xl font-black text-slate-900">{(opponentAgg.per).toFixed(1)}</div>
                    <div className="text-xs text-slate-500 uppercase font-bold">OPP PER</div>
                </div>
             </div>
         </div>
      </div>

      {/* 2. STRATEGIC GAME PLAN */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
             <Brain className="w-6 h-6 text-raptors-red" />
             <h2 className="text-2xl font-bold text-slate-900">Strategic Game Plan</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                 <div>
                     <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Offensive Profile</div>
                     <div className="flex flex-wrap gap-2">
                         {analysis.scoutingReport.offensiveTendencies.map((t, i) => (
                             <span key={i} className="bg-slate-100 text-slate-700 text-sm px-3 py-1.5 rounded-full font-medium border border-slate-200">{t}</span>
                         ))}
                     </div>
                 </div>
                 <div>
                     <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Defensive Schemes</div>
                     <div className="flex flex-wrap gap-2">
                         {analysis.scoutingReport.defensiveSchemes.map((t, i) => (
                             <span key={i} className="bg-slate-100 text-slate-700 text-sm px-3 py-1.5 rounded-full font-medium border border-slate-200">{t}</span>
                         ))}
                     </div>
                 </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Keys to Victory
                  </h3>
                  <ul className="space-y-4">
                     {analysis.scoutingReport.keysToVictory.map((key, i) => (
                         <li key={i} className="flex gap-3 text-sm text-slate-700">
                             <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">{i+1}</span>
                             <span className="pt-0.5 font-medium leading-snug">{key}</span>
                         </li>
                     ))}
                 </ul>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white flex flex-col justify-center">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Activity className="w-32 h-32" />
                  </div>
                  <div className="relative z-10">
                      <div className="text-xs font-bold text-raptors-red uppercase tracking-widest mb-2">X-Factor Matchup</div>
                      <div className="text-3xl font-black italic mb-2">{analysis.scoutingReport.xFactor}</div>
                      <p className="text-slate-300 text-sm leading-relaxed">
                          "Controlling this player's impact is crucial for the defensive rotation scheme."
                      </p>
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 3. MEDIA & INTEL */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Radio className="text-raptors-red w-5 h-5" /> Media Row & Medical
                  </h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                  <div>
                      <div className="flex items-center gap-2 mb-4">
                          <AlertTriangle className="text-orange-500 w-4 h-4" />
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Injury Report</span>
                      </div>
                      <div className="space-y-3">
                          {analysis.intel?.injuries?.length > 0 ? analysis.intel.injuries.map((inj, i) => (
                              <div key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                  <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                      inj.status === 'Out' ? 'bg-red-500' : 
                                      inj.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'
                                  }`}></div>
                                  <div>
                                      <div className="flex items-center gap-2">
                                          <span className="text-sm font-bold text-slate-900">{inj.player}</span>
                                          <span className={`text-[10px] px-1.5 rounded uppercase font-bold ${
                                              inj.status === 'Out' ? 'bg-red-100 text-red-600' : 
                                              inj.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                          }`}>{inj.status}</span>
                                      </div>
                                      <div className="text-xs text-slate-500 mt-1">{inj.details}</div>
                                  </div>
                              </div>
                          )) : (
                              <div className="text-slate-400 text-sm italic">No significant injuries reported.</div>
                          )}
                      </div>
                  </div>

                  <div>
                      <div className="flex items-center gap-2 mb-4">
                          <MessageSquare className="text-blue-500 w-4 h-4" />
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Social Feed</span>
                      </div>
                      <div className="space-y-4">
                          {analysis.intel?.socialChatter?.map((item, i) => {
                              const isWoj = item.source.toLowerCase().includes('woj') || item.source.toLowerCase().includes('espn');
                              const isShams = item.source.toLowerCase().includes('shams') || item.source.toLowerCase().includes('athletic');
                              const isRaptors = item.source.toLowerCase().includes('raptors') || item.source.toLowerCase().includes('republic');
                              const isOpponent = item.source.toLowerCase().includes(game.opponent.toLowerCase());

                              let avatar = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'; // Default
                              if (isWoj) avatar = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/ESPN_logo.svg/1200px-ESPN_logo.svg.png';
                              if (isShams) avatar = 'https://seeklogo.com/images/T/the-athletic-logo-595C3F2D47-seeklogo.com.png';
                              if (isRaptors) avatar = 'https://cdn.nba.com/logos/nba/1610612761/primary/L/logo.svg';
                              if (isOpponent && game.opponentId) avatar = `https://cdn.nba.com/logos/nba/${game.opponentId}/primary/L/logo.svg`;

                              const handle = isWoj ? '@wojespn' : isShams ? '@ShamsCharania' : isRaptors ? '@RaptorsRep' : '@NBADaily';
                              const name = item.source;

                              return (
                                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0">
                                            <img 
                                                src={avatar} 
                                                onError={(e) => e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                                                alt="avatar" 
                                                className="w-10 h-10 rounded-full object-contain border border-slate-100 bg-slate-50 p-1" 
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <span className="text-sm font-bold text-slate-900 truncate">{name}</span>
                                                    <span className="text-xs text-slate-500 truncate">{handle}</span>
                                                </div>
                                                <span className="text-xs text-slate-400">2h</span>
                                            </div>
                                            <p className="text-sm text-slate-800 mt-1 leading-snug">
                                                {item.headline}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                              );
                          })}
                      </div>
                  </div>
              </div>
          </div>

          {/* 4. TACTICAL PLAYBOOK (Refined Layout) */}
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <LayoutTemplate className="text-orange-500 w-5 h-5" />
                    Interactive Playbook
                </h3>
             </div>
             
             {/* Main Playbook Area - Responsive Flex */}
             <div className="flex flex-col md:flex-row h-auto md:h-[450px]">
                 {/* Diagram Side - Adjusted padding */}
                 <div className="w-full md:w-3/5 bg-neutral-900/5 p-4 md:p-8 flex flex-col justify-center items-center">
                     <div className="rounded-lg overflow-hidden border-2 border-slate-900 shadow-xl w-full max-w-lg aspect-[1.6]">
                        <CourtDiagram play={selectedPlay} />
                     </div>
                 </div>
                 
                 {/* Details Side - Scrollable */}
                 <div className="w-full md:w-2/5 flex flex-col border-l border-slate-100 bg-white overflow-hidden">
                     <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {analysis.playbook?.map((play) => (
                                <button 
                                    key={play.id}
                                    onClick={() => setSelectedPlay(play)}
                                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                        selectedPlay?.id === play.id 
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                                    }`}
                                >
                                    {play.name}
                                </button>
                            ))}
                        </div>
                     </div>
                     
                     <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                         {selectedPlay ? (
                             <div className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-black text-xl text-slate-900 uppercase italic tracking-tighter">{selectedPlay.name}</h4>
                                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase">{selectedPlay.diagramType}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-snug">{selectedPlay.description}</p>
                                </div>

                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Execution Steps</div>
                                    <div className="space-y-3 relative pl-2">
                                        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200"></div>
                                        {selectedPlay.execution?.map((step, i) => (
                                            <div key={i} className="flex gap-3 relative">
                                                <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0 z-10">{i+1}</div>
                                                <p className="text-sm text-slate-700 pt-0.5">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="bg-raptors-red/5 border border-raptors-red/20 p-4 rounded-xl mt-4">
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <Shield className="w-4 h-4 text-raptors-red" />
                                        <span className="text-xs font-bold text-raptors-red uppercase tracking-widest">Defensive Key</span>
                                    </div>
                                    <p className="text-sm text-slate-900 font-bold leading-relaxed">{selectedPlay.raptorsCounter}</p>
                                </div>
                             </div>
                         ) : (
                             <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                                <Activity className="w-8 h-8 opacity-20" />
                                <span className="text-sm font-medium">Select a play to view details</span>
                             </div>
                         )}
                     </div>
                 </div>
             </div>
          </div>
      </div>

      {/* 5. ROTATION SIMULATOR */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                      <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                          <div className="bg-raptors-red p-2 rounded-lg">
                            <Activity className="w-5 h-5 text-white" />
                          </div>
                          Rotation Simulator
                      </h2>
                      <p className="text-slate-400 text-xs mt-1 ml-12">Click a player on court, then click a bench player to swap</p>
                  </div>
                  <div className="flex items-center gap-3 ml-12 sm:ml-0">
                      <div className={`px-4 py-2 rounded-lg text-center ${(raptorsAgg.net - opponentAgg.net) >= 0 ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                          <div className={`text-xl font-black font-mono ${(raptorsAgg.net - opponentAgg.net) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {(raptorsAgg.net - opponentAgg.net) > 0 ? '+' : ''}{(raptorsAgg.net - opponentAgg.net).toFixed(1)}
                          </div>
                          <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Edge</div>
                      </div>
                  </div>
              </div>
          </div>

          <div className="p-6 space-y-6">

          {/* PRESET BUTTONS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Raptors Presets</div>
                  <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
                       <button onClick={() => applyRaptorsPreset('starters')} className="flex-1 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all flex items-center justify-center gap-1.5">
                          <Users className="w-3 h-3" /> Starters
                       </button>
                       <button onClick={() => applyRaptorsPreset('second')} className="flex-1 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all flex items-center justify-center gap-1.5">
                          <RefreshCcw className="w-3 h-3" /> 2nd Unit
                       </button>
                       <button onClick={() => applyRaptorsPreset('speed')} className="flex-1 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all flex items-center justify-center gap-1.5">
                          <Zap className="w-3 h-3" /> Speed
                       </button>
                       <button onClick={() => applyRaptorsPreset('big')} className="flex-1 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all flex items-center justify-center gap-1.5">
                          <Shield className="w-3 h-3" /> Big
                       </button>
                  </div>
              </div>
              <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{game.opponent} Presets</div>
                  <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
                       <button onClick={() => applyPreset('starters')} className="flex-1 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all flex items-center justify-center gap-1.5">
                          <Users className="w-3 h-3" /> Starters
                       </button>
                       <button onClick={() => applyPreset('second')} className="flex-1 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all flex items-center justify-center gap-1.5">
                          <RefreshCcw className="w-3 h-3" /> 2nd Unit
                       </button>
                       <button onClick={() => applyPreset('speed')} className="flex-1 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white hover:shadow-sm rounded transition-all flex items-center justify-center gap-1.5">
                          <Zap className="w-3 h-3" /> Speed
                       </button>
                  </div>
              </div>
          </div>

          {/* ACTIVE COURT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {/* VS Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
                     <div className="bg-slate-900 p-2.5 rounded-full border-2 border-slate-700 shadow-xl">
                        <Swords className="w-4 h-4 text-slate-300" />
                     </div>
                </div>

                {/* Raptors Side */}
                <div className="bg-gradient-to-br from-red-50/50 to-white rounded-xl p-4 border border-red-100">
                    <div className="flex justify-between items-end mb-4 pb-2 border-b-2 border-raptors-red">
                        <div className="flex items-center gap-2">
                            <img src="https://cdn.nba.com/logos/nba/1610612761/primary/L/logo.svg" className="w-6 h-6" alt="TOR" />
                            <h3 className="text-raptors-red font-black uppercase text-sm tracking-wider">TORONTO</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-[10px] font-mono text-slate-500">
                                ORTG <span className="font-bold text-slate-900">{raptorsAgg.ortg.toFixed(1)}</span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">
                                DRTG <span className="font-bold text-slate-900">{raptorsAgg.drtg.toFixed(1)}</span>
                            </div>
                            <div className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${raptorsAgg.net >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                NET {raptorsAgg.net > 0 ? '+' : ''}{raptorsAgg.net.toFixed(1)}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {activeRaptorsLineup.map((player, idx) => (
                            <PlayerCard
                                key={player.id}
                                player={player}
                                onClick={() => setSelectedSlot(selectedSlot?.team === 'raptors' && selectedSlot?.index === idx ? null : { team: 'raptors', index: idx })}
                                onDeepDive={() => setSelectedPlayerForDeepDive(player)}
                                isSelected={selectedSlot?.team === 'raptors' && selectedSlot?.index === idx}
                            />
                        ))}
                    </div>
                    {/* Raptors Bench */}
                    <div className="mt-4 pt-3 border-t border-red-100">
                         <div className="flex items-center justify-between mb-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bench ({raptorsBench.length})</div>
                            {selectedSlot?.team === 'raptors' && <div className="text-[10px] font-bold text-raptors-red animate-pulse uppercase">Click to swap in</div>}
                         </div>
                         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {raptorsBench.map(player => (
                                <BenchCard
                                    key={player.id}
                                    player={player}
                                    onClick={() => handleBenchClick(player, 'raptors')}
                                    isHighlighted={selectedSlot?.team === 'raptors'}
                                />
                            ))}
                         </div>
                    </div>
                </div>

                {/* Opponent Side */}
                <div className="bg-gradient-to-br from-blue-50/50 to-white rounded-xl p-4 border border-blue-100">
                    <div className="flex justify-between items-end mb-4 pb-2 border-b-2 border-blue-600">
                        <div className="flex items-center gap-2">
                            {game.opponentId && <img src={`https://cdn.nba.com/logos/nba/${game.opponentId}/primary/L/logo.svg`} className="w-6 h-6" alt={game.opponent} />}
                            <h3 className="text-blue-600 font-black uppercase text-sm tracking-wider">{game.opponent}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-[10px] font-mono text-slate-500">
                                ORTG <span className="font-bold text-slate-900">{opponentAgg.ortg.toFixed(1)}</span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">
                                DRTG <span className="font-bold text-slate-900">{opponentAgg.drtg.toFixed(1)}</span>
                            </div>
                            <div className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${opponentAgg.net >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                NET {opponentAgg.net > 0 ? '+' : ''}{opponentAgg.net.toFixed(1)}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {activeOpponentLineup.map((player, idx) => (
                            <PlayerCard
                                key={player.id}
                                player={player}
                                onClick={() => setSelectedSlot(selectedSlot?.team === 'opponent' && selectedSlot?.index === idx ? null : { team: 'opponent', index: idx })}
                                onDeepDive={() => setSelectedPlayerForDeepDive(player)}
                                isOpponent
                                isSelected={selectedSlot?.team === 'opponent' && selectedSlot?.index === idx}
                            />
                        ))}
                    </div>
                    {/* Opponent Bench */}
                    <div className="mt-4 pt-3 border-t border-blue-100">
                         <div className="flex items-center justify-between mb-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bench ({opponentBench.length})</div>
                            {selectedSlot?.team === 'opponent' && <div className="text-[10px] font-bold text-blue-600 animate-pulse uppercase">Click to swap in</div>}
                         </div>
                         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {opponentBench.map(player => (
                                <BenchCard
                                    key={player.id}
                                    player={player}
                                    onClick={() => handleBenchClick(player, 'opponent')}
                                    isOpponent
                                    isHighlighted={selectedSlot?.team === 'opponent'}
                                />
                            ))}
                         </div>
                    </div>
                </div>
          </div>

          {/* ANALYTICS COMPARISON PANEL */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Lineup Analytics Comparison</h3>
              </div>
              <div className="p-5">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Bar Chart */}
                      <div className="bg-white rounded-lg border border-slate-200 p-4">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Rating Comparison</div>
                          <div className="h-52">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={[
                                      { name: 'ORTG', Raptors: Number(raptorsAgg.ortg.toFixed(1)), Opponent: Number(opponentAgg.ortg.toFixed(1)) },
                                      { name: 'DRTG', Raptors: Number(raptorsAgg.drtg.toFixed(1)), Opponent: Number(opponentAgg.drtg.toFixed(1)) },
                                      { name: 'PER', Raptors: Number(raptorsAgg.per.toFixed(1)), Opponent: Number(opponentAgg.per.toFixed(1)) },
                                      { name: 'NET', Raptors: Number(raptorsAgg.net.toFixed(1)), Opponent: Number(opponentAgg.net.toFixed(1)) },
                                  ]} barGap={2} barCategoryGap="20%">
                                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                      <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={['auto', 'auto']} />
                                      <Tooltip
                                          contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                      />
                                      <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                                      <Bar dataKey="Raptors" fill="#CE1141" radius={[4, 4, 0, 0]} />
                                      <Bar dataKey="Opponent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                  </BarChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                      {/* Stat Comparison Table */}
                      <div className="bg-white rounded-lg border border-slate-200 p-4">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Head-to-Head Breakdown</div>
                          <div className="space-y-3">
                              <ComparisonRow
                                  label="Offensive Rating"
                                  raptorsVal={raptorsAgg.ortg}
                                  opponentVal={opponentAgg.ortg}
                                  higherIsBetter={true}
                              />
                              <ComparisonRow
                                  label="Defensive Rating"
                                  raptorsVal={raptorsAgg.drtg}
                                  opponentVal={opponentAgg.drtg}
                                  higherIsBetter={false}
                              />
                              <ComparisonRow
                                  label="Net Rating"
                                  raptorsVal={raptorsAgg.net}
                                  opponentVal={opponentAgg.net}
                                  higherIsBetter={true}
                              />
                              <ComparisonRow
                                  label="Avg PER"
                                  raptorsVal={raptorsAgg.per}
                                  opponentVal={opponentAgg.per}
                                  higherIsBetter={true}
                              />
                              <ComparisonRow
                                  label="Combined PPG"
                                  raptorsVal={activeRaptorsLineup.reduce((s, p) => s + (p.seasonStats?.ppg || 0), 0)}
                                  opponentVal={activeOpponentLineup.reduce((s, p) => s + (p.seasonStats?.ppg || 0), 0)}
                                  higherIsBetter={true}
                              />
                              <ComparisonRow
                                  label="Combined RPG"
                                  raptorsVal={activeRaptorsLineup.reduce((s, p) => s + (p.seasonStats?.rpg || 0), 0)}
                                  opponentVal={activeOpponentLineup.reduce((s, p) => s + (p.seasonStats?.rpg || 0), 0)}
                                  higherIsBetter={true}
                              />
                              <ComparisonRow
                                  label="Combined APG"
                                  raptorsVal={activeRaptorsLineup.reduce((s, p) => s + (p.seasonStats?.apg || 0), 0)}
                                  opponentVal={activeOpponentLineup.reduce((s, p) => s + (p.seasonStats?.apg || 0), 0)}
                                  higherIsBetter={true}
                              />
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          </div>
      </div>

      {/* MODALS */}
      {selectedPlayerForDeepDive && (
          <PlayerDeepDive 
              player={selectedPlayerForDeepDive} 
              opponentName={game.opponent} 
              onClose={() => setSelectedPlayerForDeepDive(null)} 
          />
      )}
    </div>
  );
};

// --- Sub Components ---

const PlayerCard: React.FC<{ player: Player, onClick: () => void, onDeepDive: () => void, isOpponent?: boolean, isSelected?: boolean }> = ({ player, onClick, onDeepDive, isOpponent, isSelected }) => {
    const [imgError, setImgError] = useState(false);
    
    return (
        <div 
            className={`
                group relative rounded-xl overflow-hidden transition-all duration-300 shadow-sm cursor-pointer
                ${isSelected ? 'ring-2 ring-raptors-red scale-105 z-20 shadow-xl' : 'hover:shadow-md hover:-translate-y-1'}
                bg-white border border-slate-200
                h-40 flex flex-col justify-end
            `}
            onClick={onClick}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>
            
            {!imgError ? (
                <img 
                    src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${player.id}.png`} 
                    onError={() => setImgError(true)}
                    className={`absolute top-0 left-1/2 -translate-x-1/2 w-[140%] max-w-none object-cover object-top h-full ${isOpponent ? 'grayscale-[0.3]' : ''}`}
                    alt={player.name}
                />
            ) : (
                <div className={`absolute inset-0 flex flex-col items-center justify-center opacity-20 ${isOpponent ? 'text-blue-500' : 'text-raptors-red'}`}>
                    <div className="text-4xl font-black">{player.number}</div>
                </div>
            )}

            {/* Deep Dive Button */}
            <button 
                onClick={(e) => { e.stopPropagation(); onDeepDive(); }}
                className="absolute top-1 right-1 z-30 p-1.5 rounded-full bg-white/20 hover:bg-raptors-red text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                title="View Analytics"
            >
                <ChevronRight className="w-3 h-3" />
            </button>

            {/* Info */}
            <div className="relative z-20 p-2 pointer-events-none">
                <div className={`text-[9px] font-black uppercase tracking-wider mb-0.5 ${isOpponent ? 'text-blue-300' : 'text-red-300'}`}>
                    {player.position} • #{player.number}
                </div>
                <div className="text-white font-bold leading-tight text-xs mb-1 truncate">
                    {player.name.split(' ').slice(1).join(' ')}
                </div>
                <div className="flex justify-between items-end border-t border-white/20 pt-1">
                    <div className="text-[9px] text-slate-300">PER {Number(player.advanced?.per || 0).toFixed(1)}</div>
                    <div className="text-[9px] font-mono font-bold text-white">{Number(player.seasonStats?.ppg || 0).toFixed(1)} PPG</div>
                </div>
            </div>
            
            {/* Selection Overlay */}
            {isSelected && (
                <div className="absolute inset-0 bg-raptors-red/20 z-10 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="bg-white text-raptors-red px-2 py-1 rounded text-[10px] font-bold shadow-lg uppercase">
                        Select Swap
                    </div>
                </div>
            )}
        </div>
    );
}

const BenchCard: React.FC<{ player: Player, onClick: () => void, isOpponent?: boolean, isHighlighted?: boolean }> = ({ player, onClick, isOpponent, isHighlighted }) => {
    const [imgError, setImgError] = useState(false);
    return (
        <div
            onClick={onClick}
            className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden relative cursor-pointer group transition-all bg-slate-100 border ${
                isHighlighted
                    ? 'ring-2 ring-raptors-red/50 border-raptors-red/30 shadow-md animate-pulse'
                    : 'border-slate-200 hover:ring-2 hover:ring-slate-400'
            }`}
        >
             {!imgError ? (
                <img
                    src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${player.id}.png`}
                    onError={() => setImgError(true)}
                    className={`w-full h-full object-cover object-top ${isOpponent ? 'grayscale-[0.3]' : ''}`}
                    alt={player.name}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">{player.number}</div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 p-0.5 text-center">
                <div className="text-[8px] text-white font-bold truncate">{player.name.split(' ').pop()}</div>
                <div className="text-[7px] text-slate-300 font-mono">{Number(player.seasonStats?.ppg || 0).toFixed(1)}</div>
            </div>
        </div>
    )
}

const ComparisonRow: React.FC<{ label: string, raptorsVal: number, opponentVal: number, higherIsBetter: boolean }> = ({ label, raptorsVal, opponentVal, higherIsBetter }) => {
    const raptorsWins = higherIsBetter ? raptorsVal > opponentVal : raptorsVal < opponentVal;
    const opponentWins = higherIsBetter ? opponentVal > raptorsVal : opponentVal < raptorsVal;
    const tied = Math.abs(raptorsVal - opponentVal) < 0.05;

    return (
        <div className="flex items-center gap-3">
            <div className={`flex-1 text-right font-mono text-sm font-bold transition-colors ${tied ? 'text-slate-600' : raptorsWins ? 'text-green-600' : 'text-slate-400'}`}>
                {raptorsVal.toFixed(1)}
            </div>
            <div className="flex-shrink-0 w-24">
                <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="absolute left-0 top-0 h-full bg-raptors-red rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, (raptorsVal / (raptorsVal + opponentVal || 1)) * 100))}%` }}
                    />
                </div>
                <div className="text-[9px] text-slate-500 text-center mt-1 font-medium">{label}</div>
            </div>
            <div className={`flex-1 text-left font-mono text-sm font-bold transition-colors ${tied ? 'text-slate-600' : opponentWins ? 'text-green-600' : 'text-slate-400'}`}>
                {opponentVal.toFixed(1)}
            </div>
        </div>
    );
}