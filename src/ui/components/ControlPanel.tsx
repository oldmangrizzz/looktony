import { ReactNode } from 'react';

interface ControlPanelProps {
  children: ReactNode;
  className?: string;
}

interface AgentStatusProps {
  name: string;
  status: string;
  active?: boolean;
}

export function ControlPanel({ children, className = '' }: ControlPanelProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      {children}
      <div className="flex-1 p-4">
        <div className="space-y-4">
          <div className="bg-zinc-800/50 rounded p-3 border border-blue-500/20">
            <h3 className="font-mono text-sm mb-2">ACTIVE AGENTS</h3>
            <div className="space-y-2">
              <AgentStatus name="TONY" status="PRIMARY" active />
              <AgentStatus name="NATASHA" status="SUPPORT" active />
              <AgentStatus name="JARVIS" status="STANDBY" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentStatus({ name, status, active = false }: AgentStatusProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-blue-500 animate-pulse' : 'bg-zinc-600'}`} />
        <span>{name}</span>
      </div>
      <span className="text-zinc-500">{status}</span>
    </div>
  );
}