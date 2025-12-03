import React, { useState, useEffect } from 'react';
import { ListTodo, Plus, X, Trash2, CheckCircle2, Circle, Clock, AlertCircle, CalendarPlus } from 'lucide-react';
import { Todo } from '../types';

interface TodoListProps {
  todos: Todo[];
  onAdd: (text: string, dueTime?: number) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onAdd, onToggle, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputTime, setInputTime] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every minute to check for overdue tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    let dueTimestamp: number | undefined = undefined;
    if (inputTime) {
      const date = new Date();
      const [hours, minutes] = inputTime.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      dueTimestamp = date.getTime();
    }

    onAdd(inputValue.trim(), dueTimestamp);
    setInputValue('');
    setInputTime('');
  };

  const isOverdue = (todo: Todo) => {
    return !todo.completed && todo.dueTime && currentTime > todo.dueTime;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const addToCalendar = (todo: Todo) => {
    if (!todo.dueTime) return;

    const startTime = new Date(todo.dueTime);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour block

    // Format for Google Calendar URL: YYYYMMDDTHHMMSS
    const formatGCalDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    const startStr = formatGCalDate(startTime);
    const endStr = formatGCalDate(endTime);

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(todo.text)}&dates=${startStr}/${endStr}&details=Task%20from%20Lunar%20Waves`;
    window.open(url, '_blank');
  };

  if (!isOpen) {
    const overdueCount = todos.filter(t => isOverdue(t)).length;
    
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className={`relative flex items-center gap-2 text-xs transition-colors border px-3 py-2 rounded-full ${
          overdueCount > 0 
          ? 'text-rose-400 border-rose-500/50 bg-rose-900/20 animate-pulse' 
          : 'text-slate-500 hover:text-emerald-400 border-transparent hover:border-emerald-500/30'
        }`}
      >
        <ListTodo size={14} />
        <span>Tasks</span>
        {overdueCount > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
        )}
      </button>
    );
  }

  return (
    <div className="w-full max-w-md bg-slate-900/60 border border-emerald-500/20 rounded-xl p-4 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <ListTodo size={12} /> Task List
        </h3>
        <button 
          onClick={() => setIsOpen(false)} 
          className="text-slate-500 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a new task..."
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
        <div className="flex gap-2">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Clock size={14} />
                </div>
                <input 
                    type="time" 
                    value={inputTime}
                    onChange={(e) => setInputTime(e.target.value)}
                    className="w-full pl-9 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none"
                />
            </div>
            <button 
            type="submit" 
            disabled={!inputValue}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <Plus size={16} />
            </button>
        </div>
      </form>

      <ul className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
        {todos.length === 0 && (
          <li className="text-slate-600 text-xs text-center italic py-2">No tasks yet. Stay focused.</li>
        )}
        {todos.map(todo => {
          const overdue = isOverdue(todo);
          return (
            <li 
                key={todo.id} 
                className={`group flex items-center justify-between p-2 rounded-lg border transition-all duration-300 ${
                todo.completed 
                    ? 'bg-emerald-900/10 border-emerald-500/10' 
                    : overdue 
                    ? 'bg-rose-950/30 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.2)] animate-pulse' 
                    : 'bg-slate-800/30 border-white/5 hover:border-white/10'
                }`}
            >
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <button 
                        onClick={() => onToggle(todo.id)}
                        className={`transition-colors flex-shrink-0 ${todo.completed ? 'text-emerald-500' : overdue ? 'text-rose-500' : 'text-slate-600 group-hover:text-slate-400'}`}
                    >
                        {todo.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    </button>
                    
                    <div className="flex flex-col min-w-0">
                        <span className={`text-sm truncate ${todo.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                            {todo.text}
                        </span>
                        {todo.dueTime && (
                            <span className={`text-[10px] flex items-center gap-1 ${
                                todo.completed ? 'text-slate-600' : overdue ? 'text-rose-400 font-bold' : 'text-slate-400'
                            }`}>
                                {overdue && !todo.completed && <AlertCircle size={10} />}
                                {overdue && !todo.completed ? 'OVERDUE' : ''} {formatTime(todo.dueTime)}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-1">
                    {todo.dueTime && !todo.completed && (
                        <button
                            onClick={() => addToCalendar(todo)}
                            className="text-slate-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                            title="Add to Google Calendar"
                        >
                            <CalendarPlus size={14} />
                        </button>
                    )}
                    <button 
                        onClick={() => onDelete(todo.id)}
                        className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1 flex-shrink-0"
                        aria-label="Delete task"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TodoList;