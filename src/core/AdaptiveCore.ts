import { ToolForge } from '../tools/ToolForge';
import { HomeAssistantTool } from '../tools/HomeAssistantTool';
import { EventEmitter } from 'events';

export class AdaptiveCore extends EventEmitter {
  private toolForge: ToolForge;
  private adaptationMetrics: Map<string, number>;
  private haClient: HomeAssistantTool | null = null;
  
  constructor() {
    super();
    this.toolForge = new ToolForge();
    this.adaptationMetrics = new Map();
    this.initializeAdaptiveSystem();
  }

  private async initializeAdaptiveSystem() {
    await this.createBasicTools();
    await this.initializeHomeAssistant();
    this.monitorAdaptation();
  }

  private async initializeHomeAssistant() {
    const haUrl = process.env.HOME_ASSISTANT_URL;
    const haToken = process.env.HOME_ASSISTANT_TOKEN;

    if (haUrl && haToken) {
      this.haClient = new HomeAssistantTool(haUrl, haToken);
      
      this.haClient.on('connected', () => {
        this.emit('ha:connected');
      });

      this.haClient.on('state_changed', (state) => {
        this.emit('ha:state_changed', state);
      });
    }
  }

  private async createBasicTools() {
    // Create a WebSocket tool for real-time communication
    await this.toolForge.createTool({
      name: 'realtimeComm',
      type: 'socket',
      config: {
        url: process.env.LIVEKIT_URL,
        protocol: 'wss'
      }
    });
    
    // Create a webhook for external integrations
    await this.toolForge.createTool({
      name: 'externalHook',
      type: 'webhook',
      config: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    });
  }

  private monitorAdaptation() {
    this.toolForge.on('tool:created', ({ id, name }) => {
      this.adaptationMetrics.set(id, 1);
      this.emit('adaptation:tool-ready', { id, name });
    });
  }

  async generateTool(spec: any) {
    try {
      const tool = await this.toolForge.createTool(spec);
      return tool;
    } catch (error) {
      this.emit('adaptation:error', error);
      throw error;
    }
  }

  // Home Assistant specific methods
  async controlHomeEnvironment(params: {
    lights?: { entityId: string; state: 'on' | 'off'; brightness?: number }[];
    climate?: { entityId: string; temperature: number }[];
    automations?: string[];
  }) {
    if (!this.haClient) throw new Error('Home Assistant not initialized');

    const operations = [];

    if (params.lights) {
      operations.push(...params.lights.map(light => 
        this.haClient!.controlLight(light.entityId, light.state, light.brightness)
      ));
    }

    if (params.climate) {
      operations.push(...params.climate.map(climate =>
        this.haClient!.controlClimate(climate.entityId, climate.temperature)
      ));
    }

    if (params.automations) {
      operations.push(...params.automations.map(automation =>
        this.haClient!.executeAutomation(automation)
      ));
    }

    await Promise.all(operations);
  }
}