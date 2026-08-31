import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Users, Award, CheckCircle2, Plus, Sparkles, Clock, Ticket } from "lucide-react";
import { EventItem } from "../types";
import { EventService } from "../firebase/services/eventService";
import { useAuth } from "../hooks/useAuth";
import confetti from "canvas-confetti";

export const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registeredBib, setRegisteredBib] = useState<{ [eventId: string]: string }>({});

  useEffect(() => {
    const load = async () => {
      const list = await EventService.fetchEvents();
      setEvents(list);
    };
    load();
  }, []);

  const handleRegister = async (eventId: string) => {
    const bib = await EventService.registerForEvent(eventId);
    setRegisteredBib(prev => ({ ...prev, [eventId]: bib }));
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, isRegistered: true, bibNumber: bib, participantCount: e.participantCount + 1 } : e));
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white">
          Event & Race Calendar 🏁
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Daftar race lari, gran fondo sepeda, dan kompetisi komunitas resmi berhadiah medali & slot BIB eksklusif.
        </p>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(ev => (
          <div
            key={ev.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            {/* Event Banner */}
            <div className="h-44 relative bg-slate-800">
              <img
                src={ev.bannerUrl || "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800"}
                alt={ev.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-xs font-black uppercase tracking-wider text-orange-400 border border-orange-500/30">
                  {ev.sportType} • {ev.distanceKm} KM
                </span>
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div className="text-white text-xs font-semibold flex items-center gap-1.5 drop-shadow">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  <span>{ev.location}</span>
                </div>
                <div className="text-white text-xs font-mono font-bold drop-shadow">
                  {new Date(ev.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-display font-black text-slate-900 dark:text-white">
                  {ev.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {ev.description}
                </p>
                <div className="mt-2 text-[11px] text-slate-400 italic">
                  Peraturan: {ev.rules}
                </div>
              </div>

              {/* BIB Ticket Card if Registered */}
              {ev.isRegistered && (
                <div className="p-3 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-orange-500" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Nomor Dada Resmi (BIB):</span>
                      <span className="text-sm font-mono font-black text-orange-500">{ev.bibNumber || "BIB-284"}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white">
                    Confirmed
                  </span>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white">{ev.participantCount}</span> Atlet Terdaftar
                </div>

                {ev.isRegistered ? (
                  <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Siap Bertanding
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRegister(ev.id)}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-950/20"
                  >
                    Daftar Sekarang (Free Slot)
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
