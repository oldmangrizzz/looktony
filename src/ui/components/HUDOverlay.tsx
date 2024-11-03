import React from 'react';

interface HUDOverlayProps {
  powerLevel: number;
  systemStatus: string;
}

export function HUDOverlay({ powerLevel, systemStatus }: HUDOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top-left corner */}
      <div className="absolute top-0 left-0 p-4">
        <div className="font-mono text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>STATUS: {systemStatus}</span>
          </div>
          <div className="mt-1">
            POWER: {powerLevel}%
            <div className="w-32 h-1 bg-zinc-800 mt-1">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${powerLevel}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-emerald-500/50" />
      <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-emerald-500/50" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-emerald-500/50" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-emerald-500/50" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.1)_1px,transparent_1px)] [background-size:40px_40px]" />
    </div>
  );
}