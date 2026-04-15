import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useWhaleData } from '@/hooks/use-trading-api';
import { Activity, Target, TrendingUp, Layers } from 'lucide-react';
import { cn, getSignalBgColor, getSignalColor } from '@/lib/utils';
import { motion } from 'framer-motion';

export function WhalePanel({ symbol }: { symbol: string }) {
  const { data, isLoading, isError } = useWhaleData(symbol);

  return (
    <Card className="col-span-1 lg:col-span-6 glass-panel flex flex-col border-l-2 border-l-primary/40">
      <CardHeader className="pb-3 border-b border-white/[0.05] bg-white/[0.015]">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Target className="w-3.5 h-3.5 text-primary" />
            </div>
            Institutional Flow Tracker
          </CardTitle>
          {data && (
            <Badge variant="outline" className={cn("px-2.5 py-0.5 text-[10px] font-bold font-display border tracking-wider", getSignalBgColor(data.institutionalBias))}>
              {data.institutionalBias}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-5 flex-1 flex flex-col gap-5">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : isError || !data ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Unable to load institutional flow data.
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-5"
          >
            {/* Top Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/50 border border-white/[0.05] rounded-xl p-3.5 flex flex-col gap-1 hover:border-primary/20 transition-colors">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Whale Activity
                </span>
                <span className={cn("font-display font-bold text-base mt-0.5",
                  data.whaleActivity === "ACCUMULATING" ? "text-success text-glow-success" :
                  data.whaleActivity === "DISTRIBUTING" ? "text-destructive text-glow-destructive" :
                  "text-foreground"
                )}>
                  {data.whaleActivity}
                </span>
              </div>
              <div className="bg-black/50 border border-white/[0.05] rounded-xl p-3.5 flex flex-col gap-1 hover:border-primary/20 transition-colors">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Open Interest
                </span>
                <span className="font-display font-bold text-base mt-0.5 text-foreground">
                  {data.openInterestTrend}
                </span>
              </div>
            </div>

            {/* Block Order Flow */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-medium">Block Order Pressure</span>
                <span className={cn("font-bold font-display tabular-nums",
                  data.largeOrderFlow > 0 ? "text-success" : "text-destructive"
                )}>
                  {data.largeOrderFlow > 0 ? "+" : ""}{data.largeOrderFlow}
                </span>
              </div>
              <Progress
                value={((data.largeOrderFlow + 100) / 200) * 100}
                className="h-2"
                indicatorClassName={data.largeOrderFlow > 0
                  ? "bg-success shadow-[0_0_8px_hsl(150_100%_45%/0.6)]"
                  : "bg-destructive shadow-[0_0_8px_hsl(350_92%_58%/0.6)]"}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground/50 px-0.5">
                <span>← Distribution</span>
                <span>Accumulation →</span>
              </div>
            </div>

            {/* Liquidity Zones */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" /> Key Liquidity Zones
              </span>
              <div className="flex flex-wrap gap-1.5">
                {data.liquidityZones.map((zone, i) => (
                  <span key={i} className="px-2.5 py-1 bg-primary/8 border border-primary/20 text-primary rounded-md text-xs font-display font-medium tracking-tight hover:bg-primary/15 transition-colors cursor-default">
                    {zone}
                  </span>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="mt-auto bg-black/30 p-3.5 rounded-xl border-l-2 border-primary/50 text-xs text-muted-foreground leading-relaxed">
              {data.summary}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
