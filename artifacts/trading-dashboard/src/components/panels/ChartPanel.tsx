import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface ChartPanelProps {
  symbol: string;
  timeframe: string;
}

export function ChartPanel({ symbol, timeframe }: ChartPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Map our internal symbols to TradingView symbols
  const tvSymbolMap: Record<string, string> = {
    "BTCUSD": "BITSTAMP:BTCUSD",
    "XAUUSD": "OANDA:XAUUSD",
    "EURUSD": "OANDA:EURUSD",
    "USOIL": "TVC:USOIL"
  };

  const tvSymbol = tvSymbolMap[symbol] || symbol;

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous widget
    containerRef.current.innerHTML = '';
    
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    
    const config = {
      autosize: true,
      symbol: tvSymbol,
      interval: timeframe,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      backgroundColor: "rgba(10, 10, 10, 1)", // Matches our --card bg roughly
      gridColor: "rgba(255, 255, 255, 0.06)",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: "tradingview_widget",
      toolbar_bg: "rgba(10, 10, 10, 1)",
      studies: [
        "Volume@tv-basicstudies"
      ]
    };
    
    script.textContent = JSON.stringify(config);
    containerRef.current.appendChild(script);
    
  }, [symbol, timeframe, tvSymbol]);

  return (
    <Card className="col-span-1 border-0 rounded-none sm:rounded-2xl lg:col-span-12 h-[450px] p-1 overflow-hidden glass-panel relative">
      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/30 rounded-tl-2xl pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/30 rounded-tr-2xl pointer-events-none z-10" />
      
      <div className="h-full w-full rounded-xl overflow-hidden bg-black" ref={containerRef} id="tradingview_widget">
        <div className="w-full h-full flex items-center justify-center text-muted-foreground animate-pulse">
          Loading Chart Engine...
        </div>
      </div>
    </Card>
  );
}
