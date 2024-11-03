import { Vector3 } from 'three';
import { VectorSpace } from './VectorSpace';
import { MapSystem } from './MapSystem';

export class HyperSpace {
  private dimensions: number[];
  private vectorSpaces: Map<number, VectorSpace>;
  private bridgePoints: Map<string, Vector3[]>;
  private mapSystem: MapSystem;

  constructor(iterationCount: number = 4) {
    this.dimensions = Array.from({ length: iterationCount }, (_, i) => 1536 * (i + 1));
    this.vectorSpaces = new Map();
    this.bridgePoints = new Map();
    this.mapSystem = new MapSystem();
    
    this.dimensions.forEach(dim => {
      this.vectorSpaces.set(dim, new VectorSpace(dim));
    });
  }

  async initialize(mapContainer: HTMLElement) {
    await this.mapSystem.initialize(mapContainer);
    this.mapSystem.on('ready', () => this.syncSpatialSystems());
  }

  createBridge(fromDimension: number, toDimension: number): string {
    const bridgeId = `bridge-${fromDimension}-${toDimension}`;
    const bridgePoints = Array.from({ length: 4 }, () => new Vector3());
    this.bridgePoints.set(bridgeId, bridgePoints);
    return bridgeId;
  }

  async getDirections(start: [number, number], end: [number, number]) {
    const routes = await this.mapSystem.getDirections(start, end, {
      profile: 'driving',
      alternatives: true
    });

    // Create spatial anchors for each route waypoint
    routes.forEach(route => {
      const spatialPoints = route.geometry.coordinates.map((coord: [number, number]) => 
        this.mapSystem.convertToVector3(coord)
      );
      this.createSpatialAnchors(spatialPoints);
    });

    return routes;
  }

  private createSpatialAnchors(points: Vector3[]) {
    points.forEach((point, i) => {
      if (i > 0) {
        const bridgeId = this.createBridge(
          this.dimensions[0],
          this.dimensions[Math.min(i, this.dimensions.length - 1)]
        );
        const bridge = this.bridgePoints.get(bridgeId);
        if (bridge) {
          bridge[0].copy(points[i - 1]);
          bridge[1].copy(point);
        }
      }
    });
  }

  private syncSpatialSystems() {
    // Sync map coordinates with vector space
    this.mapSystem.on('ready', () => {
      this.vectorSpaces.forEach((space, dim) => {
        const baseVector = new Float32Array(dim);
        space.addVector('spatial-anchor', baseVector);
      });
    });
  }

  traverseDimensions(startDim: number, endDim: number, data: Float32Array): Float32Array {
    const bridge = this.createBridge(startDim, endDim);
    return new Float32Array(endDim);
  }
}