import React, { useState } from 'react';
import { ChartPanel } from '@/components/panels/ChartPanel';
import { WhalePanel } from '@/components/panels/WhalePanel';
import { SentimentPanel } from '@/components/panels/SentimentPanel';
import { NewsPanel } from '@/components/panels/NewsPanel';
import { AnalysePanel } from '@/components/panels/AnalysePanel';
import { Activity, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const SYMBOLS = ["BTCUSD", "XAUUSD", "EURUSD", "USOIL"];
const TIMEFRAMES = ["2", "5", "10"];

export default function Dashboard() {
  const [activeSymbol, setActiveSymbol] = useState(SYMBOLS[0]);
  const [activeTimeframe, setActiveTimeframe] = useState(TIMEFRAMES[1]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">
      
      {/* Global Header & Controls */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 box-glow-primary">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-foreground text-glow-primary">NEXUS TERMINAL</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Institutional Alpha Engine</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-black/50 p-1 rounded-lg border border-white/5">
            {SYMBOLS.map(sym => (
              <button
                key={sym}
                onClick={() => setActiveSymbol(sym)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-display transition-all duration-200",
                  activeSymbol === sym 
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(0,229,255,0.2)]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {sym}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-black/50 p-1 rounded-lg border border-white/5">
            <Clock className="w-4 h-4 text-muted-foreground ml-2" />
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-display transition-all duration-200",
                  activeTimeframe === tf 
                    ? "bg-secondary text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {tf}m
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Row 1: Chart */}
        <ChartPanel symbol={activeSymbol} timeframe={activeTimeframe} />
        
        {/* Row 2: Whale & Sentiment */}
        <WhalePanel symbol={activeSymbol} />
        <SentimentPanel symbol={activeSymbol} />
        
        {/* Row 3: News & Analyser */}
        <NewsPanel symbol={activeSymbol} />
        <AnalysePanel symbol={activeSymbol} timeframe={activeTimeframe} />

      </main>
    </div>
  );
}
