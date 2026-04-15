import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnalyseMarketMutation } from '@/hooks/use-trading-api';
import { BrainCircuit, ChevronRight, AlertOctagon, Zap, ShieldAlert, Sparkles } from 'lucide-react';
import { SentimentGauge } from '@/components/SentimentGauge';
import { cn, getSignalBgColor, getSignalColor } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysePanelProps {
  symbol: string;
  timeframe: string;
}

export function AnalysePanel({ symbol, timeframe }: AnalysePanelProps) {
  const analyseMutation = useAnalyseMarketMutation();

  const handleAnalyse = () => {
    analyseMutation.mutate({ symbol, timeframe });
  };

  const isPending = analyseMutation.isPending;
  const result = analyseMutation.data;

  return (
    <Card className="col-span-1 lg:col-span-8 glass-panel flex flex-col h-[500px] border-l-2 border-l-primary/40 relative overflow-hidden">
      {/* Ambient glow background */}
      <div className={cn(
        "absolute inset-0 opacity-[0.06] transition-colors duration-1000 pointer-events-none",
        !result ? "bg-primary" :
        result.direction === 'UP' ? "bg-success" : "bg-destructive"
      )} />

      <CardHeader className="pb-3 border-b border-white/[0.05] relative z-10 bg-white/[0.015]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 box-glow-primary">
              <BrainCircuit className="w-3.5 h-3.5 text-primary" />
            </div>
            AI Strategic Synthesis
            <span className="text-[10px] font-normal text-muted-foreground bg-black/50 px-2 py-0.5 rounded-md border border-white/[0.06] font-sans tracking-normal">
              {symbol} · {timeframe}m
            </span>
          </CardTitle>
          <Button
            onClick={handleAnalyse}
            disabled={isPending}
            className="box-glow-primary bg-primary/10 hover:bg-primary/20 text-primary border border-primary/40 rounded-lg px-4 h-8 text-xs font-display tracking-wide shrink-0 transition-all"
          >
            {isPending ? (
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Synthesizing...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Run Synthesis <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-5 flex-1 relative z-10 flex flex-col overflow-hidden">
        {!result && !isPending && (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <div className="w-20 h-20 rounded-full bg-primary/5 border border-primary/15 flex items-center justify-center animate-bounce-subtle">
              <BrainCircuit className="w-10 h-10 text-primary/35" />
            </div>
            <p className="text-sm font-medium text-foreground/60">Ready to synthesize.</p>
            <p className="text-xs text-center max-w-xs text-muted-foreground/60 leading-relaxed">
              Aggregates institutional flow, retail sentiment, and macro news into a single directional signal.
            </p>
          </div>
        )}

        {isPending && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border border-primary/15 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary animate-pulse" />
              </div>
            </div>
            <div className="text-xs text-primary font-display tracking-[0.2em] animate-pulse uppercase">
              Synthesizing signal...
            </div>
          </div>
        )}

        <AnimatePresence>
          {result && !isPending && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col md:flex-row gap-4 min-h-0"
            >
              {/* Left: Big Signal */}
              <div className="flex-1 flex flex-col items-center justify-center bg-black/50 rounded-xl border border-white/[0.05] p-5 relative overflow-hidden">
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-0.5",
                  result.direction === 'UP'
                    ? "bg-success shadow-[0_0_16px_hsl(150_100%_45%/0.8)]"
                    : "bg-destructive shadow-[0_0_16px_hsl(350_92%_58%/0.8)]"
                )} />

                <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Final Verdict</h3>

                <div className={cn(
                  "text-7xl font-display font-black tracking-tighter mb-2",
                  getSignalColor(result.signal)
                )}>
                  {result.direction}
                </div>

                <div className={cn(
                  "px-3.5 py-1 rounded-full text-xs font-bold border mb-6",
                  getSignalBgColor(result.signal)
                )}>
                  {result.signal.replace('_', ' ')}
                </div>

                <div className="w-full relative flex justify-center mt-[-16px]">
                  <SentimentGauge score={result.signalScore} size="sm" />
                </div>
              </div>

              {/* Right: Details */}
              <div className="flex-[1.4] flex flex-col gap-3 min-h-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/50 border border-white/[0.05] p-3.5 rounded-xl hover:border-primary/20 transition-colors">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-primary" /> AI Confidence
                    </div>
                    <div className="text-2xl font-display font-bold text-foreground tabular-nums">
                      {result.confidence}%
                    </div>
                    <div className="w-full bg-white/[0.04] h-1 mt-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full shadow-[0_0_6px_hsl(188_100%_50%/0.6)]"
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-black/50 border border-white/[0.05] p-3.5 rounded-xl hover:border-warning/20 transition-colors">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-warning" /> Risk Level
                    </div>
                    <div className={cn(
                      "text-lg font-display font-bold mt-1",
                      result.riskLevel === 'HIGH' ? "text-destructive" :
                      result.riskLevel === 'MEDIUM' ? "text-warning" : "text-success"
                    )}>
                      {result.riskLevel}
                    </div>
                  </div>
                </div>

                <div className="bg-black/50 border border-white/[0.05] p-3.5 rounded-xl flex-1 flex flex-col min-h-0 overflow-hidden hover:border-white/10 transition-colors">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2.5 flex items-center gap-1 shrink-0">
                    <AlertOctagon className="w-3 h-3" /> Core Reasoning
                  </div>
                  <p className="text-xs text-foreground/75 leading-relaxed mb-3 flex-shrink-0">
                    {result.reasoning}
                  </p>
                  <div className="overflow-y-auto mt-auto">
                    <ul className="space-y-1.5">
                      {result.keyFactors.map((factor, i) => (
                        <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                          <span className="text-primary mt-0.5 shrink-0">▸</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
