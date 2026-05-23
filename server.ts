import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Load workspace environment variables
dotenv.config();

const app = express();
app.use(express.json());
const PORT = 3000;

// Lazy initialized Gemini client for safe startup without crash if key is temporarily missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY environment variable is not defined. Using mock advisor database instead.");
    return null;
  }
  
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API endpoint: AI financial roaster and smart alternatives proxy
app.post("/api/advisor", async (req, res) => {
  const { finance, goal } = req.body;
  
  if (!finance || !goal) {
    return res.status(400).json({ error: "Missing required finance or purchase goal details" });
  }

  const client = getGeminiClient();

  if (!client) {
    // Elegant hardcoded mock advisor response if the key is missing from environment secrets
    return res.json({
      roast: `Look, Prestige, your net income is $${(finance.monthlyIncome - finance.monthlyExpenses).toFixed(0)} but you are out here eyeing a $${goal.cost} "${goal.itemName}". With credit balances or student loans of $${finance.currentDebt}, you are carrying a death wish of interest. This "${goal.itemName}" is going to consume exactly ${(goal.cost / (finance.hourlyWage || 15)).toFixed(0)} hours of your literal life. You'll survive, but you will stay a wage slave for another 4 months. Unacceptable.`,
      smarterAlternative: `Hold on, hotshot. Instead of burning your entire liquid reserves of $${finance.currentSavings} today, lock $${(goal.cost / 4).toFixed(0)} a month into a secure interest account. By waiting exactly 4 months, you can buy this outright with cash without triggering immediate emergency fund alert states.`,
      savageQuotes: [
        `This ${goal.itemName} costs ${(goal.cost / (finance.hourlyWage || 15)).toFixed(0)} work hours of your finite life.`,
        `You're trading 6 months of absolute emergency safety for a temporary hit of commercial dopamine.`,
        `Your future self is screaming at your current self in the checkout line.`
      ],
      isFallback: true
    });
  }

  try {
    const netSavings = finance.monthlyIncome - finance.monthlyExpenses;
    const workHours = goal.cost / (finance.hourlyWage || 15);
    const textPrompt = `You are a brutally honest, extremely savage, yet mathematically exact AI Financial Advisor. Your purpose is to give users a hilarious, dramatically realistic reality check on whether they can afford their desired purchase.
    
Here is the user's financial profile:
- Monthly Income: $${finance.monthlyIncome}
- Monthly Expenses: $${finance.monthlyExpenses} (Net savings: $${netSavings})
- Current Liquid Savings: $${finance.currentSavings}
- Debt: $${finance.currentDebt}
- Hourly Wage: $${finance.hourlyWage} (They work ${finance.hoursWorkedPerWeek} hours a week)
- Country/City: ${finance.city}, ${finance.country}
- Purchase goal: "${goal.itemName}" costing $${goal.cost} USD. It is classified as index "${goal.category}".
- Urgency rating (1 is pure vanity, 5 is emergency need): ${goal.urgency}/5.

Calculate the math mentally, then write a response in complete, well-formed JSON matching the following schema:
{
  "roast": "A brutally honest, slightly sarcastic, hilarious roasting (around 4-6 sentences) of this purchase decision, pointing out how much of their emergency fund or life-hours it burns and mocking their financial priorities. Be specific, realistic, and brutally direct, but helpful in the end.",
  "smarterAlternative": "A practical, smarter financial path they should take instead (e.g., 'If you save $X per month for Y months... or buy refurbished Z...'). This must be smart, encouraging but written in your direct, slightly savage signature tone.",
  "savageQuotes": [
    "A highly drama-inducing short quote (e.g., 'This purchase represents Z hours of labor you will never get back')",
    "Another short savage one-liner quote",
    "A third savage quote warning about their debt or lifestyle inflation"
  ]
}

Only output raw compact JSON text. Do not write markdown blocks or any other explanation - output ONLY parsable JSON.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: textPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const bodyText = response.text || "";
    try {
      const parsed = JSON.parse(bodyText.trim());
      return res.json(parsed);
    } catch (parseError) {
      console.error("JSON parse error from Gemini text:", bodyText, parseError);
      // Fallback if formatting was somehow not perfect
      return res.json({
        roast: `Gemini response returned: ${bodyText.slice(0, 300)}... but parsed incorrectly. Long story short, buying a $${goal.cost} "${goal.itemName}" on a net income of $${netSavings} with $${finance.currentDebt} in debt is a certified bad decision.`,
        smarterAlternative: `Wait 3 months, clear your high-interest debt, then buy with cash. It is simple math.`,
        savageQuotes: [
          `Your desire costs ${workHours.toFixed(0)} hours of desk misery.`,
          `High interest balances represent modern-day indentured labor.`,
          `Saving is the only ultimate rebellion against commercial over-consumption.`
        ],
        isFallback: true
      });
    }

  } catch (err: any) {
    console.error("API Error generating AI advice:", err);
    return res.status(500).json({ error: "Failed to query AI Financial Advisor: " + err.message });
  }
});

async function run() {
  // Vite dev server mounting in development, or serve built frontend in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 [Can I Afford This?] server running on http://localhost:${PORT}`);
  });
}

run().catch((e) => {
  console.error("Fatal server failure on start:", e);
});
