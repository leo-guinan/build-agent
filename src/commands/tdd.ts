import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { tddRoutingAgent } from '../mastra';

export const tddCommand = new Command('tdd')
  .description('Run TDD agent network to implement a feature')
  .argument('<feature>', 'Feature description to implement')
  .option('--max-iterations <number>', 'Maximum TDD iterations', '20')
  .option('--timeout <seconds>', 'Timeout in seconds', '300')
  .option('--debug', 'Enable debug logging', false)
  .action(async (feature: string, options) => {
    console.log(chalk.cyan('🤖 TDD Agent Network Starting...'));
    console.log(chalk.gray(`Feature: ${feature}\n`));
    console.log(chalk.gray(`Timeout: ${options.timeout}s | Max Iterations: ${options.maxIterations}\n`));

    const spinner = ora('Analyzing feature request...').start();

    // Add timeout
    const timeoutMs = parseInt(options.timeout) * 1000;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${options.timeout}s`)), timeoutMs);
    });

    try {
      // Call the TDD routing agent network with timeout
      const networkPromise = tddRoutingAgent.network(
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

      // Race between network execution and timeout
      const result = await Promise.race([networkPromise, timeoutPromise]) as any;

      let currentPhase = '';
      let testsWritten = 0;
      let testsPassing = 0;
      const filesChanged: string[] = [];

      // Stream results with detailed logging
      console.log(chalk.gray('\n🔍 Debug Mode: Logging all network events...\n'));
      
      for await (const chunk of result) {
        // Log every event for debugging
        console.log(chalk.gray(`[${chunk.type}]`), JSON.stringify(chunk.payload || {}, null, 2).substring(0, 200));
        
        switch (chunk.type) {
          case 'routing-agent-start':
            spinner.text = 'TDD Routing Agent analyzing...';
            console.log(chalk.cyan('\n🚀 Routing agent started'));
            break;

          case 'routing-agent-end':
            console.log(chalk.cyan('✓ Routing agent finished'));
            break;

          case 'agent-execution-start':
            const agentName = (chunk.payload as any).agentName;
            console.log(chalk.yellow(`\n🤖 Starting agent: ${agentName}`));
            
            if (agentName === 'test-agent') {
              currentPhase = 'Writing Tests';
              spinner.text = chalk.yellow('📝 Test Agent writing specifications...');
            } else if (agentName === 'develop-agent') {
              currentPhase = 'Implementing';
              spinner.text = chalk.green('💻 Develop Agent implementing code...');
            }
            break;

          case 'agent-execution-end':
            const endAgentName = (chunk.payload as any).agentName;
            console.log(chalk.yellow(`✓ Agent finished: ${endAgentName}`));
            break;

          case 'tool-execution-start':
            const toolId = (chunk.payload as any).toolId;
            console.log(chalk.blue(`\n🔧 Tool called: ${toolId}`));
            console.log(chalk.gray(`   Input: ${JSON.stringify((chunk.payload as any).input || {})}`));
            
            if (toolId === 'system-state-collector') {
              spinner.text = 'Collecting system state...';
            } else if (toolId === 'git-manager') {
              spinner.text = 'Managing Git operations...';
            } else if (toolId === 'workspace-manager') {
              spinner.text = 'Managing workspaces...';
            }
            break;

          case 'tool-execution-end':
            const endToolId = (chunk.payload as any).toolId;
            console.log(chalk.blue(`✓ Tool finished: ${endToolId}`));
            const toolResult = (chunk.payload as any).result;
            if (toolResult) {
              console.log(chalk.gray(`   Result: ${JSON.stringify(toolResult).substring(0, 150)}...`));
            }
            break;

          case 'agent-execution-event-text-delta':
            // Streaming text from agent
            const delta = (chunk.payload as any).delta;
            if (delta) {
              process.stdout.write(chalk.gray(delta));
            }
            break;

          case 'agent-execution-event-step-start':
            console.log(chalk.magenta('\n📍 Step starting...'));
            break;

          case 'agent-execution-event-step-finish':
            console.log(chalk.magenta('✓ Step finished'));
            break;

          case 'network-execution-event-step-finish':
            const stepResult = (chunk.payload as any).result;
            
            // Update progress
            console.log(chalk.green(`\n✅ Network step complete: ${currentPhase}`));
            
            if (stepResult) {
              console.log(chalk.gray(`   Result: ${JSON.stringify(stepResult).substring(0, 200)}...`));
              
              if (stepResult.testsWritten) testsWritten = stepResult.testsWritten;
              if (stepResult.testsPassing) testsPassing = stepResult.testsPassing;
              if (stepResult.filesChanged) {
                filesChanged.push(...stepResult.filesChanged);
              }
              
              console.log(chalk.gray(`   Tests: ${testsPassing}/${testsWritten} passing`));
              if (stepResult.coverage) {
                console.log(chalk.gray(`   Coverage: ${stepResult.coverage}%`));
              }
            }
            break;

          case 'error':
            console.log(chalk.red('\n❌ Error event:'), chunk.payload);
            break;

          default:
            // Log unknown events
            console.log(chalk.gray(`[Unknown: ${chunk.type}]`));
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

