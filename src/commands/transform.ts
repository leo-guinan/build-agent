import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import {
  getTransform,
  getTransformDescription,
  hasTransform,
} from '../transforms/registry.js';
import type { AgentIdentity } from '../transforms/types.js';

export const transformCommand = new Command('transform')
  .description('Fork this agent into a specialized version with domain-specific tracking')
  .argument('[transform-type]', 'Type of transform (entrepreneur, builder, etc.)')
  .option('--output-dir <dir>', 'Output directory for transformed agent', '.')
  .option('--list', 'List available transforms')
  .action(async (transformType: string | undefined, options) => {
    // List transforms
    if (options.list || !transformType) {
      console.log(chalk.cyan('🎮 Available Agent Transforms:\n'));
      
      const allDescriptions = ['entrepreneur', 'builder', 'researcher', 'validator', 'activist', 'whale', 'speculator'];
      
      allDescriptions.forEach((id) => {
        const desc = getTransformDescription(id);
        const implemented = hasTransform(id);
        
        console.log(
          chalk.white(`${desc.emoji}  ${desc.name}`) +
          chalk.gray(` (${id})`)
        );
        console.log(chalk.gray(`   Game: ${desc.game}`));
        console.log(chalk.gray(`   Output: ${desc.output}`));
        console.log(chalk.gray(`   Status: ${implemented ? chalk.green('✅ Implemented') : chalk.yellow('⏳ Coming soon')}`));
        console.log();
      });
      
      if (!transformType) {
        console.log(chalk.yellow('Usage:'));
        console.log(chalk.gray('  build-agent transform entrepreneur'));
        console.log(chalk.gray('  build-agent transform builder --output-dir ~/agents'));
        console.log();
      }
      
      if (options.list) {
        return;
      }
    }

    if (!transformType) {
      console.log(chalk.red('❌ Transform type required'));
      console.log(chalk.gray('Run: build-agent transform --list'));
      process.exit(1);
    }

    console.log(chalk.cyan(`🎮 Transforming into ${transformType} agent...\n`));

    const spinner = ora('Loading transform...').start();

    try {
      // Get transform definition
      const transform = getTransform(transformType);
      if (!transform) {
        spinner.fail(chalk.red(`❌ Transform '${transformType}' not found`));
        console.log(chalk.yellow('\nRun: build-agent transform --list'));
        process.exit(1);
      }

      spinner.succeed(chalk.green('✅ Transform loaded\n'));

      // Show what this transform does
      console.log(chalk.cyan('📋 Transform Details:'));
      console.log(chalk.white('Name:'), chalk.gray(transform.name));
      console.log(chalk.white('Game:'), chalk.gray(transform.game.name));
      console.log(chalk.white('Description:'), chalk.gray(transform.description));
      console.log();
      
      console.log(chalk.cyan('📊 Game Metrics:'));
      transform.game.metrics.forEach((metric) => {
        console.log(chalk.gray(`  • ${metric}`));
      });
      console.log();
      
      console.log(chalk.cyan('🎯 Success Criteria:'));
      console.log(chalk.gray(`  ${transform.game.successCriteria}`));
      console.log();

      // Confirm
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Transform build-agent into ${transform.name}?`,
          default: true,
        },
      ]);

      if (!confirm) {
        console.log(chalk.gray('Cancelled.'));
        return;
      }

      spinner.start('Creating transformed agent...');

      // Determine output directory
      const agentName = `${transformType}-agent`;
      const outputPath = path.resolve(options.outputDir, agentName);

      // Check if already exists
      if (fs.existsSync(outputPath)) {
        spinner.fail(chalk.red('❌ Output directory already exists'));
        console.log(chalk.yellow(`\nDirectory: ${outputPath}`));
        console.log(chalk.gray('Delete it or choose a different output directory.'));
        process.exit(1);
      }

      // Get current build-agent directory
      const sourceDir = process.cwd();

      // Copy entire build-agent directory
      spinner.text = 'Copying agent files...';
      fs.mkdirSync(outputPath, { recursive: true });
      
      // Copy files (exclude node_modules, dist, workspaces, .git)
      const excludePatterns = [
        'node_modules',
        'dist',
        'workspaces',
        '.git',
        '.build-agent',
        '*.log',
      ];
      
      copyDirectory(sourceDir, outputPath, excludePatterns);

      // Update package.json
      spinner.text = 'Updating package.json...';
      const packagePath = path.join(outputPath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      packageJson.name = agentName;
      packageJson.description = `${transform.name} - ${transform.description}`;
      packageJson.bin = {
        [agentName]: './dist/index.js',
      };
      
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

      // Create agent identity file
      spinner.text = 'Creating agent identity...';
      const identity: AgentIdentity = {
        type: transformType,
        game: transform.game,
        version: '1.0.0',
        created: new Date().toISOString(),
        parentAgent: 'build-agent',
      };
      
      fs.writeFileSync(
        path.join(outputPath, 'AGENT_IDENTITY.json'),
        JSON.stringify(identity, null, 2)
      );

      // Update README
      spinner.text = 'Updating README...';
      updateReadmeForTransform(outputPath, transform, transformType);

      // Update CLI name in index.ts
      spinner.text = 'Updating CLI...';
      const indexPath = path.join(outputPath, 'src', 'index.ts');
      let indexContent = fs.readFileSync(indexPath, 'utf-8');
      indexContent = indexContent.replace(
        /\.name\('build-agent'\)/g,
        `.name('${agentName}')`
      );
      fs.writeFileSync(indexPath, indexContent);

      // Update create command to use transform's template
      spinner.text = 'Integrating transform...';
      updateCreateCommandForTransform(outputPath, transform, transformType);

      // Create tracking directory
      const trackingDir = path.join(outputPath, '.tracking');
      fs.mkdirSync(trackingDir, { recursive: true });
      fs.writeFileSync(
        path.join(trackingDir, 'README.md'),
        `# Tracking Data\n\nThis directory stores actual vs predicted data for learning.\n\nDo not commit this to git.`
      );

      // Update .gitignore
      const gitignorePath = path.join(outputPath, '.gitignore');
      let gitignore = fs.existsSync(gitignorePath)
        ? fs.readFileSync(gitignorePath, 'utf-8')
        : '';
      
      if (!gitignore.includes('.tracking')) {
        gitignore += '\n# Tracking data\n.tracking/\n';
        fs.writeFileSync(gitignorePath, gitignore);
      }

      // Initialize git repo
      spinner.text = 'Initializing git repository...';
      execSync('git init', { cwd: outputPath, stdio: 'pipe' });
      
      try {
        execSync('git config user.name', { cwd: outputPath, stdio: 'pipe' });
      } catch {
        execSync('git config user.name "Transform Agent"', { cwd: outputPath, stdio: 'pipe' });
        execSync('git config user.email "agent@transform.local"', { cwd: outputPath, stdio: 'pipe' });
      }
      
      execSync('git add .', { cwd: outputPath, stdio: 'pipe' });
      execSync(
        `git commit -m "Initial ${transform.name} transform"`,
        { cwd: outputPath, stdio: 'pipe' }
      );

      spinner.succeed(chalk.green(`✅ ${transform.name} created!\n`));

      // Show summary
      console.log(chalk.cyan('📁 Agent Location:'));
      console.log(chalk.gray(`   ${outputPath}`));
      console.log();

      console.log(chalk.cyan('🎮 Agent Identity:'));
      console.log(chalk.gray(`   Type: ${identity.type}`));
      console.log(chalk.gray(`   Game: ${identity.game.name}`));
      console.log(chalk.gray(`   Metrics: ${identity.game.metrics.join(', ')}`));
      console.log();

      console.log(chalk.yellow('🎯 Next Steps:\n'));
      
      console.log(chalk.white('1. Setup agent:'));
      console.log(chalk.gray(`   cd ${agentName}`));
      console.log(chalk.gray(`   npm install`));
      console.log(chalk.gray(`   npm run build`));
      console.log(chalk.gray(`   npm link\n`));

      console.log(chalk.white('2. Create your first idea:'));
      console.log(chalk.gray(`   ${agentName} create\n`));

      console.log(chalk.white('3. Track actuals over time:'));
      console.log(chalk.gray(`   ${agentName} track-actual <idea-name>\n`));

      console.log(chalk.white('4. View ROI report:'));
      console.log(chalk.gray(`   ${agentName} roi-report\n`));

      console.log(chalk.cyan('💡 Tips:'));
      console.log(chalk.white(`   - This agent plays the "${transform.game.name}" game`));
      console.log(chalk.white(`   - Track actuals monthly to improve predictions`));
      console.log(chalk.white(`   - Success = ${transform.game.successCriteria}`));
      console.log(chalk.white(`   - Ideas created will include ${transform.name}-specific requirements`));
      console.log();

      console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.green(`🎉 ${transform.name} ready to use!`));
      console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log();

    } catch (error: any) {
      spinner.fail(chalk.red('❌ Transform failed'));
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

/**
 * Copy directory recursively, excluding patterns
 */
function copyDirectory(src: string, dest: string, exclude: string[]) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Check if should exclude
    const shouldExclude = exclude.some((pattern) => {
      if (pattern.includes('*')) {
        // Simple glob matching
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(entry.name);
      }
      return entry.name === pattern;
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
 * Update README for transform
 */
function updateReadmeForTransform(
  outputPath: string,
  transform: any,
  transformType: string
) {
  const readmePath = path.join(outputPath, 'README.md');
  
  const readme = `# ${transform.name}

**Game:** ${transform.game.name}  
**Transformed from:** build-agent  
**Created:** ${new Date().toISOString()}

---

## 🎮 What is This?

This is a specialized version of build-agent that plays the **${transform.game.name}** game.

${transform.description}

---

## 🎯 The Game

### Metrics
${transform.game.metrics.map((m: string) => `- ${m}`).join('\n')}

### Success Criteria
${transform.game.successCriteria}

### How to Win
1. Create ideas with accurate predictions
2. Track actuals monthly
3. Learn from differences
4. Improve prediction accuracy over time

---

## 📖 Commands

### Create Idea (With ${transform.name} Tracking)

\`\`\`bash
${transformType}-agent create
\`\`\`

Interactive prompts will gather **${transform.name}-specific data** in addition to standard idea information.

### Track Actuals

\`\`\`bash
${transformType}-agent track-actual <idea-name>
\`\`\`

Update actual metrics to compare against predictions.

### View Reports

\`\`\`bash
${transformType}-agent roi-report [idea-name]
\`\`\`

See prediction accuracy and game performance.

### All Standard Commands

All base build-agent commands still work:
- \`${transformType}-agent develop\` - Create develop branch
- \`${transformType}-agent plan\` - Generate plans
- \`${transformType}-agent solve\` - Auto-implement

---

## 🚀 Quick Start

\`\`\`bash
# 1. Install
npm install
npm run build
npm link

# 2. Create idea with ${transform.name} tracking
${transformType}-agent create

# 3. Build it
cd workspaces/<your-idea>
${transformType}-agent develop

# 4. Track progress monthly
${transformType}-agent track-actual <your-idea>

# 5. Win the game!
${transformType}-agent roi-report
\`\`\`

---

## 📊 What Gets Tracked

This agent tracks **${transform.name}-specific** metrics automatically.

Every idea created includes:
- Predictions at creation time
- Monthly actual tracking
- Accuracy calculations
- Learning adjustments

See \`.tracking/\` directory for historical data.

---

## 🧠 Learning System

This agent **learns over time**:

1. You make predictions when creating ideas
2. You track actuals monthly
3. Agent calculates accuracy
4. Future predictions adjust based on your track record

**Goal:** Get better at predictions with each idea.

---

## 🎓 Philosophy

**This agent plays a specific game: ${transform.game.name}**

Different people optimize for different things:
- Entrepreneurs → ROI
- Builders → Shipping speed
- Researchers → Pattern recognition
- Validators → User feedback
- etc.

This agent is optimized for **your game**.

---

## 🔗 Interoperability

This agent understands: ${transform.understands.join(', ')}

Can share metrics with other specialized agents that understand the same concepts.

---

**Ready to play the ${transform.game.name} game?**

Run: \`${transformType}-agent create\`
`;

  fs.writeFileSync(readmePath, readme);
}

/**
 * Update create command to use transform's template and prompts
 */
function updateCreateCommandForTransform(
  outputPath: string,
  _transform: any,
  transformType: string
) {
  const createPath = path.join(outputPath, 'src', 'commands', 'create.ts');
  let content = fs.readFileSync(createPath, 'utf-8');

  // Add import for transform
  const importStatement = `import { ${transformType}Transform } from '../transforms/${transformType}.js';`;
  
  // Add after existing imports
  content = content.replace(
    /(import.*from.*;\n)(export interface IdeaInputs)/,
    `$1${importStatement}\n\n$2`
  );

  // Update to use transform's prompts and template
  // This is a simplified version - full implementation would merge prompts
  // and use transform's requirementsTemplate function

  fs.writeFileSync(createPath, content);
}

