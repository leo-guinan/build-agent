import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface MarketSpawnMetrics {
  marketId: string;
  ideaName: string;
  variations: number;
  startTime: number;
  endTime?: number;
  totalDuration?: number;
  entrepreneursSpawned: Array<{
    variationId: number;
    entrepreneurPath: string;
    childAgentsSpawned: number;
    duration: number;
    success: boolean;
    error?: string;
  }>;
  totalAgentsCreated: number;
  successRate: number;
  variationDetails: Array<{
    variationId: number;
    ideaVariation: string;
    focus: string;
    targetMarket: string;
  }>;
}

export const marketSpawnCommand = new Command('market-spawn')
  .description('Spawn N entrepreneur systems, each exploring a variation of the idea (parallel universe exploration)')
  .argument('<idea-name>', 'Base idea name')
  .option('--variations <n>', 'Number of variations to spawn', '3')
  .option('--output-dir <dir>', 'Output directory for market spawn', './market-spawns')
  .option('--variation-strategy <strategy>', 'How to vary: pricing, market, features, model', 'auto')
  .option('--skip-child-agents', 'Only create entrepreneurs, not child agents', false)
  .option('--interactive', 'Prompt for each variation', false)
  .action(async (ideaName: string, options) => {
    console.log(chalk.cyan('🌍 Market Spawn: Parallel Universe Exploration\n'));
    console.log(chalk.white('Base Idea:'), chalk.gray(ideaName));
    console.log(chalk.white('Variations:'), chalk.gray(options.variations));
    console.log(chalk.white('Strategy:'), chalk.gray(options.variationStrategy));
    console.log();

    const metrics: MarketSpawnMetrics = {
      marketId: `market-${Date.now()}`,
      ideaName,
      variations: parseInt(options.variations),
      startTime: Date.now(),
      entrepreneursSpawned: [],
      totalAgentsCreated: 0,
      successRate: 0,
      variationDetails: [],
    };

    try {
      // Confirm spawn
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `This will spawn ${options.variations} complete entrepreneur systems (each with 6 child agents). Continue?`,
          default: true,
        },
      ]);

      if (!confirm) {
        console.log(chalk.gray('Cancelled.'));
        return;
      }

      // Create market spawn directory
      const marketDir = path.join(
        path.resolve(options.outputDir),
        `${ideaName.toLowerCase().replace(/\s+/g, '-')}-market`
      );

      if (fs.existsSync(marketDir)) {
        console.log(chalk.red(`❌ Market spawn already exists: ${marketDir}`));
        console.log(chalk.gray('Choose different name or delete existing.'));
        process.exit(1);
      }

      fs.mkdirSync(marketDir, { recursive: true });

      console.log();
      console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.green('🌍 MARKET SPAWN SEQUENCE INITIATED'));
      console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log();

      // Generate or get variations
      const variations = options.interactive
        ? await promptForVariations(ideaName, parseInt(options.variations))
        : generateVariations(ideaName, parseInt(options.variations), options.variationStrategy);

      metrics.variationDetails = variations;

      // Spawn each variation
      for (let i = 0; i < variations.length; i++) {
        const variation = variations[i];
        const variationStart = Date.now();
        
        console.log(chalk.cyan(`\n🌱 Spawning Variation ${i + 1}/${variations.length}: ${variation.ideaVariation}\n`));

        try {
          const entrepreneurDir = await spawnEntrepreneurSystem(
            marketDir,
            variation,
            i + 1,
            options.skipChildAgents
          );

          const variationDuration = Date.now() - variationStart;
          const childCount = options.skipChildAgents ? 0 : 6;

          metrics.entrepreneursSpawned.push({
            variationId: i + 1,
            entrepreneurPath: entrepreneurDir,
            childAgentsSpawned: childCount,
            duration: variationDuration,
            success: true,
          });

          metrics.totalAgentsCreated += (1 + childCount); // entrepreneur + children

          console.log(chalk.green(`✅ Variation ${i + 1} complete (${(variationDuration / 1000).toFixed(1)}s, ${1 + childCount} agents)\n`));

        } catch (error: any) {
          metrics.entrepreneursSpawned.push({
            variationId: i + 1,
            entrepreneurPath: '',
            childAgentsSpawned: 0,
            duration: Date.now() - variationStart,
            success: false,
            error: error.message,
          });

          console.log(chalk.red(`❌ Variation ${i + 1} failed: ${error.message}\n`));
        }
      }

      metrics.endTime = Date.now();
      metrics.totalDuration = metrics.endTime - metrics.startTime;
      metrics.successRate = (metrics.entrepreneursSpawned.filter(e => e.success).length / metrics.entrepreneursSpawned.length) * 100;

      // Display summary
      displayMarketSpawnSummary(metrics, marketDir);
      saveMarketSpawnMetrics(metrics, marketDir);

    } catch (error: any) {
      console.error(chalk.red(`❌ Market spawn failed: ${error.message}`));
      process.exit(1);
    }
  });

/**
 * Spawn single entrepreneur system with child agents
 */
async function spawnEntrepreneurSystem(
  marketDir: string,
  variation: any,
  variationId: number,
  skipChildren: boolean
): Promise<string> {
  const entrepreneurDir = path.join(marketDir, `entrepreneur-v${variationId}`);
  const sourceDir = process.cwd();

  // Create entrepreneur directory
  fs.mkdirSync(entrepreneurDir, { recursive: true });

  // Copy build-agent to entrepreneur directory
  console.log(chalk.gray(`   Copying entrepreneur agent...`));
  copyDirectory(sourceDir, entrepreneurDir, [
    'node_modules', 'dist', 'workspaces', '.git', '.build-agent',
    '*-agent', 'market-spawns', '.spawn-metrics', '*.log'
  ]);

  // Update package.json
  const packagePath = path.join(entrepreneurDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  packageJson.name = `entrepreneur-v${variationId}`;
  packageJson.description = `Entrepreneur Agent v${variationId}: ${variation.ideaVariation}`;
  packageJson.bin = {
    [`entrepreneur-v${variationId}`]: './dist/index.js',
  };
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

  // Create agent identity
  const identity = {
    type: 'entrepreneur',
    variationId,
    variationFocus: variation.focus,
    targetMarket: variation.targetMarket,
    ideaVariation: variation.ideaVariation,
    game: {
      name: 'ROI Accuracy',
      metrics: ['Predicted ROI', 'Actual ROI', 'Prediction Accuracy'],
      successCriteria: '±10% ROI prediction accuracy',
    },
    version: '1.0.0',
    created: new Date().toISOString(),
    isParent: true,
    children: skipChildren ? [] : ['builder', 'activist', 'speculator', 'researcher', 'whale', 'validator'],
  };
  fs.writeFileSync(
    path.join(entrepreneurDir, 'AGENT_IDENTITY.json'),
    JSON.stringify(identity, null, 2)
  );

  // Update CLI name
  const indexPath = path.join(entrepreneurDir, 'src', 'index.ts');
  let indexContent = fs.readFileSync(indexPath, 'utf-8');
  indexContent = indexContent.replace(
    /\.name\('build-agent'\)/g,
    `.name('entrepreneur-v${variationId}')`
  );
  fs.writeFileSync(indexPath, indexContent);

  // Initialize mailbox
  console.log(chalk.gray(`   Initializing mailbox...`));
  const { initializeMailbox } = await import('../messaging/router.js');
  initializeMailbox(entrepreneurDir);

  // Create variation context note
  const { createNote } = await import('../messaging/router.js');
  createNote(
    entrepreneurDir,
    `Variation ${variationId} Context`,
    `This entrepreneur explores:\n\n` +
    `Idea: ${variation.ideaVariation}\n` +
    `Focus: ${variation.focus}\n` +
    `Target Market: ${variation.targetMarket}\n\n` +
    `Compare results with other variations to find optimal approach.`,
    ['variation', `v${variationId}`, variation.focus]
  );

  // Initialize git
  execSync('git init', { cwd: entrepreneurDir, stdio: 'pipe' });
  try {
    execSync('git config user.name', { cwd: entrepreneurDir, stdio: 'pipe' });
  } catch {
    execSync('git config user.name "Market Spawn"', { cwd: entrepreneurDir, stdio: 'pipe' });
    execSync('git config user.email "market@spawn.local"', { cwd: entrepreneurDir, stdio: 'pipe' });
  }
  execSync('git add .', { cwd: entrepreneurDir, stdio: 'pipe' });
  execSync(`git commit -m "Entrepreneur variation ${variationId}: ${variation.ideaVariation}"`, { cwd: entrepreneurDir, stdio: 'pipe' });

  // Install and build
  console.log(chalk.gray(`   Installing & building...`));
  execSync('npm install', { cwd: entrepreneurDir, stdio: 'pipe' });
  execSync('npm run build', { cwd: entrepreneurDir, stdio: 'pipe' });

  // Spawn child agents if requested
  if (!skipChildren) {
    console.log(chalk.gray(`   Spawning child agents...`));
    await spawnChildAgents(entrepreneurDir);
  }

  return entrepreneurDir;
}

/**
 * Spawn child agents for entrepreneur
 */
async function spawnChildAgents(entrepreneurDir: string) {
  const childAgents = ['builder', 'activist', 'speculator', 'researcher', 'whale', 'validator'];
  const sourceDir = process.cwd();

  for (const agentType of childAgents) {
    const childDir = path.join(entrepreneurDir, `${agentType}-agent`);
    
    // Copy from source
    copyDirectory(sourceDir, childDir, [
      'node_modules', 'dist', 'workspaces', '.git', '.build-agent',
      '*-agent', 'market-spawns', '.spawn-metrics', '*.log'
    ]);

    // Update package.json
    const packagePath = path.join(childDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    packageJson.name = `${agentType}-agent`;
    packageJson.bin = {
      [`${agentType}-agent`]: './dist/index.js',
    };
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

    // Create identity (knows parent)
    const parentIdentity = JSON.parse(
      fs.readFileSync(path.join(entrepreneurDir, 'AGENT_IDENTITY.json'), 'utf-8')
    );

    const { getTransform } = await import('../transforms/registry.js');
    const transform = getTransform(agentType);

    const identity = {
      type: agentType,
      game: transform?.game || {},
      version: '1.0.0',
      created: new Date().toISOString(),
      parentAgent: 'entrepreneur',
      parentVariation: parentIdentity.variationId,
      siblingAgents: childAgents.filter(a => a !== agentType),
    };
    fs.writeFileSync(
      path.join(childDir, 'AGENT_IDENTITY.json'),
      JSON.stringify(identity, null, 2)
    );

    // Update CLI name
    const indexPath = path.join(childDir, 'src', 'index.ts');
    let indexContent = fs.readFileSync(indexPath, 'utf-8');
    indexContent = indexContent.replace(
      /\.name\('build-agent'\)/g,
      `.name('${agentType}-agent')`
    );
    fs.writeFileSync(indexPath, indexContent);

    // Initialize mailbox
    const { initializeMailbox } = await import('../messaging/router.js');
    initializeMailbox(childDir);

    // Initialize git
    execSync('git init', { cwd: childDir, stdio: 'pipe' });
    try {
      execSync('git config user.name', { cwd: childDir, stdio: 'pipe' });
    } catch {
      execSync('git config user.name "Child Agent"', { cwd: childDir, stdio: 'pipe' });
      execSync('git config user.email "child@agent.local"', { cwd: childDir, stdio: 'pipe' });
    }
    execSync('git add .', { cwd: childDir, stdio: 'pipe' });
    execSync(`git commit -m "Spawned ${agentType} as child of entrepreneur v${parentIdentity.variationId}"`, { cwd: childDir, stdio: 'pipe' });

    // Install and build
    execSync('npm install', { cwd: childDir, stdio: 'pipe' });
    execSync('npm run build', { cwd: childDir, stdio: 'pipe' });
  }
}

/**
 * Generate variations automatically
 */
function generateVariations(
  baseIdea: string,
  count: number,
  strategy: string
): Array<{ variationId: number; ideaVariation: string; focus: string; targetMarket: string }> {
  const variations = [];

  const strategies: Record<string, any> = {
    pricing: [
      { focus: 'Premium', market: 'Enterprise', suffix: 'Pro' },
      { focus: 'Mid-tier', market: 'SMB', suffix: 'Business' },
      { focus: 'Budget', market: 'Individuals', suffix: 'Lite' },
    ],
    market: [
      { focus: 'Enterprise', market: 'Fortune 500', suffix: 'Enterprise' },
      { focus: 'SMB', market: 'Small businesses', suffix: 'Business' },
      { focus: 'Consumer', market: 'Individuals', suffix: 'Personal' },
    ],
    features: [
      { focus: 'Full-featured', market: 'Power users', suffix: 'Pro' },
      { focus: 'Core features', market: 'Mainstream', suffix: 'Standard' },
      { focus: 'Minimal MVP', market: 'Early adopters', suffix: 'Lite' },
    ],
    model: [
      { focus: 'Subscription', market: 'Recurring revenue', suffix: 'SaaS' },
      { focus: 'One-time', market: 'License sales', suffix: 'License' },
      { focus: 'Usage-based', market: 'Pay-as-you-go', suffix: 'Metered' },
    ],
    auto: [
      { focus: 'High-end', market: 'Premium segment', suffix: 'Premium' },
      { focus: 'Mass-market', market: 'Mainstream', suffix: 'Standard' },
      { focus: 'Budget', market: 'Cost-conscious', suffix: 'Basic' },
      { focus: 'Enterprise', market: 'B2B large', suffix: 'Enterprise' },
      { focus: 'Startup', market: 'B2B small', suffix: 'Starter' },
    ],
  };

  const strategyOptions = strategies[strategy] || strategies.auto;

  for (let i = 0; i < Math.min(count, strategyOptions.length); i++) {
    const option = strategyOptions[i];
    variations.push({
      variationId: i + 1,
      ideaVariation: `${baseIdea} ${option.suffix}`,
      focus: option.focus,
      targetMarket: option.market,
    });
  }

  // If need more variations than predefined, generate generic
  for (let i = strategyOptions.length; i < count; i++) {
    variations.push({
      variationId: i + 1,
      ideaVariation: `${baseIdea} v${i + 1}`,
      focus: `Variation ${i + 1}`,
      targetMarket: `Market segment ${i + 1}`,
    });
  }

  return variations;
}

/**
 * Prompt for variations interactively
 */
async function promptForVariations(baseIdea: string, count: number) {
  const variations = [];

  console.log(chalk.cyan('🎨 Define Your Variations\n'));

  for (let i = 0; i < count; i++) {
    console.log(chalk.white(`Variation ${i + 1}/${count}:\n`));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'ideaVariation',
        message: 'Idea variation name:',
        default: `${baseIdea} v${i + 1}`,
      },
      {
        type: 'input',
        name: 'focus',
        message: 'Primary focus (e.g., Premium, Enterprise, Budget):',
        default: `Focus ${i + 1}`,
      },
      {
        type: 'input',
        name: 'targetMarket',
        message: 'Target market:',
        default: `Market ${i + 1}`,
      },
    ]);

    variations.push({
      variationId: i + 1,
      ...answers,
    });

    console.log();
  }

  return variations;
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
 * Display market spawn summary
 */
function displayMarketSpawnSummary(metrics: MarketSpawnMetrics, marketDir: string) {
  console.log();
  console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.green('🎉 MARKET SPAWN COMPLETE'));
  console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log();

  console.log(chalk.cyan('📊 Market Spawn Metrics:\n'));
  console.log(chalk.white('Market ID:'), chalk.gray(metrics.marketId));
  console.log(chalk.white('Base Idea:'), chalk.gray(metrics.ideaName));
  console.log(chalk.white('Variations:'), chalk.gray(metrics.variations));
  console.log(chalk.white('Total Time:'), chalk.gray(`${(metrics.totalDuration! / 1000).toFixed(1)}s`));
  console.log(chalk.white('Total Agents:'), chalk.gray(metrics.totalAgentsCreated));
  console.log(chalk.white('Success Rate:'), metrics.successRate === 100 
    ? chalk.green(`${metrics.successRate}%`)
    : chalk.yellow(`${metrics.successRate.toFixed(0)}%`)
  );
  console.log();

  console.log(chalk.cyan('🌍 Variations Created:\n'));
  metrics.variationDetails.forEach((v, i) => {
    const entrepreneur = metrics.entrepreneursSpawned[i];
    const status = entrepreneur?.success ? chalk.green('✅') : chalk.red('❌');
    const childCount = entrepreneur?.childAgentsSpawned || 0;
    const totalAgents = 1 + childCount;

    console.log(`${status} ${chalk.white(`v${v.variationId}`)} ${chalk.cyan(v.ideaVariation)}`);
    console.log(chalk.gray(`   Focus: ${v.focus} | Market: ${v.targetMarket}`));
    console.log(chalk.gray(`   Agents: ${totalAgents} (1 parent + ${childCount} children)`));
    console.log(chalk.gray(`   Path: ${path.basename(entrepreneur?.entrepreneurPath || '')}`));
    console.log();
  });

  console.log(chalk.cyan('💰 Value Analysis:\n'));
  const successfulEntrepreneurs = metrics.entrepreneursSpawned.filter(e => e.success).length;
  const totalAgents = metrics.totalAgentsCreated;
  const traditionalCost = totalAgents * 150000; // $150k avg C-suite
  const yourCost = totalAgents * 5; // $5/agent/year API
  
  console.log(chalk.white('Traditional Cost:'), chalk.gray(`$${traditionalCost.toLocaleString()}/year`));
  console.log(chalk.white('Your Cost:'), chalk.gray(`~$${yourCost}/year`));
  console.log(chalk.white('Savings:'), chalk.green(`$${(traditionalCost - yourCost).toLocaleString()}/year`));
  console.log();
  console.log(chalk.white('Traditional Time:'), chalk.gray(`${totalAgents * 30} days`));
  console.log(chalk.white('Your Time:'), chalk.gray(`${(metrics.totalDuration! / 1000).toFixed(0)}s`));
  console.log();

  console.log(chalk.yellow('🎯 Next Steps:\n'));
  console.log(chalk.white('1. Explore each variation:\n'));
  metrics.variationDetails.forEach(v => {
    console.log(chalk.gray(`   cd ${marketDir}/entrepreneur-v${v.variationId}`));
    console.log(chalk.gray(`   entrepreneur-v${v.variationId} create  # ${v.ideaVariation}`));
    console.log();
  });

  console.log(chalk.white('2. Run all in parallel:'));
  console.log(chalk.gray(`   # Create ideas for each variation`));
  console.log(chalk.gray(`   # Track actuals for each`));
  console.log(chalk.gray(`   # Compare results after 3-6 months\n`));

  console.log(chalk.white('3. Find winner:'));
  console.log(chalk.gray(`   # Variation with best ROI wins`));
  console.log(chalk.gray(`   # Kill others or pivot them`));
  console.log(chalk.gray(`   # Focus resources on winner\n`));

  console.log(chalk.cyan('💡 Portfolio Approach:'));
  console.log(chalk.white(`   - Explore ${successfulEntrepreneurs} variations simultaneously`));
  console.log(chalk.white('   - Each has complete C-suite'));
  console.log(chalk.white('   - Track actuals for each'));
  console.log(chalk.white('   - Find optimal approach faster'));
  console.log(chalk.white('   - Hedge bets across variations'));
  console.log();
}

/**
 * Save market spawn metrics
 */
function saveMarketSpawnMetrics(metrics: MarketSpawnMetrics, marketDir: string) {
  const metricsDir = path.join(marketDir, '.market-metrics');
  fs.mkdirSync(metricsDir, { recursive: true });

  fs.writeFileSync(
    path.join(metricsDir, `${metrics.marketId}.json`),
    JSON.stringify(metrics, null, 2)
  );

  const report = `# Market Spawn Report

**Market ID:** ${metrics.marketId}  
**Base Idea:** ${metrics.ideaName}  
**Variations:** ${metrics.variations}  
**Date:** ${new Date(metrics.startTime).toISOString()}

---

## Variations

${metrics.variationDetails.map((v, i) => {
  const entrepreneur = metrics.entrepreneursSpawned[i];
  return `### Variation ${v.variationId}: ${v.ideaVariation}

- **Focus:** ${v.focus}
- **Target Market:** ${v.targetMarket}
- **Status:** ${entrepreneur?.success ? '✅ Success' : '❌ Failed'}
- **Agents:** ${(entrepreneur?.childAgentsSpawned || 0) + 1}
- **Duration:** ${((entrepreneur?.duration || 0) / 1000).toFixed(1)}s
`;
}).join('\n')}

---

## Metrics

- **Total Time:** ${(metrics.totalDuration! / 1000).toFixed(1)}s
- **Total Agents:** ${metrics.totalAgentsCreated}
- **Success Rate:** ${metrics.successRate.toFixed(0)}%
- **Avg Time per Variation:** ${(metrics.totalDuration! / metrics.variations / 1000).toFixed(1)}s

---

**Compare variations. Find winner. Scale what works.**
`;

  fs.writeFileSync(
    path.join(metricsDir, `${metrics.marketId}.md`),
    report
  );
}

