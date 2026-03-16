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
    <Card className="col-span-1 lg:col-span-6 glass-panel flex flex-col">
      <CardHeader className="pb-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Target className="w-5 h-5" />
            Institutional Whale Tracker
          </CardTitle>
          {data && (
            <Badge variant="outline" className={cn("px-3 py-1 font-display border", getSignalBgColor(data.institutionalBias))}>
              {data.institutionalBias}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 flex-1 flex flex-col gap-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isError || !data ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Failed to load whale activity data.
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Top Metrics Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Activity
                </span>
                <span className={cn("font-display font-semibold text-lg", 
                  data.whaleActivity === "ACCUMULATING" ? "text-success text-glow-success" : 
                  data.whaleActivity === "DISTRIBUTING" ? "text-destructive text-glow-destructive" : 
                  "text-foreground"
                )}>
                  {data.whaleActivity}
                </span>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Open Interest
                </span>
                <span className="font-display font-semibold text-lg text-foreground">
                  {data.openInterestTrend}
                </span>
              </div>
            </div>

            {/* Order Flow Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Large Order Flow</span>
                <span className={cn("font-bold font-display", data.largeOrderFlow > 0 ? "text-success" : "text-destructive")}>
                  {data.largeOrderFlow > 0 ? "+" : ""}{data.largeOrderFlow}
                </span>
              </div>
              {/* Normalize -100 to 100 into 0 to 100 for progress bar */}
              <Progress 
                value={((data.largeOrderFlow + 100) / 200) * 100} 
                className="h-3"
                indicatorClassName={data.largeOrderFlow > 0 ? "bg-success shadow-[0_0_10px_var(--color-success)]" : "bg-destructive shadow-[0_0_10px_var(--color-destructive)]"}
              />
              <div className="flex justify-between text-xs text-muted-foreground/60 px-1">
                <span>Distribution (-100)</span>
                <span>Accumulation (+100)</span>
              </div>
            </div>

            {/* Liquidity Zones */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" /> Key Liquidity Zones
              </span>
              <div className="flex flex-wrap gap-2">
                {data.liquidityZones.map((zone, i) => (
                  <span key={i} className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-md text-sm font-display tracking-tight">
                    {zone}
                  </span>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="mt-auto bg-black/30 p-4 rounded-xl border-l-2 border-primary text-sm text-muted-foreground leading-relaxed">
              {data.summary}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
