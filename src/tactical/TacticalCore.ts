import { EventEmitter } from 'events';

interface TacticalElement {
  id: string;
  type: 'unit' | 'asset' | 'incident' | 'marker';
  position: [number, number];
  metadata: {
    callsign?: string;
    status?: 'active' | 'standby' | 'emergency';
    notes?: string;
    timestamp: number;
  };
}

interface TacticalLayer {
  id: string;
  name: string;
  elements: Map<string, TacticalElement>;
  visible: boolean;
}

interface OSINTFeed {
  url: string;
  lastUpdate: number | null;
  data: any;
}

export class TacticalCore extends EventEmitter {
  private layers: Map<string, TacticalLayer>;
  private osintFeeds: Map<string, OSINTFeed>;
  
  constructor() {
    super();
    this.layers = new Map();
    this.osintFeeds = new Map();
    this.initializeTacticalSystems();
  }

  async initialize(container: HTMLElement) {
    // Initialize visualization
    this.emit('ready', { container });
  }

  private async initializeTacticalSystems() {
    await this.createLayer('operations', 'Operations');
    await this.createLayer('intel', 'Intelligence');
    await this.createLayer('assets', 'Assets');
    this.initializeOSINTFeeds();
  }

  private initializeOSINTFeeds() {
    const feeds = [
      { id: 'weather', url: 'https://api.weather.gov/points/' },
      { id: 'traffic', url: 'https://api.mapbox.com/traffic/v1/' },
      { id: 'alerts', url: 'https://api.weather.gov/alerts/active' }
    ];

    feeds.forEach(feed => {
      this.osintFeeds.set(feed.id, {
        url: feed.url,
        lastUpdate: null,
        data: null
      });
    });
  }

  async createLayer(id: string, name: string): Promise<TacticalLayer> {
    const layer: TacticalLayer = {
      id,
      name,
      elements: new Map(),
      visible: true
    };
    
    this.layers.set(id, layer);
    this.emit('layer:created', { id, name });
    return layer;
  }

  async addTacticalElement(
    layerId: string,
    element: Omit<TacticalElement, 'id'>
  ): Promise<string> {
    const layer = this.layers.get(layerId);
    if (!layer) throw new Error(`Layer ${layerId} not found`);

    const id = `tac-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullElement: TacticalElement = {
      ...element,
      id,
      metadata: {
        ...element.metadata,
        timestamp: Date.now()
      }
    };

    layer.elements.set(id, fullElement);
    this.emit('element:added', { layerId, element: fullElement });
    return id;
  }

  async updateSituationalAwareness(center: [number, number], radius: number) {
    const updates = await Promise.all([
      this.updateWeatherData(center),
      this.updateTrafficData(center, radius),
      this.updateAlertData(center)
    ]);

    const situationalUpdate = this.correlateTacticalData(updates);
    this.emit('situation:updated', situationalUpdate);
    return situationalUpdate;
  }

  private async updateWeatherData(center: [number, number]) {
    return { conditions: {}, alerts: [] };
  }

  private async updateTrafficData(center: [number, number], radius: number) {
    return { incidents: [], congestion: {} };
  }

  private async updateAlertData(center: [number, number]) {
    return { features: [] };
  }

  private correlateTacticalData(updates: any[]) {
    const [weather, traffic, alerts] = updates;
    
    return {
      timestamp: Date.now(),
      weather: {
        conditions: weather.conditions || {},
        alerts: alerts.features || []
      },
      traffic: {
        incidents: traffic.incidents || [],
        congestion: traffic.congestion || {}
      },
      tacticalElements: Array.from(this.layers.values())
        .flatMap(layer => Array.from(layer.elements.values()))
    };
  }
}