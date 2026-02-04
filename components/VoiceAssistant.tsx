import React, { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Activity, X } from 'lucide-react';
import { LiveSessionManager } from '../services/live';

interface VoiceAssistantProps {
  onClose: () => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'active' | 'error'>('connecting');
  const [transcripts, setTranscripts] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const liveManager = useRef<LiveSessionManager | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    liveManager.current = new LiveSessionManager();
    
    const start = async () => {
      try {
        await liveManager.current?.connect((inText, outText) => {
            setStatus('active');
            setTranscripts(prev => {
                const newTranscripts = [...prev];
                // Simple logic to append or update last message based on turns
                // In a real app, you'd want more robust turn tracking ID
                if (inText) {
                    const last = newTranscripts[newTranscripts.length - 1];
                    if (last?.role === 'user') last.text += inText;
                    else newTranscripts.push({ role: 'user', text: inText });
                }
                if (outText) {
                    const last = newTranscripts[newTranscripts.length - 1];
                    if (last?.role === 'model') last.text += outText;
                    else newTranscripts.push({ role: 'model', text: outText });
                }
                return newTranscripts;
            });
        });
        setStatus('active');
      } catch (e) {
        console.error(e);
        setStatus('error');
      }
    };

    start();

    return () => {
      liveManager.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
          <div className="flex items-center gap-3">
             <div className={`w-3 h-3 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
             <h2 className="text-white font-bold">Raptors Analyst Live</h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Visualizer Area (Simulated) */}
        <div className="flex-1 bg-neutral-900 p-6 overflow-y-auto relative">
           {transcripts.length === 0 && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 opacity-50">
                <Activity className="w-24 h-24 mb-4 text-raptors-red animate-pulse" />
                <p>Connecting to Analyst...</p>
             </div>
           )}

           <div className="space-y-4">
             {transcripts.map((t, i) => (
                <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl ${
                        t.role === 'user' 
                        ? 'bg-raptors-red text-white rounded-br-none' 
                        : 'bg-neutral-800 text-neutral-200 rounded-bl-none'
                    }`}>
                        {t.text}
                    </div>
                </div>
             ))}
             <div ref={bottomRef} />
           </div>
        </div>

        {/* Controls */}
        <div className="p-6 bg-neutral-950 border-t border-neutral-800 flex flex-col items-center gap-4">
           {status === 'active' ? (
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-raptors-red/20 flex items-center justify-center border border-raptors-red animate-pulse">
                    <Mic className="w-8 h-8 text-raptors-red" />
                </div>
                <div className="text-sm text-neutral-400">Listening...</div>
             </div>
           ) : (
             <div className="flex items-center gap-2 text-red-500">
                <MicOff className="w-5 h-5" />
                <span>{status === 'error' ? 'Connection Failed' : 'Connecting...'}</span>
             </div>
           )}
           <p className="text-xs text-neutral-600">
             Ask about lineups, defensive strategies, or historical stats.
           </p>
        </div>
      </div>
    </div>
  );
};
