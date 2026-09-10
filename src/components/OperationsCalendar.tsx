import React, { useState } from 'react';
import { Calendar as CalendarIcon, AlertOctagon, MapPin, Users, Camera } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  gear: string[];
  crew: string[];
  hasConflict?: boolean;
  conflictReason?: string;
}

const SAMPLE_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Arora Wedding — Sangeet & Cocktail',
    venue: 'Taj Palace, Durbar Hall',
    date: '2026-09-12',
    startTime: '04:00 PM',
    endTime: '11:30 PM',
    gear: ['Sony FX3 #1', 'Sony 70-200mm GM II', 'Aputure 600d'],
    crew: ['Amit Kumar (Lead)', 'Rohan Joshi (Drone)']
  },
  {
    id: 'evt-2',
    title: 'Kapoor Wedding — Reception',
    venue: 'Grand Hyatt, Ballroom A',
    date: '2026-09-12',
    startTime: '06:00 PM',
    endTime: '11:00 PM',
    gear: ['Sony FX3 #1', 'DJI Mavic 3 Cine'],
    crew: ['Sunil Sharma (Cinematographer)', 'Amit Kumar (Lead)'],
    hasConflict: true,
    conflictReason: 'Double-Booking Conflict: Sony FX3 #1 and Amit Kumar are already scheduled on Arora Wedding during this time!'
  },
  {
    id: 'evt-3',
    title: 'Lumina Studio Fashion Commercial',
    venue: 'Studio Floor B, Cyber City',
    date: '2026-09-14',
    startTime: '10:00 AM',
    endTime: '06:00 PM',
    gear: ['Sony A7 IV #2', 'Sony 24-70mm GM II', 'Godox AD600 Pro'],
    crew: ['Priya Nair (Lead)', 'Vikram Singh (Assistant)']
  }
];

export const OperationsCalendar: React.FC = () => {
  const [events] = useState<EventItem[]>(SAMPLE_EVENTS);
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-12');

  const activeDateEvents = events.filter(e => e.date === selectedDate);
  const hasAnyConflict = events.some(e => e.hasConflict);

  return (
    <div className="space-y-6">
      {/* Collision Detection Alert Banner */}
      {hasAnyConflict && (
        <div className="glass-panel border-red-500/50 bg-red-950/30 p-4 rounded-2xl flex items-start gap-3 text-red-200">
          <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-red-300 uppercase tracking-wider">Zero-Collision Guard Alert</h4>
            <p>1 schedule collision detected on <strong>2026-09-12</strong>. Two overlapping shoots have requested the exact same camera and lead photographer.</p>
          </div>
        </div>
      )}

      {/* Date Selector & Timeline Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-cyber-cyan" />
          <h2 className="text-base font-heading font-bold text-slate-100">Operations Schedule</h2>
        </div>
        <div className="flex items-center gap-2 bg-cyber-dark/80 p-1.5 rounded-xl border border-cyber-border">
          {['2026-09-12', '2026-09-13', '2026-09-14'].map(d => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                selectedDate === d
                  ? 'bg-cyber-purple text-white glow-purple'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Gantt / Event Cards */}
      <div className="space-y-4">
        {activeDateEvents.map(evt => (
          <div
            key={evt.id}
            className={`glass-panel rounded-2xl p-5 border transition ${
              evt.hasConflict 
                ? 'border-red-500/60 bg-red-950/20 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]' 
                : 'border-cyber-border hover:border-cyber-cyan/40'
            }`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div>
                <span className="text-xs font-mono text-cyber-cyan">{evt.startTime} – {evt.endTime}</span>
                <h3 className="text-base font-bold text-slate-100">{evt.title}</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>{evt.venue}</span>
              </div>
            </div>

            {/* Conflict Callout */}
            {evt.hasConflict && (
              <div className="mt-3 p-3 rounded-xl bg-red-900/40 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
                <span>{evt.conflictReason}</span>
              </div>
            )}

            {/* Allocated Gear and Crew */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-1">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Camera className="w-3.5 h-3.5 text-cyber-purple" /> Assigned Gear Kit
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {evt.gear.map((g, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-mono ${
                        evt.hasConflict && g.includes('Sony FX3 #1')
                          ? 'bg-red-950/60 text-red-300 border-red-500/50'
                          : 'bg-cyber-dark/60 text-slate-300 border-white/10'
                      }`}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Users className="w-3.5 h-3.5 text-cyan-400" /> Dispatched Crew
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {evt.crew.map((c, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2.5 py-1 rounded-lg border ${
                        evt.hasConflict && c.includes('Amit Kumar')
                          ? 'bg-red-950/60 text-red-300 border-red-500/50'
                          : 'bg-cyan-950/30 text-cyan-200 border-cyan-500/30'
                      }`}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
