/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserFinance, PurchaseGoal, AffordabilityReport, Achievement } from "../types";

export function calculateAffordability(
  finance: UserFinance,
  goal: PurchaseGoal
): AffordabilityReport {
  const {
    monthlyIncome,
    monthlyExpenses,
    currentSavings,
    currentDebt,
    hoursWorkedPerWeek,
  } = finance;

  const cost = Math.max(0, goal.cost);

  // 1. Hourly wages
  let hourlyWage = finance.hourlyWage;
  if (hourlyWage <= 0) {
    // Estimate from monthly income. Assumes 4.33 weeks in a month
    const hoursPerMonth = hoursWorkedPerWeek * 4.33;
    hourlyWage = hoursPerMonth > 0 ? monthlyIncome / hoursPerMonth : 15;
  }

  const netMonthlyIncome = monthlyIncome - monthlyExpenses;

  // 2. Can Buy and Should Buy
  // Mathematically can buy if current savings can cover the upfront cost (or if we can afford the hit)
  const canBuy = currentSavings >= cost;

  // Emergency savings months info
  const expenseDenominator = monthlyExpenses > 0 ? monthlyExpenses : 1;
  const beforeMonths = currentSavings / expenseDenominator;
  const postPurchaseSavings = Math.max(0, currentSavings - cost);
  const afterMonths = postPurchaseSavings / expenseDenominator;

  // Should Buy: Requires that buying it outright leaves at least 3 months of emergency expenses
  // and that their net savings are positive, and they don't have severe debt
  const isEmergencyFundSafe = afterMonths >= 3;
  const hasHealthyIncome = netMonthlyIncome > 0;
  const shouldBuy = canBuy && isEmergencyFundSafe && hasHealthyIncome && (currentDebt < monthlyIncome * 4);

  // 3. Affordability Score algorithm (0-100)
  let score = 100;

  if (cost > 0) {
    // Deficit deduction
    if (cost > currentSavings) {
      const deficitPercent = ((cost - currentSavings) / cost) * 100;
      score -= Math.min(45, 20 + deficitPercent * 0.25); // Heavy penalty for not being able to buy it outright
    } else {
      // Liquid savings drain assessment
      const savingsDrainPercent = (cost / Math.max(1, currentSavings)) * 100;
      score -= Math.min(25, savingsDrainPercent * 0.25);
    }

    // Emergency fund depletion penalty
    if (afterMonths < 3) {
      const depletionSeverity = (3 - afterMonths) / 3; // 0 to 1
      score -= Math.min(30, depletionSeverity * 30);
    }

    // Net income drain penalty
    if (netMonthlyIncome <= 0) {
      score -= 20; // Bleeding money already!
    } else {
      const netSavingsPercentOfCost = (cost / netMonthlyIncome); // how many months of net savings
      if (netSavingsPercentOfCost > 12) {
        score -= 20; // Costs more than 1 year of savings
      } else if (netSavingsPercentOfCost > 3) {
        score -= 12;
      } else if (netSavingsPercentOfCost > 1) {
        score -= 6;
      }
    }

    // Debt penalty
    if (currentDebt > 0) {
      const debtToIncomeRatio = currentDebt / Math.max(1, monthlyIncome);
      score -= Math.min(15, debtToIncomeRatio * 3);
    }

    // Urgency cushion (if it's a high urgency and we need it, we recover a TINY bit because it's justified)
    if (goal.urgency >= 4 && score <= 70) {
      score += (goal.urgency - 3) * 3;
    }
  } else {
    score = 100;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  // 4. Emergency Fund Rating
  let emergencyRating: "UNSHAKEABLE" | "SAFE" | "VULNERABLE" | "IMMEDIATE_RUIN" = "SAFE";
  let emergencyDesc = "";

  if (afterMonths >= 6) {
    emergencyRating = "UNSHAKEABLE";
    emergencyDesc = `Buying this leaves you with ${afterMonths.toFixed(1)} months of emergency buffer. You are financially bulletproof.`;
  } else if (afterMonths >= 3) {
    emergencyRating = "SAFE";
    emergencyDesc = `Valid emergency cushion remaining (${afterMonths.toFixed(1)} months). You will survive a job loss or minor health scare.`;
  } else if (afterMonths > 0) {
    emergencyRating = "VULNERABLE";
    emergencyDesc = `Danger zone: emergency fund slashed to ${afterMonths.toFixed(1)} months. One flat tire or surprise medical bill away from ruin.`;
  } else {
    emergencyRating = "IMMEDIATE_RUIN";
    emergencyDesc = `Zero emergency runway remaining. You are raw-dogging economic volatility. Good luck.`;
  }

  // 5. Work conversion metrics
  const hourlyWageSafe = hourlyWage > 0 ? hourlyWage : 15;
  const workHours = cost / hourlyWageSafe;
  const workDays = workHours / (hoursWorkedPerWeek / 5);
  const percentOfSalary = (cost / Math.max(1, monthlyIncome)) * 100;

  const netSavings = Math.max(0, netMonthlyIncome);
  const monthsOfSavingsRequired = netSavings > 0 ? cost / netSavings : 999;

  // 6. Projections standard
  const monthlySavingsAfter = Math.max(0, netMonthlyIncome);
  
  // Future projections if they DO vs DO NOT buy
  // 3 months
  const threeMonthsSavingsNoBuy = currentSavings + (monthlySavingsAfter * 3);
  const threeMonthsSavingsWithBuy = Math.max(0, currentSavings - cost) + (monthlySavingsAfter * 3);
  const threeMonthsDebtNoBuy = currentDebt;
  const threeMonthsDebtWithBuy = currentDebt + (cost > currentSavings ? (cost - currentSavings) : 0);

  // 1 year
  const oneYearSavingsNoBuy = currentSavings + (monthlySavingsAfter * 12);
  const oneYearSavingsWithBuy = Math.max(0, currentSavings - cost) + (monthlySavingsAfter * 12);
  const oneYearDebtNoBuy = currentDebt;
  const oneYearDebtWithBuy = currentDebt + (cost > currentSavings ? (cost - currentSavings) : 0);

  // Health labels
  const getHealthLabel = (savings: number, debt: number) => {
    if (debt > savings * 1.5) return "Bankruptcy Looming";
    if (debt > 0 && savings < monthlyExpenses * 2) return "Debt Trap - Sinking";
    if (savings > monthlyExpenses * 6) return "Wealth Generator Active";
    if (savings > monthlyExpenses * 3) return "Secure and Balanced";
    return "Surviving Day to Day";
  };

  // 7. Comparisons builder
  const outstandingOverdraft = Math.max(0, cost - currentSavings);
  const buyNowWarning = outstandingOverdraft > 0 
    ? `Dumping this item on a high-interest credit balance will stack a recursive debt of ${outstandingOverdraft.toFixed(0)} right away.` 
    : "Your bank coordinates are clear but your emergency fund is heavily bruised.";

  const saveFirstMonths = netSavings > 0 ? Math.ceil(cost / netSavings) : 12;
  // Opportunity cost of investing the savings instead of spending them (assumes 8% annual, compounded monthly)
  const monthlyRate = 0.08 / 12;
  let opportunityCost = 0;
  if (cost > 0 && netSavings > 0) {
    // Future value of saving that cost at 8% annual return for 5 years
    opportunityCost = cost * Math.pow(1 + monthlyRate, 60) - cost;
  }

  // EMI option simulation
  const emiTerm = 12; // 1 year term
  const emiInterestRate = 0.22; // 22% annual interest (standard CC trap)
  const monthlyInterestRate = emiInterestRate / 12;
  const monthlyEMI = cost > 0 
    ? (cost * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, emiTerm)) / (Math.pow(1 + monthlyInterestRate, emiTerm) - 1)
    : 0;
  const totalEMIPayments = monthlyEMI * emiTerm;
  const totalInterest = Math.max(0, totalEMIPayments - cost);

  const emiTrapLevel = totalInterest > cost * 0.15 ? "DEBTMAGEDDON" : totalInterest > cost * 0.08 ? "FINANCIAL_QUICKSAND" : "EASY_TRAP";

  // Cheaper alternative calculation
  let alternativeMultiplier = 0.5;
  let alternativeName = "Wait & buy refurbished / used";
  switch (goal.category) {
    case "electronics":
      alternativeMultiplier = 0.55;
      alternativeName = "Refurbished last-gen model";
      break;
    case "luxury":
      alternativeMultiplier = 0.15;
      alternativeName = "Rent for the occasion / high-street replica";
      break;
    case "vehicle":
      alternativeMultiplier = 0.4;
      alternativeName = "3-year-old certified used alternative";
      break;
    case "vacation":
      alternativeMultiplier = 0.5;
      alternativeName = "Slightly off-season stayed staycation";
      break;
    case "entertainment":
      alternativeMultiplier = 0.3;
      alternativeName = "Shared family license with friends";
      break;
    default:
      alternativeMultiplier = 0.5;
      alternativeName = "Unbranded direct option + wait 30 days";
  }

  const alternativeCost = cost * alternativeMultiplier;
  const alternativeAmountSaved = cost - alternativeCost;
  const alternativeHoursSaved = alternativeAmountSaved / hourlyWageSafe;

  // 8. Bad Decision Severity & Verdict
  let badDecisionSeverity: "NONE" | "MILD_MISTAKE" | "SEVERE_REGRET" | "SENSATIONAL_STUPIDITY" = "NONE";
  let verdict = "";

  if (score >= 80) {
    badDecisionSeverity = "NONE";
    verdict = `Approved. You earned this. Run, don't walk, to complete checkout safely.`;
  } else if (score >= 60) {
    badDecisionSeverity = "MILD_MISTAKE";
    verdict = `Slightly problematic. It won't destroy you immediately, but you're slowing down your ascent to wealth.`;
  } else if (score >= 30) {
    badDecisionSeverity = "SEVERE_REGRET";
    verdict = `Highly hazardous! You're trading permanent financial leverage for a temporary hit of dopamine.`;
  } else {
    badDecisionSeverity = "SENSATIONAL_STUPIDITY";
    verdict = `Financial Seppuku. This purchase is an act of economic self-harm. Do not do it.`;
  }

  // Determine Level and Badge
  let level = "Paycheck Survivor";
  let badge = "Survivalist";
  if (currentSavings > monthlyExpenses * 12) {
    level = "Capital Sovereign";
    badge = "Wealth Master";
  } else if (currentSavings > monthlyExpenses * 6) {
    level = "Financial Aristocrat";
    badge = "Safety Champion";
  } else if (currentSavings > monthlyExpenses * 3) {
    level = "Savings Scholar";
    badge = "Balanced Ascending";
  } else if (currentSavings <= 0 || currentDebt > currentSavings * 2) {
    level = "Indebted Serf";
    badge = "Broke Gladiator";
  }

  return {
    affordabilityScore: score,
    canBuy,
    shouldBuy,
    postPurchaseSavings,
    emergencyFundImpact: {
      beforeMonths,
      afterMonths,
      rating: emergencyRating,
      description: emergencyDesc,
    },
    realCost: {
      workHours: Math.round(workHours * 10) / 10,
      workDays: Math.round(workDays * 10) / 10,
      percentOfSalary: Math.round(percentOfSalary * 10) / 10,
      monthsOfSavingsRequired: Math.round(monthsOfSavingsRequired * 10) / 10,
    },
    projections: {
      threeMonths: {
        savings: Math.round(threeMonthsSavingsWithBuy),
        debt: Math.round(threeMonthsDebtWithBuy),
        financialHealth: getHealthLabel(threeMonthsSavingsWithBuy, threeMonthsDebtWithBuy),
      },
      oneYear: {
        savings: Math.round(oneYearSavingsWithBuy),
        debt: Math.round(oneYearDebtWithBuy),
        financialHealth: getHealthLabel(oneYearSavingsWithBuy, oneYearDebtWithBuy),
      },
    },
    comparisons: {
      buyNow: {
        upfrontCost: cost,
        debtIncurred: outstandingOverdraft,
        shortTermWarning: buyNowWarning,
      },
      saveFirst: {
        monthsToWait: saveFirstMonths,
        opportunityCost: Math.round(opportunityCost),
        smarterMoveLabel: `Saving for ${saveFirstMonths} months allows you to keep an unbruised safety net.`,
      },
      emi: {
        termMonths: emiTerm,
        monthlyEMI: Math.round(monthlyEMI),
        interestRate: emiInterestRate * 100,
        totalInterest: Math.round(totalInterest),
        realFinalCost: Math.round(totalEMIPayments),
        trapLevel: emiTrapLevel,
      },
      cheaperAlternative: {
        itemName: alternativeName,
        cost: Math.round(alternativeCost),
        amountSaved: Math.round(alternativeAmountSaved),
        hoursSaved: Math.round(alternativeHoursSaved * 10) / 10,
      },
    },
    gamification: {
      financialScore: score,
      level,
      badge,
      badDecisionSeverity,
      verdict,
    },
  };
}

export function generateAchievementsList(report?: AffordabilityReport): Achievement[] {
  return [
    {
      id: "perfect_score",
      title: "Wealth Sovereign",
      description: "Submit a goal and score a flawless 100% Affordability score.",
      iconName: "Crown",
      category: "affordability",
      unlocked: report ? report.affordabilityScore === 100 : false,
    },
    {
      id: "financial_seppuku",
      title: "Self-Sabotage Virtuoso",
      description: "Scan an item of sensational stupidity and receive a warning rating.",
      iconName: "Skull",
      category: "roast",
      unlocked: report ? report.gamification.badDecisionSeverity === "SENSATIONAL_STUPIDITY" : false,
    },
    {
      id: "emergency_safe",
      title: "Fort Knox Fortress",
      description: "Have a strong emergency buffer after executing the luxury purchase.",
      iconName: "ShieldAlert",
      category: "savings",
      unlocked: report ? report.emergencyFundImpact.afterMonths >= 6 : false,
    },
    {
      id: "work_slave",
      title: "Lifetime of Chores",
      description: "Track a single item costing more than 160 real hours of labor.",
      iconName: "Hammer",
      category: "affordability",
      unlocked: report ? report.realCost.workHours >= 160 : false,
    },
    {
      id: "saving_guru",
      title: "Compound Interest Disciple",
      description: "Review a comparison option and look at saving options first.",
      iconName: "TrendUp",
      category: "interactive",
      unlocked: report ? report.comparisons.saveFirst.opportunityCost > 500 : false,
    }
  ];
}
