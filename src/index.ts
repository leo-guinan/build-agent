#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .name('build-agent')
  .description('CLI tool for launching validated ideas with AI-guided waterfall methodology')
  .version('0.1.0');

// TODO: Add commands (init, run, chat, status, server)
// Will be implemented in TDD fashion

program.parse();

