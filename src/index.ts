#!/usr/bin/env node

import { Command } from 'commander';
import { createCommand } from './commands/create.js';
import { developCommand } from './commands/develop.js';
import { transformCommand } from './commands/transform.js';
import { solveCommand } from './commands/solve.js';
import { planCommand } from './commands/plan.js';

const program = new Command();

program
  .name('build-agent')
  .description('CLI tool for AI-assisted development with shell-based agents')
  .version('0.1.0');

// Create command - initialize new idea with requirements
program.addCommand(createCommand);

// Develop command - create develop branch from requirements
program.addCommand(developCommand);

// Transform command - fork into specialized agent
program.addCommand(transformCommand);

// Plan command - generate solution plans for Cursor
program.addCommand(planCommand);

// Solve command - clone repo and create TDD workspaces
program.addCommand(solveCommand);

program.parse();

