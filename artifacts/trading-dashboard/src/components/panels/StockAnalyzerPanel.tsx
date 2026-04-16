import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStockAnalysisMutation } from '@/hooks/use-trading-api';
import {
  Search, TrendingUp, TrendingDown, Minus, Shield, Zap,
  BarChart2, Target, AlertTriangle, CheckCircle, XCircle,
  ChevronRight, Sparkles, Info, ArrowUp, ArrowDown, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { StockAnalyzeResponse } from '@workspace/api-client-react/src/generated/api.schemas';

const QUICK_TICKERS = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'SPY'];

function VerdictColor(verdict: string) {
  if (verdict === 'BUY') return 'text-success';
  if (verdict === 'SELL') return 'text-destructive';
  return 'text-warning';
}

function VerdictBorder(verdict: string) {
  if (verdict === 'BUY') return 'border-t-success shadow-[0_0_20px_hsl(150_100%_45%/0.15)]';
  if (verdict === 'SELL') return 'border-t-destructive shadow-[0_0_20px_hsl(350_92%_58%/0.15)]';
  return 'border-t-warning shadow-[0_0_20px_hsl(43_100%_55%/0.15)]';
}

function VerdictBg(verdict: string) {
  if (verdict === 'BUY') return 'bg-success/10 border-success/30 text-success';
  if (verdict === 'SELL') return 'bg-destructive/10 border-destructive/30 text-destructive';
  return 'bg-warning/10 border-warning/30 text-warning';
}

function ScoreBar({ value, max = 100, color = 'bg-primary' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-700", color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-black/40 border border-white/[0.05] rounded-lg p-2.5 hover:border-white/10 transition-colors">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <div className="text-sm font-display font-semibold text-foreground leading-tight">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</div>}
    </div>
  );
}

function fmt(v: number | null | undefined, decimals = 2, suffix = '', prefix = ''): string {
  if (v === null || v === undefined) return 'N/A';
  return `${prefix}${v.toFixed(decimals)}${suffix}`;
}

function fmtPct(v: number | null | undefined): string {
  if (v === null || v === undefined) return 'N/A';
  return `${(v * 100).toFixed(1)}%`;
}

function ChangeChip({ change, pct }: { change: number | null; pct: number | null }) {
  if (change === null || pct === null) return null;
  const isUp = change >= 0;
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded",
      isUp ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
    )}>
      {isUp ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
      {Math.abs(pct * 100).toFixed(2)}%
    </span>
  );
}

function AnalystBar({ data }: { data: StockAnalyzeResponse['analystCounts'] }) {
  const total = data.strongBuy + data.buy + data.hold + data.sell + data.strongSell;
  if (total === 0) return <div className="text-xs text-muted-foreground">No analyst data</div>;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-0.5 h-3 rounded-full overflow-hidden w-full">
        {data.strongBuy > 0 && (
          <div className="bg-success" style={{ width: `${(data.strongBuy / total) * 100}%` }} title={`Strong Buy: ${data.strongBuy}`} />
        )}
        {data.buy > 0 && (
          <div className="bg-success/50" style={{ width: `${(data.buy / total) * 100}%` }} title={`Buy: ${data.buy}`} />
        )}
        {data.hold > 0 && (
          <div className="bg-warning/60" style={{ width: `${(data.hold / total) * 100}%` }} title={`Hold: ${data.hold}`} />
        )}
        {data.sell > 0 && (
          <div className="bg-destructive/50" style={{ width: `${(data.sell / total) * 100}%` }} title={`Sell: ${data.sell}`} />
        )}
        {data.strongSell > 0 && (
          <div className="bg-destructive" style={{ width: `${(data.strongSell / total) * 100}%` }} title={`Strong Sell: ${data.strongSell}`} />
        )}
      </div>
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="text-success">▪ Buy {data.strongBuy + data.buy}</span>
        <span className="text-warning">▪ Hold {data.hold}</span>
        <span className="text-destructive">▪ Sell {data.sell + data.strongSell}</span>
        <span className="ml-auto">of {total}</span>
      </div>
    </div>
  );
}

export function StockAnalyzerPanel() {
  const [input, setInput] = useState('');
  const mutation = useStockAnalysisMutation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = (ticker?: string) => {
    const t = (ticker ?? input).trim().toUpperCase();
    if (!t) return;
    setInput(t);
    mutation.mutate(t);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAnalyze();
  };

  const result = mutation.data;
  const isPending = mutation.isPending;
  const isError = mutation.isError;

  return (
    <Card className="col-span-1 lg:col-span-12 glass-panel flex flex-col border-l-2 border-l-violet-500/40 relative overflow-hidden">
      {/* Ambient top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent pointer-events-none" />

      <CardHeader className="pb-3 border-b border-white/[0.05] relative z-10 bg-white/[0.015]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground shrink-0">
            <div className="w-7 h-7 rounded-md bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <BarChart2 className="w-3.5 h-3.5 text-violet-400" />
            </div>
            AI Stock Analyzer
            <span className="text-[10px] font-normal text-muted-foreground bg-black/50 px-2 py-0.5 rounded-md border border-white/[0.06] font-sans tracking-normal">
              Deep Equity Research
            </span>
          </CardTitle>

          {/* Quick ticker chips */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TICKERS.map(t => (
              <button
                key={t}
                onClick={() => handleAnalyze(t)}
                disabled={isPending}
                className="px-2 py-0.5 rounded text-[10px] font-display font-medium bg-black/60 border border-white/[0.07] text-muted-foreground hover:text-foreground hover:border-violet-500/30 hover:bg-violet-500/5 transition-all disabled:opacity-50"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="Enter any ticker (e.g. AAPL, TSLA, AMD)..."
              className="w-full pl-9 pr-4 h-9 text-sm bg-black/60 border border-white/[0.08] rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all font-display tracking-wide"
            />
          </div>
          <Button
            onClick={() => handleAnalyze()}
            disabled={isPending || !input.trim()}
            className="h-9 px-4 text-xs font-display tracking-wide bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/40 rounded-lg transition-all shrink-0 shadow-[0_0_12px_hsl(270_100%_70%/0.1)]"
          >
            {isPending ? (
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Analyzing...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Run Analysis <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 relative z-10">
        {/* Empty state */}
        {!result && !isPending && !isError && (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
            <div className="w-16 h-16 rounded-full bg-violet-500/5 border border-violet-500/15 flex items-center justify-center animate-bounce-subtle">
              <BarChart2 className="w-8 h-8 text-violet-500/30" />
            </div>
            <p className="text-sm font-medium text-foreground/50">Enter any stock ticker to begin</p>
            <p className="text-xs text-center max-w-xs text-muted-foreground/50 leading-relaxed">
              AI pulls live fundamentals, analyst consensus, and generates an institutional-grade research report.
            </p>
          </div>
        )}

        {/* Loading state */}
        {isPending && (
          <div className="flex flex-col items-center justify-center py-10 gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border border-violet-500/15 border-t-violet-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-violet-400 animate-pulse" />
              </div>
            </div>
            <div className="text-xs text-violet-400 font-display tracking-[0.2em] animate-pulse uppercase">
              Fetching market data & running AI analysis...
            </div>
          </div>
        )}

        {/* Error state */}
        {isError && !isPending && (
          <div className="flex flex-col items-center justify-center py-8 gap-3 text-destructive/70">
            <XCircle className="w-10 h-10" />
            <p className="text-sm">Analysis failed. Please check the ticker and try again.</p>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && !isPending && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Header row: company info + verdict */}
              <div className="flex flex-col md:flex-row gap-4">

                {/* Company info + scores */}
                <div className="flex-1 bg-black/40 border border-white/[0.06] rounded-xl p-4 space-y-3">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-display font-bold text-foreground leading-none">{result.ticker}</h2>
                        <span className="text-xs text-muted-foreground bg-black/50 px-2 py-0.5 rounded border border-white/[0.06]">
                          {result.exchange}
                        </span>
                        {!result.hasRealData && (
                          <span className="text-[10px] text-warning bg-warning/10 border border-warning/25 px-2 py-0.5 rounded flex items-center gap-1">
                            <Info className="w-2.5 h-2.5" /> AI-estimated data
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{result.companyName}</p>
                      <p className="text-[11px] text-muted-foreground/60">{result.sector} · {result.industry}</p>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="text-2xl font-display font-bold text-foreground tabular-nums">
                        {result.currentPrice ? `$${result.currentPrice.toFixed(2)}` : 'N/A'}
                      </div>
                      <div className="mt-0.5">
                        <ChangeChip change={result.change} pct={result.changePercent} />
                      </div>
                    </div>
                  </div>

                  {/* Score bars */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                          <Activity className="w-3 h-3 text-violet-400" /> Fundamental Score
                        </span>
                        <span className="text-xs font-display font-bold text-foreground">{result.fundamentalScore}/100</span>
                      </div>
                      <ScoreBar value={result.fundamentalScore} color="bg-violet-500" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-cyan-400" /> Technical Score
                        </span>
                        <span className="text-xs font-display font-bold text-foreground">{result.technicalScore}/100</span>
                      </div>
                      <ScoreBar value={result.technicalScore} color="bg-primary" />
                    </div>
                  </div>

                  {/* Analyst consensus bar */}
                  {result.analystCounts && (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Target className="w-3 h-3" /> Analyst Consensus
                        {result.recommendationKey && result.recommendationKey !== 'N/A' && (
                          <span className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded ml-1 uppercase text-foreground/60">
                            {result.recommendationKey}
                          </span>
                        )}
                      </div>
                      <AnalystBar data={result.analystCounts} />
                    </div>
                  )}
                </div>

                {/* Verdict card */}
                <div className={cn(
                  "w-full md:w-52 bg-black/60 border border-white/[0.06] rounded-xl p-4 flex flex-col items-center justify-center text-center border-t-2 relative overflow-hidden",
                  VerdictBorder(result.verdict)
                )}>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">AI Verdict</div>

                  <div className={cn("text-5xl font-display font-black tracking-tighter mb-2", VerdictColor(result.verdict))}>
                    {result.verdict === 'BUY' ? <TrendingUp className="w-14 h-14 inline" /> :
                     result.verdict === 'SELL' ? <TrendingDown className="w-14 h-14 inline" /> :
                     <Minus className="w-14 h-14 inline" />}
                  </div>

                  <div className={cn("px-3 py-1 rounded-full text-xs font-bold border mb-3", VerdictBg(result.verdict))}>
                    {result.verdict}
                  </div>

                  <div className="w-full space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-muted-foreground">CONFIDENCE</span>
                        <span className="text-xs font-display font-bold text-foreground">{result.confidence}%</span>
                      </div>
                      <ScoreBar value={result.confidence} color={
                        result.verdict === 'BUY' ? 'bg-success' :
                        result.verdict === 'SELL' ? 'bg-destructive' : 'bg-warning'
                      } />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] text-muted-foreground">RISK</span>
                      <span className={cn("text-[10px] font-bold",
                        result.riskLevel === 'HIGH' ? 'text-destructive' :
                        result.riskLevel === 'LOW' ? 'text-success' : 'text-warning'
                      )}>
                        <Shield className="w-3 h-3 inline mr-0.5" />{result.riskLevel}
                      </span>
                    </div>

                    {result.priceTargetLow && result.priceTargetHigh && (
                      <div className="pt-1 border-t border-white/[0.05]">
                        <div className="text-[9px] text-muted-foreground mb-0.5">AI PRICE TARGET</div>
                        <div className="text-xs font-display font-bold text-foreground">
                          ${result.priceTargetLow.toFixed(0)} – ${result.priceTargetHigh.toFixed(0)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Key metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                <MetricCard label="Market Cap" value={result.marketCap ?? 'N/A'} />
                <MetricCard label="P/E (TTM)" value={fmt(result.pe)} sub="Forward: " />
                <MetricCard label="Forward P/E" value={fmt(result.forwardPE)} />
                <MetricCard label="EPS (TTM)" value={result.eps ? `$${result.eps.toFixed(2)}` : 'N/A'} />
                <MetricCard label="Beta" value={fmt(result.beta)} sub="vs market" />
                <MetricCard label="52W High" value={result.week52High ? `$${result.week52High.toFixed(2)}` : 'N/A'} />
                <MetricCard label="52W Low" value={result.week52Low ? `$${result.week52Low.toFixed(2)}` : 'N/A'} />
                <MetricCard label="Dividend" value={result.dividendYield ? fmtPct(result.dividendYield) : 'None'} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <MetricCard label="Rev Growth" value={result.revenueGrowth ? fmtPct(result.revenueGrowth) : 'N/A'} />
                <MetricCard label="Gross Margin" value={result.grossMargin ? fmtPct(result.grossMargin) : 'N/A'} />
                <MetricCard label="Net Margin" value={result.profitMargin ? fmtPct(result.profitMargin) : 'N/A'} />
                <MetricCard label="ROE" value={result.returnOnEquity ? fmtPct(result.returnOnEquity) : 'N/A'} />
              </div>

              {/* Analysis body */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                {/* Executive summary */}
                <div className="md:col-span-3 bg-black/40 border border-white/[0.06] rounded-xl p-4">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-violet-400" /> Executive Summary
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{result.executiveSummary}</p>
                  {result.valuationComment && (
                    <p className="text-xs text-muted-foreground/70 leading-relaxed mt-2 pt-2 border-t border-white/[0.05]">
                      {result.valuationComment}
                    </p>
                  )}
                </div>

                {/* Bull case */}
                <div className="bg-black/40 border border-white/[0.06] border-l-2 border-l-success/40 rounded-xl p-4">
                  <div className="text-[10px] uppercase tracking-widest text-success/70 mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" /> Bull Case
                  </div>
                  <p className="text-xs text-foreground/70 leading-relaxed mb-3">{result.bullCase}</p>
                  {result.keyStrengths?.length > 0 && (
                    <ul className="space-y-1.5">
                      {result.keyStrengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                          <CheckCircle className="w-3 h-3 text-success shrink-0 mt-0.5" />{s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Bear case */}
                <div className="bg-black/40 border border-white/[0.06] border-l-2 border-l-destructive/40 rounded-xl p-4">
                  <div className="text-[10px] uppercase tracking-widest text-destructive/70 mb-2 flex items-center gap-1.5">
                    <TrendingDown className="w-3 h-3" /> Bear Case
                  </div>
                  <p className="text-xs text-foreground/70 leading-relaxed mb-3">{result.bearCase}</p>
                  {result.keyRisks?.length > 0 && (
                    <ul className="space-y-1.5">
                      {result.keyRisks.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                          <AlertTriangle className="w-3 h-3 text-destructive shrink-0 mt-0.5" />{r}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Catalysts */}
                <div className="bg-black/40 border border-white/[0.06] border-l-2 border-l-warning/40 rounded-xl p-4">
                  <div className="text-[10px] uppercase tracking-widest text-warning/70 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Key Catalysts
                  </div>
                  {result.catalysts?.length > 0 ? (
                    <ul className="space-y-1.5">
                      {result.catalysts.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                          <span className="text-warning mt-0.5 shrink-0">▸</span>{c}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground/50">No near-term catalysts identified.</p>
                  )}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="text-[10px] text-muted-foreground/40 text-center py-1 border-t border-white/[0.03]">
                {result.disclaimer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
