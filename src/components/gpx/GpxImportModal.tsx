import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  FileText, 
  X, 
  Check, 
  MapPin, 
  TrendingUp, 
  Activity as ActivityIcon, 
  Heart, 
  Clock, 
  Zap, 
  AlertCircle, 
  CheckCircle2,
  Sparkles,
  Layers
} from "lucide-react";
import confetti from "canvas-confetti";
import { parseGPX, parseTCX, ParsedGpxData } from "../../utils/gpxParser";
import { ActivityService } from "../../firebase/services/activityService";
import { LeafletMap } from "../map/LeafletMap";
import { useAuth } from "../../hooks/useAuth";
import { SportType, PrivacyLevel } from "../../types";
import { formatDistance, formatDuration, formatPace } from "../../utils/formatters";

interface GpxImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityImported?: (activity: any) => void;
}

export const GpxImportModal: React.FC<GpxImportModalProps> = ({
  isOpen,
  onClose,
  onActivityImported
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedGpxData | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State for saving
  const [title, setTitle] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [sportType, setSportType] = useState<SportType>("Running");
  const [privacy, setPrivacy] = useState<PrivacyLevel>("PUBLIC");
  const [selectedGearId, setSelectedGearId] = useState<string>("");

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    setFileName(file.name);
    setIsProcessing(true);

    try {
      const text = await file.text();
      let data: ParsedGpxData;

      if (file.name.toLowerCase().endsWith(".tcx")) {
        data = parseTCX(text);
      } else {
        data = parseGPX(text);
      }

      setParsedData(data);
      setTitle(data.title || file.name.replace(/\.[^/.]+$/, ""));
      setSportType(data.sportType);
    } catch (err: any) {
      console.error("Parse GPX error:", err);
      setErrorMessage(err?.message || "Gagal memproses file GPX/TCX.");
      setParsedData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSaveImport = async () => {
    if (!parsedData) return;
    setIsProcessing(true);

    try {
      const { activity, newPRs } = await ActivityService.saveCompletedActivity({
        sportType,
        title: title.trim() || `${sportType} Workout`,
        caption: caption.trim() || `Diimpor dari file GPS (${fileName})`,
        privacy,
        durationSec: parsedData.durationSec,
        distanceKm: parsedData.distanceKm,
        avgSpeedKmh: parsedData.avgSpeedKmh,
        maxSpeedKmh: parsedData.maxSpeedKmh,
        avgPaceMinPerKm: parsedData.avgPaceMinPerKm,
        elevationGainM: parsedData.elevationGainM,
        caloriesKcal: parsedData.caloriesKcal,
        avgHeartRate: parsedData.avgHeartRate,
        cadence: parsedData.cadence,
        routePoints: parsedData.points,
        startTime: parsedData.startTime,
        endTime: parsedData.endTime
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onActivityImported) {
        onActivityImported(activity);
      }

      handleClose();
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMessage(err?.message || "Gagal menyimpan aktivitas.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setParsedData(null);
    setFileName("");
    setErrorMessage(null);
    setTitle("");
    setCaption("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-3xl bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-white flex items-center gap-2">
                IMPOR FILE GPX / TCX GPS
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  Garmin • Strava • Apple Watch
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Unggah file rekaman GPS eksternal untuk dimasukkan ke feed & statistik SPORTIVA
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* File Upload Dropzone (if no data parsed yet) */}
          {!parsedData && (
            <div className="space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-orange-500 bg-orange-500/10 scale-[1.01]"
                    : "border-slate-700 bg-slate-950/50 hover:border-slate-500 hover:bg-slate-800/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".gpx,.tcx"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-16 h-16 rounded-3xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8" />
                </div>

                <h4 className="text-base font-bold text-white mb-1">
                  Tarik & Lepas File .GPX / .TCX ke sini
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Mendukung file track dari smartwatch Garmin, Suunto, Coros, Wahoo, Apple Watch, Strava, dan Nike Run Club.
                </p>

                <button
                  type="button"
                  className="mt-5 px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-extrabold shadow-lg shadow-orange-950/30 transition-all inline-flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Pilih File dari Komputer
                </button>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* Parsed Preview Screen */}
          {parsedData && (
            <div className="space-y-5 animate-fadeIn">
              {/* Success Banner */}
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>File berhasil dibaca: <strong>{fileName}</strong> ({parsedData.points.length} GPS Points)</span>
                </div>
                <button
                  onClick={() => setParsedData(null)}
                  className="text-xs text-slate-400 hover:text-white underline font-mono"
                >
                  Ganti File
                </button>
              </div>

              {/* Metrics Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Distance</div>
                  <div className="text-2xl font-display font-black text-white mt-0.5">
                    {formatDistance(parsedData.distanceKm)} <span className="text-xs font-normal text-slate-400">KM</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Duration</div>
                  <div className="text-2xl font-mono-sport font-black text-orange-400 mt-0.5">
                    {formatDuration(parsedData.durationSec)}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Avg Pace</div>
                  <div className="text-2xl font-mono-sport font-black text-white mt-0.5">
                    {formatPace(parsedData.avgPaceMinPerKm)} <span className="text-xs font-normal text-slate-400">/km</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Elevation Gain</div>
                  <div className="text-2xl font-mono-sport font-black text-emerald-400 mt-0.5">
                    +{parsedData.elevationGainM} <span className="text-xs font-normal text-slate-400">m</span>
                  </div>
                </div>
              </div>

              {/* Map Preview */}
              <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-md">
                <LeafletMap
                  points={parsedData.points}
                  height="220px"
                  zoom={14}
                />
              </div>

              {/* Save Form Details */}
              <div className="space-y-3.5 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Judul Aktivitas</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Judul aktivitas..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Kategori Olahraga</label>
                    <select
                      value={sportType}
                      onChange={e => setSportType(e.target.value as SportType)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="Running">🏃‍♂️ Running</option>
                      <option value="Cycling">🚴‍♂️ Cycling</option>
                      <option value="Walking">🚶‍♂️ Walking</option>
                      <option value="Hiking">🥾 Hiking</option>
                      <option value="Trekking">⛰️ Trekking</option>
                      <option value="Treadmill">🏃 Treadmill</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Catatan Tambahan</label>
                  <textarea
                    rows={2}
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="Catatan rute atau cuaca..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Gear Selector */}
                {user.gear && user.gear.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-orange-400" />
                      Gunakan Gear / Sepatu (Odometer Mileage)
                    </label>
                    <select
                      value={selectedGearId}
                      onChange={e => setSelectedGearId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Tanpa Gear Spesifik</option>
                      {user.gear.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.brand}) - {g.distanceKm}/{g.maxDistanceKm} KM
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setParsedData(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-semibold text-sm"
                >
                  Batal / Pilih Ulang
                </button>
                <button
                  type="button"
                  onClick={handleSaveImport}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-orange-950/40 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  {isProcessing ? "Menyimpan ke Feed..." : "Simpan & Publikasikan ke Feed"}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
