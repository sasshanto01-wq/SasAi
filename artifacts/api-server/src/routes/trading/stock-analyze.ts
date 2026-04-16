import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

async function fetchYahooFinanceData(ticker: string) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
  };

  let quoteData: Record<string, unknown> = {};
  let summaryData: Record<string, unknown> = {};

  try {
    const quoteRes = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=3mo`,
      { headers }
    );
    if (quoteRes.ok) {
      const raw = await quoteRes.json() as Record<string, unknown>;
      const result = (raw?.chart as Record<string, unknown>)?.result as unknown[];
      if (Array.isArray(result) && result.length > 0) {
        quoteData = result[0] as Record<string, unknown>;
      }
    }
  } catch (e) {
    console.warn("Yahoo Finance chart fetch failed:", e);
  }

  try {
    const summaryRes = await fetch(
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=summaryDetail,defaultKeyStatistics,financialData,assetProfile,recommendationTrend,price`,
      { headers }
    );
    if (summaryRes.ok) {
      const raw = await summaryRes.json() as Record<string, unknown>;
      const result = (raw?.quoteSummary as Record<string, unknown>)?.result as unknown[];
      if (Array.isArray(result) && result.length > 0) {
        summaryData = result[0] as Record<string, unknown>;
      }
    }
  } catch (e) {
    console.warn("Yahoo Finance summary fetch failed:", e);
  }

  return { quoteData, summaryData };
}

function extractMetrics(quoteData: Record<string, unknown>, summaryData: Record<string, unknown>) {
  const price = summaryData?.price as Record<string, unknown> ?? {};
  const summary = summaryData?.summaryDetail as Record<string, unknown> ?? {};
  const keyStats = summaryData?.defaultKeyStatistics as Record<string, unknown> ?? {};
  const financialData = summaryData?.financialData as Record<string, unknown> ?? {};
  const profile = summaryData?.assetProfile as Record<string, unknown> ?? {};
  const rec = summaryData?.recommendationTrend as Record<string, unknown> ?? {};

  const meta = quoteData?.meta as Record<string, unknown> ?? {};

  const val = (obj: Record<string, unknown>, key: string): number | null => {
    const v = obj?.[key];
    if (v && typeof v === 'object' && 'raw' in (v as object)) {
      return (v as Record<string, unknown>).raw as number;
    }
    return typeof v === 'number' ? v : null;
  };

  const str = (obj: Record<string, unknown>, key: string): string | null => {
    const v = obj?.[key];
    if (v && typeof v === 'object' && 'fmt' in (v as object)) {
      return (v as Record<string, unknown>).fmt as string;
    }
    return typeof v === 'string' ? v : null;
  };

  const recTrend = Array.isArray(rec?.trend) ? (rec.trend as Record<string, unknown>[])[0] : null;

  return {
    companyName: str(price, 'longName') ?? str(price, 'shortName') ?? (meta?.shortName as string) ?? (meta?.longName as string) ?? meta?.symbol ?? 'Unknown',
    exchange: str(price, 'exchangeName') ?? str(meta, 'exchangeName') ?? 'N/A',
    sector: str(profile, 'sector') ?? 'N/A',
    industry: str(profile, 'industry') ?? 'N/A',
    currentPrice: val(price, 'regularMarketPrice') ?? val(meta as Record<string, unknown>, 'regularMarketPrice'),
    previousClose: val(price, 'regularMarketPreviousClose') ?? val(summary, 'previousClose'),
    change: val(price, 'regularMarketChange'),
    changePercent: val(price, 'regularMarketChangePercent'),
    marketCap: str(price, 'marketCap') ?? (val(price, 'marketCap') ? `$${((val(price, 'marketCap') ?? 0) / 1e9).toFixed(1)}B` : 'N/A'),
    pe: val(summary, 'trailingPE'),
    forwardPE: val(summary, 'forwardPE'),
    eps: val(keyStats, 'trailingEps'),
    beta: val(summary, 'beta'),
    week52High: val(summary, 'fiftyTwoWeekHigh'),
    week52Low: val(summary, 'fiftyTwoWeekLow'),
    dividendYield: val(summary, 'dividendYield'),
    revenueGrowth: val(financialData, 'revenueGrowth'),
    grossMargin: val(financialData, 'grossMargins'),
    profitMargin: val(financialData, 'profitMargins'),
    operatingMargin: val(financialData, 'operatingMargins'),
    debtToEquity: val(keyStats, 'debtToEquity'),
    currentRatio: val(financialData, 'currentRatio'),
    returnOnEquity: val(financialData, 'returnOnEquity'),
    freeCashFlow: val(financialData, 'freeCashflow'),
    targetMeanPrice: val(financialData, 'targetMeanPrice'),
    recommendationKey: financialData?.recommendationKey as string ?? 'N/A',
    strongBuy: recTrend?.strongBuy as number ?? 0,
    buy: recTrend?.buy as number ?? 0,
    hold: recTrend?.hold as number ?? 0,
    sell: recTrend?.sell as number ?? 0,
    strongSell: recTrend?.strongSell as number ?? 0,
    businessSummary: str(profile, 'longBusinessSummary') ?? 'No company description available.',
  };
}

router.post("/stock-analyze", async (req, res) => {
  try {
    const rawTicker = req.body?.ticker;
    if (!rawTicker || typeof rawTicker !== 'string') {
      res.status(400).json({ error: "ticker is required" });
      return;
    }
    const ticker = rawTicker.trim().toUpperCase().slice(0, 10);

    // Fetch real financial data
    const { quoteData, summaryData } = await fetchYahooFinanceData(ticker);
    const metrics = extractMetrics(quoteData, summaryData);

    const hasRealData = metrics.currentPrice !== null;

    const systemPrompt = `You are a senior equity research analyst with 20 years of experience at a top-tier investment bank.
You produce concise, data-driven stock analysis reports.
Always respond with valid JSON only — no markdown, no explanations outside JSON.
IMPORTANT DISCLAIMER: All analysis is strictly informational and does not constitute investment advice.`;

    const metricsText = `
TICKER: ${ticker}
COMPANY: ${metrics.companyName}
SECTOR: ${metrics.sector} | INDUSTRY: ${metrics.industry}
EXCHANGE: ${metrics.exchange}

PRICE DATA:
- Current Price: ${metrics.currentPrice ?? 'N/A'}
- Previous Close: ${metrics.previousClose ?? 'N/A'}
- Change: ${metrics.change ?? 'N/A'} (${metrics.changePercent ? (metrics.changePercent * 100).toFixed(2) + '%' : 'N/A'})
- 52W High: ${metrics.week52High ?? 'N/A'} | 52W Low: ${metrics.week52Low ?? 'N/A'}

VALUATION:
- Market Cap: ${metrics.marketCap ?? 'N/A'}
- Trailing P/E: ${metrics.pe ?? 'N/A'}
- Forward P/E: ${metrics.forwardPE ?? 'N/A'}
- EPS (TTM): ${metrics.eps ?? 'N/A'}
- Beta: ${metrics.beta ?? 'N/A'}
- Dividend Yield: ${metrics.dividendYield ? (metrics.dividendYield * 100).toFixed(2) + '%' : 'None'}

FUNDAMENTALS:
- Revenue Growth (YoY): ${metrics.revenueGrowth ? (metrics.revenueGrowth * 100).toFixed(1) + '%' : 'N/A'}
- Gross Margin: ${metrics.grossMargin ? (metrics.grossMargin * 100).toFixed(1) + '%' : 'N/A'}
- Operating Margin: ${metrics.operatingMargin ? (metrics.operatingMargin * 100).toFixed(1) + '%' : 'N/A'}
- Net Profit Margin: ${metrics.profitMargin ? (metrics.profitMargin * 100).toFixed(1) + '%' : 'N/A'}
- Return on Equity: ${metrics.returnOnEquity ? (metrics.returnOnEquity * 100).toFixed(1) + '%' : 'N/A'}
- Debt/Equity: ${metrics.debtToEquity ?? 'N/A'}
- Current Ratio: ${metrics.currentRatio ?? 'N/A'}

ANALYST CONSENSUS:
- Recommendation: ${metrics.recommendationKey}
- Strong Buy: ${metrics.strongBuy} | Buy: ${metrics.buy} | Hold: ${metrics.hold} | Sell: ${metrics.sell} | Strong Sell: ${metrics.strongSell}
- Analyst Price Target: ${metrics.targetMeanPrice ?? 'N/A'}

COMPANY OVERVIEW:
${metrics.businessSummary?.slice(0, 400)}
`;

    const userPrompt = `Analyze ${ticker} based on the following data and generate a structured investment research report:

${metricsText}

${!hasRealData ? `NOTE: Real market data could not be retrieved. Perform analysis based on your knowledge of ${ticker} as of your training data.` : ''}

Respond with this exact JSON structure:
{
  "verdict": "BUY|HOLD|SELL",
  "verdictScore": <number -100 to 100, negative=bearish, positive=bullish>,
  "confidence": <number 0-100>,
  "priceTargetLow": <number or null>,
  "priceTargetHigh": <number or null>,
  "fundamentalScore": <number 0-100, based on valuation, growth, margins>,
  "technicalScore": <number 0-100, based on price vs 52w range, momentum>,
  "riskLevel": "LOW|MEDIUM|HIGH",
  "executiveSummary": "<2-3 sentence overview of the company and investment thesis>",
  "bullCase": "<2 sentence bull case>",
  "bearCase": "<2 sentence bear case>",
  "keyStrengths": ["<strength1>", "<strength2>", "<strength3>"],
  "keyRisks": ["<risk1>", "<risk2>", "<risk3>"],
  "catalysts": ["<catalyst1>", "<catalyst2>"],
  "valuationComment": "<1-2 sentence comment on current valuation vs peers>",
  "disclaimer": "This analysis is for informational purposes only and does not constitute investment advice."
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";

    let aiAnalysis: Record<string, unknown> = {};
    try {
      const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
      aiAnalysis = JSON.parse(cleaned);
    } catch {
      aiAnalysis = {
        verdict: "HOLD",
        verdictScore: 0,
        confidence: 30,
        fundamentalScore: 50,
        technicalScore: 50,
        riskLevel: "MEDIUM",
        executiveSummary: "Analysis could not be completed at this time.",
        bullCase: "Insufficient data for bull case.",
        bearCase: "Insufficient data for bear case.",
        keyStrengths: [],
        keyRisks: [],
        catalysts: [],
        valuationComment: "Valuation data unavailable.",
        disclaimer: "This analysis is for informational purposes only."
      };
    }

    res.json({
      ticker,
      companyName: metrics.companyName,
      exchange: metrics.exchange,
      sector: metrics.sector,
      industry: metrics.industry,
      currentPrice: metrics.currentPrice,
      previousClose: metrics.previousClose,
      change: metrics.change,
      changePercent: metrics.changePercent,
      marketCap: metrics.marketCap,
      pe: metrics.pe,
      forwardPE: metrics.forwardPE,
      eps: metrics.eps,
      beta: metrics.beta,
      week52High: metrics.week52High,
      week52Low: metrics.week52Low,
      dividendYield: metrics.dividendYield,
      revenueGrowth: metrics.revenueGrowth,
      grossMargin: metrics.grossMargin,
      profitMargin: metrics.profitMargin,
      operatingMargin: metrics.operatingMargin,
      returnOnEquity: metrics.returnOnEquity,
      debtToEquity: metrics.debtToEquity,
      targetMeanPrice: metrics.targetMeanPrice,
      recommendationKey: metrics.recommendationKey,
      analystCounts: {
        strongBuy: metrics.strongBuy,
        buy: metrics.buy,
        hold: metrics.hold,
        sell: metrics.sell,
        strongSell: metrics.strongSell,
      },
      hasRealData,
      ...aiAnalysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stock analyze error:", error);
    res.status(500).json({ error: "Stock analysis failed. Please check the ticker and try again." });
  }
});

export default router;
