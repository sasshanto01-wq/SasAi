import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { AnalyseMarketBody, AnalyseMarketResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/analyse", async (req, res) => {
  try {
    const body = AnalyseMarketBody.parse(req.body);
    const { symbol, timeframe, whaleData, sentimentData, newsData } = body;

    const systemPrompt = `You are an expert algorithmic trading analyst specializing in USOIL, BTCUSD, XAUUSD, and EURUSD.
You combine institutional whale data, retail sentiment, and market news to generate precise trading signals.
Always respond with valid JSON only, no markdown or extra text.`;

    const userPrompt = `Analyze the following market data for ${symbol} on the ${timeframe}-minute timeframe and generate a trading signal:

WHALE/INSTITUTIONAL DATA:
${whaleData || "No whale data available - use general institutional analysis for " + symbol}

RETAIL SENTIMENT DATA:
${sentimentData || "No sentiment data available - use typical retail crowd behavior for " + symbol}

RECENT NEWS:
${newsData || "No recent news - use fundamental analysis for " + symbol}

Based on all available data, provide a comprehensive trading signal analysis.

Respond with this exact JSON structure:
{
  "signal": "STRONG_BUY|BUY|NEUTRAL|SELL|STRONG_SELL",
  "signalScore": <number from -100 to 100>,
  "direction": "UP|DOWN",
  "confidence": <number 0-100>,
  "reasoning": "<detailed 2-3 sentence explanation>",
  "keyFactors": ["<factor1>", "<factor2>", "<factor3>"],
  "riskLevel": "LOW|MEDIUM|HIGH"
}

Rules:
- signalScore > 60: STRONG_BUY, 20-60: BUY, -20 to 20: NEUTRAL, -60 to -20: SELL, < -60: STRONG_SELL
- direction is UP for positive scores, DOWN for negative, neutral for 0
- confidence reflects how certain you are given the data quality
- keyFactors should be 3-5 specific, actionable observations`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        signal: "NEUTRAL",
        signalScore: 0,
        direction: "UP",
        confidence: 50,
        reasoning: "Unable to parse AI response. Please try again.",
        keyFactors: ["Analysis in progress"],
        riskLevel: "MEDIUM"
      };
    }

    const response = AnalyseMarketResponse.parse({
      symbol,
      signal: parsed.signal ?? "NEUTRAL",
      signalScore: parsed.signalScore ?? 0,
      direction: parsed.direction ?? "UP",
      confidence: parsed.confidence ?? 50,
      reasoning: parsed.reasoning ?? "Analysis complete.",
      keyFactors: parsed.keyFactors ?? [],
      riskLevel: parsed.riskLevel ?? "MEDIUM",
      timestamp: new Date().toISOString(),
    });

    res.json(response);
  } catch (error) {
    console.error("Analyse error:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

export default router;
