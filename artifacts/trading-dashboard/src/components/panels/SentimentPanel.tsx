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
    <Card className="col-span-1 lg:col-span-6 glass-panel flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Users className="w-5 h-5" />
          Retail Order Flow Microstructure
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6 flex-1 flex flex-col items-center justify-between">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-8">
            <Skeleton className="w-[260px] h-[140px] rounded-t-full" />
            <Skeleton className="h-8 w-full rounded-full" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : isError || !data ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Failed to load sentiment data.
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center gap-8"
          >
            {/* The Main Gauge */}
            <div className="relative mt-4">
              <SentimentGauge score={data.sentimentScore} size="lg" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className={cn("px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase border", getSignalBgColor(data.sentiment))}>
                  {data.sentiment.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Buy/Sell Split Bar */}
            <div className="w-full mt-6 space-y-2 max-w-md">
              <div className="flex justify-between text-sm font-display font-medium">
                <span className="text-destructive">{data.sellPercent}% Selling</span>
                <span className="text-muted-foreground uppercase text-xs tracking-wider">Crowd Position</span>
                <span className="text-success">{data.buyPercent}% Buying</span>
              </div>
              <div className="h-3 w-full flex rounded-full overflow-hidden bg-black/50 border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${data.sellPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-destructive/80 h-full"
                />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${data.buyPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-success/80 h-full"
                />
              </div>
            </div>

            {/* Bottom details */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-black/30 border border-white/5 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Contrarian Signal</h4>
                  <p className="text-sm font-medium">{data.contrarySignal}</p>
                </div>
              </div>
              <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-sm text-muted-foreground flex items-center">
                {data.summary}
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
