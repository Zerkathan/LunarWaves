import React, { useState, useEffect } from 'react';
import { BookOpen, X, Save, Edit3 } from 'lucide-react';

interface DailyReflectionProps {
  reflection: string;
  onUpdate: (text: string) => void;
}

const DailyReflection: React.FC<DailyReflectionProps> = ({ reflection, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(reflection);

  // Sync internal text if prop changes
  useEffect(() => {
    setText(reflection);
  }, [reflection]);

  const handleSave = () => {
    onUpdate(text);
    setIsEditing(false);
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs text-slate-500 hover:text-amber-400 transition-colors border border-transparent hover:border-amber-500/30 px-3 py-2 rounded-full"
      >
        <BookOpen size={14} />
        <span>Reflection</span>
      </button>
    );
  }

  return (
    <div className="w-full max-w-md bg-slate-900/60 border border-amber-500/20 rounded-xl p-4 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <BookOpen size={12} /> Daily Note
        </h3>
        <button 
          onClick={() => setIsOpen(false)} 
          className="text-slate-500 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {isEditing || !reflection ? (
        <div className="flex flex-col gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a thought, a win, or a lesson from today..."
            className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none custom-scrollbar"
          />
          <button 
            onClick={handleSave}
            disabled={!text.trim()}
            className="self-end flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={14} /> Save Note
          </button>
        </div>
      ) : (
        <div className="relative group">
           <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 text-slate-300 text-sm italic leading-relaxed min-h-[5rem] whitespace-pre-wrap">
             "{reflection}"
           </div>
           <button 
             onClick={startEditing}
             className="absolute top-2 right-2 text-slate-500 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-all p-1"
             title="Edit Reflection"
           >
             <Edit3 size={14} />
           </button>
        </div>
      )}
    </div>
  );
};

export default DailyReflection;