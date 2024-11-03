import React from 'react';

export function StatusMonitor() {
  return (
    <div className="h-full flex items-center justify-between px-4">
      <div className="flex items-center gap-8">
        <h1 className="font-mono text-2xl text-blue-400">TONYAI WORKSHOP</h1>
        <div className="flex items-center gap-4 text-sm">
          <StatusIndicator label="CORE" value="OPTIMAL" />
          <StatusIndicator label="NETWORK" value="SECURE" />
          <StatusIndicator label="MEMORY" value="87.2%" />
        </div>
      </div>
      <div className="text-sm font-mono">
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

function StatusIndicator({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-zinc-500">{label}:</span>
      <span className="text-blue-400">{value}</span>
    </div>
  );
}