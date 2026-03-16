import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GetWhaleInfoBody, GetWhaleInfoResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/whale", async (req, res) => {
  try {
    const body = GetWhaleInfoBody.parse(req.body);
    const { symbol } = body;

    const systemPrompt = `You are an expert in institutional trading and whale activity analysis for forex and commodity markets.
Analyze ${symbol} and provide realistic, data-driven institutional whale activity insights.
Always respond with valid JSON only, no markdown or extra text.`;

    const assetContext: Record<string, string> = {
      USOIL: "WTI Crude Oil - influenced by OPEC decisions, US inventory data, geopolitical events",
      BTCUSD: "Bitcoin - influenced by ETF flows, whale wallet movements, exchange inflows/outflows, regulatory news",
      XAUUSD: "Gold - influenced by central bank purchases, USD strength, inflation expectations, geopolitical risk",
      EURUSD: "Euro/USD - influenced by ECB vs Fed policy divergence, Eurozone economic data, risk sentiment"
    };

    const context = assetContext[symbol] || "Major trading asset";

    const userPrompt = `Analyze institutional whale activity for ${symbol} (${context}).
    
Based on current global market conditions, typical institutional behavior patterns, and the specific characteristics of this asset, provide whale tracking analysis.

Respond with this exact JSON structure:
{
  "whaleActivity": "ACCUMULATING|DISTRIBUTING|NEUTRAL",
  "institutionalBias": "BULLISH|BEARISH|NEUTRAL",
  "largeOrderFlow": <number from -100 to 100>,
  "openInterestTrend": "RISING|FALLING|STABLE",
  "liquidityZones": ["<price level or description>", "<price level or description>", "<price level or description>"],
  "summary": "<2-3 sentence institutional analysis>",
  "keyMetrics": ["<metric1>", "<metric2>", "<metric3>", "<metric4>"]
}

Be specific to ${symbol}'s market dynamics. Use realistic values based on current global market conditions.`;

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
        whaleActivity: "NEUTRAL",
        institutionalBias: "NEUTRAL",
        largeOrderFlow: 0,
        openInterestTrend: "STABLE",
        liquidityZones: ["Key support zone", "Current range", "Key resistance zone"],
        summary: "Unable to retrieve whale data. Please try again.",
        keyMetrics: ["Analysis in progress"]
      };
    }

    const response = GetWhaleInfoResponse.parse({
      symbol,
      whaleActivity: parsed.whaleActivity ?? "NEUTRAL",
      institutionalBias: parsed.institutionalBias ?? "NEUTRAL",
      largeOrderFlow: parsed.largeOrderFlow ?? 0,
      openInterestTrend: parsed.openInterestTrend ?? "STABLE",
      liquidityZones: parsed.liquidityZones ?? [],
      summary: parsed.summary ?? "Analysis complete.",
      keyMetrics: parsed.keyMetrics ?? [],
      timestamp: new Date().toISOString(),
    });

    res.json(response);
  } catch (error) {
    console.error("Whale info error:", error);
    res.status(500).json({ error: "Whale analysis failed" });
  }
});

export default router;
