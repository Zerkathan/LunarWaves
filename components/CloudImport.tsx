import React, { useState } from 'react';
import { CloudDownload, Link, X, Check, Music } from 'lucide-react';
import { useAudioContext, Track } from '../contexts/AudioContext';

interface CloudImportProps {
  isOpen: boolean;
  onClose: () => void;
}

const CloudImport: React.FC<CloudImportProps> = ({ isOpen, onClose }) => {
  const { addExternalTrack } = useAudioContext();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS'>('IDLE');

  if (!isOpen) return null;

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let finalUrl = url;
    let finalTitle = title || "Unknown Track";

    // --- SENIOR DEV LOGIC: Smart Google Drive Link Conversion ---
    // Detects: drive.google.com/file/d/ID/view...
    // Converts to: drive.google.com/uc?export=download&id=ID
    const driveRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    
    if (match && match[1]) {
        const fileId = match[1];
        finalUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        if (!title) finalTitle = "Drive Audio Import";
    }

    const newTrack: Track = {
        id: `ext_${Date.now()}`,
        src: finalUrl,
        title: finalTitle,
        artist: artist || "Imported Source",
    };

    addExternalTrack(newTrack);
    
    setStatus('SUCCESS');
    setUrl('');
    setTitle('');
    setArtist('');
    
    setTimeout(() => {
        setStatus('IDLE');
        onClose();
    }, 1000);
  };

  return (
    <div className="absolute bottom-24 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 w-80 bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
        <h3 className="text-xs font-bold text-blue-300 uppercase tracking-widest flex items-center gap-2">
            <CloudDownload size={14} /> Import URL / Drive
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      <form onSubmit={handleImport} className="space-y-3">
        <div>
            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1 ml-1">Direct Link or Drive Share Link</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Link size={14} />
                </div>
                <input 
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full pl-9 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
            </div>
            <p className="text-[10px] text-slate-600 mt-1 ml-1">
                * For Google Drive, ensure link is "Anyone with the link".
            </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
            <div>
                 <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Song Title"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
            </div>
            <div>
                 <input 
                    type="text" 
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Artist"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
            </div>
        </div>

        <button 
            type="submit"
            disabled={!url || status === 'SUCCESS'}
            className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                status === 'SUCCESS' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
            }`}
        >
            {status === 'SUCCESS' ? <><Check size={14} /> Added!</> : <><Music size={14} /> Import Track</>}
        </button>
      </form>
    </div>
  );
};

export default CloudImport;