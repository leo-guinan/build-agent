import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { createNote, readNotebook } from '../messaging/router.js';

export const notebookCommand = new Command('notebook')
  .description('Manage agent notebook (personal notes and context)')
  .option('--list', 'List all notes', false)
  .option('--add', 'Add new note (interactive)', false)
  .option('--title <text>', 'Note title (with --add)')
  .option('--content <text>', 'Note content (with --add)')
  .option('--tags <list>', 'Comma-separated tags')
  .option('--search <query>', 'Search notes')
  .action(async (options) => {
    try {
      const workspacePath = process.cwd();
      
      // List notes
      if (options.list || (!options.add && !options.search)) {
        const notes = readNotebook(workspacePath);
        
        console.log(chalk.cyan('📓 Notebook\n'));
        console.log(chalk.white('Total Notes:'), chalk.gray(notes.length));
        console.log();
        
        if (notes.length === 0) {
          console.log(chalk.gray('No notes yet.'));
          console.log();
          console.log(chalk.yellow('💡 Tip: Create notes to remember important context'));
          console.log(chalk.gray('   build-agent notebook --add'));
          console.log();
          return;
        }
        
        notes.forEach((note, i) => {
          console.log(chalk.white(`${i + 1}. ${note.title}`));
          console.log(chalk.gray(`   Created: ${note.created}`));
          if (note.tags && note.tags.length > 0) {
            console.log(chalk.gray(`   Tags: ${note.tags.join(', ')}`));
          }
          console.log(chalk.gray(`   ${note.content.substring(0, 150)}${note.content.length > 150 ? '...' : ''}`));
          console.log();
        });
        
        return;
      }
      
      // Add note
      if (options.add) {
        let title, content, tags;
        
        if (options.title && options.content) {
          title = options.title;
          content = options.content;
          tags = options.tags ? options.tags.split(',').map((s: string) => s.trim()) : [];
        } else {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'title',
              message: 'Note title:',
              validate: (input: string) => input.trim() ? true : 'Title required',
            },
            {
              type: 'input',
              name: 'content',
              message: 'Note content:',
              validate: (input: string) => input.trim() ? true : 'Content required',
            },
            {
              type: 'input',
              name: 'tags',
              message: 'Tags (comma-separated, optional):',
              default: '',
            },
          ]);
          
          title = answers.title;
          content = answers.content;
          tags = answers.tags ? answers.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
        }
        
        const noteId = createNote(workspacePath, title, content, tags);
        
        console.log(chalk.green('✅ Note created\n'));
        console.log(chalk.cyan('📓 Note Details:'));
        console.log(chalk.white('  ID:'), chalk.gray(noteId));
        console.log(chalk.white('  Title:'), chalk.gray(title));
        console.log(chalk.white('  Tags:'), tags.length > 0 ? chalk.gray(tags.join(', ')) : chalk.gray('None'));
        console.log();
        console.log(chalk.yellow('💡 Tip: Reference this note when making decisions'));
        console.log();
        
        return;
      }
      
      // Search notes
      if (options.search) {
        const notes = readNotebook(workspacePath);
        const query = options.search.toLowerCase();
        
        const matches = notes.filter(note => 
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          (note.tags && note.tags.some((tag: string) => tag.toLowerCase().includes(query)))
        );
        
        console.log(chalk.cyan(`📓 Search Results for "${options.search}"\n`));
        console.log(chalk.white('Matches:'), chalk.gray(matches.length));
        console.log();
        
        if (matches.length === 0) {
          console.log(chalk.gray('No matching notes found.'));
          console.log();
          return;
        }
        
        matches.forEach((note, i) => {
          console.log(chalk.white(`${i + 1}. ${note.title}`));
          console.log(chalk.gray(`   ${note.content.substring(0, 200)}...`));
          if (note.tags && note.tags.length > 0) {
            console.log(chalk.gray(`   Tags: ${note.tags.join(', ')}`));
          }
          console.log();
        });
      }
      
    } catch (error: any) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

