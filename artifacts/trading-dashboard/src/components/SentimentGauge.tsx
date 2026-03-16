import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SentimentGaugeProps {
  score: number; // -100 to 100
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SentimentGauge({ score, size = 'md', className }: SentimentGaugeProps) {
  // Map score (-100 to 100) to rotation (-90deg to 90deg)
  const rotation = Math.max(-90, Math.min(90, (score / 100) * 90));
  
  const dimensions = {
    sm: { width: 140, height: 80, needleLength: 45, cx: 70, cy: 70 },
    md: { width: 260, height: 140, needleLength: 90, cx: 130, cy: 125 },
    lg: { width: 340, height: 180, needleLength: 120, cx: 170, cy: 165 },
  };
  
  const dim = dimensions[size];
  
  // Outer radius for the thick colored arcs
  const radius = dim.cx - 20;
  
  // Helper to draw an arc
  const describeArc = (x: number, y: number, r: number, startAngle: number, endAngle: number) => {
    const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
      const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
      return {
        x: cx + (r * Math.cos(angleInRadians)),
        y: cy + (r * Math.sin(angleInRadians))
      };
    };

    const start = polarToCartesian(x, y, r, endAngle);
    const end = polarToCartesian(x, y, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y, 
      "A", r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  // 5 zones across a 180 degree semicircle (from -90 to +90 in our head, but standard SVG angles start at 0 (top/12 o'clock))
  // We want to draw from left (270 deg) to right (90 deg).
  const zones = [
    { start: 270, end: 306, color: "var(--color-destructive)" },     // Strong Sell
    { start: 306, end: 342, color: "var(--color-warning)" },         // Sell
    { start: 342, end: 18,  color: "hsl(var(--muted-foreground))" }, // Neutral (crosses 0)
    { start: 18,  end: 54,  color: "hsl(100, 50%, 50%)" },           // Buy (light green)
    { start: 54,  end: 90,  color: "var(--color-success)" },         // Strong Buy
  ];

  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)}>
      <svg 
        width={dim.width} 
        height={dim.height} 
        viewBox={`0 0 ${dim.width} ${dim.height}`}
        className="overflow-visible"
      >
        {/* Draw background track (optional, for aesthetics) */}
        <path
          d={describeArc(dim.cx, dim.cy, radius, 270, 90)}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="16"
          strokeLinecap="round"
        />
        
        {/* Draw colored zones */}
        {zones.map((zone, i) => {
          // Adjust angle mapping because our describeArc expects 0 at top.
          // Neutral crosses 360/0.
          let s = zone.start;
          let e = zone.end;
          // Small gap between segments
          s += 1.5;
          e -= 1.5;
          
          return (
            <path
              key={i}
              d={describeArc(dim.cx, dim.cy, radius, s, e)}
              fill="none"
              stroke={zone.color}
              strokeWidth="16"
              className={cn("transition-opacity duration-300", 
                // Highlight the active zone slightly
                score >= -100 + (i*40) && score <= -100 + ((i+1)*40) ? "opacity-100 drop-shadow-[0_0_8px_currentColor]" : "opacity-40"
              )}
            />
          );
        })}

        {/* Needle pivot shadow/glow */}
        <circle cx={dim.cx} cy={dim.cy} r="12" fill="hsl(var(--background))" />
        <circle cx={dim.cx} cy={dim.cy} r="8" fill="hsl(var(--foreground))" className="drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />

        {/* Needle */}
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.2 }}
          style={{ originX: `${dim.cx}px`, originY: `${dim.cy}px` }}
        >
          <path
            d={`M ${dim.cx - 4} ${dim.cy} L ${dim.cx} ${dim.cy - dim.needleLength} L ${dim.cx + 4} ${dim.cy} Z`}
            fill="hsl(var(--foreground))"
            className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
          />
          <circle cx={dim.cx} cy={dim.cy - dim.needleLength} r="2" fill="hsl(var(--background))" />
        </motion.g>
      </svg>
      
      {/* Center Label */}
      <div className="absolute bottom-0 text-center translate-y-4">
        <span className="font-display font-bold text-2xl tracking-tighter">
          {score > 0 ? "+" : ""}{score.toFixed(0)}
        </span>
      </div>
    </div>
  );
}
