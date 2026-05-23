/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rateToUSD: number; // For basic conversion
}

export interface UserFinance {
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  currentDebt: number;
  hourlyWage: number;
  hoursWorkedPerWeek: number;
  country: string;
  city: string;
}

export interface PurchaseGoal {
  itemName: string;
  cost: number;
  category: "electronics" | "luxury" | "vehicle" | "vacation" | "entertainment" | "other";
  urgency: number; // 1 to 5
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: "savings" | "roast" | "affordability" | "interactive";
  unlocked: boolean;
  unlockedAt?: string;
}

export interface AffordabilityReport {
  affordabilityScore: number; // 0 to 100
  canBuy: boolean; // Mathematically has the liquid cash
  shouldBuy: boolean; // Financially smart
  postPurchaseSavings: number;
  emergencyFundImpact: {
    beforeMonths: number;
    afterMonths: number;
    rating: "UNSHAKEABLE" | "SAFE" | "VULNERABLE" | "IMMEDIATE_RUIN";
    description: string;
  };
  realCost: {
    workHours: number;
    workDays: number;
    percentOfSalary: number;
    monthsOfSavingsRequired: number;
  };
  projections: {
    threeMonths: {
      savings: number;
      debt: number;
      financialHealth: string;
    };
    oneYear: {
      savings: number;
      debt: number;
      financialHealth: string;
    };
  };
  comparisons: {
    buyNow: {
      upfrontCost: number;
      debtIncurred: number;
      shortTermWarning: string;
    };
    saveFirst: {
      monthsToWait: number;
      opportunityCost: number; // Interest earned if savings were invested instead
      smarterMoveLabel: string;
    };
    emi: {
      termMonths: number;
      monthlyEMI: number;
      interestRate: number;
      totalInterest: number;
      realFinalCost: number;
      trapLevel: "EASY_TRAP" | "FINANCIAL_QUICKSAND" | "DEBTMAGEDDON";
    };
    cheaperAlternative: {
      itemName: string;
      cost: number;
      amountSaved: number;
      hoursSaved: number;
    };
  };
  gamification: {
    financialScore: number;
    level: string;
    badge: string;
    badDecisionSeverity: "NONE" | "MILD_MISTAKE" | "SEVERE_REGRET" | "SENSATIONAL_STUPIDITY";
    verdict: string;
  };
}

export interface SearchSavedItems {
  id: string;
  date: string;
  userFinance: UserFinance;
  purchaseGoal: PurchaseGoal;
  report: AffordabilityReport;
  aiRoast?: string;
}

export interface UserAccount {
  email: string;
  name: string;
  isLoggedIn: boolean;
  savedScans: SearchSavedItems[];
  settings: {
    currencyCode: string;
    theme: "dark";
    autoRoast: boolean;
  };
}

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", rateToUSD: 1.0 },
  { code: "EUR", symbol: "€", name: "Euro", rateToUSD: 1.08 },
  { code: "GBP", symbol: "£", name: "British Pound", rateToUSD: 1.26 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rateToUSD: 0.012 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rateToUSD: 0.73 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rateToUSD: 0.66 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rateToUSD: 0.0064 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", rateToUSD: 0.74 }
];
