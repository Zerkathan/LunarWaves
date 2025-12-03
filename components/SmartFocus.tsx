import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, X } from 'lucide-react';
import { generateFocusStrategy } from '../services/gemini';

const SmartFocus: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [task, setTask] = useState('');
  const [strategy, setStrategy] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    
    setIsLoading(true);
    const result = await generateFocusStrategy(task);
    setStrategy(result);
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs text-slate-500 hover:text-violet-400 transition-colors border border-transparent hover:border-violet-500/30 px-3 py-2 rounded-full"
      >
        <Sparkles size={14} />
        <span>Strategy</span>
      </button>
    );
  }

  return (
    <div className="w-full max-w-md bg-slate-900/60 border border-violet-500/20 rounded-xl p-4 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!strategy ? (
        <>
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-violet-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={12} /> AI Strategy
             </h3>
             <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={14} /></button>
          </div>
          <form onSubmit={handleGenerate} className="flex gap-2">
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="What is your goal?"
              className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
            <button 
              type="submit" 
              disabled={isLoading || !task}
              className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-3 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            </button>
          </form>
        </>
      ) : (
        <div className="text-left">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-violet-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} /> AI Strategy
            </h3>
            <button onClick={() => { setStrategy(null); setTask(''); setIsOpen(false); }} className="text-slate-500 hover:text-white text-xs">Close</button>
          </div>
          <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-light">
            {strategy}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartFocus;