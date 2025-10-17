/**
 * Transform System Types
 * 
 * Defines the "games" that different agent types play.
 * Each transform adds domain-specific tracking and optimization.
 */

import type { IdeaInputs as BaseIdeaInputs } from '../commands/create.js';

/**
 * Base game that all agents understand
 */
export interface AgentGame {
  name: string;
  description: string;
  metrics: string[];  // What this game measures
  successCriteria: string;  // How to win this game
}

/**
 * Transform definition - how to fork into specialized agent
 */
export interface Transform {
  id: string;
  name: string;
  description: string;
  game: AgentGame;
  
  // Additional prompts for this domain
  additionalPrompts: TransformPrompt[];
  
  // Requirements template modifications
  requirementsTemplate: (inputs: any) => string;
  
  // Validation rules
  validators: TransformValidator[];
  
  // Custom commands to add
  customCommands?: string[];
  
  // Learning system
  learningEnabled: boolean;
  
  // Interop: what other games does this understand?
  understands: string[];
}

/**
 * Additional prompts for specialized domains
 */
export interface TransformPrompt {
  name: string;
  type: 'input' | 'number' | 'list' | 'confirm';
  message: string;
  choices?: string[];
  default?: any;
  validate?: (input: any) => boolean | string;
}

/**
 * Validation rules for domain-specific constraints
 */
export interface TransformValidator {
  name: string;
  validate: (inputs: any) => Promise<ValidationResult>;
  required: boolean;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
  warnings?: string[];
}

/**
 * Extended inputs with domain-specific data
 */
export interface TransformedIdeaInputs extends BaseIdeaInputs {
  [key: string]: any;  // Domain-specific fields
}

/**
 * Tracking data for learning/improvement
 */
export interface IdeaTracking {
  ideaId: string;
  ideaName: string;
  created: string;
  
  // Predictions made at creation
  predictions: Record<string, any>;
  
  // Actual data collected over time
  actuals: Record<string, any[]>;
  
  // Calculated accuracy
  accuracy: Record<string, number>;
  
  // Learning adjustments
  adjustments: Record<string, any>;
}

/**
 * Agent identity - knows what game it's playing
 */
export interface AgentIdentity {
  type: string;  // 'base' | 'entrepreneur' | 'builder' | etc.
  game: AgentGame;
  version: string;
  created: string;
  parentAgent?: string;  // If transformed from another agent
}

