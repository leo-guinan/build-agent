#!/usr/bin/env node

import { Command } from 'commander';
import { createCommand } from './commands/create.js';
import { developCommand } from './commands/develop.js';
import { transformCommand } from './commands/transform.js';
import { spawnCommand } from './commands/spawn.js';
import { inboxCommand } from './commands/inbox.js';
import { sendCommand } from './commands/send.js';
import { routeCommand } from './commands/route.js';
import { notebookCommand } from './commands/notebook.js';
import { orchestrateCommand } from './commands/orchestrate.js';
import { marketSpawnCommand } from './commands/market-spawn.js';
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

// Spawn command - initialize complete AI-powered company
program.addCommand(spawnCommand);

// Messaging commands - inter-agent communication
program.addCommand(inboxCommand);
program.addCommand(sendCommand);
program.addCommand(routeCommand);
program.addCommand(notebookCommand);
program.addCommand(orchestrateCommand);

// Market spawn - parallel universe exploration
program.addCommand(marketSpawnCommand);

// Plan command - generate solution plans for Cursor
program.addCommand(planCommand);

// Solve command - clone repo and create TDD workspaces
program.addCommand(solveCommand);

program.parse();

