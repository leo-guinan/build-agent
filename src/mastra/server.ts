import { createServer } from '@mastra/core';
import { mastra } from './index';

const PORT = process.env.MASTRA_PORT || 4111;

async function startServer() {
  console.log('[Mastra Server] Starting on port', PORT);
  
  const server = await createServer({
    mastra,
    port: Number(PORT),
  });

  console.log(`[Mastra Server] ✓ Running at http://localhost:${PORT}`);
  console.log(`[Mastra Server] Playground: http://localhost:${PORT}/playground`);
  console.log(`[Mastra Server] Test agents, workflows, and tools in the playground`);
  console.log('[Mastra Server] Press Ctrl+C to stop');

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n[Mastra Server] Shutting down...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n[Mastra Server] Shutting down...');
    process.exit(0);
  });
}

startServer().catch((error) => {
  console.error('[Mastra Server] Failed to start:', error);
  process.exit(1);
});

