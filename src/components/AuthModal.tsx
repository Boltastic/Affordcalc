/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { X, Lock, Mail, User, ShieldCheck, Landmark } from "lucide-react";
import { UserAccount } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (account: Partial<UserAccount>) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email || !password || (isSignUp && !name)) {
      setError("Fill out all the requested entries!");
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      onLoginSuccess({
        email,
        name: isSignUp ? name : email.split("@")[0].toUpperCase(),
        isLoggedIn: true,
        settings: {
          currencyCode: currency,
          theme: "dark",
          autoRoast: true,
        },
        savedScans: [],
      });
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  const loadIdentityPreset = (gender: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const genericName = gender === "Pete" ? "Prestige Pete" : "Sofia Student";
      onLoginSuccess({
        email: `${gender.toLowerCase()}@realitycheck.com`,
        name: genericName,
        isLoggedIn: true,
        settings: {
          currencyCode: "USD",
          theme: "dark",
          autoRoast: true,
        },
        savedScans: [],
      });
      setIsLoading(false);
      onClose();
    }, 850);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl animate-fade-in font-sans">
        
        {/* Top visual flare */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          id="auth-modal-close"
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl mb-3">
              <Landmark className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              {isSignUp ? "Create Savage Safe Account" : "Access Reality Check Safe"}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-normal">
              Sign up or select a mock setup to establish your simulated financial scoreboard.
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold leading-normal">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold mb-1.5">
                  Name / Alias
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="E.g., Crypto Chad"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-150 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold mb-1.5">
                Email Balance Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="you@wallet.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-150 focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold mb-1.5">
                Secret Password Guard
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-150 focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold mb-1.5">
                  Visual Ledger Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-150 focus:outline-none focus:border-amber-500 transition cursor-pointer"
                >
                  <option value="USD">USD ($) - US Dollars</option>
                  <option value="EUR">EUR (€) - Euros</option>
                  <option value="GBP">GBP (£) - British Pounds</option>
                  <option value="INR">INR (₹) - Indian Rupees</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              id="auth-submit-btn"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-sm transition font-semibold shadow-lg hover:shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              {isLoading ? "Synchronizing state..." : isSignUp ? "Unlock Safe Access" : "Secure Gate Sign In"}
            </button>
          </form>

          {/* Toggle Screen */}
          <div className="mt-4 text-center">
            <button
              id="auth-toggle-btn"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-slate-400 hover:text-amber-400 font-medium transition cursor-pointer"
            >
              {isSignUp ? "Already have a secure vault? Sign In" : "Need a vault? Establish an Account"}
            </button>
          </div>

          {/* Quick Mock entrance divider */}
          <div className="relative my-6 select-none">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900 px-3.5 text-slate-500 font-mono text-[10px] tracking-widest uppercase font-bold">
                Dynamic Quick Launch
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <button
              id="quick-auth-Pete"
              onClick={() => loadIdentityPreset("Pete")}
              className="p-2 px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl hover:border-amber-500 text-slate-300 transition"
            >
              💻 Prestige Pete
            </button>
            <button
              id="quick-auth-Sofia"
              onClick={() => loadIdentityPreset("Sofia")}
              className="p-2 px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl hover:border-rose-500 text-slate-300 transition"
            >
              🎒 Student Sofia
            </button>
          </div>

          <div className="mt-4 text-center">
            <span className="text-[10px] text-slate-600 font-mono tracking-tight leading-normal">
              Protected by Client Sandbox Encryption
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
