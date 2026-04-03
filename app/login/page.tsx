"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState("Username atau password salah!");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (res.ok) {
        localStorage.setItem("isLogin", "true");

        setTimeout(() => {
          router.push("/admin");
        }, 800);
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Username atau password salah!");
        setError(true);
      }
    } catch (error) {
      setErrorMessage("Terjadi kesalahan jaringan.");
      setError(true);
    }

    setLoading(false);
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0f16] font-sans selection:bg-emerald-500/30">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[40rem] h-[40rem] bg-emerald-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[20%] w-[35rem] h-[35rem] bg-teal-600/10 rounded-full blur-[120px] mix-blend-screen" />
        {/* Subtle Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="backdrop-blur-2xl bg-slate-900/60 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden relative group">
          
          {/* Top Edge Highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 mb-5 shadow-inner"
              >
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                Administrator
              </h2>
              <p className="text-slate-400 text-sm">
                Login untuk mengelola sistem PPDB
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">
                  Username
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500 group-focus-within/input:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError(false);
                    }}
                    disabled={loading}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Masukkan username"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within/input:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(false);
                    }}
                    disabled={loading}
                    className={`block w-full pl-11 pr-12 py-3.5 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      error
                        ? "border-red-500/50 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                        : "border-slate-700/50 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {/* Error Box */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mt-2 ml-1"
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <motion.button
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-medium shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 overflow-hidden group border border-emerald-500/30"
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                      />
                      <span className="relative z-10">Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">Sign In</span>
                      <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
          
          {/* Footer inside card */}
          <div className="bg-slate-900/80 py-4 px-8 border-t border-slate-700/50 text-center">
            <p className="text-xs text-slate-500 font-medium tracking-wide">
              Sistem Informasi PPDB © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
