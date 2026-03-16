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
    <Card className="col-span-1 lg:col-span-8 glass-panel flex flex-col h-[500px] border-primary/20 relative overflow-hidden">
      {/* Decorative background glow based on result */}
      <div className={cn(
        "absolute inset-0 opacity-10 transition-colors duration-1000 pointer-events-none",
        !result ? "bg-primary" : 
        result.direction === 'UP' ? "bg-success" : "bg-destructive"
      )} />

      <CardHeader className="pb-2 border-b border-white/5 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BrainCircuit className="w-6 h-6 text-primary" />
            AI Strategic Synthesis
            <span className="ml-2 text-xs font-normal text-muted-foreground bg-black/40 px-2 py-1 rounded-md border border-white/5">
              {symbol} • {timeframe}
            </span>
          </CardTitle>
          <Button 
            onClick={handleAnalyse} 
            disabled={isPending}
            className="box-glow-primary bg-primary/10 hover:bg-primary/20 text-primary border border-primary/50 rounded-xl px-6 h-9 font-display tracking-wide"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" /> Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Synthesize Signal <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 flex-1 relative z-10 flex flex-col">
        {!result && !isPending && (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <div className="w-24 h-24 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center mb-4">
              <BrainCircuit className="w-12 h-12 text-primary/40" />
            </div>
            <p className="text-lg">Awaiting synthesis execution.</p>
            <p className="text-sm text-center max-w-md opacity-60">
              Click synthesize to aggregate Whale Order Flow, Retail Sentiment, and Macro News into a final predictive signal.
            </p>
          </div>
        )}

        {isPending && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            <div className="text-primary font-display tracking-widest animate-pulse">
              ANALYZING MULTI-DIMENSIONAL DATA...
            </div>
          </div>
        )}

        <AnimatePresence>
          {result && !isPending && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col md:flex-row gap-8"
            >
              {/* Left Column: Big Signal */}
              <div className="flex-1 flex flex-col items-center justify-center bg-black/40 rounded-2xl border border-white/5 p-6 relative overflow-hidden">
                <div className={cn(
                  "absolute top-0 w-full h-1", 
                  result.direction === 'UP' ? "bg-success shadow-[0_0_20px_var(--color-success)]" : "bg-destructive shadow-[0_0_20px_var(--color-destructive)]"
                )} />
                
                <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Final Verdict</h3>
                
                <div className={cn(
                  "text-6xl font-display font-bold tracking-tighter mb-2",
                  getSignalColor(result.signal)
                )}>
                  {result.direction}
                </div>
                
                <div className={cn(
                  "px-4 py-1 rounded-full text-sm font-bold border mb-8",
                  getSignalBgColor(result.signal)
                )}>
                  {result.signal.replace('_', ' ')}
                </div>

                <div className="w-full relative flex justify-center mt-[-20px]">
                   <SentimentGauge score={result.signalScore} size="sm" />
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="flex-[1.5] flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-primary" /> AI Confidence
                    </div>
                    <div className="text-3xl font-display text-foreground">
                      {result.confidence}%
                    </div>
                    <div className="w-full bg-white/5 h-1 mt-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: `${result.confidence}%` }} />
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-warning" /> Risk Level
                    </div>
                    <div className={cn(
                      "text-xl font-display font-semibold mt-2",
                      result.riskLevel === 'HIGH' ? "text-destructive" :
                      result.riskLevel === 'MEDIUM' ? "text-warning" : "text-success"
                    )}>
                      {result.riskLevel}
                    </div>
                  </div>
                </div>

                <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex-1 flex flex-col">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5" /> Core Reasoning
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                    {result.reasoning}
                  </p>
                  
                  <div className="mt-auto">
                    <ul className="space-y-2">
                      {result.keyFactors.map((factor, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
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
