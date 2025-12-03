import React, { useState } from 'react';
import { ListTodo, Plus, X, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Todo } from '../types';

interface TodoListProps {
  todos: Todo[];
  onAdd: (text: string) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onAdd, onToggle, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onAdd(inputValue.trim());
    setInputValue('');
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs text-slate-500 hover:text-emerald-400 transition-colors border border-transparent hover:border-emerald-500/30 px-3 py-2 rounded-full"
      >
        <ListTodo size={14} />
        <span>Tasks</span>
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

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
        <button 
          type="submit" 
          disabled={!inputValue}
          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
        </button>
      </form>

      <ul className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
        {todos.length === 0 && (
          <li className="text-slate-600 text-xs text-center italic py-2">No tasks yet. Stay focused.</li>
        )}
        {todos.map(todo => (
          <li 
            key={todo.id} 
            className={`group flex items-center justify-between p-2 rounded-lg border transition-all duration-300 ${todo.completed ? 'bg-emerald-900/10 border-emerald-500/10' : 'bg-slate-800/30 border-white/5 hover:border-white/10'}`}
          >
            <button 
              onClick={() => onToggle(todo.id)}
              className="flex items-center gap-3 flex-1 text-left"
            >
              <div className={`transition-colors ${todo.completed ? 'text-emerald-500' : 'text-slate-600 group-hover:text-slate-400'}`}>
                {todo.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              </div>
              <span className={`text-sm truncate ${todo.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                {todo.text}
              </span>
            </button>
            
            <button 
              onClick={() => onDelete(todo.id)}
              className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1"
              aria-label="Delete task"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;