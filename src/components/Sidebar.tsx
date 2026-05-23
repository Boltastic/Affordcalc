/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutDashboard, Calculator, MessageSquareWarning, ArrowLeftRight, Settings, LogOut, User, Landmark, HelpCircle, Gift } from "lucide-react";
import { UserAccount } from "../types";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userAccount: UserAccount;
  onLogout: () => void;
  onOpenAuth: () => void;
  onLoadPreset: (presetId: string) => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  userAccount,
  onLogout,
  onOpenAuth,
  onLoadPreset,
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { id: "calculator", label: "Calculator", Icon: Calculator },
    { id: "advisor", label: "AI Advisor Roast", Icon: MessageSquareWarning },
    { id: "comparison", label: "Rule of Smarter Buy", Icon: ArrowLeftRight },
    { id: "settings", label: "Finance Profile", Icon: Settings },
  ];

  return (
    <aside className="w-80 h-screen bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col justify-between hidden md:flex sticky top-0 font-sans z-40">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-rose-600 to-amber-500 rounded-xl shadow-lg ring-1 ring-rose-500/20">
            <Landmark className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Can I Afford This?
            </h1>
            <p className="text-[10px] text-rose-500 font-mono tracking-widest uppercase font-bold">
              🔥 FINANCIAL REALITY CHECK
            </p>
          </div>
        </div>

        {/* User Account / Profile status */}
        <div className="mx-4 mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 shrink-0 select-none rounded-lg bg-slate-800 border border-slate-700 text-base flex items-center justify-center font-bold text-amber-500 ring-4 ring-amber-500/5">
              {userAccount.isLoggedIn ? (
                userAccount.name[0]?.toUpperCase() || <User className="h-4 w-4 text-slate-400" />
              ) : (
                <HelpCircle className="h-4 w-4 text-slate-500" />
              )}
            </div>
            <div className="min-w-0 pr-1">
              <div className="text-xs font-semibold text-slate-200 truncate leading-none">
                {userAccount.isLoggedIn ? userAccount.name : "Guest Gladiator"}
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate mt-1">
                {userAccount.isLoggedIn ? userAccount.email : "Simulated Mode"}
              </div>
            </div>
          </div>
          {userAccount.isLoggedIn ? (
            <button
              onClick={onLogout}
              id="btn-logout"
              title="Logout Account"
              className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-rose-500/20 hover:text-rose-400 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              id="btn-login-sidebar"
              className="px-3 py-1 text-xs font-medium rounded-lg bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 hover:shadow-lg transition cursor-pointer"
            >
              Join
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="mt-8 px-4 space-y-1.5">
          <span className="px-3 text-[10px] text-slate-500 font-mono tracking-wider uppercase font-bold block mb-3">
            Core Modules
          </span>
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-lg text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? "bg-slate-800 text-amber-400 border-l-4 border-amber-500 shadow-md"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                <item.Icon className={`h-4.5 w-4.5 ${isActive ? "text-amber-400 text-glow" : "text-slate-400"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Demo Loader Selector */}
      <div className="p-4 border-t border-slate-800">
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 select-none">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
            <span className="text-[10px] font-mono text-rose-500 uppercase tracking-wider font-bold">
              Immersive Chaos Presets
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal mb-3">
            Load an extreme, pre-configured financial disaster profile instantly.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              id="preset-load-tech-bro"
              onClick={() => onLoadPreset("tech_bro")}
              className="p-1 px-2 text-[10px] rounded bg-slate-900 border border-slate-800 hover:border-amber-500 hover:text-amber-400 transition"
            >
              💻 Tech Bro
            </button>
            <button
              id="preset-load-student"
              onClick={() => onLoadPreset("student")}
              className="p-1 px-2 text-[10px] rounded bg-slate-900 border border-slate-800 hover:border-rose-500 hover:text-rose-400 transition"
            >
              🎒 Broke Grad
            </button>
            <button
              id="preset-load-crypto"
              onClick={() => onLoadPreset("crypto_gambler")}
              className="p-1 px-2 text-[10px] rounded bg-slate-900 border border-slate-800 hover:border-sky-500 hover:text-sky-400 transition"
            >
              🚀 Crypto God
            </button>
            <button
              id="preset-load-steady"
              onClick={() => onLoadPreset("steady_spender")}
              className="p-1 px-2 text-[10px] rounded bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:text-emerald-400 transition"
            >
              📚 Safe Teacher
            </button>
          </div>
        </div>
        <div className="text-center mt-4">
          <span className="text-[10px] text-slate-600 font-mono">
            v1.2.0 • Standalone Applet
          </span>
        </div>
      </div>
    </aside>
  );
}
