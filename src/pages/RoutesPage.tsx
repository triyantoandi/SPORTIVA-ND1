import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  TrendingUp, 
  Clock, 
  Bookmark, 
  Plus, 
  Download, 
  Compass, 
  ChevronRight, 
  Share2,
  X,
  Sparkles,
  Film
} from "lucide-react";
import { RouteItem, SportType, Activity } from "../types";
import { RouteService } from "../firebase/services/routeService";
import { LeafletMap } from "../components/map/LeafletMap";
import { RouteEditorMap } from "../components/map/RouteEditorMap";
import { RouteFlyover3DModal } from "../components/flyover/RouteFlyover3DModal";
import { formatDistance, formatDuration } from "../utils/formatters";

export const RoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [sportFilter, setSportFilter] = useState("All");
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [flyoverActivity, setFlyoverActivity] = useState<Activity | null>(null);

  // New Route Form
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSport, setNewSport] = useState<SportType>("Running");
  const [newDifficulty, setNewDifficulty] = useState<"Easy" | "Moderate" | "Hard" | "Extreme">("Moderate");
  const [newWaypoints, setNewWaypoints] = useState<any[]>([]);
  const [calculatedDist, setCalculatedDist] = useState(0);

  useEffect(() => {
    const load = async () => {
      const list = await RouteService.fetchRoutes(sportFilter);
      setRoutes(list);
      if (list.length > 0 && !selectedRoute) {
        setSelectedRoute(list[0]);
      }
    };
    load();
  }, [sportFilter]);

  const handleToggleSave = async (routeId: string) => {
    const isSaved = await RouteService.toggleSaveRoute(routeId);
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, isSaved } : r));
    if (selectedRoute && selectedRoute.id === routeId) {
      setSelectedRoute(prev => prev ? { ...prev, isSaved } : null);
    }
  };

  const handleWaypointsChange = (wps: any[], dist: number) => {
    setNewWaypoints(wps);
    setCalculatedDist(dist);
  };

  const handleSaveNewRoute = async () => {
    if (!newTitle.trim() || newWaypoints.length < 2) return;

    const created = await RouteService.createRoute({
      title: newTitle,
      description: newDescription || "Rute custom SPORTIVA Athlete",
      sportType: newSport,
      distanceKm: calculatedDist,
      elevationGainM: Math.round(calculatedDist * 14),
      difficulty: newDifficulty,
      estimatedDurationSec: Math.round((calculatedDist / 10) * 3600),
      waypoints: newWaypoints,
      location: "Jember, Indonesia"
    });

    setRoutes(prev => [created, ...prev]);
    setSelectedRoute(created);
    setIsCreatingRoute(false);
    setNewTitle("");
    setNewDescription("");
    setNewWaypoints([]);
    setCalculatedDist(0);
  };

  const handleExportGPX = (route: RouteItem) => {
    const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="SPORTIVA Athletic Platform">\n<metadata><name>${route.title}</name></metadata>\n<trk><name>${route.title}</name><trkseg>\n`;
    const gpxPoints = route.waypoints.map(w => `<trkpt lat="${w.lat}" lon="${w.lng}"><ele>${w.altitude || 80}</ele></trkpt>`).join("\n");
    const gpxFooter = `\n</trkseg></trk>\n</gpx>`;
    const fullGpx = gpxHeader + gpxPoints + gpxFooter;

    const blob = new Blob([fullGpx], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${route.title.replace(/\s+/g, "_")}.gpx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white">
            Route Explorer & Trail Planner 🗺️
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Jelajahi segmen rute populer atau rancang rute latihan Anda sendiri dengan panduan kontur elevasi.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreatingRoute(true)}
          className="px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-orange-900/30 transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Rancang Rute Baru
        </button>
      </div>

      {/* Sport Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {["All", "Running", "Cycling", "Hiking", "Trekking"].map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setSportFilter(s)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              sportFilter === s
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Main Routes Grid / Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Route List Cards */}
        <div className="lg:col-span-5 space-y-3.5">
          {routes.map(r => {
            const isSelected = selectedRoute?.id === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRoute(r)}
                className={`p-4 rounded-3xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-orange-500/10 border-orange-500 shadow-md"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {r.sportType} • {r.difficulty}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white font-display mt-1">
                      {r.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {r.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSave(r.id);
                    }}
                    className={`p-2 rounded-xl transition-colors ${
                      r.isSaved ? "text-orange-500 bg-orange-500/10" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${r.isSaved ? "fill-orange-500" : ""}`} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Jarak</span>
                    <span className="font-display font-extrabold text-slate-900 dark:text-white">{r.distanceKm} KM</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Elevasi</span>
                    <span className="font-mono-sport font-extrabold text-slate-900 dark:text-white">+{r.elevationGainM}m</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Estimasi</span>
                    <span className="font-mono-sport font-extrabold text-orange-500">{formatDuration(r.estimatedDurationSec)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Route Interactive Map & GPX Exporter */}
        <div className="lg:col-span-7">
          {selectedRoute ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm sticky top-20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-black text-slate-900 dark:text-white">
                    {selectedRoute.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span>{selectedRoute.location}</span>
                    <span>• Dibuat oleh {selectedRoute.createdBy}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFlyoverActivity({
                        id: selectedRoute.id,
                        userId: "route_planner",
                        userName: selectedRoute.createdBy,
                        title: selectedRoute.title,
                        sportType: selectedRoute.sportType,
                        distanceKm: selectedRoute.distanceKm,
                        durationSec: selectedRoute.estimatedDurationSec,
                        avgPaceMinPerKm: (selectedRoute.estimatedDurationSec / 60) / selectedRoute.distanceKm,
                        elevationGainM: selectedRoute.elevationGainM,
                        routePoints: selectedRoute.waypoints as any,
                        createdAt: Date.now()
                      });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500 text-orange-600 dark:text-orange-400 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-orange-500/20 transition-all"
                  >
                    <Film className="w-3.5 h-3.5" />
                    3D Flyover
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportGPX(selectedRoute)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5 text-orange-500" />
                    Export GPX
                  </button>
                </div>
              </div>

              {/* Map Preview */}
              <LeafletMap
                points={selectedRoute.waypoints as any}
                height="320px"
              />

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Deskripsi Rute</h5>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedRoute.description}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-slate-400 text-xs">
              Pilih salah satu rute untuk melihat jalur peta.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Interactive Custom Route Planner */}
      {isCreatingRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-white text-base">SPORTIVA Custom Trail & Route Planner</h3>
              </div>
              <button
                onClick={() => setIsCreatingRoute(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Route Map Click Engine */}
            <RouteEditorMap
              onWaypointsChange={handleWaypointsChange}
              height="340px"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Rute</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Contoh: Loop Alun-Alun Jember & UNEJ"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Jenis Olahraga</label>
                <select
                  value={newSport}
                  onChange={e => setNewSport(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Running">Running</option>
                  <option value="Cycling">Cycling</option>
                  <option value="Hiking">Hiking</option>
                  <option value="Walking">Walking</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div>
                <span className="text-xs text-slate-400 block">Total Jarak Terkalkulasi:</span>
                <span className="text-2xl font-display font-extrabold text-orange-400">{calculatedDist} KM</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Waypoints:</span>
                <span className="text-2xl font-mono-sport font-extrabold text-white">{newWaypoints.length} Pins</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingRoute(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveNewRoute}
                disabled={newWaypoints.length < 2 || !newTitle.trim()}
                className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-orange-950/40 disabled:opacity-40"
              >
                Simpan & Publikasikan Rute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Flyover Modal for Route Preview */}
      <RouteFlyover3DModal
        activity={flyoverActivity}
        onClose={() => setFlyoverActivity(null)}
      />
    </div>
  );
};
