import { Mastra } from '@mastra/core';
import { tddRoutingAgent } from './agents/tdd-routing-agent';
import { testAgent } from './agents/test-agent';
import { developAgent } from './agents/develop-agent';
import { systemStateTool } from './tools/system-state';
import { gitManagerTool } from './tools/git-manager';
import { workspaceManagerTool } from './tools/workspace-manager';
import { shellExecutorTool } from './tools/shell-executor';
import { debugInspectorTool } from './tools/debug-inspector';

import { LibSQLStore } from "@mastra/libsql";

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
    shellExecutorTool,
    debugInspectorTool,
  },
  storage: new LibSQLStore({
    url: ":memory:"
  }),
});

export { tddRoutingAgent, testAgent, developAgent };
export { systemStateTool, gitManagerTool, workspaceManagerTool, shellExecutorTool, debugInspectorTool };

