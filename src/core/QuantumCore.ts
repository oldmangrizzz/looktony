import { Vector3 } from 'three';
import { nanoid } from 'nanoid';

type QuantumState = 'superposition' | 'entangled' | 'collapsed';

interface QuantumNode {
  id: string;
  state: QuantumState;
  probability: number;
  entangledWith: Set<string>;
}

export class QuantumCore {
  private nodes: Map<string, QuantumNode>;
  private dimensionalLayers: number;
  
  constructor(layers: number = 4) {
    this.nodes = new Map();
    this.dimensionalLayers = layers; // One for each iteration
  }

  createSuperposition(probability: number = 0.5): string {
    const id = `q-${nanoid()}`;
    this.nodes.set(id, {
      id,
      state: 'superposition',
      probability,
      entangledWith: new Set()
    });
    return id;
  }

  entangle(nodeA: string, nodeB: string): void {
    const a = this.nodes.get(nodeA);
    const b = this.nodes.get(nodeB);
    
    if (a && b) {
      a.state = 'entangled';
      b.state = 'entangled';
      a.entangledWith.add(nodeB);
      b.entangledWith.add(nodeA);
    }
  }

  collapse(nodeId: string): QuantumState {
    const node = this.nodes.get(nodeId);
    if (!node) return 'collapsed';

    node.state = 'collapsed';
    node.entangledWith.forEach(id => {
      const entangled = this.nodes.get(id);
      if (entangled) {
        entangled.state = 'collapsed';
        entangled.probability = node.probability;
      }
    });

    return node.state;
  }
}