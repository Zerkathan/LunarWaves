import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock, ArrowLeft, ExternalLink, Circle } from 'lucide-react';
import { Todo } from '../types';

interface CalendarWidgetProps {
  onAddEvent?: (title: string, dueTime: number) => void;
  todos?: Todo[];
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ onAddEvent, todos = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // State for Event Creation
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('09:00');

  // Helper to get days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Helper to get start day of week (0 = Sunday)
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
    setSelectedDay(null); // Reset selection on month change
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Check if a specific day has tasks
  const hasTaskOnDay = (day: number) => {
    return todos.some(todo => {
      if (!todo.dueTime || todo.completed) return false;
      const todoDate = new Date(todo.dueTime);
      return (
        todoDate.getDate() === day &&
        todoDate.getMonth() === currentDate.getMonth() &&
        todoDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  // Get tasks for the currently selected day
  const getTasksForSelectedDay = () => {
    if (!selectedDay) return [];
    return todos.filter(todo => {
       if (!todo.dueTime) return false;
       const todoDate = new Date(todo.dueTime);
       return (
         todoDate.getDate() === selectedDay &&
         todoDate.getMonth() === currentDate.getMonth() &&
         todoDate.getFullYear() === currentDate.getFullYear()
       );
    }).sort((a, b) => (a.dueTime || 0) - (b.dueTime || 0));
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setEventTitle('');
    // Reset time to next hour roughly or keep default
  };

  const handleAddToGoogleCalendar = () => {
    if (!selectedDay || !eventTitle) return;

    // Construct Date Objects
    const startTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
    const [hours, minutes] = eventTime.split(':').map(Number);
    startTime.setHours(hours, minutes, 0);

    const endTime = new Date(startTime);
    endTime.setHours(hours + 1, minutes, 0); // Default 1 hour duration

    // Format for Google Calendar URL: YYYYMMDDTHHMMSS
    const formatGCalDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    const startStr = formatGCalDate(startTime);
    const endStr = formatGCalDate(endTime);

    // Build URL
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startStr}/${endStr}&details=Created%20via%20Lunar%20Waves`;
    
    // 1. Open Google Calendar
    window.open(url, '_blank');

    // 2. Sync to local Todo List
    if (onAddEvent) {
      onAddEvent(eventTitle, startTime.getTime());
    }
    
    setSelectedDay(null); // Return to calendar view
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs text-slate-500 hover:text-indigo-400 transition-colors border border-transparent hover:border-indigo-500/30 px-3 py-2 rounded-full"
      >
        <CalendarIcon size={14} />
        <span>Calendar</span>
      </button>
    );
  }

  // --- Render View: Calendar Grid ---
  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const startDay = getFirstDayOfMonth(currentDate);
    
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const today = isToday(d);
      const hasTask = hasTaskOnDay(d);
      days.push(
        <button 
          key={d} 
          onClick={() => handleDayClick(d)}
          className={`relative h-8 w-full flex flex-col items-center justify-center rounded-full transition-all hover:scale-110 ${
            today 
              ? 'bg-indigo-600 text-white font-bold shadow-[0_0_10px_rgba(79,70,229,0.4)]' 
              : 'text-slate-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <span className="text-xs z-10">{d}</span>
          {hasTask && !today && (
             <span className="absolute bottom-1 w-1 h-1 bg-emerald-400 rounded-full"></span>
          )}
        </button>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-indigo-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <CalendarIcon size={12} /> 
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-2 items-center">
              <button onClick={() => changeMonth(-1)} className="text-slate-500 hover:text-white"><ChevronLeft size={14} /></button>
              <button onClick={() => changeMonth(1)} className="text-slate-500 hover:text-white"><ChevronRight size={14} /></button>
              <div className="w-px h-3 bg-slate-700 mx-1"></div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white"><X size={14} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-[10px] text-slate-600 font-bold uppercase">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </>
    );
  };

  // --- Render View: Add Event Form ---
  const renderEventForm = () => {
    const dayTasks = getTasksForSelectedDay();

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
          <button 
            onClick={() => setSelectedDay(null)} 
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
          </button>
          <h3 className="text-indigo-300 text-xs font-bold uppercase tracking-wider">
            {monthNames[currentDate.getMonth()]} {selectedDay}
          </h3>
        </div>

        <div className="space-y-3 mb-6">
          <div>
            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">New Event Title</label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Deep Work Session..."
              autoFocus
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
             <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                <Clock size={10} /> Time
             </label>
             <input
               type="time"
               value={eventTime}
               onChange={(e) => setEventTime(e.target.value)}
               className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
             />
          </div>

          <button
            onClick={handleAddToGoogleCalendar}
            disabled={!eventTitle}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Add to G-Cal</span>
            <ExternalLink size={12} />
          </button>
        </div>

        {/* --- Scheduled Tasks List --- */}
        {dayTasks.length > 0 && (
          <div className="pt-2 border-t border-white/5">
            <h4 className="text-[10px] text-slate-400 uppercase font-bold mb-2">Scheduled Tasks</h4>
            <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar">
              {dayTasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 text-xs text-slate-300 p-1.5 rounded bg-slate-800/30">
                  <div className={`w-1.5 h-1.5 rounded-full ${task.completed ? 'bg-emerald-500' : 'bg-indigo-400'}`}></div>
                  <span className="truncate flex-1">{task.text}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(task.dueTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-xs bg-slate-900/60 border border-indigo-500/20 rounded-xl p-4 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[300px]">
      {selectedDay ? renderEventForm() : renderCalendarGrid()}
    </div>
  );
};

export default CalendarWidget;