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

/**
 * Available transforms
 * 
 * Complete multi-agent system:
 * - entrepreneur: ROI accuracy game → Financial tracking
 * - builder: Ship velocity game → AI cofounder webapp
 * - activist: Pivot speed game → Marketing page
 * - speculator: Future accuracy game → Sales/investment flows
 * - researcher: Pattern recognition game → External context
 * - validator: User feedback game (coming soon)
 * - whale: Scale/impact game (coming soon)
 */
export const transforms: Record<string, Transform> = {
  entrepreneur: entrepreneurTransform,
  builder: builderTransform,
  activist: activistTransform,
  speculator: speculatorTransform,
  researcher: researcherTransform,
  
  // Future transforms (commented out until implemented)
  // validator: validatorTransform,
  // whale: whaleTransform,
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
  validator: {
    name: 'Validator Agent',
    game: 'User Feedback (Validation / Assumption)',
    emoji: '✅',
    output: 'Validation System (coming soon)',
  },
  whale: {
    name: 'Whale Agent',
    game: 'Scale Impact (Users × Value)',
    emoji: '🐋',
    output: 'Scale Strategy (coming soon)',
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
    core: ['entrepreneur', 'builder', 'activist', 'speculator', 'researcher'],
    experimental: ['validator', 'whale'],
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

