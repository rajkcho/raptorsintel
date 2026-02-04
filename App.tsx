import React, { useState, useEffect } from 'react';
import { Game } from './types';
import { fetchRaptorsSchedule } from './services/gemini';
import { ScheduleList } from './components/ScheduleList';
import { MatchupAnalyzer } from './components/MatchupAnalyzer';
import { LayoutDashboard } from 'lucide-react';

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { games: fetchedGames } = await fetchRaptorsSchedule();
      setGames(fetchedGames);
      // Auto-select the next upcoming game
      const nextGame = fetchedGames.find(g => g.status === 'upcoming');
      if (nextGame) setSelectedGame(nextGame);
      else if (fetchedGames.length > 0) setSelectedGame(fetchedGames[0]);
      
      setLoadingSchedule(false);
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-raptors-red selection:text-white flex flex-col h-screen overflow-hidden">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white flex-shrink-0 z-30 shadow-sm">
        <div className="w-full max-w-[98%] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 border border-slate-100 shadow-sm">
               <img 
                 src="https://cdn.nba.com/logos/nba/1610612761/primary/L/logo.svg" 
                 alt="Raptors Logo" 
                 className="w-full h-full object-contain"
               />
             </div>
             <span className="text-xl font-bold tracking-tight text-slate-900">RAPTORS <span className="text-slate-400 font-light">INTEL</span></span>
          </div>
          <div className="text-xs text-slate-500 font-mono font-bold">
              COACH'S DASHBOARD v2.1
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden w-full max-w-[98%] mx-auto px-4 py-4">
        <div className="grid grid-cols-12 gap-4 h-full">
          
          {/* Sidebar Schedule - Compressed Width */}
          <div className="col-span-12 lg:col-span-2 h-full overflow-hidden">
             <ScheduleList 
                games={games} 
                onSelectGame={setSelectedGame} 
                selectedGameId={selectedGame?.id} 
             />
          </div>

          {/* Main Analyzer Area - Expanded Width */}
          <div className="col-span-12 lg:col-span-10 h-full overflow-y-auto custom-scrollbar pb-10">
            {loadingSchedule ? (
              <div className="h-full flex flex-col items-center justify-center border border-slate-200 rounded-xl bg-white shadow-sm">
                 <div className="w-10 h-10 border-4 border-raptors-red border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-slate-500 font-medium">Loading Season Data...</p>
              </div>
            ) : selectedGame ? (
              <MatchupAnalyzer game={selectedGame} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center border border-slate-200 rounded-xl bg-white shadow-sm text-slate-400">
                <LayoutDashboard className="w-12 h-12 mb-4 opacity-50" />
                <p>Select a game from the calendar to open the scouting report.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}