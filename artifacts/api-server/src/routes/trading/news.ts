import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GetNewsQueryParams, GetNewsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/news", async (req, res) => {
  try {
    const query = GetNewsQueryParams.parse(req.query);
    const symbol = query.symbol;

    const systemPrompt = `You are a financial news analyst specializing in generating realistic market news summaries for USOIL, BTCUSD, XAUUSD, and EURUSD.
Generate plausible, current-sounding news articles based on typical market conditions and events.
Always respond with valid JSON only, no markdown or extra text.`;

    const symbolFilter = symbol ? `Focus primarily on news relevant to ${symbol}.` : "Cover all four assets: USOIL, BTCUSD, XAUUSD, and EURUSD.";

    const sources = [
      "Investing.com", "Forex.com", "FXStreet", "DailyFX", "TradingView",
      "DailyForex", "Cointelegraph", "MarketPulse", "Reuters", "Finviz"
    ];

    const userPrompt = `Generate 8 realistic market news articles from major financial sources. ${symbolFilter}

These should sound like real, current market news covering macroeconomic events, central bank decisions, geopolitical developments, technical breakouts, and market-moving data releases.

Respond with this exact JSON structure:
{
  "articles": [
    {
      "title": "<compelling news headline>",
      "source": "<one of: ${sources.join(", ")}>",
      "summary": "<2 sentence summary of the news>",
      "sentiment": "BULLISH|BEARISH|NEUTRAL",
      "relevantSymbols": ["<symbol>"],
      "publishedAt": "<ISO 8601 datetime within last 4 hours>",
      "url": "#"
    }
  ]
}

Generate exactly 8 articles. Make them realistic and varied - mix of technical analysis, fundamental news, geopolitical events, and economic data releases. Each article should have 1-2 relevant symbols from [USOIL, BTCUSD, XAUUSD, EURUSD].`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 2048,
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
      parsed = { articles: [] };
    }

    const articles = (parsed.articles ?? []).map((a: Record<string, unknown>) => ({
      title: String(a.title ?? "Market Update"),
      source: String(a.source ?? "Reuters"),
      summary: String(a.summary ?? ""),
      sentiment: String(a.sentiment ?? "NEUTRAL"),
      relevantSymbols: Array.isArray(a.relevantSymbols) ? a.relevantSymbols.map(String) : [],
      publishedAt: String(a.publishedAt ?? new Date().toISOString()),
      url: String(a.url ?? "#"),
    }));

    const response = GetNewsResponse.parse({
      articles,
      lastUpdated: new Date().toISOString(),
    });

    res.json(response);
  } catch (error) {
    console.error("News error:", error);
    res.status(500).json({ error: "News fetch failed" });
  }
});

export default router;
