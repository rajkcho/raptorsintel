import React, { useEffect, useState, useRef } from 'react';
import { MessageCircle, Send, Activity, X, Loader2 } from 'lucide-react';
import { ChatSessionManager } from '../services/live';

interface VoiceAssistantProps {
  onClose: () => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onClose }) => {
  const [transcripts, setTranscripts] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatManager = useRef<ChatSessionManager | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatManager.current = new ChatSessionManager();
    inputRef.current?.focus();

    return () => {
      chatManager.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  const handleSend = async () => {
    const message = input.trim();
    if (!message || isLoading) return;

    setInput('');
    setTranscripts(prev => [...prev, { role: 'user', text: message }]);
    setIsLoading(true);

    // Add a placeholder for the assistant response
    setTranscripts(prev => [...prev, { role: 'model', text: '' }]);

    try {
      await chatManager.current?.sendMessage(message, (chunk) => {
        setTranscripts(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'model') {
            last.text += chunk;
          }
          return updated;
        });
      });
    } catch (e) {
      console.error(e);
      setTranscripts(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === 'model' && !last.text) {
          last.text = 'Connection error. Please try again.';
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">

        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
          <div className="flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
             <h2 className="text-white font-bold">Raptors Analyst Chat</h2>
             <span className="text-[10px] text-neutral-500 font-mono">via OpenRouter</span>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-neutral-900 p-6 overflow-y-auto relative">
           {transcripts.length === 0 && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 opacity-50">
                <Activity className="w-24 h-24 mb-4 text-raptors-red animate-pulse" />
                <p>Ask about lineups, stats, or strategy...</p>
             </div>
           )}

           <div className="space-y-4">
             {transcripts.map((t, i) => (
                <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap ${
                        t.role === 'user'
                        ? 'bg-raptors-red text-white rounded-br-none'
                        : 'bg-neutral-800 text-neutral-200 rounded-bl-none'
                    }`}>
                        {t.text || (isLoading && i === transcripts.length - 1 ? (
                          <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                        ) : '')}
                    </div>
                </div>
             ))}
             <div ref={bottomRef} />
           </div>
        </div>

        {/* Input */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800">
           <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about lineups, defensive strategies, or stats..."
                className="flex-1 bg-neutral-800 text-white rounded-xl px-4 py-3 text-sm outline-none border border-neutral-700 focus:border-raptors-red transition-colors placeholder:text-neutral-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-3 rounded-xl bg-raptors-red text-white hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
           </div>
           <p className="text-xs text-neutral-600 mt-2 text-center">
             Powered by OpenRouter
           </p>
        </div>
      </div>
    </div>
  );
};
