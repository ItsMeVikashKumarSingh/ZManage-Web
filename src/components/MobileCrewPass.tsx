import React, { useState } from 'react';
import { MapPin, Clock, Camera, CheckCircle2, Shield, Smartphone } from 'lucide-react';

export const MobileCrewPass: React.FC = () => {
  const [hasArrived, setHasArrived] = useState<boolean>(false);
  const [wrapDone, setWrapDone] = useState<boolean>(false);
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({
    'g-1': true,
    'g-2': true,
    'g-3': false
  });

  const toggleGearCheck = (id: string) => {
    setCheckedGear(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col items-center justify-center p-2">
      {/* Phone Mockup Frame (Dub Clean White/Slate Border-First Theme) */}
      <div className="w-full max-w-sm rounded-[36px] p-4 bg-white border-4 border-charcoal shadow-floating">
        {/* Dynamic Island Notch */}
        <div className="w-24 h-4 bg-charcoal mx-auto rounded-full mb-4" />

        {/* Content Container */}
        <div className="space-y-4">
          {/* Header Card */}
          <div className="dub-card p-4 bg-paper border border-ash">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-electric font-semibold">CREW PASS #8492</span>
              <span className="text-steel font-medium">Lead Cinematographer</span>
            </div>
            <h2 className="text-base font-semibold font-satoshi text-charcoal mt-1">Arora Wedding — Sangeet</h2>
            <div className="flex items-center gap-1.5 text-xs text-steel mt-1">
              <Clock className="w-3.5 h-3.5 text-tangerine" />
              <span>Call: <strong className="text-charcoal font-mono">04:00 PM</strong> • Wrap: 11:30 PM</span>
            </div>
          </div>

          {/* Venue & GPS Directions */}
          <div className="dub-card p-4 bg-white border border-ash space-y-2">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-electric shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold text-charcoal">Taj Palace, New Delhi</div>
                <div className="text-steel">Durbar Hall, Ground Floor Entrance</div>
              </div>
            </div>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noreferrer"
              className="block text-center py-2 rounded-lg bg-paper text-charcoal text-xs font-semibold border border-ash hover:bg-ash/40 transition"
            >
              Open GPS Navigation
            </a>
          </div>

          {/* Assigned Equipment Kit */}
          <div className="dub-card p-4 bg-white border border-ash space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-steel" /> Assigned Camera Kit
              </span>
              <span className="text-[10px] text-fog font-mono">3 ITEMS</span>
            </div>

            <div className="space-y-1.5">
              {[
                { id: 'g-1', name: 'Sony FX3 Body #1', sn: 'SN-849204' },
                { id: 'g-2', name: 'Sony 70-200mm f/2.8 GM II', sn: 'SN-294819' },
                { id: 'g-3', name: '3x NP-FZ100 Batteries + Charger', sn: 'KIT-BAT-04' }
              ].map(gear => (
                <div
                  key={gear.id}
                  onClick={() => toggleGearCheck(gear.id)}
                  className="flex items-center justify-between p-2 rounded-lg bg-paper/60 border border-ash text-xs cursor-pointer hover:bg-paper"
                >
                  <div>
                    <div className={`font-medium ${checkedGear[gear.id] ? 'text-charcoal' : 'text-steel'}`}>
                      {gear.name}
                    </div>
                    <div className="text-[10px] font-mono text-fog">{gear.sn}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={checkedGear[gear.id] || false}
                    onChange={() => {}}
                    className="w-4 h-4 rounded border-ash text-electric focus:ring-0 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Arrival & Wrap Action Buttons */}
          <div className="space-y-2 pt-1">
            {!hasArrived ? (
              <button
                onClick={() => setHasArrived(true)}
                className="dub-btn-primary w-full py-2.5 text-xs font-semibold"
              >
                Tap When Arrived on Venue
              </button>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-vividGreen" />
                <span>Arrival Logged at 03:45 PM</span>
              </div>
            )}

            {hasArrived && (
              <button
                onClick={() => setWrapDone(true)}
                disabled={wrapDone}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition ${
                  wrapDone
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'dub-btn-outline'
                }`}
              >
                {wrapDone ? 'Shoot Wrap Completed' : 'Log Shoot Wrap'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
