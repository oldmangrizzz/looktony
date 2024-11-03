import React, { useState, useEffect } from 'react';
import { TonyCore } from '../core/TonyCore';
import { HUDOverlay } from './components/HUDOverlay';
import { ControlPanel } from './components/ControlPanel';
import { ConsoleOutput } from './components/ConsoleOutput';
import { StatusMonitor } from './components/StatusMonitor';

interface WorkshopUIProps {
  core: TonyCore;
  mapRef: React.RefObject<HTMLDivElement>;
}

export function WorkshopUI({ core, mapRef }: WorkshopUIProps) {
  const [systemStatus, setSystemStatus] = useState('INITIALIZING');
  const [powerLevel, setPowerLevel] = useState(0);

  useEffect(() => {
    // Simulate power-up sequence
    const powerSequence = setInterval(() => {
      setPowerLevel(prev => {
        if (prev >= 100) {
          clearInterval(powerSequence);
          setSystemStatus('ONLINE');
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(powerSequence);
  }, []);

  return (
    <div className="relative h-screen bg-zinc-900 text-blue-300 overflow-hidden">
      {/* HUD Overlay - Always visible */}
      <HUDOverlay powerLevel={powerLevel} systemStatus={systemStatus} />

      <div className="flex h-full">
        {/* Left Control Panel */}
        <ControlPanel className="w-80 bg-zinc-900/90 border-r border-blue-500/20 backdrop-blur-sm">
          <div className="p-4 border-b border-blue-500/20">
            <h2 className="font-mono text-xl text-blue-400 mb-2">WORKSHOP CONTROL</h2>
            <div className="grid grid-cols-2 gap-2">
              <button className="industrial-button">INITIALIZE</button>
              <button className="industrial-button">CALIBRATE</button>
            </div>
          </div>
        </ControlPanel>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col">
          {/* Top Status Bar */}
          <div className="h-16 bg-zinc-800/80 border-b border-blue-500/20 backdrop-blur-sm">
            <StatusMonitor />
          </div>

          {/* Main Display Area */}
          <div className="flex-1 flex">
            {/* Map Visualization */}
            <div className="flex-1 relative">
              <div ref={mapRef} className="absolute inset-0" />
              {/* Map overlay elements */}
              <div className="absolute top-4 right-4 bg-zinc-900/80 border border-blue-500/20 p-4 rounded backdrop-blur-sm">
                <h3 className="font-mono text-sm mb-2">TACTICAL OVERLAY</h3>
                {/* Tactical controls will go here */}
              </div>
            </div>

            {/* Right Info Panel */}
            <div className="w-96 bg-zinc-900/90 border-l border-blue-500/20 backdrop-blur-sm p-4">
              <div className="bg-zinc-800/50 rounded-lg p-4 border border-blue-500/20">
                <h3 className="font-mono text-lg text-blue-400 mb-2">SYSTEM METRICS</h3>
                {/* System metrics will go here */}
              </div>
            </div>
          </div>

          {/* Bottom Console */}
          <ConsoleOutput className="h-48 bg-zinc-900/90 border-t border-blue-500/20 backdrop-blur-sm" />
        </div>
      </div>
    </div>
  );
}