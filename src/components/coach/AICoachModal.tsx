import React, { useState } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  X, 
  TrendingUp, 
  Activity as ActivityIcon, 
  BatteryCharging, 
  Flame, 
  CheckCircle2, 
  HelpCircle 
} from "lucide-react";
import { AICoachService, AICoachResponse } from "../../firebase/services/aiCoachService";
import { useAuth } from "../../hooks/useAuth";

interface Message {
  role: "user" | "coach";
  text: string;
  timestamp: string;
}

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "coach",
      text: `Halo ${user.fullName}! Saya SPORTIVA AI Fitness Coach. Saya siap menganalisis data aktivitas lari, bersepeda, beban latihan mingguan, dan membantu menyusun strategi peningkatan pace atau program latihan Anda. Ada yang ingin Anda diskusikan hari ini?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const recoveryInfo = AICoachService.getRecoveryEstimation();

  if (!isOpen) return null;

  const handleSendMessage = async (promptText?: string) => {
    const textToSend = promptText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!promptText) setInputText("");
    setIsLoading(true);

    try {
      const resp: AICoachResponse = await AICoachService.askCoach(textToSend);
      const coachMsg: Message = {
        role: "coach",
        text: resp.advice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, coachMsg]);
    } catch (e) {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    "Bagaimana meningkatkan pace 5K saya?",
    "Apakah minggu ini saya terlalu banyak latihan?",
    "Buatkan program latihan 10K untuk 8 minggu.",
    "Analisis performa & stamina saya bulan ini."
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-900/40">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">SPORTIVA AI Fitness Coach</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Gemini Powered
                </span>
              </div>
              <p className="text-xs text-slate-400">Analisis Performa Cerdas & Rekomendasi Periodisasi Latihan</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Panel: Fitness Score & Recovery HUD */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 p-4 space-y-4 overflow-y-auto">
            {/* Fitness Score Card */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SPORTIVA Fitness Score</span>
                <span className="text-xs font-bold text-emerald-400">Level: {user.fitnessLevel.toUpperCase()}</span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-display font-black text-white">{user.fitnessScores.overall}</span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>

              {/* Component breakdown bars */}
              <div className="space-y-2 pt-1">
                {[
                  { label: "Endurance", val: user.fitnessScores.endurance, color: "bg-blue-500" },
                  { label: "Speed", val: user.fitnessScores.speed, color: "bg-orange-500" },
                  { label: "Consistency", val: user.fitnessScores.consistency, color: "bg-emerald-500" },
                  { label: "Recovery", val: user.fitnessScores.recovery, color: "bg-purple-500" }
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>{item.label}</span>
                      <span>{item.val}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recovery & Readiness Insight */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <BatteryCharging className="w-4 h-4 text-emerald-400" />
                  <span>Recovery Status</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  {recoveryInfo.status}
                </span>
              </div>

              <div className="text-2xl font-display font-extrabold text-white">
                {recoveryInfo.score}%
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {recoveryInfo.adviceText}
              </p>

              <div className="pt-2 border-t border-slate-700/60 text-xs">
                <span className="text-slate-400 block mb-1">Saran Sesi Hari Ini:</span>
                <span className="font-semibold text-orange-400">{recoveryInfo.recommendedActivity}</span>
              </div>
            </div>

            {/* Medical Disclaimer Note */}
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/40 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Disclaimer:</strong> Analisis ini adalah fitness insight olahraga berbasis sains performa dan bukan diagnosis medis.
              </span>
            </div>
          </div>

          {/* Right Panel: Interactive AI Chat */}
          <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden bg-slate-900">
            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "coach" && (
                    <div className="w-8 h-8 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center shrink-0 mt-1 border border-orange-500/30">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-orange-600 text-white rounded-tr-none shadow-lg shadow-orange-950/30"
                        : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700 shadow-sm"
                    }`}
                  >
                    {msg.text}
                    <div className={`text-[10px] mt-1.5 ${msg.role === "user" ? "text-orange-200" : "text-slate-400"} text-right`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span>AI Coach sedang menyusun analisis performa...</span>
                </div>
              )}
            </div>

            {/* Quick Question Chips */}
            <div className="pt-3 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {sampleQuestions.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="pt-2 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                placeholder="Tanyakan analisis pace, recovery, atau program latihan..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputText.trim()}
                className="px-5 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 disabled:opacity-50 transition-all"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
