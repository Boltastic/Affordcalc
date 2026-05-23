/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserFinance, PurchaseGoal } from "../types";

export interface DemoProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  finance: UserFinance;
  goal: PurchaseGoal;
}

export const DEMO_PROFILES: DemoProfile[] = [
  {
    id: "tech_bro",
    name: "Prestige Pete",
    role: "Silicon Valley Tech Bro",
    avatar: "💻",
    bio: "Earns a solid tech salary, but spends it instantly on $4000 rent, high-end organic coffee, boutique gyms, and Tesla payments. Literally has zero self-control.",
    finance: {
      monthlyIncome: 12500,
      monthlyExpenses: 11900,
      currentSavings: 3500,
      currentDebt: 85000,
      hourlyWage: 72,
      hoursWorkedPerWeek: 40,
      country: "United States",
      city: "San Francisco"
    },
    goal: {
      itemName: "Custom Titanium Road Bike",
      cost: 9500,
      category: "luxury",
      urgency: 2
    }
  },
  {
    id: "student",
    name: "Ramen Royalty Sofia",
    role: "Broke College Student",
    avatar: "🎒",
    bio: "Balances class, student debt, and a part-time retail gig. Survives on loyalty coffee and dynamic pricing noodles, but possesses high-street designer ambitions.",
    finance: {
      monthlyIncome: 1400,
      monthlyExpenses: 1350,
      currentSavings: 320,
      currentDebt: 32000,
      hourlyWage: 16,
      hoursWorkedPerWeek: 20,
      country: "United Kingdom",
      city: "London"
    },
    goal: {
      itemName: "Prada Double-Breasted Trench Coat",
      cost: 2350,
      category: "luxury",
      urgency: 1
    }
  },
  {
    id: "crypto_gambler",
    name: "Chad 'HODL' Kowalski",
    role: "Crypto Gambler / Dev",
    avatar: "🚀",
    bio: "Puts all spare cash into highly volatile leverage plays and Shiba-inspired dog tokens. Has a hyper-powered graphics card but his liquid bank balance is completely bankrupt.",
    finance: {
      monthlyIncome: 3400,
      monthlyExpenses: 3200,
      currentSavings: 750,
      currentDebt: 8500,
      hourlyWage: 25,
      hoursWorkedPerWeek: 35,
      country: "Canada",
      city: "Toronto"
    },
    goal: {
      itemName: "RTX 5090 Liquid-Cooled Setup",
      cost: 3400,
      category: "electronics",
      urgency: 4
    }
  },
  {
    id: "steady_spender",
    name: "Mindful Maya",
    role: "Balanced Teacher",
    avatar: "📚",
    bio: "Maya maintains a steady household flow, preserves an active emergency guard, and tracks her spending. She is considering an actual reward for herself.",
    finance: {
      monthlyIncome: 4200,
      monthlyExpenses: 2900,
      currentSavings: 18000,
      currentDebt: 4500,
      hourlyWage: 26,
      hoursWorkedPerWeek: 40,
      country: "Australia",
      city: "Melbourne"
    },
    goal: {
      itemName: "7-Day Tokyo Cherry Blossom Vacation",
      cost: 3800,
      category: "vacation",
      urgency: 3
    }
  }
];
