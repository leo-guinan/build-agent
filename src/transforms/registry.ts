/**
 * Transform Registry
 * 
 * Registry of all available agent transforms.
 * Each transform represents a different "game" an agent can play.
 */

import type { Transform } from './types.js';
import { entrepreneurTransform } from './entrepreneur.js';
import { builderTransform } from './builder.js';
import { activistTransform } from './activist.js';
import { speculatorTransform } from './speculator.js';
import { researcherTransform } from './researcher.js';
import { whaleTransform } from './whale.js';
import { validatorTransform } from './validator.js';

/**
 * Available transforms
 * 
 * COMPLETE MULTI-AGENT BUSINESS SYSTEM (7 of 7):/
 * - entrepreneur: ROI accuracy game → Financial tracking
 * - builder: Ship velocity game → AI cofounder webapp
 * - activist: Pivot speed game → Marketing page
 * - speculator: Future accuracy game → Sales/investment flows
 * - researcher: Pattern recognition game → External context
 * - whale: Capital deployment game → Fundraising strategy
 * - validator: System coherence game → Quality control
 */
export const transforms: Record<string, Transform> = {
  entrepreneur: entrepreneurTransform,
  builder: builderTransform,
  activist: activistTransform,
  speculator: speculatorTransform,
  researcher: researcherTransform,
  whale: whaleTransform,
  validator: validatorTransform,
};

/**
 * Get transform by ID
 */
export function getTransform(id: string): Transform | undefined {
  return transforms[id];
}

/**
 * List all available transforms
 */
export function listTransforms(): Transform[] {
  return Object.values(transforms);
}

/**
 * Check if transform exists
 */
export function hasTransform(id: string): boolean {
  return id in transforms;
}

/**
 * Transform descriptions for CLI display
 */
export const transformDescriptions: Record<string, { name: string; game: string; emoji: string; output: string }> = {
  entrepreneur: {
    name: 'Entrepreneur Agent',
    game: 'ROI Accuracy (Time + Money)',
    emoji: '💰',
    output: 'Financial projections & ROI tracking',
  },
  builder: {
    name: 'Builder Agent',
    game: 'Ship Velocity (Features / Time)',
    emoji: '🔨',
    output: 'AI Cofounder Webapp',
  },
  activist: {
    name: 'Activist Agent',
    game: 'Pivot Speed (Time to Right Answer)',
    emoji: '🔄',
    output: 'Marketing Page & Acquisition',
  },
  speculator: {
    name: 'Speculator Agent',
    game: 'Future Accuracy (Predictions / Reality)',
    emoji: '🔮',
    output: 'Sales & Investment Flows',
  },
  researcher: {
    name: 'Researcher Agent',
    game: 'Pattern Recognition (Insights / Data)',
    emoji: '🔬',
    output: 'External Context & Intelligence',
  },
  whale: {
    name: 'Whale Agent',
    game: 'Capital Deployment (Impact × Timing)',
    emoji: '🐋',
    output: 'Fundraising Strategy & Capital Allocation',
  },
  validator: {
    name: 'Validator Agent',
    game: 'System Coherence (Prediction / Reality)',
    emoji: '✅',
    output: 'Validation System & Quality Control',
  },
};

/**
 * Get transform description
 */
export function getTransformDescription(id: string) {
  return transformDescriptions[id] || {
    name: 'Unknown Transform',
    game: 'Unknown Game',
    emoji: '❓',
    output: 'Unknown output',
  };
}

/**
 * Get transforms by category
 */
export function getTransformsByCategory() {
  return {
    business: ['entrepreneur', 'speculator', 'whale'],
    product: ['builder', 'activist'],
    intelligence: ['researcher', 'validator'],
    all: ['entrepreneur', 'builder', 'activist', 'speculator', 'researcher', 'whale', 'validator'],
  };
}

/**
 * Check if agent types are compatible
 */
export function areAgentsCompatible(agent1: string, agent2: string): boolean {
  const transform1 = getTransform(agent1);
  const transform2 = getTransform(agent2);
  
  if (!transform1 || !transform2) return false;
  
  // Check for shared understanding
  const shared = transform1.understands.filter(concept => 
    transform2.understands.includes(concept)
  );
  
  return shared.length > 0;
}

/**
 * Get shared concepts between agents
 */
export function getSharedConcepts(agent1: string, agent2: string): string[] {
  const transform1 = getTransform(agent1);
  const transform2 = getTransform(agent2);
  
  if (!transform1 || !transform2) return [];
  
  return transform1.understands.filter(concept => 
    transform2.understands.includes(concept)
  );
}

