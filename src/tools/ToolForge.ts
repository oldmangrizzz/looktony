import { nanoid } from 'nanoid';
import { EventEmitter } from 'events';

interface Tool {
  id: string;
  name: string;
  type: 'webhook' | 'socket' | 'api';
  config: any;
  handler: Function;
}

export class ToolForge extends EventEmitter {
  private tools: Map<string, Tool>;
  private sockets: Map<string, WebSocket>;
  
  constructor() {
    super();
    this.tools = new Map();
    this.sockets = new Map();
  }

  async createTool(spec: {
    name: string;
    type: 'webhook' | 'socket' | 'api';
    config: any;
  }): Promise<Tool> {
    const id = `tool-${nanoid()}`;
    const handler = await this.generateHandler(spec);
    
    const tool: Tool = {
      id,
      ...spec,
      handler
    };
    
    this.tools.set(id, tool);
    this.emit('tool:created', { id, name: spec.name });
    
    if (spec.type === 'socket') {
      await this.initializeSocket(tool);
    }
    
    return tool;
  }

  private async generateHandler(spec: any): Promise<Function> {
    const handlerTemplate = `
      return async function ${spec.name}Handler(input) {
        // Generated handler for ${spec.type}
        const response = await fetch(input.url, {
          method: spec.config.method || 'POST',
          headers: spec.config.headers || {},
          body: JSON.stringify(input.data)
        });
        return response.json();
      }
    `;
    
    return new Function('spec', handlerTemplate)(spec);
  }

  private async initializeSocket(tool: Tool) {
    const ws = new WebSocket(tool.config.url);
    
    ws.onmessage = (event) => {
      this.emit(`${tool.id}:message`, JSON.parse(event.data));
    };
    
    this.sockets.set(tool.id, ws);
  }

  async invokeTool(toolId: string, input: any) {
    const tool = this.tools.get(toolId);
    if (!tool) throw new Error(`Tool ${toolId} not found`);
    
    return tool.handler(input);
  }
}