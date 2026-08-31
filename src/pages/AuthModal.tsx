import React, { useState } from "react";
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthTab = "login" | "register" | "forgot";

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, resetPassword, loginGoogle, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      if (activeTab === "register") {
        if (!email.trim() || !password.trim()) {
          setError("Email dan password wajib diisi");
          return;
        }
        if (password.length < 6) {
          setError("Password minimal 6 karakter");
          return;
        }
        await register(
          email.trim(),
          password,
          fullName.trim() || email.split("@")[0],
          username.trim() || email.split("@")[0]
        );
        onClose();
      } else if (activeTab === "login") {
        if (!email.trim() || !password.trim()) {
          setError("Email dan password wajib diisi");
          return;
        }
        await login(email.trim(), password);
        onClose();
      } else if (activeTab === "forgot") {
        if (!email.trim()) {
          setError("Masukkan alamat email Anda");
          return;
        }
        await resetPassword(email.trim());
        setSuccessMessage("Link reset password telah dikirim ke email " + email);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses autentikasi");
    }
  };

  const handleQuickLogin = async (presetEmail: string, presetName: string) => {
    setEmail(presetEmail);
    setPassword("password123");
    setError(null);
    try {
      await login(presetEmail, "password123");
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal login dengan akun demo");
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await loginGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal login dengan Google");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-5 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-xl text-white shadow-md shadow-orange-500/20">
              S
            </div>
            <div>
              <h3 className="font-display font-black text-lg tracking-wide text-slate-900 dark:text-white">
                SPORTIVA AUTH
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Akses akun atlet & sinkronisasi data latihan
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setError(null);
              setSuccessMessage(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              activeTab === "login"
                ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Masuk dengan Email
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setError(null);
              setSuccessMessage(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              activeTab === "register"
                ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {activeTab === "register" && (
            <>
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Nama Lengkap Atlet
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Triyanto Andi"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Username (@)
                </label>
                <input
                  type="text"
                  required
                  placeholder="triyanto_runner"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>
          </div>

          {activeTab !== "forgot" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 dark:text-slate-300 font-bold block">
                  Password
                </label>
                {activeTab === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("forgot");
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] text-orange-500 hover:underline font-semibold"
                  >
                    Lupa password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <span>Memproses...</span>
            ) : activeTab === "register" ? (
              <>
                <span>Daftar Akun Baru</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : activeTab === "forgot" ? (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Kirim Link Reset Password</span>
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {activeTab === "forgot" && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="text-xs text-orange-500 font-semibold hover:underline"
              >
                ← Kembali ke Halaman Masuk
              </button>
            </div>
          )}
        </form>

        {/* Quick Demo Athlete Accounts */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center justify-between">
            <span>Pilihan Akun Cepat</span>
            <span className="text-orange-500 font-bold">1-Klik Masuk</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("triyantoandi80@gmail.com", "Andi Triyanto")}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 hover:bg-orange-500/5 text-left transition-all flex items-center gap-2.5"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                alt="Andi"
                className="w-7 h-7 rounded-full object-cover border border-orange-500/40"
              />
              <div className="truncate">
                <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">Andi Triyanto</div>
                <div className="text-[9px] text-slate-400 font-mono truncate">triyantoandi80@gmail.com</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("sarah.jenkins@sportiva.run", "Sarah Jenkins")}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 hover:bg-orange-500/5 text-left transition-all flex items-center gap-2.5"
            >
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                alt="Sarah"
                className="w-7 h-7 rounded-full object-cover border border-orange-500/40"
              />
              <div className="truncate">
                <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">Sarah Jenkins</div>
                <div className="text-[9px] text-slate-400 font-mono truncate">sarah.jenkins@sportiva.run</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

