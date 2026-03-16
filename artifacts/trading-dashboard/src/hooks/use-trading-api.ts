import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getWhaleInfo, 
  getSentiment, 
  getNews, 
  analyseMarket,
} from "@workspace/api-client-react";
import type { 
  WhaleResponse, 
  SentimentResponse, 
  NewsResponse, 
  AnalyseResponse 
} from "@workspace/api-client-react/src/generated/api.schemas";

// We wrap the generated mutation functions in useQuery so they fetch on mount/symbol change
export function useWhaleData(symbol: string) {
  return useQuery({
    queryKey: ["whale", symbol],
    queryFn: async () => {
      // The generated client expects { data: { symbol } } for mutations or just the object depending on generation
      // Looking at the generated api.ts: getWhaleInfo(whaleRequest: WhaleRequest)
      return await getWhaleInfo({ symbol });
    },
    refetchInterval: 5 * 60 * 1000, // 5 mins
    staleTime: 60 * 1000,
  });
}

export function useSentimentData(symbol: string) {
  return useQuery({
    queryKey: ["sentiment", symbol],
    queryFn: async () => {
      return await getSentiment({ symbol });
    },
    refetchInterval: 2 * 60 * 1000, // 2 mins
    staleTime: 30 * 1000,
  });
}

export function useNewsData(symbol: string) {
  return useQuery({
    queryKey: ["news", symbol],
    queryFn: async () => {
      return await getNews({ symbol });
    },
    refetchInterval: 10 * 60 * 1000, // 10 mins
  });
}

export function useAnalyseMarketMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ symbol, timeframe }: { symbol: string, timeframe: string }) => {
      // Fetch latest data from cache to pass to the AI
      const whaleData = queryClient.getQueryData<WhaleResponse>(["whale", symbol]);
      const sentimentData = queryClient.getQueryData<SentimentResponse>(["sentiment", symbol]);
      const newsData = queryClient.getQueryData<NewsResponse>(["news", symbol]);

      return await analyseMarket({
        symbol,
        timeframe,
        whaleData: whaleData ? JSON.stringify(whaleData) : undefined,
        sentimentData: sentimentData ? JSON.stringify(sentimentData) : undefined,
        newsData: newsData ? JSON.stringify(newsData.articles.slice(0, 5)) : undefined,
      });
    }
  });
}
