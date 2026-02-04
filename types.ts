export interface Game {
  id: string;
  date: string;
  opponent: string;
  opponentId?: string; // NBA Team ID for logos
  isHome: boolean;
  time: string;
  venue: string;
  status: 'upcoming' | 'completed' | 'live';
  result?: string; 
}

export interface StatSet {
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  oreb: number;
  dreb: number;
  fgPct: number;
  threePtPct: number;
  ftPct: number;
  plusMinus: number;
  turnovers: number;
}

export interface AdvancedStats {
  per: number;        // Player Efficiency Rating
  ts: number;         // True Shooting %
  usg: number;        // Usage %
  ortg: number;       // Offensive Rating
  drtg: number;       // Defensive Rating
}

export interface Player {
  id: string;         // NBA Player ID
  name: string;
  position: string;
  number: string;
  imageUrl?: string;
  seasonStats: StatSet;
  vsOpponentStats: StatSet; // Stats specifically against this opponent
  advanced: AdvancedStats;
  analysis?: string;
}

export interface Play {
  id: string;
  name: string;
  type: 'offense' | 'defense';
  description: string;
  execution: string[]; // Step-by-step breakdown
  raptorsCounter: string; // Detailed defensive key
  diagramType: 'pnr' | 'iso' | 'post' | 'horns' | 'zone' | 'transition'; 
}

export interface LineupPreset {
  name: string;
  description: string;
  playerIds: string[]; // IDs of players in this lineup
  netRating: number;
  ortg: number;
  drtg: number;
}

export interface Injury {
  player: string;
  status: 'Out' | 'Questionable' | 'Doubtful' | 'Probable' | 'Active';
  details: string;
  team: 'raptors' | 'opponent';
}

export interface NewsItem {
  headline: string;
  source: string; 
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface MatchupAnalysis {
  summary: string;
  winProbability: number;
  raptorsRoster: Player[];
  opponentRoster: Player[];
  lineupPresets: LineupPreset[];
  playbook: Play[];
  scoutingReport: {
      offensiveTendencies: string[];
      defensiveSchemes: string[];
      xFactor: string;
      keysToVictory: string[];
  };
  intel: {
      injuries: Injury[];
      socialChatter: NewsItem[];
  }
}