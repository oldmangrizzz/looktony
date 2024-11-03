import { PromptSystem, SystemPrompt } from '../prompts/SystemPrompts';
import { MemoryVault } from '../memory/MemoryVault';

interface AgentContext {
  personality: SystemPrompt;
  memories: MemoryVault;
  currentRole: string;
}

export class AgentPromptManager {
  private promptSystem: PromptSystem;
  private agentContexts: Map<string, AgentContext>;
  
  constructor() {
    this.promptSystem = new PromptSystem();
    this.agentContexts = new Map();
    this.initializeAgents();
  }

  private async initializeAgents() {
    // Initialize Tony
    await this.createAgentContext('tony-prime', 'primary');
    
    // Initialize Natasha
    await this.createAgentContext('natasha-prime', 'support');
  }

  private async createAgentContext(agentId: string, role: string) {
    const personality = this.promptSystem.getPrompt(agentId);
    if (!personality) return;

    const context: AgentContext = {
      personality,
      memories: new MemoryVault(agentId),
      currentRole: role
    };

    this.agentContexts.set(agentId, context);
  }

  async getAgentPrompt(agentId: string): Promise<string | null> {
    const context = this.agentContexts.get(agentId);
    if (!context) return null;

    // Combine personality with recent memories for context
    const recentMemories = await context.memories.recall(new Float32Array(1536), 3);
    
    return `${context.personality.content}\n\nRecent Context:\n${
      recentMemories.map(mem => mem.metadata.context).join('\n')
    }`;
  }

  updateAgentPrompt(agentId: string, newContent: string) {
    this.promptSystem.updatePrompt(agentId, newContent);
  }
}