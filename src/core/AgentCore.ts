import { create } from 'zustand';
import { Vector3 } from 'three';

interface Agent {
  id: string;
  name: string;
  type: 'primary' | 'secondary';
  position: Vector3;
  active: boolean;
}

interface AgentState {
  agents: Map<string, Agent>;
  activeAgent: string | null;
  addAgent: (agent: Agent) => void;
  setActiveAgent: (id: string) => void;
  updateAgentPosition: (id: string, position: Vector3) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: new Map(),
  activeAgent: null,
  addAgent: (agent) => 
    set((state) => {
      const newAgents = new Map(state.agents);
      newAgents.set(agent.id, agent);
      return { agents: newAgents };
    }),
  setActiveAgent: (id) => 
    set({ activeAgent: id }),
  updateAgentPosition: (id, position) =>
    set((state) => {
      const newAgents = new Map(state.agents);
      const agent = newAgents.get(id);
      if (agent) {
        newAgents.set(id, { ...agent, position });
      }
      return { agents: newAgents };
    })
}));