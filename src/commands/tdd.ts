import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { tddRoutingAgent } from '../mastra';

export const tddCommand = new Command('tdd')
  .description('Run TDD agent network to implement a feature')
  .argument('<feature>', 'Feature description to implement')
  .option('--max-iterations <number>', 'Maximum TDD iterations', '20')
  .action(async (feature: string, options) => {
    console.log(chalk.cyan('🤖 TDD Agent Network Starting...'));
    console.log(chalk.gray(`Feature: ${feature}\n`));

    const spinner = ora('Analyzing feature request...').start();

    try {
      // Call the TDD routing agent network
      const result = await tddRoutingAgent.network(
        `Implement this feature using TDD:

${feature}

Follow the TDD process:
1. Collect current system state
2. Write integration test (if first iteration)
3. Write smallest unit test for next step
4. Implement minimal code to pass test
5. Repeat until complete

Maximum ${options.maxIterations} iterations.
Maintain 85%+ test coverage.
Commit all changes to appropriate branches.`
      );

      let currentPhase = '';
      let testsWritten = 0;
      let testsPassing = 0;
      const filesChanged: string[] = [];

      // Stream results
      for await (const chunk of result) {
        switch (chunk.type) {
          case 'routing-agent-start':
            spinner.text = 'TDD Routing Agent analyzing...';
            break;

          case 'agent-execution-start':
            const agentName = (chunk.payload as any).agentName;
            if (agentName === 'test-agent') {
              currentPhase = 'Writing Tests';
              spinner.text = chalk.yellow('📝 Test Agent writing specifications...');
            } else if (agentName === 'develop-agent') {
              currentPhase = 'Implementing';
              spinner.text = chalk.green('💻 Develop Agent implementing code...');
            }
            break;

          case 'tool-execution-start':
            const toolId = (chunk.payload as any).toolId;
            if (toolId === 'system-state-collector') {
              spinner.text = 'Collecting system state...';
            } else if (toolId === 'git-manager') {
              spinner.text = 'Managing Git operations...';
            }
            break;

          case 'agent-execution-event-text-delta':
            // Streaming text from agent
            const delta = (chunk.payload as any).delta;
            if (delta) {
              // Could stream to console if desired
            }
            break;

          case 'network-execution-event-step-finish':
            const stepResult = (chunk.payload as any).result;
            
            // Update progress
            console.log(chalk.gray(`\n✓ ${currentPhase} complete`));
            
            if (stepResult) {
              if (stepResult.testsWritten) testsWritten = stepResult.testsWritten;
              if (stepResult.testsPassing) testsPassing = stepResult.testsPassing;
              if (stepResult.filesChanged) {
                filesChanged.push(...stepResult.filesChanged);
              }
              
              console.log(chalk.gray(`  Tests: ${testsPassing}/${testsWritten} passing`));
              if (stepResult.coverage) {
                console.log(chalk.gray(`  Coverage: ${stepResult.coverage}%`));
              }
            }
            break;
        }
      }

      spinner.succeed(chalk.green('✅ TDD workflow complete!'));

      // Final summary
      console.log(chalk.cyan('\n📊 Summary:'));
      console.log(chalk.white(`  Tests Written: ${testsWritten}`));
      console.log(chalk.white(`  Tests Passing: ${testsPassing}`));
      console.log(chalk.white(`  Files Changed: ${filesChanged.length}`));
      console.log(chalk.gray(`\n  ${filesChanged.join('\n  ')}`));

    } catch (error: any) {
      spinner.fail(chalk.red('❌ TDD workflow failed'));
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

