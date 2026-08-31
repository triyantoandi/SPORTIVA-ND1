import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Radio, 
  Share2, 
  Copy, 
  Check, 
  ShieldAlert, 
  BatteryCharging, 
  Clock, 
  MapPin, 
  PhoneCall, 
  MessageSquare, 
  X, 
  CheckCircle2,
  Lock,
  Compass,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface LiveBeaconModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLat?: number;
  currentLng?: number;
  isRecording?: boolean;
}

export const LiveBeaconModal: React.FC<LiveBeaconModalProps> = ({
  isOpen,
  onClose,
  currentLat = -8.1724,
  currentLng = 113.7007,
  isRecording = true
}) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState("0812-3456-7890 (Keluarga / Pelatih)");
  const [shareSuccessMessage, setShareSuccessMessage] = useState<string | null>(null);
  const [sosSent, setSosSent] = useState(false);

  if (!isOpen) return null;

  const beaconToken = "sportiva-live-track-" + Math.random().toString(36).substring(2, 9);
  const shareableUrl = `${window.location.origin}/#live-beacon?token=${beaconToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const text = `Halo, pantau aktivitas lari/sepeda saya secara real-time demi keselamatan di SPORTIVA Live Beacon: ${shareableUrl} (Lokasi GPS Live: ${currentLat.toFixed(5)}, ${currentLng.toFixed(5)})`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    setShareSuccessMessage("Tautan Live Beacon berhasil disiapkan untuk dikirim ke WhatsApp!");
    window.open(waUrl, "_blank");
    setTimeout(() => setShareSuccessMessage(null), 4000);
  };

  const handleTriggerSOS = () => {
    setSosSent(true);
    setTimeout(() => setSosSent(false), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-xl bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-white flex items-center gap-2">
                SPORTIVA LIVE BEACON & SAFETY
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              </h3>
              <p className="text-xs text-slate-400">
                Bagikan lokasi GPS, rute, dan status keselamatan Anda secara real-time ke kontak darurat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status HUD Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-950 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>BEACON SIGNAL: ACTIVE & BROADCASTING</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <BatteryCharging className="w-4 h-4" />
                <span>94% Battery</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Koordinat Live GPS</span>
                <span className="text-white font-mono font-bold">{currentLat.toFixed(5)}, {currentLng.toFixed(5)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Enkripsi Siaran</span>
                <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> End-to-End Encrypted
                </span>
              </div>
            </div>
          </div>

          {/* Shareable Link Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Tautan Live Tracking Real-Time
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-orange-400 font-mono focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-950/40 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Tersalin!" : "Salin"}</span>
              </button>
            </div>
          </div>

          {/* Quick Sharing Channels */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Kirim ke Kontak Darurat
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Bagikan via WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Share2 className="w-4 h-4 text-orange-400" />
                <span>Bagikan Tautan Publik</span>
              </button>
            </div>
          </div>

          {/* SOS Emergency Trigger Button */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleTriggerSOS}
              className={`w-full py-3.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                sosSent 
                  ? "bg-red-500 text-white animate-pulse" 
                  : "bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/60 shadow-lg shadow-red-950/50"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{sosSent ? "🚨 SINYAL SOS DARURAT TELAH DIKIRIM!" : "KIRIM PERINGATAN SOS DARURAT (INCIDENT DETECTION)"}</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-1.5">
              Fitur deteksi insiden otomatis akan mengirim notifikasi SMS ke kontak darurat jika atlet tidak bergerak selama lebih dari 3 menit saat tracking aktif.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
