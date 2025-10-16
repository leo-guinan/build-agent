import { defineConfig } from '@mastra/core';
import { mastra } from './src/mastra';

export default defineConfig({
  mastra,
  port: 4111,
  // Disable storage for dev server (causes LibSQL import errors)
  storage: false,
});

