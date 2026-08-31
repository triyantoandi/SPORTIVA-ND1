import React, { useState } from "react";
import { 
  User, 
  MapPin, 
  Flame, 
  Trophy, 
  Settings, 
  Edit3, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  Plus, 
  Layers,
  X,
  Check
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { GearItem } from "../types";
import { formatDistance, formatDuration } from "../utils/formatters";

interface ProfilePageProps {
  onOpenAuth?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onOpenAuth }) => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingGear, setIsAddingGear] = useState(false);

  // Edit Profile Form
  const [fullName, setFullName] = useState(user.fullName);
  const [bio, setBio] = useState(user.bio || "");
  const [location, setLocation] = useState(user.location || "");
  const [weightKg, setWeightKg] = useState(user.weightKg || 70);
  const [heightCm, setHeightCm] = useState(user.heightCm || 175);

  // Add Gear Form
  const [gearName, setGearName] = useState("");
  const [gearBrand, setGearBrand] = useState("");
  const [gearType, setGearType] = useState<"shoes" | "bike" | "other">("shoes");
  const [maxDistanceKm, setMaxDistanceKm] = useState(800);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      fullName,
      bio,
      location,
      weightKg,
      heightCm
    });
    setIsEditing(false);
  };

  const handleAddGear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gearName.trim()) return;

    const newGear: GearItem = {
      id: `gear_${Date.now()}`,
      name: gearName,
      brand: gearBrand || "Brand",
      type: gearType,
      distanceKm: 0,
      maxDistanceKm,
      isRetired: false,
      dateAdded: new Date().toISOString()
    };

    await updateProfile({
      gear: [...(user.gear || []), newGear]
    });

    setIsAddingGear(false);
    setGearName("");
    setGearBrand("");
  };

  const badges = [
    { id: "b_1", title: "Early Pioneer", icon: "🚀", desc: "Bergabung di SPORTIVA beta", date: "Agu 2026" },
    { id: "b_2", title: "10-Day Streak", icon: "🔥", desc: "Konsisten 10 hari berturut-turut", date: "Agu 2026" },
    { id: "b_3", title: "Century Rider", icon: "🚴", desc: "Menempuh 100 KM dalam 1 sesi", date: "Jul 2026" },
    { id: "b_4", title: "Sub-25 5K", icon: "⚡", desc: "Menembus pace 5K di bawah 25 menit", date: "Jul 2026" },
    { id: "b_5", title: "Trail Master", icon: "⛰️", desc: "Akumulasi elevasi 1,000+ meter", date: "Jun 2026" }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Profile Cover Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Cover */}
        <div className="h-44 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 relative">
          <div className="absolute top-4 right-4 flex gap-2">
            {onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 hover:bg-slate-900 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Ganti Akun Email
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 hover:bg-slate-900 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profil
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-12 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-end gap-4">
              <img
                src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                alt={user.fullName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-xl"
              />
              <div className="space-y-1 mb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
                    {user.fullName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white">
                    {user.fitnessLevel}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>@{user.username}</span>
                  {user.location && (
                    <span className="flex items-center gap-0.5">
                      • <MapPin className="w-3.5 h-3.5 text-orange-500" /> {user.location}
                    </span>
                  )}
                  <span>• Bergabung Agu 2026</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-bold flex items-center gap-1.5">
                <Flame className="w-4 h-4 fill-orange-500" />
                <span>{user.stats.currentStreak} Hari Streak</span>
              </div>
            </div>
          </div>

          {user.bio && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed max-w-3xl">
              {user.bio}
            </p>
          )}

          {/* Lifetime Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Distance</div>
              <div className="text-xl font-display font-extrabold text-slate-900 dark:text-white mt-0.5">
                {formatDistance(user.stats.totalDistanceKm)} <span className="text-xs font-normal text-slate-400">KM</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Time</div>
              <div className="text-xl font-mono-sport font-extrabold text-orange-500 mt-0.5">
                {formatDuration(user.stats.totalDurationSec)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-slate-400">Elevation Gain</div>
              <div className="text-xl font-mono-sport font-extrabold text-slate-900 dark:text-white mt-0.5">
                +{user.stats.totalElevationM} <span className="text-xs font-normal text-slate-400">m</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-slate-400">Activities Done</div>
              <div className="text-xl font-display font-extrabold text-slate-900 dark:text-white mt-0.5">
                {user.stats.totalActivities} <span className="text-xs font-normal text-slate-400">Sesi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gear Tracker HUD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-500" />
            <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
              Gear & Equipment Odometer Mileage Tracker 👟🚴
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAddingGear(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 hover:bg-slate-200"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Gear
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(user.gear || []).map(g => {
            const mileagePercent = Math.min(100, Math.round((g.distanceKm / g.maxDistanceKm) * 100));
            return (
              <div
                key={g.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {g.brand} • {g.type}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{g.name}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-orange-500">
                    {g.distanceKm} / {g.maxDistanceKm} KM
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${mileagePercent > 80 ? "bg-red-500" : "bg-orange-500"}`}
                    style={{ width: `${mileagePercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Cabinet */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
            Pencapaian & Lencana Atlet ({badges.length})
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {badges.map(b => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-center space-y-1.5"
            >
              <div className="text-3xl">{b.icon}</div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">{b.title}</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Edit Profil Atlet</h3>
              <button onClick={() => setIsEditing(false)} className="p-1 rounded-full text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Bio</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Lokasi</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Berat Badan (Kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={e => setWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Tinggi Badan (Cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={e => setHeightCm(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Gear Modal */}
      {isAddingGear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Tambah Perlengkapan (Gear)</h3>
              <button onClick={() => setIsAddingGear(false)} className="p-1 rounded-full text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGear} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nama Gear / Model</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Nike Alphafly 3"
                  value={gearName}
                  onChange={e => setGearName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Merek (Brand)</label>
                <input
                  type="text"
                  placeholder="Contoh: Nike / Asics / Trek"
                  value={gearBrand}
                  onChange={e => setGearBrand(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Kategori</label>
                  <select
                    value={gearType}
                    onChange={e => setGearType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="shoes">Sepatu Lari</option>
                    <option value="bike">Sepeda</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Masa Pakai (KM)</label>
                  <input
                    type="number"
                    value={maxDistanceKm}
                    onChange={e => setMaxDistanceKm(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingGear(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold"
                >
                  Tambahkan Gear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
