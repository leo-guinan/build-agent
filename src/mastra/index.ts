import { Mastra } from '@mastra/core';
import { tddRoutingAgent } from './agents/tdd-routing-agent';
import { testAgent } from './agents/test-agent';
import { developAgent } from './agents/develop-agent';
import { systemStateTool } from './tools/system-state';
import { gitManagerTool } from './tools/git-manager';
import { workspaceManagerTool } from './tools/workspace-manager';

export const mastra = new Mastra({
  agents: {
    tddRoutingAgent,
    testAgent,
    developAgent,
  },
  tools: {
    systemStateTool,
    gitManagerTool,
    workspaceManagerTool,
  },
});

export { tddRoutingAgent, testAgent, developAgent };
export { systemStateTool, gitManagerTool, workspaceManagerTool };

