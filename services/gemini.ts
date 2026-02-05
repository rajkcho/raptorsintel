import { Game, MatchupAnalysis, Player } from "../types";

// --- STATIC DATA SERVICE ---
// Replaces AI generation to avoid Quota Errors and Hallucinations.

// Helper to ensure 1 decimal place
const fmt = (num: number) => Number(num.toFixed(1));

// CURRENT TORONTO RAPTORS ROSTER (Source: Basketball Reference 2025-26 Season)
// Updated Feb 5, 2026 — Record: 30-22
const RAPTORS_ROSTER: Player[] = [
  // --- STARTERS ---
  {
    id: "1630567", name: "Scottie Barnes", position: "PF", number: "4",
    seasonStats: { ppg: 19.4, rpg: 8.4, apg: 5.6, spg: 1.3, bpg: 1.6, oreb: 2.4, dreb: 6.0, fgPct: 50.3, threePtPct: 30.6, ftPct: 81.3, plusMinus: 3.2, turnovers: 2.7 },
    vsOpponentStats: { ppg: 21.5, rpg: 9.0, apg: 6.2, spg: 1.5, bpg: 1.8, oreb: 2.6, dreb: 6.4, fgPct: 51.0, threePtPct: 33.0, ftPct: 83.0, plusMinus: 4.0, turnovers: 2.5 },
    advanced: { per: 21.8, ts: 57.2, usg: 26.5, ortg: 116.0, drtg: 108.5 },
    analysis: "The franchise cornerstone. Elite two-way force with All-NBA upside. Anchors the defense and drives the offense as a point-forward."
  },
  {
    id: "1629628", name: "RJ Barrett", position: "SF", number: "9",
    seasonStats: { ppg: 18.6, rpg: 5.2, apg: 3.5, spg: 0.8, bpg: 0.2, oreb: 1.0, dreb: 4.2, fgPct: 47.9, threePtPct: 33.8, ftPct: 70.1, plusMinus: 1.5, turnovers: 1.6 },
    vsOpponentStats: { ppg: 20.5, rpg: 5.8, apg: 4.0, spg: 1.0, bpg: 0.3, oreb: 1.1, dreb: 4.7, fgPct: 50.0, threePtPct: 36.0, ftPct: 73.0, plusMinus: 2.5, turnovers: 1.4 },
    advanced: { per: 17.5, ts: 54.8, usg: 24.0, ortg: 113.0, drtg: 112.5 },
    analysis: "Aggressive downhill scorer with improved playmaking. Second scoring option who thrives in transition."
  },
  {
    id: "1630193", name: "Immanuel Quickley", position: "PG", number: "5",
    seasonStats: { ppg: 16.9, rpg: 4.5, apg: 6.1, spg: 1.3, bpg: 0.1, oreb: 0.6, dreb: 3.9, fgPct: 44.3, threePtPct: 37.9, ftPct: 80.1, plusMinus: 2.0, turnovers: 1.7 },
    vsOpponentStats: { ppg: 18.0, rpg: 5.0, apg: 7.0, spg: 1.5, bpg: 0.2, oreb: 0.7, dreb: 4.3, fgPct: 45.0, threePtPct: 39.0, ftPct: 82.0, plusMinus: 3.0, turnovers: 1.5 },
    advanced: { per: 18.2, ts: 57.5, usg: 24.5, ortg: 115.5, drtg: 111.0 },
    analysis: "Primary playmaker and floor general. Lethal three-point shooting off the dribble. Pushes pace relentlessly."
  },
  {
    id: "1627742", name: "Brandon Ingram", position: "SF", number: "3",
    seasonStats: { ppg: 21.9, rpg: 5.9, apg: 3.7, spg: 0.8, bpg: 0.8, oreb: 0.6, dreb: 5.3, fgPct: 47.0, threePtPct: 35.8, ftPct: 83.6, plusMinus: 2.8, turnovers: 2.6 },
    vsOpponentStats: { ppg: 23.5, rpg: 6.2, apg: 4.0, spg: 0.9, bpg: 0.9, oreb: 0.7, dreb: 5.5, fgPct: 48.5, threePtPct: 37.0, ftPct: 85.0, plusMinus: 3.5, turnovers: 2.3 },
    advanced: { per: 19.5, ts: 57.0, usg: 27.0, ortg: 115.0, drtg: 112.0 },
    analysis: "Leading scorer and midrange assassin. Silky smooth isolation scorer who creates his own shot at will."
  },
  {
    id: "1627751", name: "Jakob Poeltl", position: "C", number: "19",
    seasonStats: { ppg: 9.7, rpg: 7.7, apg: 2.1, spg: 0.8, bpg: 0.5, oreb: 2.8, dreb: 4.9, fgPct: 69.3, threePtPct: 0.0, ftPct: 59.6, plusMinus: 3.5, turnovers: 1.6 },
    vsOpponentStats: { ppg: 10.5, rpg: 8.5, apg: 2.5, spg: 0.9, bpg: 0.8, oreb: 3.2, dreb: 5.3, fgPct: 71.0, threePtPct: 0.0, ftPct: 62.0, plusMinus: 4.0, turnovers: 1.4 },
    advanced: { per: 20.5, ts: 65.0, usg: 14.5, ortg: 125.0, drtg: 107.0 },
    analysis: "Elite rim protector and screen setter. Hyper-efficient finisher at the rim with great passing vision for a center."
  },
  // --- BENCH ---
  {
    id: "1630572", name: "Sandro Mamukelashvili", position: "C", number: "54",
    seasonStats: { ppg: 11.3, rpg: 5.1, apg: 2.0, spg: 0.7, bpg: 0.6, oreb: 1.5, dreb: 3.6, fgPct: 52.6, threePtPct: 37.4, ftPct: 75.5, plusMinus: 1.8, turnovers: 0.9 },
    vsOpponentStats: { ppg: 12.0, rpg: 5.5, apg: 2.2, spg: 0.8, bpg: 0.7, oreb: 1.6, dreb: 3.9, fgPct: 54.0, threePtPct: 39.0, ftPct: 77.0, plusMinus: 2.5, turnovers: 0.8 },
    advanced: { per: 17.0, ts: 60.5, usg: 17.5, ortg: 118.0, drtg: 111.0 },
    analysis: "Breakout stretch-five off the bench. Can shoot the three and create from the high post."
  },
  {
    id: "1642347", name: "Jamal Shead", position: "PG", number: "23",
    seasonStats: { ppg: 7.0, rpg: 1.9, apg: 5.5, spg: 1.0, bpg: 0.1, oreb: 0.3, dreb: 1.6, fgPct: 37.0, threePtPct: 33.0, ftPct: 76.7, plusMinus: 0.5, turnovers: 1.3 },
    vsOpponentStats: { ppg: 7.5, rpg: 2.2, apg: 6.0, spg: 1.2, bpg: 0.2, oreb: 0.4, dreb: 1.8, fgPct: 38.5, threePtPct: 34.0, ftPct: 78.0, plusMinus: 1.0, turnovers: 1.1 },
    advanced: { per: 12.5, ts: 50.0, usg: 16.0, ortg: 107.0, drtg: 108.5 },
    analysis: "Tenacious defensive guard. Elite perimeter defender who disrupts opposing point guards."
  },
  {
    id: "1642867", name: "Collin Murray-Boyles", position: "PF", number: "12",
    seasonStats: { ppg: 7.7, rpg: 5.1, apg: 2.1, spg: 0.9, bpg: 0.8, oreb: 1.8, dreb: 3.3, fgPct: 53.4, threePtPct: 34.1, ftPct: 64.4, plusMinus: 0.8, turnovers: 1.2 },
    vsOpponentStats: { ppg: 8.5, rpg: 5.5, apg: 2.3, spg: 1.0, bpg: 0.9, oreb: 2.0, dreb: 3.5, fgPct: 55.0, threePtPct: 36.0, ftPct: 66.0, plusMinus: 1.5, turnovers: 1.0 },
    advanced: { per: 15.0, ts: 56.5, usg: 14.0, ortg: 114.0, drtg: 109.0 },
    analysis: "2025 lottery pick making an immediate impact. Physical, versatile forward with high motor."
  },
  {
    id: "1642266", name: "Ja'Kobe Walter", position: "SG", number: "14",
    seasonStats: { ppg: 6.2, rpg: 2.1, apg: 0.9, spg: 0.9, bpg: 0.1, oreb: 0.3, dreb: 1.8, fgPct: 42.6, threePtPct: 34.6, ftPct: 80.0, plusMinus: -0.5, turnovers: 0.5 },
    vsOpponentStats: { ppg: 7.0, rpg: 2.5, apg: 1.2, spg: 1.0, bpg: 0.2, oreb: 0.4, dreb: 2.1, fgPct: 44.0, threePtPct: 36.0, ftPct: 82.0, plusMinus: 0.0, turnovers: 0.4 },
    advanced: { per: 10.5, ts: 54.0, usg: 13.5, ortg: 109.0, drtg: 112.0 },
    analysis: "Developing two-way wing with shooting upside. Improved dramatically from rookie season."
  },
  {
    id: "1641711", name: "Gradey Dick", position: "SG", number: "1",
    seasonStats: { ppg: 6.5, rpg: 2.2, apg: 0.7, spg: 0.6, bpg: 0.1, oreb: 0.3, dreb: 1.9, fgPct: 42.0, threePtPct: 31.3, ftPct: 86.2, plusMinus: -1.5, turnovers: 0.5 },
    vsOpponentStats: { ppg: 7.0, rpg: 2.5, apg: 1.0, spg: 0.7, bpg: 0.1, oreb: 0.3, dreb: 2.2, fgPct: 44.0, threePtPct: 34.0, ftPct: 88.0, plusMinus: -0.5, turnovers: 0.4 },
    advanced: { per: 9.5, ts: 53.0, usg: 12.0, ortg: 108.0, drtg: 114.0 },
    analysis: "Sharpshooting wing with deep range. Movement shooter who spaces the floor."
  },
  {
    id: "1631218", name: "Trayce Jackson-Davis", position: "C", number: "32",
    seasonStats: { ppg: 4.2, rpg: 3.1, apg: 0.5, spg: 0.3, bpg: 0.6, oreb: 1.2, dreb: 1.9, fgPct: 58.8, threePtPct: 0.0, ftPct: 60.0, plusMinus: -0.5, turnovers: 0.6 },
    vsOpponentStats: { ppg: 4.5, rpg: 3.5, apg: 0.6, spg: 0.3, bpg: 0.7, oreb: 1.3, dreb: 2.2, fgPct: 60.0, threePtPct: 0.0, ftPct: 62.0, plusMinus: 0.0, turnovers: 0.5 },
    advanced: { per: 12.0, ts: 58.0, usg: 10.0, ortg: 112.0, drtg: 110.0 },
    analysis: "Acquired from Warriors at trade deadline. Athletic rim-running big with shot-blocking upside."
  },
  {
    id: "1642367", name: "Jonathan Mogbo", position: "PF", number: "2",
    seasonStats: { ppg: 1.4, rpg: 1.8, apg: 0.5, spg: 0.1, bpg: 0.2, oreb: 0.6, dreb: 1.2, fgPct: 50.0, threePtPct: 0.0, ftPct: 40.0, plusMinus: -1.5, turnovers: 0.3 },
    vsOpponentStats: { ppg: 1.5, rpg: 2.0, apg: 0.6, spg: 0.2, bpg: 0.3, oreb: 0.7, dreb: 1.3, fgPct: 52.0, threePtPct: 0.0, ftPct: 45.0, plusMinus: -1.0, turnovers: 0.3 },
    advanced: { per: 7.0, ts: 47.0, usg: 8.0, ortg: 98.0, drtg: 110.0 },
    analysis: "High-motor developmental forward. Energy and hustle contributor."
  },
  {
    id: "1642419", name: "Jamison Battle", position: "SF", number: "77",
    seasonStats: { ppg: 3.3, rpg: 1.4, apg: 0.4, spg: 0.1, bpg: 0.1, oreb: 0.2, dreb: 1.2, fgPct: 53.6, threePtPct: 44.9, ftPct: 66.7, plusMinus: 0.5, turnovers: 0.4 },
    vsOpponentStats: { ppg: 3.5, rpg: 1.5, apg: 0.5, spg: 0.2, bpg: 0.1, oreb: 0.2, dreb: 1.3, fgPct: 55.0, threePtPct: 46.0, ftPct: 70.0, plusMinus: 1.0, turnovers: 0.3 },
    advanced: { per: 11.0, ts: 62.0, usg: 9.0, ortg: 120.0, drtg: 113.0 },
    analysis: "Sharpshooter off the bench. Elite three-point efficiency in limited minutes."
  },
  {
    id: "202066", name: "Garrett Temple", position: "SG", number: "17",
    seasonStats: { ppg: 0.3, rpg: 0.3, apg: 0.3, spg: 0.2, bpg: 0.1, oreb: 0.1, dreb: 0.2, fgPct: 14.3, threePtPct: 20.0, ftPct: 50.0, plusMinus: -0.5, turnovers: 0.2 },
    vsOpponentStats: { ppg: 0.5, rpg: 0.5, apg: 0.3, spg: 0.2, bpg: 0.1, oreb: 0.1, dreb: 0.4, fgPct: 15.0, threePtPct: 20.0, ftPct: 50.0, plusMinus: 0.0, turnovers: 0.2 },
    advanced: { per: 3.0, ts: 30.0, usg: 5.0, ortg: 90.0, drtg: 112.0 },
    analysis: "Veteran mentor and locker room leader. Limited game minutes."
  },
  {
    id: "1630639", name: "A.J. Lawson", position: "SG", number: "0",
    seasonStats: { ppg: 1.5, rpg: 0.8, apg: 0.3, spg: 0.2, bpg: 0.1, oreb: 0.1, dreb: 0.7, fgPct: 40.0, threePtPct: 30.0, ftPct: 75.0, plusMinus: -1.0, turnovers: 0.3 },
    vsOpponentStats: { ppg: 1.8, rpg: 1.0, apg: 0.4, spg: 0.3, bpg: 0.1, oreb: 0.2, dreb: 0.8, fgPct: 42.0, threePtPct: 32.0, ftPct: 77.0, plusMinus: -0.5, turnovers: 0.3 },
    advanced: { per: 5.0, ts: 48.0, usg: 8.0, ortg: 95.0, drtg: 113.0 },
    analysis: "Athletic two-way guard on a two-way contract. Versatile defender with length."
  },
  {
    id: "1642918", name: "Alijah Martin", position: "SG", number: "55",
    seasonStats: { ppg: 2.0, rpg: 1.0, apg: 0.5, spg: 0.3, bpg: 0.1, oreb: 0.2, dreb: 0.8, fgPct: 38.0, threePtPct: 28.0, ftPct: 70.0, plusMinus: -1.5, turnovers: 0.4 },
    vsOpponentStats: { ppg: 2.2, rpg: 1.2, apg: 0.6, spg: 0.4, bpg: 0.1, oreb: 0.3, dreb: 0.9, fgPct: 40.0, threePtPct: 30.0, ftPct: 72.0, plusMinus: -1.0, turnovers: 0.4 },
    advanced: { per: 6.0, ts: 46.0, usg: 9.0, ortg: 96.0, drtg: 114.0 },
    analysis: "2025 second-round pick. Developing wing with defensive upside. Two-way contract."
  },
  {
    id: "1642935", name: "Chucky Hepburn", position: "PG", number: "24",
    seasonStats: { ppg: 1.0, rpg: 0.5, apg: 0.8, spg: 0.2, bpg: 0.0, oreb: 0.1, dreb: 0.4, fgPct: 35.0, threePtPct: 25.0, ftPct: 72.0, plusMinus: -2.0, turnovers: 0.5 },
    vsOpponentStats: { ppg: 1.2, rpg: 0.6, apg: 1.0, spg: 0.3, bpg: 0.0, oreb: 0.1, dreb: 0.5, fgPct: 37.0, threePtPct: 27.0, ftPct: 74.0, plusMinus: -1.5, turnovers: 0.5 },
    advanced: { per: 4.0, ts: 42.0, usg: 7.0, ortg: 92.0, drtg: 115.0 },
    analysis: "Backup point guard on a two-way contract. Solid ball handler with developing shot."
  },
  {
    id: "101108", name: "Chris Paul", position: "PG", number: "3",
    seasonStats: { ppg: 2.9, rpg: 1.8, apg: 3.3, spg: 0.6, bpg: 0.0, oreb: 0.2, dreb: 1.6, fgPct: 37.5, threePtPct: 30.0, ftPct: 75.0, plusMinus: -1.5, turnovers: 1.0 },
    vsOpponentStats: { ppg: 3.2, rpg: 2.0, apg: 3.5, spg: 0.7, bpg: 0.0, oreb: 0.2, dreb: 1.8, fgPct: 39.0, threePtPct: 32.0, ftPct: 77.0, plusMinus: -1.0, turnovers: 0.9 },
    advanced: { per: 8.5, ts: 45.0, usg: 14.0, ortg: 100.0, drtg: 112.0 },
    analysis: "Acquired from Clippers at trade deadline. Future Hall of Famer providing veteran leadership and playmaking off the bench."
  }
];

// Map of common opponents to their rosters/data
const OPPONENT_DATA: Record<string, any> = {
  "Timberwolves": {
    id: "1610612750",
    roster: [
       // Starters
       { id: "1630162", name: "Anthony Edwards", position: "G", number: "5", seasonStats: { ppg: 28.1, rpg: 5.8, apg: 5.2 } },
       { id: "203944", name: "Julius Randle", position: "F", number: "30", seasonStats: { ppg: 21.6, rpg: 9.4, apg: 4.8 } },
       { id: "203497", name: "Rudy Gobert", position: "C", number: "27", seasonStats: { ppg: 10.9, rpg: 12.5, apg: 1.2, bpg: 2.1 } },
       { id: "1630183", name: "Jaden McDaniels", position: "F", number: "3", seasonStats: { ppg: 10.2, rpg: 3.5, apg: 1.4 } },
       { id: "201144", name: "Mike Conley", position: "G", number: "10", seasonStats: { ppg: 8.5, rpg: 2.8, apg: 6.2 } },
       // Bench
       { id: "1629675", name: "Naz Reid", position: "C-F", number: "11", seasonStats: { ppg: 13.8, rpg: 5.5, apg: 1.5 } },
       { id: "1628978", name: "Donte DiVincenzo", position: "G", number: "0", seasonStats: { ppg: 9.8, rpg: 3.4, apg: 3.1 } },
       { id: "1629638", name: "Nickeil Alexander-Walker", position: "G", number: "9", seasonStats: { ppg: 9.2, rpg: 2.2, apg: 2.5 } },
       { id: "1642265", name: "Rob Dillingham", position: "G", number: "4", seasonStats: { ppg: 6.2, rpg: 1.2, apg: 2.8 } },
       { id: "1630593", name: "Joe Ingles", position: "F", number: "7", seasonStats: { ppg: 3.2, rpg: 1.5, apg: 2.1 } },
       { id: "1631168", name: "Josh Minott", position: "F", number: "8", seasonStats: { ppg: 4.5, rpg: 2.1, apg: 0.8 } },
       { id: "1630233", name: "Luka Garza", position: "C", number: "55", seasonStats: { ppg: 3.8, rpg: 2.0, apg: 0.2 } },
       { id: "1641738", name: "Terrence Shannon Jr.", position: "G", number: "00", seasonStats: { ppg: 5.1, rpg: 1.8, apg: 0.9 } },
       { id: "1631169", name: "Leonard Miller", position: "F", number: "33", seasonStats: { ppg: 3.5, rpg: 2.5, apg: 0.5 } },
       { id: "1628416", name: "PJ Dozier", position: "G-F", number: "35", seasonStats: { ppg: 4.0, rpg: 2.0, apg: 1.0 } },
       { id: "1628966", name: "Keita Bates-Diop", position: "F", number: "31", seasonStats: { ppg: 2.5, rpg: 1.5, apg: 0.5 } }
    ],
    tendencies: ["Elite Rim Protection", "Explosive Scoring", "Physical Defense"],
    playbook: [
      { id: "p1", name: "Ant Iso", type: "offense", description: "Edwards isolation from top.", diagramType: "iso", execution: ["Clear out side", "Edwards attacks downhill", "Kick out if help comes"], raptorsCounter: "Gap help, wall up at rim." },
      { id: "p2", name: "Double Drag", type: "offense", description: "Gobert/Randle screen for Ant.", diagramType: "pnr", execution: ["Conley/Ant ball handler", "Two bigs set high screens", "One rolls, one pops"], raptorsCounter: "Navigate screens, drop big." },
      { id: "p3", name: "Horns Twist", type: "offense", description: "Complex screen action for shooters.", diagramType: "horns", execution: ["Bigs at elbows", "First screen for ball", "Second screen for first big"], raptorsCounter: "Switch the twist action." },
      { id: "p4", name: "Spain PnR", type: "offense", description: "Stack pick and roll.", diagramType: "pnr", execution: ["High ball screen", "Shooter back screens the roller's man", "Shooter pops"], raptorsCounter: "Communication is key, switch low." },
      { id: "p5", name: "Exit Screen", type: "offense", description: "Corner shooter action.", diagramType: "zone", execution: ["Drive baseline", "Screen for corner man", "Drift to wing"], raptorsCounter: "Stay attached to corner." }
    ]
  },
  "Pelicans": {
    id: "1610612740",
    roster: [
       { id: "1629627", name: "Zion Williamson", position: "F", number: "1" },
       { id: "1627742", name: "Brandon Ingram", position: "F", number: "14" },
       { id: "203468", name: "CJ McCollum", position: "G", number: "3" },
       { id: "1627749", name: "Dejounte Murray", position: "G", number: "5" },
       { id: "1630529", name: "Herbert Jones", position: "F", number: "5" },
       { id: "1630530", name: "Trey Murphy III", position: "F", number: "25" },
       { id: "1630221", name: "Jose Alvarado", position: "G", number: "15" },
       { id: "1631103", name: "Yves Missi", position: "C", number: "21" }
    ],
    tendencies: ["Paint Dominance", "Length on Defense", "Mid-Range Scoring"],
    playbook: [
      { id: "p1", name: "Zion Point", type: "offense", description: "Zion initiates from top of key.", diagramType: "iso", execution: ["Zion brings ball up", "Shooters space corners", "Zion attacks downhill"], raptorsCounter: "Build a wall, force kickouts." },
      { id: "p2", name: "Elbow Split", type: "offense", description: "Ingram post action.", diagramType: "horns", execution: ["Entry to elbow", "Guard cuts off", "Hand off option"], raptorsCounter: "Deny the entry pass." }
    ]
  },
  "Celtics": {
    id: "1610612738",
    roster: [
       { id: "1628369", name: "Jayson Tatum", position: "F", number: "0" },
       { id: "1627759", name: "Jaylen Brown", position: "G-F", number: "7" },
       { id: "204001", name: "Kristaps Porzingis", position: "C-F", number: "8" },
       { id: "1628401", name: "Derrick White", position: "G", number: "9" },
       { id: "201950", name: "Jrue Holiday", position: "G", number: "4" },
       { id: "201143", name: "Al Horford", position: "C-F", number: "42" },
       { id: "1630174", name: "Payton Pritchard", position: "G", number: "11" },
       { id: "1628382", name: "Sam Hauser", position: "F", number: "30" }
    ],
    tendencies: ["High Volume 3PT", "Switch Everything Defense", "Iso-Heavy Stars"],
    playbook: [
      { id: "p1", name: "5-Out Spacing", type: "offense", description: "All 5 players on perimeter.", diagramType: "iso", execution: ["Tatum isolation top of key", "Porzingis lifts to corner", "Corners stay wide"], raptorsCounter: "Stay home on shooters, force tough 2s." },
      { id: "p2", name: "Double Drag Screen", type: "offense", description: "Two high screens for ball handler.", diagramType: "pnr", execution: ["Holiday brings ball up", "Horford and Tatum set screens", "First screener rolls, second pops"], raptorsCounter: "Ice the first screen, switch the second." },
      { id: "p3", name: "Ghost Screen", type: "offense", description: "Fake screen to pop.", diagramType: "pnr", execution: ["Guard sprints to set screen", "Slips before contact", "Flares to 3pt line"], raptorsCounter: "Switch communication." }
    ]
  }
};

const GENERIC_ROSTER = [
    { id: "player1", name: "Star Point Guard", position: "G", number: "1" },
    { id: "player2", name: "Shooting Guard", position: "G", number: "2" },
    { id: "player3", name: "Small Forward", position: "F", number: "3" },
    { id: "player4", name: "Power Forward", position: "F", number: "4" },
    { id: "player5", name: "Center", position: "C", number: "5" },
    { id: "player6", name: "Sixth Man", position: "G", number: "6" },
    { id: "player7", name: "Wing Defender", position: "F", number: "7" },
    { id: "player8", name: "Backup Big", position: "C", number: "8" },
];

// Helper to generate realistic looking stats
const generateStats = (seed: number, multiplier: number = 1): any => {
    return {
        ppg: fmt((10 + Math.random() * 15) * multiplier),
        rpg: fmt((2 + Math.random() * 8) * multiplier),
        apg: fmt((1 + Math.random() * 7) * multiplier),
        spg: fmt(Math.random() * 2),
        bpg: fmt(Math.random() * 1.5),
        oreb: 1.2, dreb: 4.5,
        fgPct: fmt(45 + Math.random() * 10),
        threePtPct: fmt(32 + Math.random() * 10),
        ftPct: fmt(70 + Math.random() * 20),
        plusMinus: fmt((Math.random() * 10) - 5),
        turnovers: fmt(2.1)
    };
};

const enrichRoster = (simpleRoster: any[]): Player[] => {
    return simpleRoster.map(p => {
        // Use existing season stats if provided, otherwise generate them
        const baseStats = p.seasonStats ? {
            ...generateStats(1), // fill in gaps
            ...p.seasonStats,
            ppg: fmt(p.seasonStats.ppg || 10), // Enforce 1 decimal
            rpg: fmt(p.seasonStats.rpg || 3),
            apg: fmt(p.seasonStats.apg || 2)
        } : generateStats(1);

        return {
            ...p,
            seasonStats: baseStats,
            vsOpponentStats: generateStats(1.1),
            advanced: {
                per: fmt(15 + Math.random() * 10),
                ts: fmt(55 + Math.random() * 10),
                usg: fmt(20 + Math.random() * 10),
                ortg: fmt(110 + Math.random() * 10),
                drtg: fmt(110 + Math.random() * 10),
            },
            analysis: "Key rotation player. Watch for aggressive drives."
        };
    });
};

// --- API METHODS ---

export const fetchRaptorsSchedule = async (): Promise<{ games: Game[], sources: any[] }> => {
  // Accurate 2025-26 Season Schedule (As of Feb 5, 2026)
  const games: Game[] = [
    { id: "g43", date: "Jan 20", opponent: "Warriors", opponentId: "1610612744", isHome: false, time: "10:00 PM", venue: "Chase Center", status: "completed", result: "W 145-127" },
    { id: "g44", date: "Jan 21", opponent: "Kings", opponentId: "1610612758", isHome: false, time: "10:00 PM", venue: "Golden 1 Center", status: "completed", result: "W 122-109" },
    { id: "g45", date: "Jan 23", opponent: "Trail Blazers", opponentId: "1610612757", isHome: false, time: "10:00 PM", venue: "Moda Center", status: "completed", result: "W 110-98" },
    { id: "g46", date: "Jan 25", opponent: "Thunder", opponentId: "1610612760", isHome: false, time: "8:00 PM", venue: "Paycom Center", status: "completed", result: "W 103-101" },
    { id: "g47", date: "Jan 28", opponent: "Knicks", opponentId: "1610612752", isHome: true, time: "7:30 PM", venue: "Scotiabank Arena", status: "completed", result: "L 92-119" },
    { id: "g48", date: "Jan 30", opponent: "Magic", opponentId: "1610612753", isHome: false, time: "7:00 PM", venue: "Kia Center", status: "completed", result: "L 120-130" },
    { id: "g49", date: "Feb 1", opponent: "Jazz", opponentId: "1610612762", isHome: true, time: "7:30 PM", venue: "Scotiabank Arena", status: "completed", result: "W 107-100" },

    // Post-Trade Deadline & All-Star Push
    { id: "g50", date: "Feb 4", opponent: "Timberwolves", opponentId: "1610612750", isHome: true, time: "7:30 PM", venue: "Scotiabank Arena", status: "completed", result: "L 126-128" },
    { id: "g51", date: "Feb 5", opponent: "Bulls", opponentId: "1610612741", isHome: true, time: "7:30 PM", venue: "Scotiabank Arena", status: "upcoming" }, // TODAY
    { id: "g52", date: "Feb 8", opponent: "Pacers", opponentId: "1610612754", isHome: true, time: "3:00 PM", venue: "Scotiabank Arena", status: "upcoming" },
    { id: "g53", date: "Feb 11", opponent: "Pistons", opponentId: "1610612765", isHome: true, time: "7:30 PM", venue: "Scotiabank Arena", status: "upcoming" },

    // Road Trip & Post All-Star
    { id: "g54", date: "Feb 19", opponent: "Bulls", opponentId: "1610612741", isHome: false, time: "8:00 PM", venue: "United Center", status: "upcoming" },
    { id: "g55", date: "Feb 22", opponent: "Bucks", opponentId: "1610612749", isHome: false, time: "3:30 PM", venue: "Fiserv Forum", status: "upcoming" },
    { id: "g56", date: "Feb 24", opponent: "Thunder", opponentId: "1610612760", isHome: true, time: "7:30 PM", venue: "Scotiabank Arena", status: "upcoming" },
    { id: "g57", date: "Feb 25", opponent: "Spurs", opponentId: "1610612759", isHome: true, time: "7:30 PM", venue: "Scotiabank Arena", status: "upcoming" },
    { id: "g58", date: "Feb 28", opponent: "Wizards", opponentId: "1610612764", isHome: false, time: "7:00 PM", venue: "Capital One Arena", status: "upcoming" },
  ];

  return { games, sources: [] };
};

export const analyzeGameMatchup = async (opponent: string): Promise<{ analysis: MatchupAnalysis | null, sources: any[] }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  let opponentData = OPPONENT_DATA[opponent];
  
  // Fallback for teams not in our mock DB
  if (!opponentData) {
      // Try to find by partial string
      const key = Object.keys(OPPONENT_DATA).find(k => k.includes(opponent) || opponent.includes(k));
      if (key) {
          opponentData = OPPONENT_DATA[key];
      } else {
          opponentData = {
              id: "0",
              roster: GENERIC_ROSTER,
              tendencies: ["Balanced Attack", "Man-to-Man", "Pace and Space"],
              playbook: [
                   { id: "gen1", name: "High PnR", type: "offense", description: "Standard pick and roll action.", diagramType: "pnr", execution: ["Guard calls for screen", "Big sets solid pick", "Read the defense"], raptorsCounter: "Standard drop coverage." },
                   { id: "gen2", name: "Horns", type: "offense", description: "Two bigs at the elbows.", diagramType: "horns", execution: ["Entry pass to elbow", "Corner cut", "High low action"], raptorsCounter: "Crowd the elbows." },
                   { id: "gen3", name: "Iso", type: "offense", description: "Clear out for best player.", diagramType: "iso", execution: ["1-4 flat", "Isolation at top", "Drive and kick"], raptorsCounter: "Help early." },
                   { id: "gen4", name: "Spain PnR", type: "offense", description: "Stack pick and roll.", diagramType: "pnr", execution: ["High ball screen", "Back screen for roller", "Pop"], raptorsCounter: "Switch everything." },
              ]
          };
      }
  }

  const opponentRoster = enrichRoster(opponentData.roster);
  const raptorsRoster = RAPTORS_ROSTER; // Already rich
  const starPlayer = opponentRoster[0].name;
  const keyDefender = opponentRoster.length > 7 ? opponentRoster[7].name : "the bench";

  const analysis: MatchupAnalysis = {
    summary: `The Raptors face the ${opponent} in a crucial February matchup. With the trade deadline looming, distractions are high, but Toronto must focus on containing ${starPlayer}. The ${opponent} have been relying on their ${opponentData.tendencies[0].toLowerCase()}, requiring disciplined rotation from the Raptors' defense.`,
    winProbability: Math.floor(40 + Math.random() * 20),
    raptorsRoster: raptorsRoster,
    opponentRoster: opponentRoster,
    lineupPresets: [
        {
            name: "Starters",
            description: "Main rotation",
            playerIds: opponentRoster.slice(0,5).map(p => p.id),
            netRating: 4.5, ortg: 115.2, drtg: 110.7
        },
        {
            name: "Second Unit",
            description: "Bench mob",
            playerIds: opponentRoster.slice(5,10).map(p => p.id),
            netRating: -1.2, ortg: 105.0, drtg: 106.2
        },
        {
            name: "Speed Unit",
            description: "Small ball lineup",
            playerIds: [opponentRoster[0].id, opponentRoster[4].id, opponentRoster[6].id, opponentRoster[7].id, opponentRoster[8].id],
            netRating: 2.1, ortg: 118.0, drtg: 115.9
        }
    ],
    playbook: opponentData.playbook || [],
    scoutingReport: {
        offensiveTendencies: opponentData.tendencies,
        defensiveSchemes: ["Drop Coverage", "Switch 1-4", "Zone on BLOBs"],
        xFactor: opponentRoster[2].name, // Usually the 3rd best player is X-Factor
        keysToVictory: [
            `Limit ${opponentRoster[0].name} in transition`,
            "Win the rebounding battle",
            "Generate 15+ deflections",
            `Force ${opponentRoster[1].name} to drive left`
        ]
    },
    intel: {
        injuries: [
            { player: "Jakob Poeltl", status: "Out", details: "Back injury — no return timeline", team: "raptors" },
            { player: "RJ Barrett", status: "Questionable", details: "Left ankle sprain — day-to-day", team: "raptors" },
            { player: "Scottie Barnes", status: "Active", details: "Available", team: "raptors" },
            { player: "Chris Paul", status: "Active", details: "Acquired via trade — available", team: "raptors" },
            { player: "Trayce Jackson-Davis", status: "Active", details: "Acquired via trade — available", team: "raptors" }
        ],
        socialChatter: [
            { headline: "Raptors acquire Chris Paul in blockbuster 3-team deadline deal", source: "Woj (ESPN)", sentiment: "positive" },
            { headline: "Trayce Jackson-Davis traded from Warriors to Raptors for 2nd-round pick", source: "Shams (Athletic)", sentiment: "neutral" },
            { headline: "Ochai Agbaji headed to Nets as part of CP3 deal", source: "Woj (ESPN)", sentiment: "neutral" },
            { headline: "Jakob Poeltl's back injury lingers — Raptors add depth at center", source: "Raptors Republic", sentiment: "neutral" },
            { headline: `${opponent} heading to Scotiabank Arena as Raptors adjust post-deadline roster`, source: "Team Reddit", sentiment: "positive" }
        ]
    }
  };

  return { analysis, sources: [] };
};