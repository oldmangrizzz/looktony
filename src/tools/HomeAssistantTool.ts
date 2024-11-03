import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';

interface HAEntity {
  entityId: string;
  state: string;
  attributes: Record<string, any>;
  lastChanged: string;
}

interface HACommand {
  domain: string;
  service: string;
  entityId: string;
  data?: Record<string, any>;
}

export class HomeAssistantTool extends EventEmitter {
  private wsClient: WebSocket | null = null;
  private entities: Map<string, HAEntity> = new Map();
  private commandQueue: HACommand[] = [];
  private messageId = 1;

  constructor(
    private url: string,
    private accessToken: string
  ) {
    super();
    this.connect();
  }

  private connect() {
    this.wsClient = new WebSocket(
      `${this.url}/api/websocket`
    );

    this.wsClient.onopen = () => {
      this.authenticate();
      this.emit('connected');
    };

    this.wsClient.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
  }

  private authenticate() {
    if (!this.wsClient) return;
    
    this.wsClient.send(JSON.stringify({
      type: 'auth',
      access_token: this.accessToken
    }));
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'auth_ok':
        this.subscribeToEvents();
        break;
      case 'event':
        if (message.event.event_type === 'state_changed') {
          this.updateEntityState(message.event.data.new_state);
        }
        break;
    }
  }

  private subscribeToEvents() {
    if (!this.wsClient) return;
    
    this.wsClient.send(JSON.stringify({
      id: this.messageId++,
      type: 'subscribe_events',
      event_type: 'state_changed'
    }));
  }

  private updateEntityState(state: HAEntity) {
    this.entities.set(state.entityId, state);
    this.emit('state_changed', state);
  }

  async callService(command: HACommand) {
    if (!this.wsClient) {
      this.commandQueue.push(command);
      return;
    }

    this.wsClient.send(JSON.stringify({
      id: this.messageId++,
      type: 'call_service',
      domain: command.domain,
      service: command.service,
      target: {
        entity_id: command.entityId
      },
      service_data: command.data
    }));
  }

  getEntityState(entityId: string): HAEntity | undefined {
    return this.entities.get(entityId);
  }

  async executeAutomation(name: string) {
    return this.callService({
      domain: 'automation',
      service: 'trigger',
      entityId: `automation.${name}`
    });
  }

  async controlLight(entityId: string, state: 'on' | 'off', brightness?: number) {
    return this.callService({
      domain: 'light',
      service: state,
      entityId,
      data: brightness ? { brightness } : undefined
    });
  }

  async controlClimate(entityId: string, temperature: number) {
    return this.callService({
      domain: 'climate',
      service: 'set_temperature',
      entityId,
      data: { temperature }
    });
  }
}