import { Vector3 } from 'three';
import { WorkshopCore } from '../core/WorkshopCore';
import { useAgentStore } from '../core/AgentCore';
import { AgentPromptManager } from './AgentPromptManager';

export class TonyAgent {
  private core: WorkshopCore;
  private promptManager: AgentPromptManager;
  private voiceModulation: number;
  
  constructor() {
    this.core = new WorkshopCore();
    this.promptManager = new AgentPromptManager();
    this.voiceModulation = 0.8;
    this.initialize();
  }

  private async initialize() {
    await this.core.bootSequence();
    const prompt = await this.promptManager.getAgentPrompt('tony-prime');
    
    useAgentStore.getState().addAgent({
      id: 'mark-1',
      name: 'Tony',
      type: 'primary',
      position: new Vector3(0, 0, 0),
      active: true
    });
  }

  async processInput(input: string) {
    const currentPrompt = await this.promptManager.getAgentPrompt('tony-prime');
    // Process input with context from the system prompt
    return `Processing: ${input}`;
  }

  async synthesizeSpeech(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = this.voiceModulation;
    return utterance;
  }
}