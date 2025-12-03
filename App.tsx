import React, { useState, useEffect } from 'react';
import { Waves, Settings2, Check, Play, LogOut, User as UserIcon } from 'lucide-react';
import Visualizer from './components/Visualizer';
import Timer from './components/Timer';
import AudioControl from './components/AudioControl';
import SmartFocus from './components/SmartFocus';
import TodoList from './components/TodoList';
import LevelTracker from './components/LevelTracker';
import MeditateMode from './components/MeditateMode';
import DailyReflection from './components/DailyReflection';
import CalendarWidget from './components/CalendarWidget';
import { AudioProvider, useAudioContext } from './contexts/AudioContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Todo } from './types';

// Google Logo Component for the button
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
    <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
    <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
    <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
  </svg>
);

const AppContent: React.FC = () => {
  const { isPlaying, layers, togglePlay } = useAudioContext();
  const { user, loginWithGoogle, loginAsGuest, logout, isLoading: isAuthLoading } = useAuth();
  
  const [hasStarted, setHasStarted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Wave Colors State: Array of 3 colors
  const [waveColors, setWaveColors] = useState<string[]>(['#8b5cf6', '#8b5cf6', '#8b5cf6']);

  // Lifted States
  const [todos, setTodos] = useState<Todo[]>([]);
  const [reflection, setReflection] = useState('');

  // Check audio activity
  const isAnyAudioActive = isPlaying || layers.some(l => l.isActive);

  const handleStartSession = async (method: 'google' | 'guest') => {
    if (!isPlaying) togglePlay();

    if (method === 'google') {
        await loginWithGoogle();
    } else {
        loginAsGuest();
    }
    setHasStarted(true);
  };

  const handleAddTodo = (text: string, dueTime?: number) => {
    const newTodo: Todo = { id: Date.now(), text, completed: false, dueTime };
    setTodos([...todos, newTodo]);
  };

  const handleToggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const updateWaveColor = (index: number, color: string) => {
      setWaveColors(prev => {
          const newColors = [...prev];
          newColors[index] = color;
          return newColors;
      });
  };

  const completedCount = todos.filter(t => t.completed).length;

  const colorPalettes = [
    { name: 'Nebula', hex: '#8b5cf6' },
    { name: 'Ocean', hex: '#06b6d4' },
    { name: 'Aurora', hex: '#10b981' },
    { name: 'Sunset', hex: '#f43f5e' },
    { name: 'Gold', hex: '#f59e0b' },
  ];

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#050511] text-slate-200">
      
      {/* Intro / Login Overlay */}
      {!hasStarted && (
        <div className="fixed inset-0 z-[100] bg-[#050511] flex flex-col items-center justify-center animate-in fade-in duration-500 p-6">
           {/* Background Glow */}
           <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600 rounded-full blur-[120px]"></div>
           </div>
           
           <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8">
              {/* Logo Section */}
              <div className="flex flex-col items-center gap-4 text-center">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-2xl shadow-violet-500/20">
                    <Waves className="text-violet-400 w-12 h-12" />
                 </div>
                 <h1 className="text-4xl font-bold tracking-widest text-white font-space-mono">
                  LUNAR WAVES
                 </h1>
                 <p className="text-slate-400 tracking-widest uppercase text-sm">Focus • Flow • Relax</p>
              </div>

              {/* Login Actions */}
              <div className="w-full space-y-4 pt-4">
                  {/* Google Button */}
                  <button 
                    onClick={() => handleStartSession('google')}
                    disabled={isAuthLoading}
                    className="w-full relative group bg-white hover:bg-slate-100 text-slate-800 h-14 rounded-full font-bold transition-all flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02]"
                  >
                    {isAuthLoading ? (
                        <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></span>
                    ) : (
                        <>
                            <GoogleLogo />
                            <span>Continue with Google</span>
                        </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-4">
                      <div className="h-px bg-white/10 flex-1"></div>
                      <span className="text-xs text-slate-600 uppercase font-bold">or</span>
                      <div className="h-px bg-white/10 flex-1"></div>
                  </div>

                  {/* Guest Button */}
                  <button 
                    onClick={() => handleStartSession('guest')}
                    className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-full text-sm font-medium tracking-wide transition-all hover:border-white/20"
                  >
                    Continue as Guest
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* Background Visualizer Layer */}
      <Visualizer isActive={isAnyAudioActive} waveColors={waveColors} />

      {/* UI Layer */}
      <div className={`relative z-10 min-h-screen flex flex-col justify-between p-6 transition-opacity duration-1000 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Header */}
        <header className="flex justify-between items-center max-w-6xl mx-auto w-full relative z-50">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:border-white/30 transition-colors">
                <Waves style={{ color: waveColors[0] }} size={24} />
            </div>
            <h1 className="hidden sm:block text-xl font-bold tracking-wider text-slate-100 font-space-mono">
              LUNAR WAVES
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
             {/* Wave Color Settings */}
             <div className="relative">
                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`p-2 rounded-full transition-all ${isSettingsOpen ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  title="Theme Settings"
                >
                  <Settings2 size={20} />
                </button>
                {isSettingsOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-slate-900/95 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl p-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                      {[0, 1, 2].map((layerIndex) => (
                        <div key={layerIndex} className="mb-3 last:mb-0">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">
                                Wave {layerIndex + 1}
                            </h3>
                            <div className="grid grid-cols-5 gap-2">
                            {colorPalettes.map((palette) => (
                                <button
                                key={palette.hex}
                                onClick={() => updateWaveColor(layerIndex, palette.hex)}
                                className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 border border-white/10 relative"
                                style={{ backgroundColor: palette.hex }}
                                title={palette.name}
                                >
                                {waveColors[layerIndex] === palette.hex && <Check size={10} className="text-white drop-shadow-md" />}
                                </button>
                            ))}
                            </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </div>

             {/* User Profile / Status */}
             {user ? (
                 <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-200">{user.name}</span>
                        <span className="text-[10px] text-slate-500">Premium Plan</span>
                    </div>
                    <div className="relative group">
                        <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-9 h-9 rounded-full border border-white/20 bg-slate-800"
                        />
                        {/* Logout Tooltip/Button */}
                        <button 
                            onClick={() => { logout(); setHasStarted(false); }}
                            className="absolute top-full right-0 mt-2 p-2 bg-slate-800 border border-red-500/30 rounded-lg text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs font-bold whitespace-nowrap pointer-events-none group-hover:pointer-events-auto"
                        >
                            <LogOut size={12} /> Sign Out
                        </button>
                    </div>
                 </div>
             ) : (
                 <div className="hidden sm:flex text-xs text-slate-400 border border-slate-800 bg-slate-900/50 backdrop-blur px-3 py-1.5 rounded-full items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> 
                    GUEST
                 </div>
             )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center items-center py-12 w-full max-w-4xl mx-auto">
          <Timer onTimerComplete={() => console.log('Session done')} />
          
          <div className="flex flex-wrap justify-center items-start gap-4 mt-8 w-full">
            <SmartFocus />
            <TodoList 
              todos={todos}
              onAdd={handleAddTodo}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
            />
            <CalendarWidget onAddEvent={handleAddTodo} todos={todos} />
            <MeditateMode />
            <DailyReflection reflection={reflection} onUpdate={setReflection} />
            
            {(todos.length > 0 || completedCount > 0) && (
              <LevelTracker completedCount={completedCount} />
            )}
          </div>
        </main>

        {/* Footer */}
        <div className="pb-4">
           <AudioControl /> 
        </div>

      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </AuthProvider>
  );
};

export default App;