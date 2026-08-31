import React, { useRef, useState } from "react";
import { X, Download, Share2, Copy, Check, Sparkles } from "lucide-react";
import { Activity } from "../../types";
import { formatDistance, formatDuration, formatPace } from "../../utils/formatters";
import * as htmlToImage from "html-to-image";

interface ShareCardModalProps {
  activity: Activity | null;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ activity, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!activity) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 0.95 });
      const link = document.createElement("a");
      link.download = `SPORTIVA_${activity.sportType}_${activity.distanceKm}KM.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Export card error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/activity/${activity.id}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-white text-base">SPORTIVA Share Card</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Share Card Canvas Container */}
        <div
          ref={cardRef}
          className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 p-7 flex flex-col justify-between shadow-2xl text-white select-none"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.92) 100%), url('https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800')`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          {/* Header Branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center font-black text-lg shadow-lg shadow-orange-600/40">
                S
              </div>
              <span className="font-display font-black tracking-wider text-xl">SPORTIVA</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-orange-400 border border-white/10">
              {activity.sportType}
            </span>
          </div>

          {/* Central Athletic Giant Numbers */}
          <div className="space-y-4 my-auto">
            <div>
              <div className="text-6xl font-display font-black tracking-tight text-white leading-none">
                {formatDistance(activity.distanceKm)}
                <span className="text-xl font-bold text-orange-400 ml-2">KM</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Duration</div>
                <div className="text-2xl font-mono-sport font-extrabold text-white">
                  {formatDuration(activity.durationSec)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Avg Pace</div>
                <div className="text-2xl font-mono-sport font-extrabold text-white">
                  {formatPace(activity.avgPaceMinPerKm)} <span className="text-xs font-normal text-slate-400">/KM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Card Info */}
          <div className="flex items-end justify-between border-t border-white/10 pt-4">
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-wider">
                {activity.userLocation ? activity.userLocation.toUpperCase() : "JEMBER"}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {activity.userName}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono text-orange-400 font-semibold tracking-wider">
                #SPORTIVAATHLETE
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? "Generating..." : "Download Card (PNG)"}
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {isCopied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>
    </div>
  );
};
