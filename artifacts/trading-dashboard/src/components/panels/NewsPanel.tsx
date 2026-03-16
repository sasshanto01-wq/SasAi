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
    <Card className="col-span-1 lg:col-span-4 glass-panel flex flex-col h-[500px]">
      <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Newspaper className="w-5 h-5" />
            Macro & Market News
          </CardTitle>
          <Badge variant="outline" className="bg-black/50 text-muted-foreground">
            Live
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 flex-1 overflow-y-auto px-2">
        {isLoading ? (
          <div className="space-y-4 px-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : isError || !data ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            News feed unavailable.
          </div>
        ) : (
          <div className="space-y-4 px-2">
            {data.articles.map((article, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group p-4 rounded-xl bg-black/20 hover:bg-black/40 border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex justify-between items-start mb-2 gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary/80">
                    {article.source}
                  </span>
                  <Badge variant="outline" className={cn(
                    "text-[10px] px-1.5 py-0",
                    article.sentiment === 'BULLISH' ? "border-success text-success bg-success/10" :
                    article.sentiment === 'BEARISH' ? "border-destructive text-destructive bg-destructive/10" :
                    "border-muted text-muted-foreground bg-muted/20"
                  )}>
                    {article.sentiment}
                  </Badge>
                </div>
                
                <h4 className="font-medium text-sm text-foreground/90 leading-snug mb-2 group-hover:text-primary transition-colors">
                  <a href={article.url || '#'} target="_blank" rel="noreferrer" className="flex items-start gap-1">
                    {article.title}
                    {article.url && <ExternalLink className="w-3 h-3 inline-block mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </a>
                </h4>
                
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {article.summary}
                </p>
                
                <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
                  <div className="flex gap-1">
                    {article.relevantSymbols.map(s => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-white/5">{s}</span>
                    ))}
                  </div>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
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
