#!/usr/bin/env node

import { Command } from 'commander';
import { solveCommand } from './commands/solve.js';
import { planCommand } from './commands/plan.js';

const program = new Command();

program
  .name('build-agent')
  .description('CLI tool for AI-assisted development with shell-based agents')
  .version('0.1.0');

// Plan command - generate solution plans for Cursor
program.addCommand(planCommand);

// Solve command - clone repo and create TDD workspaces
program.addCommand(solveCommand);

program.parse();

