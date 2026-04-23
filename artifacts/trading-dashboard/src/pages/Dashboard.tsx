import React, { useState } from 'react';
import { ChartPanel } from '@/components/panels/ChartPanel';
import { WhalePanel } from '@/components/panels/WhalePanel';
import { SentimentPanel } from '@/components/panels/SentimentPanel';
import { NewsPanel } from '@/components/panels/NewsPanel';
import { AnalysePanel } from '@/components/panels/AnalysePanel';
import { StockAnalyzerPanel } from '@/components/panels/StockAnalyzerPanel';
import { GitSyncButton } from '@/components/GitSyncButton';
import { LayoutDashboard, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const SYMBOLS = ["BTCUSD", "XAUUSD", "EURUSD", "USOIL"];
const TIMEFRAMES = ["2", "5", "10"];

export default function Dashboard() {
  const [activeSymbol, setActiveSymbol] = useState(SYMBOLS[0]);
  const [activeTimeframe, setActiveTimeframe] = useState(TIMEFRAMES[1]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* Full-width Header Bar */}
      <header className="h-auto md:h-14 border-b border-white/[0.06] bg-black/60 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-3 md:py-0 gap-3 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 box-glow-primary">
              <LayoutDashboard className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-base font-bold tracking-tight text-foreground text-glow-primary leading-none">
                NEXUS TERMINAL
              </h1>
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.18em] leading-none mt-0.5">
                Multi-Asset Intelligence
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Symbol Selector */}
          <div className="flex bg-black/70 p-0.5 rounded-lg border border-white/[0.06]">
            {SYMBOLS.map(sym => (
              <button
                key={sym}
                onClick={() => setActiveSymbol(sym)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-display font-medium transition-all duration-200",
                  activeSymbol === sym
                    ? "bg-primary/15 text-primary border border-primary/25 shadow-[0_0_12px_rgba(0,229,255,0.15)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {sym}
              </button>
            ))}
          </div>

          <GitSyncButton />

          {/* Timeframe Selector */}
          <div className="flex items-center gap-0.5 bg-black/70 p-0.5 rounded-lg border border-white/[0.06]">
            <Clock className="w-3.5 h-3.5 text-muted-foreground ml-2 shrink-0" />
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-display font-medium transition-all duration-200",
                  activeTimeframe === tf
                    ? "bg-white/10 text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {tf}m
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1700px] mx-auto">

          {/* Row 1: Chart */}
          <ChartPanel symbol={activeSymbol} timeframe={activeTimeframe} />

          {/* Row 2: Whale & Sentiment */}
          <WhalePanel symbol={activeSymbol} />
          <SentimentPanel symbol={activeSymbol} />

          {/* Row 3: News & AI Synthesis */}
          <NewsPanel symbol={activeSymbol} />
          <AnalysePanel symbol={activeSymbol} timeframe={activeTimeframe} />

          {/* Row 4: AI Stock Analyzer */}
          <StockAnalyzerPanel />

        </div>
      </main>
    </div>
  );
}
