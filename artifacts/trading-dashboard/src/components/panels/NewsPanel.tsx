import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNewsData } from '@/hooks/use-trading-api';
import { Newspaper, ExternalLink, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

export function NewsPanel({ symbol }: { symbol: string }) {
  const { data, isLoading, isError } = useNewsData(symbol);

  return (
    <Card className="col-span-1 lg:col-span-4 glass-panel flex flex-col h-[500px] border-l-2 border-l-indigo-500/40">
      <CardHeader className="pb-3.5 border-b border-white/[0.05] bg-white/[0.015] shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <div className="w-7 h-7 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Newspaper className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            Macro & Market News
          </CardTitle>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-success/20 bg-success/5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot shrink-0" />
            <span className="text-[10px] font-bold text-success uppercase tracking-wider">Live</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-3 flex-1 overflow-y-auto px-2">
        {isLoading ? (
          <div className="space-y-3 px-3 pt-1">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : isError || !data ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            News feed unavailable.
          </div>
        ) : (
          <div className="space-y-2 px-1 py-1">
            {data.articles.map((article, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group p-3.5 rounded-xl bg-black/25 hover:bg-black/50 border border-white/[0.04] hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-1.5 gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
                    {article.source}
                  </span>
                  <Badge variant="outline" className={cn(
                    "text-[9px] px-1.5 py-0 font-bold tracking-wide shrink-0",
                    article.sentiment === 'BULLISH'
                      ? "border-success/40 text-success bg-success/8"
                      : article.sentiment === 'BEARISH'
                      ? "border-destructive/40 text-destructive bg-destructive/8"
                      : "border-muted/30 text-muted-foreground bg-muted/10"
                  )}>
                    {article.sentiment}
                  </Badge>
                </div>

                <h4 className="font-medium text-xs text-foreground/90 leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
                  <a href={article.url || '#'} target="_blank" rel="noreferrer" className="flex items-start gap-1">
                    {article.title}
                    {article.url && (
                      <ExternalLink className="w-2.5 h-2.5 inline-block mt-0.5 shrink-0 opacity-0 group-hover:opacity-70 transition-opacity" />
                    )}
                  </a>
                </h4>

                <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                  {article.summary}
                </p>

                <div className="flex items-center justify-between text-[9px] text-muted-foreground/50">
                  <div className="flex gap-1">
                    {article.relevantSymbols.map(s => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-white/[0.04] text-muted-foreground/70">{s}</span>
                    ))}
                  </div>
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
