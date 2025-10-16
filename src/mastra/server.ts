// Simple test server - bypasses Mastra CLI bundler issues
import { mastra } from './index';
import express from 'express';
import { json } from 'express';

const PORT = process.env.MASTRA_PORT || 4111;
const app = express();

app.use(json());

// Test endpoint for TDD routing agent
app.post('/api/tdd', async (req, res) => {
  try {
    const { feature } = req.body;
    
    console.log('[TDD API] Processing feature:', feature);
    
    const result = await mastra.agents.tddRoutingAgent.network(feature);
    
    const responses = [];
    for await (const chunk of result) {
      responses.push(chunk);
      
      // Send progress updates
      if (chunk.type === 'tool-execution-start') {
        console.log('[TDD API] Tool called:', (chunk.payload as any).toolId);
      }
    }
    
    res.json({ success: true, responses });
  } catch (error: any) {
    console.error('[TDD API] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Test individual agents
app.post('/api/agents/:agentName/test', async (req, res) => {
  try {
    const { agentName } = req.params;
    const { prompt } = req.body;
    
    const agent = (mastra.agents as any)[agentName];
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    console.log(`[Agent API] Testing ${agentName} with prompt:`, prompt);
    
    const result = await agent.generate(prompt);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    agents: Object.keys(mastra.agents || {}),
    tools: Object.keys(mastra.tools || {}),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`[Mastra Server] ✓ Running at http://localhost:${PORT}`);
  console.log(`[Mastra Server] Health: http://localhost:${PORT}/health`);
  console.log(`[Mastra Server] TDD API: POST http://localhost:${PORT}/api/tdd`);
  console.log(`[Mastra Server] Test agents: POST http://localhost:${PORT}/api/agents/:name/test`);
  console.log('[Mastra Server] Press Ctrl+C to stop\n');
  console.log(`[Mastra Server] Agents available:`);
  Object.keys(mastra.agents || {}).forEach(name => {
    console.log(`  - ${name}`);
  });
  console.log(`\n[Mastra Server] Tools available:`);
  Object.keys(mastra.tools || {}).forEach(name => {
    console.log(`  - ${name}`);
  });
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Mastra Server] Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Mastra Server] Shutting down...');
  process.exit(0);
});

