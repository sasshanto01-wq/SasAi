import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GetSentimentBody, GetSentimentResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/sentiment", async (req, res) => {
  try {
    const body = GetSentimentBody.parse(req.body);
    const { symbol } = body;

    const systemPrompt = `You are an expert in retail trader sentiment analysis and order flow microstructure for financial markets.
Analyze retail sentiment and crowd behavior for trading instruments.
Always respond with valid JSON only, no markdown or extra text.`;

    const assetContext: Record<string, string> = {
      USOIL: "WTI Crude Oil - retail traders often follow momentum and news events",
      BTCUSD: "Bitcoin - retail heavily influenced by social media, fear & greed, momentum",
      XAUUSD: "Gold - retail trades as safe haven and inflation hedge, often contrarian to USD",
      EURUSD: "Euro/USD - retail tends to follow trends, highly reactive to economic data releases"
    };

    const context = assetContext[symbol] || "Major trading instrument";

    const userPrompt = `Analyze current retail trader sentiment for ${symbol} (${context}).

Based on typical retail trading behavior, common sentiment patterns, and current market conditions, provide a realistic sentiment analysis that reflects actual retail crowd behavior for this asset right now.

Respond with this exact JSON structure:
{
  "buyPercent": <number 0-100, realistic retail buy percentage>,
  "sellPercent": <number 0-100, realistic retail sell percentage, should sum to ~100 with buyPercent>,
  "sentimentScore": <number -100 to 100, negative=bearish/selling, positive=bullish/buying>,
  "sentiment": "STRONG_BUY|BUY|NEUTRAL|SELL|STRONG_SELL",
  "crowdBias": "<brief description of what the crowd is doing>",
  "contrarySignal": "STRONG_BUY|BUY|NEUTRAL|SELL|STRONG_SELL (opposite of crowd for contrarian play)",
  "summary": "<2-3 sentence explanation of retail sentiment dynamics>"
}

Rules:
- buyPercent + sellPercent should equal approximately 100
- sentimentScore > 60: STRONG_BUY crowd (but contrarily bearish), > 20: BUY crowd, -20 to 20: NEUTRAL, < -20: SELL crowd, < -60: STRONG_SELL crowd
- contrarySignal is the opposite of sentiment (if crowd is buying heavily, smart money often goes opposite)
- Be realistic and specific to ${symbol}'s current market dynamics`;

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
        buyPercent: 50,
        sellPercent: 50,
        sentimentScore: 0,
        sentiment: "NEUTRAL",
        crowdBias: "Mixed signals in the market",
        contrarySignal: "NEUTRAL",
        summary: "Unable to retrieve sentiment data. Please try again."
      };
    }

    const buyPercent = Math.max(0, Math.min(100, parsed.buyPercent ?? 50));
    const sellPercent = Math.max(0, Math.min(100, parsed.sellPercent ?? 50));

    const response = GetSentimentResponse.parse({
      symbol,
      buyPercent,
      sellPercent,
      sentimentScore: parsed.sentimentScore ?? 0,
      sentiment: parsed.sentiment ?? "NEUTRAL",
      crowdBias: parsed.crowdBias ?? "Mixed signals",
      contrarySignal: parsed.contrarySignal ?? "NEUTRAL",
      summary: parsed.summary ?? "Analysis complete.",
      timestamp: new Date().toISOString(),
    });

    res.json(response);
  } catch (error) {
    console.error("Sentiment error:", error);
    res.status(500).json({ error: "Sentiment analysis failed" });
  }
});

export default router;
