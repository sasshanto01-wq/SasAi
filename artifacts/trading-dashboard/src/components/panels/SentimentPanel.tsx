import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSentimentData } from '@/hooks/use-trading-api';
import { Users, AlertTriangle } from 'lucide-react';
import { SentimentGauge } from '@/components/SentimentGauge';
import { motion } from 'framer-motion';
import { cn, getSignalBgColor } from '@/lib/utils';

export function SentimentPanel({ symbol }: { symbol: string }) {
  const { data, isLoading, isError } = useSentimentData(symbol);

  return (
    <Card className="col-span-1 lg:col-span-6 glass-panel flex flex-col border-l-2 border-l-warning/40">
      <CardHeader className="pb-3 border-b border-white/[0.05] bg-white/[0.015]">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <div className="w-7 h-7 rounded-md bg-warning/10 border border-warning/20 flex items-center justify-center shrink-0">
            <Users className="w-3.5 h-3.5 text-warning" />
          </div>
          Retail Sentiment Gauge
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-5 flex-1 flex flex-col items-center justify-between">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-6">
            <Skeleton className="w-[260px] h-[140px] rounded-t-full" />
            <Skeleton className="h-6 w-full rounded-full" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : isError || !data ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Unable to load sentiment data.
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center gap-6"
          >
            {/* Gauge */}
            <div className="relative mt-3">
              <SentimentGauge score={data.sentimentScore} size="lg" />
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className={cn("px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase border", getSignalBgColor(data.sentiment))}>
                  {data.sentiment.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Buy / Sell Split */}
            <div className="w-full mt-5 space-y-1.5 max-w-md">
              <div className="flex justify-between text-xs font-display font-semibold">
                <span className="text-destructive">{data.sellPercent}% Selling</span>
                <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Crowd Split</span>
                <span className="text-success">{data.buyPercent}% Buying</span>
              </div>
              <div className="h-2.5 w-full flex rounded-full overflow-hidden bg-black/60 border border-white/[0.05]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.sellPercent}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="bg-destructive/85 h-full"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.buyPercent}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="bg-success/85 h-full"
                />
              </div>
            </div>

            {/* Contrarian + Summary */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-black/40 border border-white/[0.05] rounded-xl p-3.5 flex gap-2.5 hover:border-warning/20 transition-colors">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Contrarian Signal</h4>
                  <p className="text-xs font-medium leading-snug">{data.contrarySignal}</p>
                </div>
              </div>
              <div className="bg-black/40 border border-white/[0.05] rounded-xl p-3.5 text-xs text-muted-foreground leading-relaxed">
                {data.summary}
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
