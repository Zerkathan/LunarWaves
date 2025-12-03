import React, { useState } from 'react';
import { Waves } from 'lucide-react';
import Visualizer from './components/Visualizer';
import Timer from './components/Timer';
import AudioControl from './components/AudioControl';
import SmartFocus from './components/SmartFocus';
import TodoList from './components/TodoList';
import LevelTracker from './components/LevelTracker';
import MeditateMode from './components/MeditateMode';
import DailyReflection from './components/DailyReflection';
import { useAudio } from './hooks/useAudio';
import { Todo } from './types';

const App: React.FC = () => {
  const { isPlaying, toggleAudio, volume, setVolume } = useAudio();
  
  // Lifted Todo State
  const [todos, setTodos] = useState<Todo[]>([]);
  // Reflection State
  const [reflection, setReflection] = useState('');

  const handleAddTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false
    };
    setTodos([...todos, newTodo]);
  };

  const handleToggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Calculate completed count for gamification
  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#050511] text-slate-200">
      {/* Background Visualizer Layer */}
      <Visualizer isActive={isPlaying} />

      {/* UI Layer */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between p-6">
        
        {/* Header */}
        <header className="flex justify-between items-center max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20 group-hover:border-violet-500/50 transition-colors">
                <Waves className="text-violet-400" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-wider text-violet-100 font-space-mono">
              LUNAR WAVES
            </h1>
          </div>
          <div className="text-xs text-slate-400 border border-slate-800 bg-slate-900/50 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> 
            ONLINE
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center items-center py-12 w-full max-w-4xl mx-auto">
          <Timer onTimerComplete={() => console.log('Session done')} />
          
          {/* Tools Container */}
          <div className="flex flex-wrap justify-center items-start gap-4 mt-8 w-full">
            <SmartFocus />
            <TodoList 
              todos={todos}
              onAdd={handleAddTodo}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
            />
            <MeditateMode />
            <DailyReflection reflection={reflection} onUpdate={setReflection} />
            
            {/* Show Level Tracker only if there's at least one task or the user has leveled up */}
            {(todos.length > 0 || completedCount > 0) && (
              <LevelTracker completedCount={completedCount} />
            )}
          </div>
        </main>

        {/* Footer Controls */}
        <div className="pb-4">
           <AudioControl 
             isPlaying={isPlaying} 
             toggleAudio={toggleAudio} 
             volume={volume} 
             setVolume={setVolume} 
           />
        </div>

      </div>
    </div>
  );
};

export default App;