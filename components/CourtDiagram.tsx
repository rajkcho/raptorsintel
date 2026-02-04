import React from 'react';
import { Play } from '../types';

interface CourtDiagramProps {
  play: Play | null;
}

export const CourtDiagram: React.FC<CourtDiagramProps> = ({ play }) => {
  return (
    <div className="relative w-full pt-[60%] bg-[#f0e6d2] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
       {/* Inject CSS Animations */}
       <style>
        {`
          @keyframes drive {
            0% { transform: translate(0, 0); }
            50% { transform: translate(10px, -15px); }
            100% { transform: translate(20px, -20px); }
          }
          @keyframes screen {
            0% { transform: translate(0, 0); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translate(5px, -5px); opacity: 0; }
          }
          @keyframes pass {
             0% { stroke-dashoffset: 100; opacity: 0; }
             20% { opacity: 1; }
             100% { stroke-dashoffset: 0; opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { r: 1.5; opacity: 1; }
            50% { r: 2.5; opacity: 0.5; }
          }
        `}
      </style>

      <div className="absolute inset-0">
          {/* --- Hardwood Texture & Court Lines --- */}
          <svg viewBox="0 0 100 60" className="w-full h-full" preserveAspectRatio="none">
             {/* Base Floor Color - Lighter for Light Theme */}
             <rect x="0" y="0" width="100" height="60" fill="#f8f4eb" /> 
             
             {/* Paint Area */}
             <rect x="0" y="22" width="12" height="16" fill="#CE1141" fillOpacity="0.1" />
             <rect x="88" y="22" width="12" height="16" fill="#333" fillOpacity="0.05" />

             {/* Center Court Logo Area */}
             <circle cx="50" cy="30" r="8" fill="none" stroke="#94a3b8" strokeWidth="0.5" opacity="0.5" />
             <path d="M50 0 V60" stroke="#94a3b8" strokeWidth="0.2" opacity="0.5" />

             {/* Left Key (Raptors Hoop) */}
             <rect x="0" y="22" width="12" height="16" fill="none" stroke="#CE1141" strokeWidth="0.5" />
             <circle cx="12" cy="30" r="4" fill="none" stroke="#CE1141" strokeWidth="0.5" />
             <path d="M0 10 A 15 15 0 0 1 15 50" fill="none" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="1,1" opacity="0.5" /> 

             {/* Right Key (Opponent Hoop) */}
             <rect x="88" y="22" width="12" height="16" fill="none" stroke="#333" strokeWidth="0.5" />
             <circle cx="88" cy="30" r="4" fill="none" stroke="#333" strokeWidth="0.5" />
             
             {/* Dynamic Play Visualization */}
             {play && <PlayOverlay play={play} />}

          </svg>
      </div>
      
      {/* Title Badge */}
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-slate-800 border border-slate-200 px-3 py-1 rounded text-[10px] font-mono font-bold uppercase z-10 shadow-sm">
         {play ? play.name : 'Tactical Board'}
      </div>
    </div>
  );
};

const PlayOverlay = ({ play }: { play: Play }) => {
    // Re-render animation on play change
    return (
        <g key={play.id}>
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#CE1141" />
                </marker>
                <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="blue" />
                </marker>
            </defs>
            {getDiagram(play.diagramType)}
        </g>
    )
}

const getDiagram = (type: string) => {
    switch(type) {
        case 'pnr':
            return (
                <g>
                   {/* Ball Handler Drive */}
                   <circle cx="50" cy="50" r="1.5" fill="#CE1141" style={{animation: 'drive 3s infinite'}} />
                   <path d="M50 50 Q 60 40 70 30" fill="none" stroke="#CE1141" strokeWidth="0.5" markerEnd="url(#arrowhead)" strokeDasharray="2,1" opacity="0.5" />
                   
                   {/* Screener */}
                   <circle cx="55" cy="45" r="1.5" fill="black" style={{animation: 'screen 3s infinite 1s'}} />
                   <line x1="55" y1="45" x2="60" y2="40" stroke="black" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                   
                   <text x="45" y="55" fontSize="2" fill="black">PG</text>
                   <text x="52" y="44" fontSize="2" fill="black">C</text>
                </g>
            );
        case 'horns':
             return (
                <g>
                    {/* Setup */}
                    <circle cx="70" cy="20" r="1.5" fill="black" />
                    <circle cx="70" cy="40" r="1.5" fill="black" />
                    <circle cx="60" cy="30" r="1.5" fill="#CE1141" />

                    {/* Passes */}
                    <path d="M60 30 L 70 20" fill="none" stroke="#CE1141" strokeWidth="0.5" strokeDasharray="1,1" style={{animation: 'pass 2s infinite'}} />
                    <path d="M60 30 L 70 40" fill="none" stroke="#CE1141" strokeWidth="0.5" strokeDasharray="1,1" style={{animation: 'pass 2s infinite 1s'}} />
                </g>
             );
        case 'zone':
             return (
                <g>
                    {/* Zone Pulse */}
                    <circle cx="75" cy="20" r="1.5" fill="blue" opacity="0.6" style={{animation: 'pulse 2s infinite'}} />
                    <circle cx="75" cy="40" r="1.5" fill="blue" opacity="0.6" style={{animation: 'pulse 2s infinite 0.5s'}} />
                    <circle cx="85" cy="15" r="1.5" fill="blue" opacity="0.6" style={{animation: 'pulse 2s infinite 1s'}} />
                    <circle cx="85" cy="30" r="1.5" fill="blue" opacity="0.6" style={{animation: 'pulse 2s infinite 1.5s'}} />
                    <circle cx="85" cy="45" r="1.5" fill="blue" opacity="0.6" style={{animation: 'pulse 2s infinite 2s'}} />
                </g>
             );
        default: // ISO or generic
            return (
                <g>
                    <path d="M60 10 Q 75 30 85 30" fill="none" stroke="#CE1141" strokeWidth="0.8" markerEnd="url(#arrowhead)" strokeDasharray="2,1" style={{animation: 'pass 3s infinite'}} />
                    <circle cx="60" cy="10" r="1.5" fill="#CE1141" style={{animation: 'pulse 1s infinite'}} />
                    <text x="55" y="10" fontSize="3" fill="black">ISO</text>
                </g>
            );
    }
}
