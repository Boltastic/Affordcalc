/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import {
  Calculator,
  MessageSquareWarning,
  ArrowLeftRight,
  Settings,
  Flame,
  User,
  Trash2,
  TrendingDown,
  Clock,
  Briefcase,
  HelpCircle,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Crown,
  Share2,
  Activity,
  Award,
  BookOpen,
  DollarSign,
  ChevronRight,
  Coins,
  Smile,
  Zap,
  RotateCcw,
  Sparkles,
  SmilePlus,
  AlertTriangle,
  FlameKindling
} from "lucide-react";

import { UserAccount, PurchaseGoal, CURRENCIES, AffordabilityReport } from "./types";
import { calculateAffordability, generateAchievementsList } from "./utils/calculations";
import Sidebar from "./components/Sidebar";
import AuthModal from "./components/AuthModal";
import { DEMO_PROFILES, DemoProfile } from "./data/demoProfiles";

export default function App() {
  // Active states
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [activeScanId, setActiveScanId] = useState<string | null>(null);

  // User Profile Data
  const [userAccount, setUserAccount] = useState<UserAccount>({
    email: "prestige.pete@siliconvalley.com",
    name: "Pete",
    isLoggedIn: false,
    settings: {
      currencyCode: "USD",
      theme: "dark",
      autoRoast: true,
    },
    savedScans: [],
  });

  // Financial State Parameters for live calculator tracking
  const [monthlyIncome, setMonthlyIncome] = useState<number>(12500);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(11900);
  const [currentSavings, setCurrentSavings] = useState<number>(3500);
  const [currentDebt, setCurrentDebt] = useState<number>(85000);
  const [hourlyWage, setHourlyWage] = useState<number>(72);
  const [hoursWorkedPerWeek, setHoursWorkedPerWeek] = useState<number>(40);
  const [country, setCountry] = useState<string>("United States");
  const [city, setCity] = useState<string>("San Francisco");

  // Purchase Goal State
  const [itemName, setItemName] = useState<string>("Custom Titanium Road Bike");
  const [itemCost, setItemCost] = useState<number>(9500);
  const [itemCategory, setItemCategory] = useState<"electronics" | "luxury" | "vehicle" | "vacation" | "entertainment" | "other">("luxury");
  const [itemUrgency, setItemUrgency] = useState<number>(2);

  // Custom AI Roast Output State
  const [aiAnalysis, setAiAnalysis] = useState<{
    roast: string;
    smarterAlternative: string;
    savageQuotes: string[];
    isFallback?: boolean;
  } | null>(null);
  
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>("");

  // Quick Notification messages
  const [notification, setNotification] = useState<string | null>(null);

  const activeCurrency = CURRENCIES.find(c => c.code === userAccount.settings.currencyCode) || CURRENCIES[0];

  const getFinanceObj = () => ({
    monthlyIncome,
    monthlyExpenses,
    currentSavings,
    currentDebt,
    hourlyWage,
    hoursWorkedPerWeek,
    country,
    city,
  });

  const getGoalObj = (): PurchaseGoal => ({
    itemName,
    cost: itemCost,
    category: itemCategory,
    urgency: itemUrgency,
  });

  // Auto-calculate report state
  const report: AffordabilityReport = calculateAffordability(getFinanceObj(), getGoalObj());

  // Load demo preset
  const handleLoadPreset = (presetId: string) => {
    const preset = DEMO_PROFILES.find((p) => p.id === presetId);
    if (preset) {
      setMonthlyIncome(preset.finance.monthlyIncome);
      setMonthlyExpenses(preset.finance.monthlyExpenses);
      setCurrentSavings(preset.finance.currentSavings);
      setCurrentDebt(preset.finance.currentDebt);
      setHourlyWage(preset.finance.hourlyWage);
      setHoursWorkedPerWeek(preset.finance.hoursWorkedPerWeek);
      setCountry(preset.finance.country);
      setCity(preset.finance.city);

      setItemName(preset.goal.itemName);
      setItemCost(preset.goal.cost);
      setItemCategory(preset.goal.category);
      setItemUrgency(preset.goal.urgency);

      // Trigger standard AI check instantly
      triggerRoast(preset.finance, preset.goal);
      showNotice(`Successfully imported ${preset.name}'s financial configuration.`);
    }
  };

  // Toast notifier helper
  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Trigger Gemini Roast client proxy
  const triggerRoast = async (customFinance?: any, customGoal?: any) => {
    setIsAiLoading(true);
    setAiError("");
    setAiAnalysis(null);

    const f = customFinance || getFinanceObj();
    const g = customGoal || getGoalObj();

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finance: f, goal: g }),
      });

      if (!response.ok) {
        throw new Error("Advisor proxy returned non-200 state.");
      }

      const outcome = await response.json();
      setAiAnalysis(outcome);
    } catch (err: any) {
      console.error(err);
      setAiError("Unable to establish remote synapse connection to Gemini server. Falling back to local model.");
      // Standard local rule fallback based on prompt values
      setAiAnalysis({
        roast: `Let's be real: your net income surplus is ${activeCurrency.symbol}${(f.monthlyIncome - f.monthlyExpenses).toFixed(0)} but you're attempting to drop ${activeCurrency.symbol}${g.cost} onto "${g.itemName}". With ${activeCurrency.symbol}${f.currentDebt} outstanding, you are setting fire to your long-term opportunities just to spark minimal dopamine today!`,
        smarterAlternative: `Hold your balance. Instead of draining ${activeCurrency.symbol}${f.currentSavings} immediately, isolate ${activeCurrency.symbol}${(g.cost / 4).toFixed(0)} per month into an interest account. Buy with liquid cash without risking ruin in 4 months.`,
        savageQuotes: [
          `This costs exactly ${(g.cost / (f.hourlyWage || 15)).toFixed(1)} work-hours of your finite life.`,
          `Your emergency buffer represents basic autonomy. Do not surrender it to ${g.itemName}.`,
          `Refusal of flash consumer credit is the starting point of true capital preservation.`
        ]
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Manual Trigger Initial Scan Setup
  useEffect(() => {
    // Initial standard load to pre-populate AI roasting feedback
    triggerRoast();
  }, []);

  const handleAuthSuccess = (newAcct: Partial<UserAccount>) => {
    setUserAccount((prev) => ({
      ...prev,
      ...newAcct,
      isLoggedIn: true,
    }));
    showNotice(`Logged into vault successfully! Custom configurations synced.`);
  };

  const handleLogout = () => {
    setUserAccount((prev) => ({
      ...prev,
      isLoggedIn: false,
      name: "Guest",
    }));
    showNotice("Securely detached ledger session.");
  };

  // Save scan event simulation
  const handleSaveScan = () => {
    const newScan = {
      id: Math.random().toString(36).substring(4, 9),
      date: new Date().toISOString().split("T")[0],
      userFinance: getFinanceObj(),
      purchaseGoal: getGoalObj(),
      report: report,
      aiRoast: aiAnalysis?.roast || "",
    };

    setUserAccount((prev) => ({
      ...prev,
      savedScans: [newScan, ...prev.savedScans],
    }));
    showNotice(`Recorded "${itemName}" analysis to history tracker!`);
  };

  // Delete from history
  const handleDeleteScan = (idToDelete: string) => {
    setUserAccount((prev) => ({
      ...prev,
      savedScans: prev.savedScans.filter((s) => s.id !== idToDelete),
    }));
    showNotice("Removed analysis footprint.");
  };

  // Load old scan parameters back
  const handleLoadSavedScan = (scan: any) => {
    setMonthlyIncome(scan.userFinance.monthlyIncome);
    setMonthlyExpenses(scan.userFinance.monthlyExpenses);
    setCurrentSavings(scan.userFinance.currentSavings);
    setCurrentDebt(scan.userFinance.currentDebt);
    setHourlyWage(scan.userFinance.hourlyWage);
    setHoursWorkedPerWeek(scan.userFinance.hoursWorkedPerWeek);
    setCountry(scan.userFinance.country);
    setCity(scan.userFinance.city);

    setItemName(scan.purchaseGoal.itemName);
    setItemCost(scan.purchaseGoal.cost);
    setItemCategory(scan.purchaseGoal.category);
    setItemUrgency(scan.purchaseGoal.urgency);

    if (scan.aiRoast) {
      setAiAnalysis({
        roast: scan.aiRoast,
        smarterAlternative: "Load alternative path first to trigger fresh simulation",
        savageQuotes: [
          `Retrieved records from ${scan.date}.`
        ]
      });
    } else {
      triggerRoast(scan.userFinance, scan.purchaseGoal);
    }

    showNotice(`Retrieved simulation record for "${scan.purchaseGoal.itemName}"`);
  };

  // Generate accomplishments summary
  const achievements = generateAchievementsList(report);
  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="flex h-screen w-full bg-[#050505] text-[#E0E0E0] font-sans overflow-hidden">
      
      {/* Sidebar - Side Menu */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userAccount={userAccount}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLoadPreset={handleLoadPreset}
      />

      {/* Main Viewport Workspace */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Banner/Toast alerts */}
        {notification && (
          <div className="absolute top-4 right-4 z-50 bg-slate-900 border border-amber-500/30 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-slide-in">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-xs font-semibold text-white/90">{notification}</span>
          </div>
        )}

        {/* Global sticky bar with profile values */}
        <header className="h-20 border-b border-white/10 px-6 md:px-8 flex items-center justify-between bg-[#080808]/70 backdrop-blur-md shrink-0 z-10 w-full">
          <div className="overflow-hidden pr-2">
            <h2 className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-mono leading-none">
              ACTIVE PURCHASE OBJECTIVE
            </h2>
            <p className="text-base md:text-lg font-bold tracking-tight text-white mt-1 truncate">
              {itemName || "Unnamed Target"} —{" "}
              <span className="text-rose-500">
                {activeCurrency.symbol}
                {itemCost.toLocaleString()}
              </span>
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-mono">
                Simulated Net Monthly Surplus
              </p>
              <p className={`text-xs font-mono font-bold mt-0.5 ${
                monthlyIncome - monthlyExpenses > 0 ? "text-emerald-400" : "text-rose-500 animate-pulse"
              }`}>
                {(monthlyIncome - monthlyExpenses) >= 0 ? "+" : ""}
                {activeCurrency.symbol}
                {(monthlyIncome - monthlyExpenses).toLocaleString()}
              </p>
            </div>

            {/* Simulated Live Connection Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-[10px] font-mono select-none">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-white/70">WAGE-CONVERSION STYLING active</span>
            </div>
          </div>
        </header>

        {/* Mobile quick tab layout bar */}
        <div className="md:hidden flex overflow-x-auto bg-[#080808] border-b border-white/10 px-2 py-1.5 gap-1 shrink-0 scrollbar-none">
          {["dashboard", "calculator", "advisor", "comparison", "settings"].map((m) => (
            <button
              key={m}
              onClick={() => setCurrentTab(m)}
              className={`p-2 px-3 text-xs font-medium rounded-lg shrink-0 ${
                currentTab === m
                  ? "bg-slate-800 text-amber-400 font-semibold"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {/* Scrollable Canvas area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#050505] space-y-6">
          
          {/* TAB 1: DASHBOARD */}
          {currentTab === "dashboard" && (
            <div className="grid grid-cols-12 gap-6 animate-fade-in">
              
              {/* Alert Warning Box */}
              <div className="col-span-12 p-5 bg-gradient-to-r from-rose-950/20 to-zinc-950 border border-rose-500/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-950/40 border border-rose-500/30 text-rose-500 rounded-lg shrink-0 mt-0.5">
                    <Flame className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-rose-500">
                      WARNING LEVEL: {report.gamification.badDecisionSeverity}
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed mt-1">
                      {report.gamification.verdict}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0 font-mono">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Affordability Index</span>
                  <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-md">
                    {report.affordabilityScore}%
                  </div>
                </div>
              </div>

              {/* Big Gauge Meter (Left Column style matching mock) */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                
                {/* Visual Circle Gauge */}
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6.5 flex flex-col items-center justify-center relative overflow-hidden shadow-xl min-h-[340px]">
                  <div className="absolute inset-0 bg-gradient-to-b from-rose-500/[0.04] to-transparent pointer-events-none" />
                  
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3 font-mono">
                    Affordability Score
                  </p>
                  
                  <div className="relative flex items-center justify-center">
                    {/* SVG ring */}
                    <svg className="w-44 h-44 -rotate-90">
                      <circle
                        cx="88"
                        cy="88"
                        r="76"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        className="text-white/5"
                      />
                      <circle
                        cx="88"
                        cy="88"
                        r="76"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray="477"
                        strokeDashoffset={477 - (477 * report.affordabilityScore) / 100}
                        className={`transition-all duration-1000 ${
                          report.affordabilityScore >= 75
                            ? "text-emerald-500"
                            : report.affordabilityScore >= 50
                            ? "text-amber-500"
                            : "text-rose-500"
                        }`}
                      />
                    </svg>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-extrabold tracking-tighter text-white">
                        {report.affordabilityScore}%
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
                        report.affordabilityScore >= 75
                          ? "text-emerald-400"
                          : report.affordabilityScore >= 50
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}>
                        {report.affordabilityScore >= 75
                          ? "Sustainable"
                          : report.affordabilityScore >= 50
                          ? "Mild Caution"
                          : "High Risk"}
                      </span>
                    </div>
                  </div>

                  <p className="mt-5 text-center text-xs text-white/60 px-2 leading-relaxed">
                    Technical status:{" "}
                    <span className="text-white font-medium">
                      {report.canBuy ? "Liquid Cash Covers upfront" : "Savings insufficient to buy outright"}
                    </span>
                    {!report.shouldBuy && ". Proceeding breaks safety protocols."}
                  </p>
                </div>

                {/* Savings Runway & Emergency Fund Coverage */}
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 shadow-md">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-mono mb-3">
                    Emergency Fund Impact
                  </p>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-2xl font-bold tracking-tight text-slate-100">
                      -{activeCurrency.symbol}
                      {itemCost.toLocaleString()}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                      report.emergencyFundImpact.afterMonths >= 3
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {report.emergencyFundImpact.afterMonths.toFixed(1)} Months Left
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 leading-normal italic mt-2.5">
                    "{report.emergencyFundImpact.description}"
                  </p>
                </div>
              </div>

              {/* Real Cost & Projections Breakdown panel */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                
                {/* Standard Bento Box Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Real Cost life labor hour values */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 relative flex flex-col justify-between shadow-md">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] uppercase tracking-widest text-[#D1FF33] font-mono font-bold">
                          The Life Energy Cost
                        </span>
                        <Briefcase className="w-4 h-4 text-white/30" />
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60 text-sm">Labor Cost Time</span>
                          <span className="text-xl font-extrabold tracking-tight text-white">
                            {report.realCost.workHours.toLocaleString()}{" "}
                            <span className="text-[10px] font-normal opacity-50">HRS</span>
                          </span>
                        </div>
                        
                        {/* Progress line representing cost of month income */}
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#D1FF33] h-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, report.realCost.percentOfSalary)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-white/60 text-sm">Life worked weeks</span>
                          <span className="text-lg font-bold tracking-tight text-white/90">
                            {report.realCost.workDays.toLocaleString()}{" "}
                            <span className="text-[10px] font-normal opacity-50">DAYS</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-white/30 mt-6 border-t border-white/5 pt-3 font-mono">
                      Calculated on raw hourly wage representation of{" "}
                      {activeCurrency.symbol}
                      {hourlyWage}/hr
                    </p>
                  </div>

                  {/* Savings recovery months progress */}
                  <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D1FF33]/[0.02] rounded-full blur-2xl" />
                    
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
                          Opportunity Cost (Not buying)
                        </span>
                        <TrendingUp className="w-4 h-4 text-[#D1FF33]" />
                      </div>
                      <p className="text-3xl font-extrabold tracking-tighter text-[#D1FF33] mt-2">
                        {activeCurrency.symbol}
                        {report.comparisons.saveFirst.opportunityCost.toLocaleString()}
                      </p>
                      <p className="text-xs text-white/60 leading-normal mt-2">
                        Earned growth if you invest the {activeCurrency.symbol}
                        {itemCost.toLocaleString()} amount for 5 years at an estimated 8% rate instead of spending today.
                      </p>
                    </div>

                    <button
                      id="dashboard-cta-save-instead"
                      onClick={() => setCurrentTab("comparison")}
                      className="w-full py-2.5 mt-5 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors cursor-pointer text-center"
                    >
                      Compare Savings Plan →
                    </button>
                  </div>
                </div>

                {/* AI Roast Instant Snippet widget matching bottom row style in mock */}
                <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6.5 relative overflow-hidden">
                  <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-rose-500/10 blur-[80px] pointer-events-none" />
                  
                  <div className="flex gap-4 md:gap-5 items-start relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 to-black border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                      <span className="text-xl">👺</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-rose-500 font-bold font-mono">
                        Brutally Honest AI Advisor Summary
                      </p>
                      
                      {isAiLoading ? (
                        <div className="py-4 space-y-2 max-w-md animate-pulse">
                          <div className="h-4 bg-white/10 rounded w-full"></div>
                          <div className="h-4 bg-white/10 rounded w-5/6"></div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-base md:text-lg font-medium italic text-white leading-normal mt-2.5">
                            "{aiAnalysis?.roast?.split(".")[0] || "We need a reality check. Calculate if you really have the leverage to dump this expense."}."
                          </h3>
                          
                          <div className="flex flex-wrap gap-2 mt-4">
                            <span className="px-2 py-0.5 bg-rose-500/10 rounded border border-rose-500/20 text-[9px] text-rose-400 font-bold uppercase font-mono">
                              Budget Leak Warning
                            </span>
                            <span className="px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20 text-[9px] text-amber-400 font-bold uppercase font-mono">
                              Post-Purchase Bleed Risk
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col sm:flex-row justify-between sm:items-center text-[11px] border-t border-white/5 pt-4 gap-2">
                    <div className="flex items-center gap-1.5 text-white/50">
                      <span className="text-rose-500 animate-ping">●</span> Dynamic feedback is parsed on the fly.
                    </div>
                    <button
                      id="dashboard-advisor-explore-btn"
                      onClick={() => setCurrentTab("advisor")}
                      className="text-white hover:text-amber-400 font-bold cursor-pointer transition text-left"
                    >
                      Read Thorough Brutal Roast →
                    </button>
                  </div>
                </div>

                {/* Savings level streak & gamified badges dashboard strip */}
                <div className="p-5 rounded-2xl bg-[#080808] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                  <div>
                    <h4 className="text-[11px] text-slate-400 uppercase tracking-widest font-mono">
                      🎮 ACTIVE LEVEL STATUS & ACHIEVEMENT
                    </h4>
                    <p className="text-sm font-bold text-white mt-1">
                      Level {report.affordabilityScore > 80 ? "Sovereign" : "Serf"}:{" "}
                      <span className="text-amber-400">{report.gamification.level}</span> • Badge: {report.gamification.badge}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/5 font-mono text-xs">
                    <Crown className="w-4.5 h-4.5 text-amber-400" />
                    <span className="text-white">
                      Unlocked: <strong className="text-amber-400">{unlockedAchievementsCount}</strong> / 5 Milestones
                    </span>
                  </div>
                </div>
              </div>

              {/* Saved Simulation Scans lists */}
              <div className="col-span-12">
                <div className="bg-[#080808] border border-white/10 rounded-3xl p-6 shadow-md">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-bold tracking-tight text-white uppercase font-mono">
                        Saved Simulation Scorecard Journal ({userAccount.savedScans.length})
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Persist trial scans securely within local browser parameters.
                      </p>
                    </div>
                    <button
                      id="btn-save-current-scan"
                      onClick={handleSaveScan}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow cursor-pointer border border-white/5"
                    >
                      Log Current Simulation 💾
                    </button>
                  </div>

                  {userAccount.savedScans.length === 0 ? (
                    <div className="text-center py-8 bg-[#050505] rounded-2xl border border-dashed border-white/10">
                      <HelpCircle className="w-8 h-8 mx-auto text-slate-600 mb-2.5" />
                      <p className="text-xs text-slate-400 font-medium">No archived simulation records stored yet.</p>
                      <p className="text-[11px] text-slate-500 mt-1">Adjust input parameters and tap log to record history.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {userAccount.savedScans.map((scan) => (
                        <div
                          key={scan.id}
                          className="p-3.5 rounded-xl bg-[#050505] hover:bg-slate-950 border border-white/5 hover:border-white/10 transition flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0 flex-1 cursor-pointer" onClick={() => handleLoadSavedScan(scan)}>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white normal-case truncate">
                                {scan.purchaseGoal.itemName}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/5 font-mono text-[9px] text-slate-400">
                                Score: {scan.report?.affordabilityScore}%
                              </span>
                            </div>
                            <div className="flex gap-3 text-[10px] text-slate-400 font-mono mt-1">
                              <span>Log ID: {scan.id}</span>
                              <span>•</span>
                              <span>Cost: {activeCurrency.symbol}{scan.purchaseGoal.cost.toLocaleString()}</span>
                              <span>•</span>
                              <span>Recorded: {scan.date}</span>
                            </div>
                          </div>
                          
                          <button
                            id={`delete-scan-${scan.id}`}
                            onClick={() => handleDeleteScan(scan.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CALCULATOR */}
          {currentTab === "calculator" && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-slate-300">
              
              <div className="bg-[#080808] border border-white/10 rounded-3xl p-6.5 md:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Financial Input Simulator Matrix</h3>
                    <p className="text-xs text-slate-400">Tweak income, current assets, or targeted cost sliders to instantly alter affordability scores.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Parameter column 1 */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] tracking-widest text-[#D1FF33] font-mono font-bold uppercase">
                      Simulated Client Profile
                    </h4>

                    <div>
                      <label className="block text-xs font-mono font-bold text-white/70 mb-1.5">
                        Gross Monthly Cashflow ({activeCurrency.symbol})
                      </label>
                      <input
                        type="number"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-white/70 mb-1.5">
                        Actual Monthly Outflow Expenses ({activeCurrency.symbol})
                      </label>
                      <input
                        type="number"
                        value={monthlyExpenses}
                        onChange={(e) => setMonthlyExpenses(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-white/70 mb-1.5">
                        Working Hours per Week ({hoursWorkedPerWeek} Hrs)
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="80"
                        value={hoursWorkedPerWeek}
                        onChange={(e) => setHoursWorkedPerWeek(parseInt(e.target.value) || 40)}
                        className="w-full filter-amber-slider mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-white/70 mb-1.5">
                        Calculated Hourly Wage Equivalent ({activeCurrency.symbol}{hourlyWage}/hr)
                      </label>
                      <input
                        type="number"
                        value={hourlyWage}
                        onChange={(e) => setHourlyWage(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                      />
                      <p className="text-[10px] text-slate-500 font-mono mt-1">
                        Leave as is or adjust to alter absolute labor conversions.
                      </p>
                    </div>
                  </div>

                  {/* Parameter column 2 */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] tracking-widest text-[#D1FF33] font-mono font-bold uppercase">
                      Current Store Target Details
                    </h4>

                    <div>
                      <label className="block text-xs font-mono font-bold text-white/70 mb-1.5">
                        What item is your heart set on?
                      </label>
                      <input
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="E.g. Gaming rig / Trip"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-white/70 mb-1.5">
                        Stated Upfront Net Cost ({activeCurrency.symbol}{itemCost.toLocaleString()})
                      </label>
                      <input
                        type="number"
                        value={itemCost}
                        onChange={(e) => setItemCost(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-rose-500 transition animate-pulse-border"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-white/70 mb-1.5">
                        Item Category Slot
                      </label>
                      <select
                        value={itemCategory}
                        onChange={(e: any) => setItemCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
                      >
                        <option value="electronics">💻 Electronics / Smart tech</option>
                        <option value="luxury">💎 High luxury vanity items</option>
                        <option value="vehicle">🚗 Transportation / Vehicles</option>
                        <option value="vacation">✈️ Travel / Getaways</option>
                        <option value="entertainment">🎮 Gaming / Fun entertainment</option>
                        <option value="other">📦 Standard unclassified cargo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-white/70 mb-1.5">
                        Perceived Necessity Urgency ({itemUrgency} / 5)
                      </label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setItemUrgency(u)}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                              itemUrgency === u
                                ? "bg-amber-500 text-slate-950"
                                : "bg-slate-950 border border-white/10 text-slate-400 hover:text-white"
                            }`}
                          >
                            {u === 1 ? "Vanity" : u === 5 ? "Life Saving" : u}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-left w-full md:w-auto">
                    <p className="text-xs text-stone-400">
                      Modifying values will instantly rerun numerical scenarios offline.
                    </p>
                  </div>
                  <div className="flex w-full md:w-auto gap-3">
                    <button
                      id="btn-trigger-ai-roast"
                      onClick={() => {
                        triggerRoast();
                        setCurrentTab("advisor");
                      }}
                      className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-extrabold text-xs uppercase tracking-widest shadow-md hover:opacity-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Flame className="w-4.5 h-4.5" />
                      Generate AI Advisor Roast →
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: AI ADVISOR */}
          {currentTab === "advisor" && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-slate-300 font-sans">
              
              <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
                <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-rose-500/10 blur-[130px] timer-pulse pointer-events-none" />
                
                <div className="flex gap-5 items-start relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 via-stone-900 to-black border border-white/10 flex items-center justify-center shrink-0 shadow-lg">
                    <span className="text-3xl">👺</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-rose-500 font-bold font-mono">
                        AI Certified Savage Advisor
                      </span>
                      {aiAnalysis?.isFallback && (
                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/5 font-mono text-[9px] text-amber-500">
                          Offline Safe Engine
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-serif italic text-white leading-snug mt-3">
                      {isAiLoading ? (
                        <span className="text-slate-500 font-mono text-sm not-italic animate-pulse">
                          🔥 Commencing deep database analysis of your questionable choices...
                        </span>
                      ) : (
                        `"${aiAnalysis?.roast || "Your budget stats are in line. However, the simulation indicates a severe dopamine luxury addiction. Check detail cards."}"`
                      )}
                    </h3>

                    {!isAiLoading && (
                      <div className="mt-6 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-rose-500/25 rounded-md border border-rose-500/30 text-[10px] text-rose-400 font-bold uppercase font-mono tracking-wider">
                          Critical Decision Check
                        </span>
                        <span className="px-3 py-1 bg-amber-500/25 rounded-md border border-rose-500/30 text-[10px] text-amber-400 font-bold uppercase font-mono tracking-wider">
                          Leverage Ratio Slashed
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {isAiLoading && (
                  <div className="mt-8 space-y-3 py-6 animate-pulse max-w-xl">
                    <div className="h-4.5 bg-white/10 rounded w-full"></div>
                    <div className="h-4.5 bg-white/10 rounded w-11/12"></div>
                    <div className="h-4.5 bg-white/10 rounded w-3/4"></div>
                  </div>
                )}

                {/* Smarter Alternatives block */}
                {!isAiLoading && aiAnalysis?.smarterAlternative && (
                  <div className="mt-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10 relative">
                    <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider font-extrabold block mb-2">
                      💡 Smarter Financial Route
                    </span>
                    <p className="text-xs text-white/80 leading-relaxed font-sans">
                      {aiAnalysis.smarterAlternative}
                    </p>
                  </div>
                )}
              </div>

              {/* Savage Short Warnings Quotes grid */}
              {!isAiLoading && aiAnalysis?.savageQuotes && aiAnalysis.savageQuotes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {aiAnalysis.savageQuotes.map((quote, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#080808] border border-white/5 hover:border-white/10 transition relative shadow-md"
                    >
                      <div className="w-7 h-7 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center font-mono text-xs font-extrabold mb-3">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-stone-300 italic leading-relaxed">
                        "{quote}"
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Prompt to re-run with live trigger params */}
              <div className="p-6 rounded-2xl bg-[#080808] border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white uppercase font-mono">
                    Dissatisfied with the outcome of this roasting?
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Increase item necessity, earn a higher margin, or request a fresh audit.
                  </p>
                </div>
                <button
                  id="advisor-manual-refetch"
                  onClick={() => triggerRoast()}
                  className="px-5 py-2.5 bg-white text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition cursor-pointer shrink-0"
                >
                  Reload Custom Roast 👺
                </button>
              </div>

            </div>
          )}

          {/* TAB 4: COMPARISON */}
          {currentTab === "comparison" && (
            <div className="max-w-5xl mx-auto space-y-6 animate-fade-in text-slate-300">
              
              <div className="text-center max-w-lg mx-auto mb-2">
                <h3 className="text-lg font-mono uppercase tracking-widest text-amber-500">
                  ⚖️ RULE OF SMARTER ACQUISITION
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  We compare the real financial footprint of how you choose to process this desire. Choose wisely, or remain in modern indentured service.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* CHOICE A: BUY NOW OUTRIGHT */}
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6.5 flex flex-col justify-between shadow-md">
                  <div>
                    <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/25 rounded-md text-[10px] text-rose-400 font-bold uppercase font-mono">
                      Option 1: Execute Now Outright
                    </span>
                    <h4 className="text-2xl font-black text-white mt-4 tracking-tighter">
                      {activeCurrency.symbol}
                      {itemCost.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-slate-400 uppercase">Immediate hit</span>
                    </h4>
                    
                    <p className="text-xs text-stone-400 mt-3 leading-relaxed">
                      You swipe your liquid asset balance instantly. You walk out of the store with the item, but you sacrifice significant leverage.
                    </p>

                    <div className="space-y-3.5 mt-6 border-t border-white/5 pt-5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Upfront Cash Slashed</span>
                        <span className="text-rose-400 font-bold">
                          -{activeCurrency.symbol}
                          {itemCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Months of Expenses Left</span>
                        <span className="font-bold text-white">
                          {report.emergencyFundImpact.afterMonths.toFixed(1)} Months Buffer
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Temporary Debt Loaded</span>
                        <span className="text-rose-400 font-bold">
                          {activeCurrency.symbol}
                          {report.comparisons.buyNow.debtIncurred.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 mt-6 bg-rose-500/5 border border-rose-500/10 rounded-xl leading-relaxed text-xs">
                    <span className="font-bold text-rose-400">Status Danger:</span>{" "}
                    {report.comparisons.buyNow.shortTermWarning}
                  </div>
                </div>

                {/* CHOICE B: SAVE FIRST IN CASH */}
                <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6.5 flex flex-col justify-between shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] rounded-full blur-2xl" />
                  
                  <div>
                    <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/20 rounded-md text-[10px] text-emerald-400 font-bold uppercase font-mono">
                      Option 2: Smarter Save First Plan
                    </span>
                    <h4 className="text-2xl font-black text-white mt-4 tracking-tighter">
                      {report.comparisons.saveFirst.monthsToWait} Months Wait
                    </h4>
                    
                    <p className="text-xs text-stone-400 mt-3 leading-relaxed">
                      You freeze and suppress consumption. You channel your net monthly cashflow surplus of{" "}
                      {activeCurrency.symbol}
                      {Math.max(1, (monthlyIncome - monthlyExpenses)).toLocaleString()}/mo until you can buy outright with surplus cash.
                    </p>

                    <div className="space-y-3.5 mt-6 border-t border-white/5 pt-5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Months Postponed</span>
                        <span className="text-emerald-400 font-bold">
                          {report.comparisons.saveFirst.monthsToWait} Months
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Emergency Fund Intact</span>
                        <span className="font-bold text-white">
                          {(currentSavings / Math.max(1, monthlyExpenses)).toFixed(1)} Months Buffer preserved
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Alternative Compound Gains</span>
                        <span className="text-[#D1FF33] font-bold font-mono">
                          +{activeCurrency.symbol}
                          {report.comparisons.saveFirst.opportunityCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 mt-6 bg-emerald-500/5 border border-emerald-500/10 rounded-xl leading-relaxed text-xs">
                    <span className="font-bold text-emerald-400">Advisor Verdict:</span>{" "}
                    {report.comparisons.saveFirst.smarterMoveLabel} Keep your security intact!
                  </div>
                </div>

                {/* CREDIT CARD EMI DEBT TRAP WARNING GRID */}
                <div className="bg-[#080808] border border-[#ff3355]/30 rounded-3xl p-6.5 shadow-lg col-span-1 md:col-span-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 shrink-0 text-red-500 opacity-20">
                    <Activity className="w-16 h-16" />
                  </div>
                  
                  <div>
                    <span className="px-2.5 py-1 bg-red-500/15 border border-red-500/35 rounded-md text-[10px] text-red-400 font-extrabold uppercase font-mono select-none">
                      ⚠️ Modern Financial Trap Scenario: 12-Month CC EMI
                    </span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                      <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 font-mono uppercase">Monthly Payment Balance</span>
                        <p className="text-xl font-bold text-white mt-1">
                          {activeCurrency.symbol}
                          {report.comparisons.emi.monthlyEMI.toLocaleString()}
                        </p>
                      </div>

                      <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 font-mono uppercase">Assumed Annual APR Trap</span>
                        <p className="text-xl font-bold text-red-400 mt-1">
                          {report.comparisons.emi.interestRate.toFixed(1)}% APR
                        </p>
                      </div>

                      <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-500 font-mono uppercase">Compound Penalty Interest</span>
                        <p className="text-xl font-bold text-red-400 mt-1">
                          +{activeCurrency.symbol}
                          {report.comparisons.emi.totalInterest.toLocaleString()}
                        </p>
                      </div>

                      <div className="p-4 bg-red-950/20 rounded-xl border border-red-900/40">
                        <span className="text-[10px] text-red-400 font-bold font-mono uppercase">True Realized Cost</span>
                        <p className="text-xl font-black text-rose-500 mt-1">
                          {activeCurrency.symbol}
                          {report.comparisons.emi.realFinalCost.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2 text-xs leading-relaxed text-slate-300">
                      <p>
                        <strong>How Credit Card interest functions:</strong> By selecting standard monthly financing options with APRs hovering around 22%, your final payment on the <strong>{itemName}</strong> inflates to over <strong>{activeCurrency.symbol}{report.comparisons.emi.realFinalCost.toLocaleString()}</strong>.
                      </p>
                      <p className="text-red-400 font-mono text-[11px] font-bold">
                        ⚠️ TRAP DEBTMAGEDDON INDEX: The algorithm rates this financing route as "{report.comparisons.emi.trapLevel}". High danger of cascading life anxiety.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CHEAPER REFURBISHED ALTERNATIVE OPTION */}
                <div className="bg-[#080808] border border-white/10 rounded-3xl p-6.5 col-span-1 md:col-span-2 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  <div className="min-w-0 flex-1">
                    <span className="px-2.5 py-1 bg-[#D1FF33]/15 border border-[#D1FF33]/25 rounded-md text-[10px] text-[#D1FF33] font-bold uppercase font-mono">
                      Refurbished / Smart Substitute Choice Alternate
                    </span>
                    <h4 className="text-lg font-bold text-white mt-3 truncate">
                      {report.comparisons.cheaperAlternative.itemName}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Trading minor vanity specifications saves significant work-time labor.
                    </p>
                    
                    <div className="flex gap-4 mt-4 font-mono text-xs">
                      <div>
                        <span className="text-white/40">Substitute Cost</span>
                        <p className="font-bold text-white text-base mt-1">
                          {activeCurrency.symbol}
                          {report.comparisons.cheaperAlternative.cost.toLocaleString()}
                        </p>
                      </div>
                      <div className="border-l border-white/10 pl-4">
                        <span className="text-white/40">Actual Savings Left</span>
                        <p className="font-bold text-emerald-400 text-base mt-1">
                          +{activeCurrency.symbol}
                          {report.comparisons.cheaperAlternative.amountSaved.toLocaleString()}
                        </p>
                      </div>
                      <div className="border-l border-white/10 pl-4">
                        <span className="text-white/40">Descent Labor hours Saved</span>
                        <p className="font-bold text-[#D1FF33] text-base mt-1 text-glow">
                          {report.comparisons.cheaperAlternative.hoursSaved.toLocaleString()} Hrs Saved
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    id="btn-apply-cheaper-alternative"
                    onClick={() => {
                      setItemCost(report.comparisons.cheaperAlternative.cost);
                      setItemName(`${report.comparisons.cheaperAlternative.itemName} (${itemName})`);
                      showNotice(`Updated purchase objective target with Refurbished value! Affordability scores restored.`);
                    }}
                    className="w-full md:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-black font-extrabold text-xs uppercase tracking-widest transition cursor-pointer shrink-0 text-center"
                  >
                    Adjust Budget To Alternative ⚖️
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {currentTab === "settings" && (
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in text-slate-300">
              
              <div className="bg-[#080808] border border-white/10 rounded-3xl p-6.5 md:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-slate-800 border border-white/10 text-white rounded-xl">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Client Demographics & Budget Planner Dashboard</h3>
                    <p className="text-xs text-slate-400">These details synchronize the underlying arithmetic formulas correctly.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-white/70 mb-1.5">
                        Client Geographical Jurisdiction / Country
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-white/70 mb-1.5">
                        Client City Locale
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-white/70 mb-1.5">
                        Outstanding Debt Load (Student Loans, CC) ({activeCurrency.symbol})
                      </label>
                      <input
                        type="number"
                        value={currentDebt}
                        onChange={(e) => setCurrentDebt(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-white/70 mb-1.5">
                        Liquid Savings Reserves Balance ({activeCurrency.symbol})
                      </label>
                      <input
                        type="number"
                        value={currentSavings}
                        onChange={(e) => setCurrentSavings(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-mono font-bold text-white/70 mb-1.5">
                        Active Currency Selection
                      </label>
                      <select
                        value={userAccount.settings.currencyCode}
                        onChange={(e) => {
                          const val = e.target.value;
                          setUserAccount((prev) => ({
                            ...prev,
                            settings: { ...prev.settings, currencyCode: val },
                          }));
                          showNotice(`Scale unit set to ${val}. Sliders updated.`);
                        }}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} ({c.symbol}) - {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-white/70 mb-1.5">
                        Automatic AI Advisor Roasting Mode
                      </label>
                      <div className="flex items-center gap-3 py-2 px-1">
                        <input
                          type="checkbox"
                          id="auto-roast-checkbox"
                          checked={userAccount.settings.autoRoast}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setUserAccount((prev) => ({
                              ...prev,
                              settings: { ...prev.settings, autoRoast: val },
                            }));
                            showNotice(`Automatic model roasting is now ${val ? "armed" : "muted"}.`);
                          }}
                          className="h-4 w-4 bg-slate-950 border border-white/10 text-amber-500 focus:ring-0 rounded cursor-pointer"
                        />
                        <span className="text-xs text-white/80">Query Gemini 3.5 live on preset switch changes</span>
                      </div>
                    </div>
                  </div>

                  {/* Account detail status cards */}
                  <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                    <h4 className="text-[10px] tracking-widest text-slate-500 font-mono font-bold uppercase">
                      Vault Profile Identification
                    </h4>
                    
                    <div className="p-4 rounded-xl bg-slate-950 border border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-3">
                      <div>
                        <span className="text-xs text-stone-400 font-mono block">Status State:</span>
                        <span className="text-sm font-semibold text-white mt-1 block">
                          {userAccount.isLoggedIn ? "Primary Core Registered" : "Offline Sandbox mode"}
                        </span>
                      </div>
                      
                      {userAccount.isLoggedIn ? (
                        <button
                          id="btn-trigger-logout-settings"
                          onClick={handleLogout}
                          className="px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition cursor-pointer font-semibold border border-rose-500/15"
                        >
                          Erase Synapse Footprint
                        </button>
                      ) : (
                        <button
                          id="btn-trigger-login-settings"
                          onClick={() => setIsAuthOpen(true)}
                          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs transition cursor-pointer font-bold"
                        >
                          Sync Global Vault Accounts
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Auth Account Setup modal Component */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleAuthSuccess}
      />

    </div>
  );
}
