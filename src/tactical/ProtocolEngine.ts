import { EventEmitter } from 'events';
import { TacticalCore } from './TacticalCore';

interface Protocol {
  id: string;
  name: string;
  type: 'standard' | 'emergency' | 'custom';
  steps: ProtocolStep[];
  conditions: ProtocolCondition[];
}

interface ProtocolStep {
  id: string;
  action: string;
  parameters: Record<string, any>;
  nextSteps: string[];
  completionCriteria?: ProtocolCondition[];
}

interface ProtocolCondition {
  type: 'environmental' | 'tactical' | 'temporal';
  operator: 'equals' | 'greater' | 'less' | 'contains';
  value: any;
}

interface ProtocolContext {
  environmental?: Record<string, any>;
  tactical?: Record<string, any>;
  activeSteps?: string[];
}

export class ProtocolEngine extends EventEmitter {
  private protocols: Map<string, Protocol>;
  private activeProtocols: Map<string, string[]>; // protocolId -> active step IDs
  private tacticalCore: TacticalCore;

  constructor(tacticalCore: TacticalCore) {
    super();
    this.protocols = new Map();
    this.activeProtocols = new Map();
    this.tacticalCore = tacticalCore;
    
    this.tacticalCore.on('situation:updated', this.evaluateProtocols.bind(this));
  }

  async loadProtocol(protocol: Protocol): Promise<void> {
    this.validateProtocol(protocol);
    this.protocols.set(protocol.id, protocol);
    this.emit('protocol:loaded', { id: protocol.id, name: protocol.name });
  }

  private validateProtocol(protocol: Protocol): void {
    if (!protocol.steps.length) {
      throw new Error(`Protocol ${protocol.id} must have at least one step`);
    }

    const stepIds = new Set(protocol.steps.map(s => s.id));
    protocol.steps.forEach(step => {
      step.nextSteps.forEach(nextId => {
        if (!stepIds.has(nextId)) {
          throw new Error(`Invalid step reference ${nextId} in protocol ${protocol.id}`);
        }
      });
    });
  }

  async activateProtocol(protocolId: string, context: ProtocolContext = {}): Promise<void> {
    const protocol = this.protocols.get(protocolId);
    if (!protocol) throw new Error(`Protocol ${protocolId} not found`);

    const conditionsMet = protocol.conditions.every(condition =>
      this.evaluateCondition(condition, context)
    );

    if (!conditionsMet) {
      throw new Error(`Conditions not met for protocol ${protocolId}`);
    }

    const activeSteps = [protocol.steps[0].id];
    this.activeProtocols.set(protocolId, activeSteps);
    
    await this.executeProtocolStep(protocol, protocol.steps[0], context);
    this.emit('protocol:activated', { id: protocolId, initialStep: protocol.steps[0].id });
  }

  private async executeProtocolStep(
    protocol: Protocol,
    step: ProtocolStep,
    context: ProtocolContext
  ): Promise<void> {
    try {
      await this.executeAction(step.action, step.parameters, context);

      const isComplete = !step.completionCriteria || 
        step.completionCriteria.every(condition =>
          this.evaluateCondition(condition, context)
        );

      if (isComplete) {
        await this.progressProtocol(protocol, step, context);
      }

      this.emit('step:executed', {
        protocolId: protocol.id,
        stepId: step.id,
        complete: isComplete
      });
    } catch (error) {
      this.emit('step:error', {
        protocolId: protocol.id,
        stepId: step.id,
        error
      });
    }
  }

  private async progressProtocol(
    protocol: Protocol,
    currentStep: ProtocolStep,
    context: ProtocolContext
  ): Promise<void> {
    const activeSteps = this.activeProtocols.get(protocol.id) || [];
    
    const updatedSteps = activeSteps.filter(id => id !== currentStep.id);
    updatedSteps.push(...currentStep.nextSteps);
    this.activeProtocols.set(protocol.id, updatedSteps);

    await Promise.all(
      currentStep.nextSteps.map(async (nextId) => {
        const nextStep = protocol.steps.find(s => s.id === nextId);
        if (nextStep) {
          await this.executeProtocolStep(protocol, nextStep, context);
        }
      })
    );
  }

  private async executeAction(
    action: string,
    parameters: Record<string, any>,
    context: ProtocolContext
  ): Promise<void> {
    switch (action) {
      case 'mark_location':
        await this.tacticalCore.addTacticalElement(
          'operations',
          {
            type: 'marker',
            position: parameters.position,
            metadata: {
              ...parameters.metadata,
              timestamp: Date.now()
            }
          }
        );
        break;
      
      case 'update_situation':
        await this.tacticalCore.updateSituationalAwareness(
          parameters.center,
          parameters.radius
        );
        break;
      
      default:
        throw new Error(`Unknown action type: ${action}`);
    }
  }

  private evaluateCondition(
    condition: ProtocolCondition,
    context: ProtocolContext
  ): boolean {
    const actualValue = this.getContextValue(condition.type, context);
    
    switch (condition.operator) {
      case 'equals':
        return actualValue === condition.value;
      case 'greater':
        return actualValue > condition.value;
      case 'less':
        return actualValue < condition.value;
      case 'contains':
        return Array.isArray(actualValue) && 
          actualValue.includes(condition.value);
      default:
        return false;
    }
  }

  private getContextValue(type: string, context: ProtocolContext): any {
    switch (type) {
      case 'environmental':
        return context.environmental;
      case 'tactical':
        return context.tactical;
      case 'temporal':
        return Date.now();
      default:
        return null;
    }
  }

  private async evaluateProtocols(situationUpdate: any): Promise<void> {
    for (const [protocolId, activeSteps] of this.activeProtocols) {
      const protocol = this.protocols.get(protocolId);
      if (!protocol) continue;

      const context = {
        ...situationUpdate,
        activeSteps
      };

      const conditionsMet = protocol.conditions.every(condition =>
        this.evaluateCondition(condition, context)
      );

      if (!conditionsMet) {
        this.deactivateProtocol(protocolId);
        continue;
      }

      await Promise.all(
        activeSteps.map(async (stepId) => {
          const step = protocol.steps.find(s => s.id === stepId);
          if (step) {
            await this.executeProtocolStep(protocol, step, context);
          }
        })
      );
    }
  }

  private deactivateProtocol(protocolId: string): void {
    this.activeProtocols.delete(protocolId);
    this.emit('protocol:deactivated', { id: protocolId });
  }
}