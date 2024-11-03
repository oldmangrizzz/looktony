import React, { useState, useEffect } from 'react';

interface ConsoleOutputProps {
  className?: string;
}

export function ConsoleOutput({ className = '' }: ConsoleOutputProps) {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Simulate system logs
    const initialLogs = [
      '[SYSTEM] Initializing workshop systems...',
      '[CORE] Power systems online',
      '[NETWORK] Establishing secure connections',
      '[SENSORS] Calibrating environmental monitors'
    ];

    initialLogs.forEach((log, i) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
      }, i * 500);
    });
  }, []);

  return (
    <div className={className}>
      <div className="h-full p-4 font-mono text-sm">
        <div className="h-full bg-zinc-800/50 rounded-lg p-3 border border-blue-500/20 overflow-auto">
          {logs.map((log, i) => (
            <div key={i} className="text-blue-300/80">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}