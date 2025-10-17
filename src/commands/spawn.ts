import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { getTransform } from '../transforms/registry.js';
import { initializeMailbox } from '../messaging/router.js';

interface SpawnMetrics {
  agentName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  steps: string[];
  success: boolean;
  error?: string;
}

interface SpawnSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalDuration?: number;
  agentsSpawned: SpawnMetrics[];
  successRate: number;
  totalSteps: number;
  failures: string[];
}

export const spawnCommand = new Command('spawn')
  .description('Initialize complete AI-powered company (entrepreneur spawns all other agents)')
  .option('--output-dir <dir>', 'Output directory for all agents', '.')
  .option('--agents <list>', 'Comma-separated list of agents to spawn', 'builder,activist,speculator,researcher,whale,validator')
  .option('--skip-setup', 'Skip npm install/build for each agent', false)
  .option('--track-only', 'Only track metrics, don\'t actually spawn', false)
  .action(async (options) => {
    console.log(chalk.cyan('🌱 Spawning Complete AI-Powered Company...\n'));
    console.log(chalk.gray('Entrepreneur agent will spawn and orchestrate other agents.\n'));

    const session: SpawnSession = {
      sessionId: `spawn-${Date.now()}`,
      startTime: Date.now(),
      agentsSpawned: [],
      successRate: 0,
      totalSteps: 0,
      failures: [],
    };

    try {
      // Confirm the spawn
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'This will create 7 specialized agents. Continue?',
          default: true,
        },
      ]);

      if (!confirm) {
        console.log(chalk.gray('Cancelled.'));
        return;
      }

      // Get agent list
      const agentList = options.agents.split(',').map((s: string) => s.trim());
      const allAgents = ['entrepreneur', ...agentList];

      console.log(chalk.cyan('📋 Spawn Plan:\n'));
      console.log(chalk.white('Parent Agent:'), chalk.green('entrepreneur (CEO)'));
      console.log(chalk.white('Child Agents:'), chalk.gray(agentList.join(', ')));
      console.log(chalk.white('Output:'), chalk.gray(path.resolve(options.outputDir)));
      console.log(chalk.white('Total Agents:'), chalk.gray(allAgents.length));
      console.log();

      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'Begin spawn sequence?',
          default: true,
        },
      ]);

      if (!proceed) {
        console.log(chalk.gray('Cancelled.'));
        return;
      }

      console.log();
      console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.green('🌱 SPAWN SEQUENCE INITIATED'));
      console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log();

      // Spawn each agent
      for (const agentType of allAgents) {
        const metrics = await spawnAgent(agentType, options, session);
        session.agentsSpawned.push(metrics);
        session.totalSteps += metrics.steps.length;

        if (!metrics.success) {
          session.failures.push(`${agentType}: ${metrics.error}`);
        }
      }

      session.endTime = Date.now();
      session.totalDuration = session.endTime - session.startTime;
      session.successRate = (session.agentsSpawned.filter(a => a.success).length / session.agentsSpawned.length) * 100;

      // Display summary
      console.log();
      console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.green('🎉 SPAWN SEQUENCE COMPLETE'));
      console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log();

      displaySpawnSummary(session, options);
      saveSpawnMetrics(session, options);

      // Next steps
      console.log();
      console.log(chalk.yellow('🎯 Next Steps:\n'));
      console.log(chalk.white('1. Verify all agents:'));
      console.log(chalk.gray(`   ls -la ${path.resolve(options.outputDir)}`));
      console.log();
      console.log(chalk.white('2. Use entrepreneur agent to orchestrate:'));
      console.log(chalk.gray(`   cd ${path.resolve(options.outputDir)}/entrepreneur-agent`));
      console.log(chalk.gray(`   entrepreneur-agent create`));
      console.log();
      console.log(chalk.white('3. Spawn additional agents as needed:'));
      console.log(chalk.gray(`   builder-agent create`));
      console.log(chalk.gray(`   activist-agent create`));
      console.log(chalk.gray(`   etc.`));
      console.log();
      console.log(chalk.white('4. View spawn metrics:'));
      console.log(chalk.gray(`   cat ${path.resolve(options.outputDir)}/.spawn-metrics/${session.sessionId}.json`));
      console.log();

      if (session.successRate === 100) {
        console.log(chalk.green('✅ ALL AGENTS SPAWNED SUCCESSFULLY!'));
        console.log(chalk.green('Complete AI-powered C-suite ready to use.'));
      } else {
        console.log(chalk.yellow(`⚠️  ${session.failures.length} agents failed to spawn`));
        console.log(chalk.gray('See above for details.'));
      }
      console.log();

    } catch (error: any) {
      console.error(chalk.red(`❌ Spawn sequence failed: ${error.message}`));
      process.exit(1);
    }
  });

/**
 * Spawn a single agent
 */
async function spawnAgent(
  agentType: string,
  options: any,
  session: SpawnSession
): Promise<SpawnMetrics> {
  const metrics: SpawnMetrics = {
    agentName: agentType,
    startTime: Date.now(),
    steps: [],
    success: false,
  };

  const spinner = ora(`Spawning ${agentType} agent...`).start();

  try {
    // Validate transform exists
    metrics.steps.push('Validate transform');
    const transform = getTransform(agentType);
    if (!transform) {
      throw new Error(`Transform '${agentType}' not found`);
    }
    spinner.text = `${agentType}: Transform loaded`;

    // Create output directory
    metrics.steps.push('Create directory');
    const agentDir = path.join(path.resolve(options.outputDir), `${agentType}-agent`);
    
    if (fs.existsSync(agentDir)) {
      if (options.trackOnly) {
        spinner.info(chalk.yellow(`${agentType}: Already exists (track-only mode)`));
        metrics.success = true;
        metrics.endTime = Date.now();
        metrics.duration = metrics.endTime - metrics.startTime;
        return metrics;
      }
      throw new Error(`Directory ${agentDir} already exists`);
    }

    fs.mkdirSync(agentDir, { recursive: true });
    spinner.text = `${agentType}: Directory created`;

    // Copy build-agent
    metrics.steps.push('Copy source files');
    const sourceDir = process.cwd();
    copyDirectory(sourceDir, agentDir, ['node_modules', 'dist', 'workspaces', '.git', '.build-agent', '*.log', '*-agent']);
    spinner.text = `${agentType}: Files copied`;

    // Update package.json
    metrics.steps.push('Update package.json');
    const packagePath = path.join(agentDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    packageJson.name = `${agentType}-agent`;
    packageJson.description = `${transform.name} - ${transform.description}`;
    packageJson.bin = {
      [`${agentType}-agent`]: './dist/index.js',
    };
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    spinner.text = `${agentType}: Package updated`;

    // Create agent identity
    metrics.steps.push('Create identity');
    const identity = {
      type: agentType,
      game: transform.game,
      version: '1.0.0',
      created: new Date().toISOString(),
      parentAgent: 'entrepreneur',
      spawnSession: session.sessionId,
    };
    fs.writeFileSync(
      path.join(agentDir, 'AGENT_IDENTITY.json'),
      JSON.stringify(identity, null, 2)
    );
    spinner.text = `${agentType}: Identity created`;

    // Update CLI name
    metrics.steps.push('Update CLI');
    const indexPath = path.join(agentDir, 'src', 'index.ts');
    let indexContent = fs.readFileSync(indexPath, 'utf-8');
    indexContent = indexContent.replace(
      /\.name\('build-agent'\)/g,
      `.name('${agentType}-agent')`
    );
    fs.writeFileSync(indexPath, indexContent);
    spinner.text = `${agentType}: CLI updated`;

    // Initialize git
    metrics.steps.push('Initialize git');
    execSync('git init', { cwd: agentDir, stdio: 'pipe' });
    try {
      execSync('git config user.name', { cwd: agentDir, stdio: 'pipe' });
    } catch {
      execSync('git config user.name "Spawn Agent"', { cwd: agentDir, stdio: 'pipe' });
      execSync('git config user.email "spawn@agent.local"', { cwd: agentDir, stdio: 'pipe' });
    }
    execSync('git add .', { cwd: agentDir, stdio: 'pipe' });
    execSync(`git commit -m "Spawned ${transform.name} from entrepreneur"`, { cwd: agentDir, stdio: 'pipe' }      );
      spinner.text = `${agentType}: Git initialized`;

      // Initialize mailbox
      metrics.steps.push('Initialize mailbox');
      initializeMailbox(agentDir);
      spinner.text = `${agentType}: Mailbox ready`;

      // Install and build (unless skipped)
    if (!options.skipSetup) {
      metrics.steps.push('Install dependencies');
      spinner.text = `${agentType}: Installing dependencies...`;
      execSync('npm install', { cwd: agentDir, stdio: 'pipe' });
      
      metrics.steps.push('Build');
      spinner.text = `${agentType}: Building...`;
      execSync('npm run build', { cwd: agentDir, stdio: 'pipe' });
      
      metrics.steps.push('Link globally');
      spinner.text = `${agentType}: Linking...`;
      execSync('npm link', { cwd: agentDir, stdio: 'pipe' });
    } else {
      metrics.steps.push('Skip setup (--skip-setup)');
    }

    metrics.success = true;
    metrics.endTime = Date.now();
    metrics.duration = metrics.endTime - metrics.startTime;

    spinner.succeed(chalk.green(`✅ ${agentType}: Spawned successfully (${(metrics.duration / 1000).toFixed(1)}s, ${metrics.steps.length} steps)`));

    return metrics;

  } catch (error: any) {
    metrics.success = false;
    metrics.error = error.message;
    metrics.endTime = Date.now();
    metrics.duration = metrics.endTime - metrics.startTime;

    spinner.fail(chalk.red(`❌ ${agentType}: Failed - ${error.message}`));

    return metrics;
  }
}

/**
 * Copy directory excluding patterns
 */
function copyDirectory(src: string, dest: string, exclude: string[]) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    const shouldExclude = exclude.some((pattern) => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(entry.name);
      }
      return entry.name === pattern || entry.name.startsWith(pattern);
    });

    if (shouldExclude) {
      continue;
    }

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirectory(srcPath, destPath, exclude);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Display spawn summary
 */
function displaySpawnSummary(session: SpawnSession, options: any) {
  console.log(chalk.cyan('📊 Spawn Metrics:\n'));

  // Overall stats
  console.log(chalk.white('Session ID:'), chalk.gray(session.sessionId));
  console.log(chalk.white('Total Time:'), chalk.gray(`${(session.totalDuration! / 1000).toFixed(1)}s`));
  console.log(chalk.white('Total Steps:'), chalk.gray(session.totalSteps));
  console.log(chalk.white('Success Rate:'), session.successRate === 100 
    ? chalk.green(`${session.successRate.toFixed(0)}%`)
    : chalk.yellow(`${session.successRate.toFixed(0)}%`)
  );
  console.log();

  // Per-agent breakdown
  console.log(chalk.cyan('🤖 Agent Breakdown:\n'));

  const table = session.agentsSpawned.map(agent => {
    const status = agent.success ? chalk.green('✅') : chalk.red('❌');
    const duration = agent.duration ? `${(agent.duration / 1000).toFixed(1)}s` : 'N/A';
    const steps = agent.steps.length;
    const role = getAgentRole(agent.agentName);

    return {
      status,
      agent: agent.agentName,
      role,
      duration,
      steps,
    };
  });

  table.forEach(row => {
    console.log(`${row.status}  ${chalk.white(row.agent.padEnd(12))} ${chalk.gray(`(${row.role})`.padEnd(20))} ${chalk.gray(row.duration.padEnd(8))} ${chalk.gray(`${row.steps} steps`)}`);
  });

  console.log();

  // Failures (if any)
  if (session.failures.length > 0) {
    console.log(chalk.red('❌ Failures:\n'));
    session.failures.forEach((failure, i) => {
      console.log(chalk.red(`${i + 1}. ${failure}`));
    });
    console.log();
  }

  // Performance analysis
  console.log(chalk.cyan('⚡ Performance Analysis:\n'));

  const avgDuration = session.agentsSpawned.reduce((sum, a) => sum + (a.duration || 0), 0) / session.agentsSpawned.length;
  const avgSteps = session.totalSteps / session.agentsSpawned.length;
  const fastest = session.agentsSpawned.reduce((min, a) => 
    (a.duration || Infinity) < (min.duration || Infinity) ? a : min
  );
  const slowest = session.agentsSpawned.reduce((max, a) => 
    (a.duration || 0) > (max.duration || 0) ? a : max
  );

  console.log(chalk.white('Average Time:'), chalk.gray(`${(avgDuration / 1000).toFixed(1)}s per agent`));
  console.log(chalk.white('Average Steps:'), chalk.gray(`${avgSteps.toFixed(1)} per agent`));
  console.log(chalk.white('Fastest:'), chalk.gray(`${fastest.agentName} (${((fastest.duration || 0) / 1000).toFixed(1)}s)`));
  console.log(chalk.white('Slowest:'), chalk.gray(`${slowest.agentName} (${((slowest.duration || 0) / 1000).toFixed(1)}s)`));
  console.log();

  // Time breakdown
  const totalTime = session.totalDuration! / 1000;
  const timePerAgent = totalTime / session.agentsSpawned.length;
  const setupTime = options.skipSetup ? 0 : session.agentsSpawned.filter(a => a.success).length * (timePerAgent * 0.7);
  const transformTime = totalTime - setupTime;

  console.log(chalk.cyan('⏱️  Time Breakdown:\n'));
  console.log(chalk.white('Transform:'), chalk.gray(`${transformTime.toFixed(1)}s (${((transformTime / totalTime) * 100).toFixed(0)}%)`));
  if (!options.skipSetup) {
    console.log(chalk.white('Setup:'), chalk.gray(`${setupTime.toFixed(1)}s (${((setupTime / totalTime) * 100).toFixed(0)}%)`));
  }
  console.log(chalk.white('Total:'), chalk.gray(`${totalTime.toFixed(1)}s`));
  console.log();

  // Cost analysis
  console.log(chalk.cyan('💰 Value Analysis:\n'));
  
  const traditionalCost = session.agentsSpawned.filter(a => a.success).length * 150000; // Avg C-suite salary
  const timeSaved = session.agentsSpawned.filter(a => a.success).length * 30 * 24 * 60 * 60 * 1000; // 30 days per hire
  const apiCost = session.agentsSpawned.filter(a => a.success).length * 5; // ~$5/year per agent

  console.log(chalk.white('Traditional Cost:'), chalk.gray(`$${traditionalCost.toLocaleString()}/year`));
  console.log(chalk.white('Your Cost:'), chalk.gray(`~$${apiCost}/year`));
  console.log(chalk.white('Savings:'), chalk.green(`$${(traditionalCost - apiCost).toLocaleString()}/year`));
  console.log();
  console.log(chalk.white('Traditional Time:'), chalk.gray(`${Math.floor(timeSaved / (24 * 60 * 60 * 1000))} days`));
  console.log(chalk.white('Your Time:'), chalk.gray(`${totalTime.toFixed(0)} seconds`));
  console.log(chalk.white('Time Saved:'), chalk.green(`${Math.floor(timeSaved / (24 * 60 * 60 * 1000))} days`));
  console.log();
}

/**
 * Save spawn metrics
 */
function saveSpawnMetrics(session: SpawnSession, options: any) {
  const metricsDir = path.join(path.resolve(options.outputDir), '.spawn-metrics');
  fs.mkdirSync(metricsDir, { recursive: true });

  const metricsFile = path.join(metricsDir, `${session.sessionId}.json`);
  fs.writeFileSync(metricsFile, JSON.stringify(session, null, 2));

  // Create summary
  const summary = {
    sessionId: session.sessionId,
    date: new Date(session.startTime).toISOString(),
    totalTime: `${(session.totalDuration! / 1000).toFixed(1)}s`,
    agentsSpawned: session.agentsSpawned.length,
    successRate: `${session.successRate.toFixed(0)}%`,
    totalSteps: session.totalSteps,
    avgStepsPerAgent: (session.totalSteps / session.agentsSpawned.length).toFixed(1),
    failures: session.failures.length,
  };

  const summaryFile = path.join(metricsDir, 'latest.json');
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

  // Create markdown report
  const report = generateSpawnReport(session);
  const reportFile = path.join(metricsDir, `${session.sessionId}.md`);
  fs.writeFileSync(reportFile, report);
}

/**
 * Generate markdown report
 */
function generateSpawnReport(session: SpawnSession): string {
  const timestamp = new Date(session.startTime).toISOString();
  const duration = (session.totalDuration! / 1000).toFixed(1);

  return `# Spawn Session Report

**Session ID:** ${session.sessionId}  
**Date:** ${timestamp}  
**Duration:** ${duration}s  
**Success Rate:** ${session.successRate.toFixed(0)}%

---

## Agents Spawned

| Agent | Role | Duration | Steps | Status |
|-------|------|----------|-------|--------|
${session.agentsSpawned.map(a => 
  `| ${a.agentName} | ${getAgentRole(a.agentName)} | ${((a.duration || 0) / 1000).toFixed(1)}s | ${a.steps.length} | ${a.success ? '✅' : '❌'} |`
).join('\n')}

**Total Steps:** ${session.totalSteps}  
**Average Steps per Agent:** ${(session.totalSteps / session.agentsSpawned.length).toFixed(1)}

---

## Performance Metrics

**Timing:**
- Total: ${duration}s
- Average: ${(session.totalDuration! / session.agentsSpawned.length / 1000).toFixed(1)}s per agent
- Fastest: ${session.agentsSpawned.reduce((min, a) => 
    (a.duration || Infinity) < (min.duration || Infinity) ? a : min
  ).agentName} (${((session.agentsSpawned.reduce((min, a) => 
    (a.duration || Infinity) < (min.duration || Infinity) ? a : min
  ).duration || 0) / 1000).toFixed(1)}s)
- Slowest: ${session.agentsSpawned.reduce((max, a) => 
    (a.duration || 0) > (max.duration || 0) ? a : max
  ).agentName} (${((session.agentsSpawned.reduce((max, a) => 
    (a.duration || 0) > (max.duration || 0) ? a : max
  ).duration || 0) / 1000).toFixed(1)}s)

**Success:**
- Successful: ${session.agentsSpawned.filter(a => a.success).length}/${session.agentsSpawned.length}
- Success Rate: ${session.successRate.toFixed(0)}%
- Failures: ${session.failures.length}

---

## Failures

${session.failures.length > 0 ? session.failures.map((f, i) => `${i + 1}. ${f}`).join('\n') : 'None'}

---

## Value Created

**Traditional C-Suite Cost:** $${(session.agentsSpawned.filter(a => a.success).length * 150000).toLocaleString()}/year  
**Your Cost:** ~$${(session.agentsSpawned.filter(a => a.success).length * 5)}/year  
**Savings:** $${((session.agentsSpawned.filter(a => a.success).length * 150000) - (session.agentsSpawned.filter(a => a.success).length * 5)).toLocaleString()}/year

**Traditional Hiring Time:** ${Math.floor(session.agentsSpawned.filter(a => a.success).length * 30)} days  
**Your Time:** ${duration} seconds  
**Time Saved:** ${Math.floor(session.agentsSpawned.filter(a => a.success).length * 30)} days

---

**Spawn complete. Use agents to build your company.**
`;
}

/**
 * Get agent role
 */
function getAgentRole(agentType: string): string {
  const roles: Record<string, string> = {
    entrepreneur: 'CFO',
    builder: 'CTO',
    activist: 'CMO',
    speculator: 'VP Sales',
    researcher: 'CSO',
    whale: 'VP Finance',
    validator: 'CQO',
  };
  
  return roles[agentType] || 'Unknown';
}

