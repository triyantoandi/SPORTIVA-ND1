import React, { useState, useEffect } from "react";
import { Users, Plus, MapPin, Award, Shield, Check, Lock, Globe, X } from "lucide-react";
import { Club, SportType } from "../types";
import { ClubService } from "../firebase/services/clubService";
import { useAuth } from "../hooks/useAuth";

export const ClubsPage: React.FC = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isCreatingClub, setIsCreatingClub] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("Jember");
  const [selectedSports, setSelectedSports] = useState<SportType[]>(["Running"]);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    const load = async () => {
      const list = await ClubService.fetchClubs();
      setClubs(list);
    };
    load();
  }, []);

  const handleToggleMembership = async (clubId: string, currentMember: boolean) => {
    if (currentMember) {
      await ClubService.leaveClub(clubId);
      setClubs(prev => prev.map(c => c.id === clubId ? { ...c, isMember: false, memberCount: Math.max(0, c.memberCount - 1) } : c));
    } else {
      await ClubService.joinClub(clubId);
      setClubs(prev => prev.map(c => c.id === clubId ? { ...c, isMember: true, memberCount: c.memberCount + 1 } : c));
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newClub = await ClubService.createClub({
      name,
      description,
      city,
      country: "Indonesia",
      sportTypes: selectedSports,
      isPrivate
    });

    setClubs(prev => [newClub, ...prev]);
    setIsCreatingClub(false);
    setName("");
    setDescription("");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white">
            Komunitas & Athletic Clubs 🏅
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bergabung dengan club pelari, cyclist, dan pegiat kebugaran lokal untuk latihan bersama.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreatingClub(true)}
          className="px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-orange-900/30 transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Buat Club Baru
        </button>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {clubs.map(c => (
          <div
            key={c.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            {/* Cover Banner */}
            <div className="h-32 relative bg-slate-800">
              <img
                src={c.coverUrl || "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800"}
                alt={c.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              {/* Logo Overlay */}
              <div className="absolute -bottom-6 left-5">
                <img
                  src={c.logoUrl || "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300"}
                  alt={c.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-slate-900 shadow-lg"
                />
              </div>

              {/* Badges */}
              <div className="absolute top-3 right-3 flex gap-1.5">
                {c.isPrivate ? (
                  <span className="px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Private
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Public
                  </span>
                )}
              </div>
            </div>

            {/* Club Details */}
            <div className="pt-8 p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-display font-black text-slate-900 dark:text-white">
                    {c.name}
                  </h3>
                  {c.isAdmin && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-500">
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-orange-500" /> {c.city}, {c.country}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 font-bold text-slate-700 dark:text-slate-300">
                    <Users className="w-3 h-3" /> {c.memberCount} Anggota
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {c.sportTypes.map(st => (
                    <span key={st} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      {st}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleMembership(c.id, !!c.isMember)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    c.isMember
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-500/10 hover:text-red-500"
                      : "bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-950/20"
                  }`}
                >
                  {c.isMember ? "Joined ✓" : "Gabung Club"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Club */}
      {isCreatingClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Buat Athletic Club Baru</h3>
              <button
                onClick={() => setIsCreatingClub(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Komunitas / Club</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Contoh: Jember Ultra Runners"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Deskripsi & Visi Club</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Komunitas lari rutin mingguan..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Kota Asal</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Tipe Akses</label>
                  <select
                    value={isPrivate ? "private" : "public"}
                    onChange={e => setIsPrivate(e.target.value === "private")}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="public">Publik (Terbuka)</option>
                    <option value="private">Privat (Perlu Persetujuan)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingClub(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-orange-950/40"
                >
                  Buat Komunitas Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
