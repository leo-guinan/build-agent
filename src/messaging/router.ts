/**
 * Message Router
 * 
 * Routes messages from agent outboxes to recipient inboxes
 */

import fs from 'fs';
import path from 'path';
import type { AgentMessage, MessageStatus } from './types.js';
import { AGENT_GROUPS } from './types.js';

/**
 * Get agent mailbox paths
 */
export function getMailboxPaths(agentPath: string) {
  return {
    inbox: path.join(agentPath, 'inbox'),
    outbox: path.join(agentPath, 'outbox'),
    notebook: path.join(agentPath, 'notebook'),
    archived: path.join(agentPath, 'inbox', '.archived'),
  };
}

/**
 * Initialize mailbox for agent
 */
export function initializeMailbox(agentPath: string) {
  const paths = getMailboxPaths(agentPath);
  
  // Create directories
  for (const dir of Object.values(paths)) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  // Create README files
  fs.writeFileSync(
    path.join(paths.inbox, 'README.md'),
    `# Inbox\n\nMessages received from other agents.\n\nEach message is a JSON file: {messageId}.json`
  );
  
  fs.writeFileSync(
    path.join(paths.outbox, 'README.md'),
    `# Outbox\n\nMessages to send to other agents.\n\nRouter will deliver these and move to .sent/`
  );
  
  fs.writeFileSync(
    path.join(paths.notebook, 'README.md'),
    `# Notebook\n\nAgent's personal notes and context.\n\nReference these for decision making.`
  );
}

/**
 * Send message (write to outbox)
 */
export function sendMessage(
  agentPath: string,
  message: Omit<AgentMessage, 'id' | 'created' | 'status'>
): AgentMessage {
  const paths = getMailboxPaths(agentPath);
  
  const fullMessage: AgentMessage = {
    ...message,
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    created: new Date().toISOString(),
    status: 'pending',
  };
  
  const outboxFile = path.join(paths.outbox, `${fullMessage.id}.json`);
  fs.writeFileSync(outboxFile, JSON.stringify(fullMessage, null, 2));
  
  return fullMessage;
}

/**
 * Route all pending messages
 */
export function routeMessages(workspaceRoot: string): {
  delivered: number;
  failed: number;
  details: Array<{ messageId: string; from: string; to: string; status: string }>;
} {
  const delivered: string[] = [];
  const failed: Array<{ messageId: string; from: string; to: string; error: string }> = [];
  const details: Array<{ messageId: string; from: string; to: string; status: string }> = [];
  
  // Find all agent directories
  const agentDirs = fs.readdirSync(workspaceRoot)
    .filter(name => name.endsWith('-agent'))
    .map(name => path.join(workspaceRoot, name));
  
  // Process each agent's outbox
  for (const agentDir of agentDirs) {
    const paths = getMailboxPaths(agentDir);
    const outboxPath = paths.outbox;
    
    if (!fs.existsSync(outboxPath)) continue;
    
    const messages = fs.readdirSync(outboxPath)
      .filter(f => f.endsWith('.json') && f !== 'README.md');
    
    for (const messageFile of messages) {
      try {
        const messagePath = path.join(outboxPath, messageFile);
        const message: AgentMessage = JSON.parse(fs.readFileSync(messagePath, 'utf-8'));
        
        // Resolve recipients
        const recipients = resolveRecipients(message.to, workspaceRoot);
        
        // Deliver to each recipient
        for (const recipient of recipients) {
          const recipientAgent = recipient.replace('-agent', '');
          if (recipientAgent === message.from) continue; // Don't send to self
          
          const recipientInbox = path.join(recipient, 'inbox', `${message.id}.json`);
          
          // Update message status
          const deliveredMessage = {
            ...message,
            status: 'delivered' as MessageStatus,
            delivered: new Date().toISOString(),
          };
          
          fs.writeFileSync(recipientInbox, JSON.stringify(deliveredMessage, null, 2));
          delivered.push(message.id);
          
          details.push({
            messageId: message.id,
            from: message.from,
            to: recipientAgent,
            status: 'delivered',
          });
        }
        
        // Move from outbox to .sent
        const sentDir = path.join(outboxPath, '.sent');
        if (!fs.existsSync(sentDir)) {
          fs.mkdirSync(sentDir, { recursive: true });
        }
        fs.renameSync(messagePath, path.join(sentDir, messageFile));
        
      } catch (error: any) {
        failed.push({
          messageId: messageFile,
          from: path.basename(agentDir).replace('-agent', ''),
          to: 'unknown',
          error: error.message,
        });
        
        details.push({
          messageId: messageFile,
          from: path.basename(agentDir).replace('-agent', ''),
          to: 'unknown',
          status: `failed: ${error.message}`,
        });
      }
    }
  }
  
  return {
    delivered: delivered.length,
    failed: failed.length,
    details,
  };
}

/**
 * Resolve recipient(s) to agent paths
 */
function resolveRecipients(to: string | string[], workspaceRoot: string): string[] {
  const recipients: string[] = [];
  const toArray = Array.isArray(to) ? to : [to];
  
  for (const recipient of toArray) {
    // Check if it's a group
    if (recipient.toUpperCase() in AGENT_GROUPS) {
      const groupKey = recipient.toUpperCase() as keyof typeof AGENT_GROUPS;
      const groupMembers = AGENT_GROUPS[groupKey];
      recipients.push(...groupMembers.map(agent => path.join(workspaceRoot, `${agent}-agent`)));
    } else {
      // Single agent
      const agentPath = path.join(workspaceRoot, `${recipient}-agent`);
      if (fs.existsSync(agentPath)) {
        recipients.push(agentPath);
      }
    }
  }
  
  return recipients;
}

/**
 * Read inbox messages
 */
export function readInbox(agentPath: string): AgentMessage[] {
  const paths = getMailboxPaths(agentPath);
  const inboxPath = paths.inbox;
  
  if (!fs.existsSync(inboxPath)) return [];
  
  const messages = fs.readdirSync(inboxPath)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const content = fs.readFileSync(path.join(inboxPath, f), 'utf-8');
      return JSON.parse(content) as AgentMessage;
    })
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  
  return messages;
}

/**
 * Mark message as read
 */
export function markAsRead(agentPath: string, messageId: string) {
  const paths = getMailboxPaths(agentPath);
  const messagePath = path.join(paths.inbox, `${messageId}.json`);
  
  if (!fs.existsSync(messagePath)) return;
  
  const message: AgentMessage = JSON.parse(fs.readFileSync(messagePath, 'utf-8'));
  message.status = 'read';
  message.read = new Date().toISOString();
  
  fs.writeFileSync(messagePath, JSON.stringify(message, null, 2));
}

/**
 * Archive message
 */
export function archiveMessage(agentPath: string, messageId: string) {
  const paths = getMailboxPaths(agentPath);
  const messagePath = path.join(paths.inbox, `${messageId}.json`);
  const archivedPath = path.join(paths.archived, `${messageId}.json`);
  
  if (!fs.existsSync(messagePath)) return;
  
  if (!fs.existsSync(paths.archived)) {
    fs.mkdirSync(paths.archived, { recursive: true });
  }
  
  fs.renameSync(messagePath, archivedPath);
}

/**
 * Get unread count
 */
export function getUnreadCount(agentPath: string): number {
  const messages = readInbox(agentPath);
  return messages.filter(m => m.status === 'delivered').length;
}

/**
 * Create notebook entry
 */
export function createNote(
  agentPath: string,
  title: string,
  content: string,
  tags: string[] = []
): string {
  const paths = getMailboxPaths(agentPath);
  const noteId = `note-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const agent = path.basename(agentPath).replace('-agent', '');
  
  const note = {
    id: noteId,
    agent,
    title,
    content,
    tags,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };
  
  const notePath = path.join(paths.notebook, `${noteId}.json`);
  fs.writeFileSync(notePath, JSON.stringify(note, null, 2));
  
  return noteId;
}

/**
 * Read all notes
 */
export function readNotebook(agentPath: string) {
  const paths = getMailboxPaths(agentPath);
  const notebookPath = paths.notebook;
  
  if (!fs.existsSync(notebookPath)) return [];
  
  return fs.readdirSync(notebookPath)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(notebookPath, f), 'utf-8')));
}

/**
 * Extract questions from requirements
 */
export function extractQuestionsFromRequirements(requirementsPath: string): Array<{
  question: string;
  context: string;
  section: string;
}> {
  if (!fs.existsSync(requirementsPath)) return [];
  
  const content = fs.readFileSync(requirementsPath, 'utf-8');
  const questions: Array<{ question: string; context: string; section: string }> = [];
  
  // Look for "Open Questions" section
  const openQuestionsMatch = content.match(/##\s+.*Open Questions.*\n([\s\S]*?)(?=\n##|$)/i);
  if (openQuestionsMatch) {
    const section = openQuestionsMatch[1];
    const lines = section.split('\n');
    let currentContext = '';
    
    for (const line of lines) {
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const question = line.replace(/^[-*]\s*/, '').trim();
        if (question && question.includes('?')) {
          questions.push({
            question,
            context: currentContext,
            section: 'Open Questions',
          });
        }
      } else if (line.trim().startsWith('#')) {
        currentContext = line.replace(/^#+\s*/, '').trim();
      }
    }
  }
  
  // Look for "[TBD]" or "[To be determined]" markers
  const tbdMatches = content.matchAll(/\*\*(.*?)\*\*[:\s]*\[(TBD|To be determined|To be defined)\]/gi);
  for (const match of tbdMatches) {
    const topic = match[1];
    questions.push({
      question: `What should the ${topic} be?`,
      context: 'Requirements specification',
      section: 'To Be Determined',
    });
  }
  
  return questions;
}

/**
 * Send questions to researcher
 */
export function sendQuestionsToResearcher(
  entrepreneurPath: string,
  questions: Array<{ question: string; context: string; section: string }>,
  ideaName: string
): AgentMessage[] {
  const sentMessages: AgentMessage[] = [];
  
  for (const q of questions) {
    const message = sendMessage(entrepreneurPath, {
      type: 'question',
      from: 'entrepreneur',
      to: 'researcher',
      subject: `Research needed: ${q.question.substring(0, 60)}...`,
      body: `**Question:** ${q.question}\n\n**Context:** ${q.context}\n\n**Section:** ${q.section}\n\n**Idea:** ${ideaName}\n\nPlease research and provide answer with supporting data.`,
      priority: q.section === 'Open Questions' ? 'high' : 'medium',
      relatedIdea: ideaName,
    });
    
    sentMessages.push(message);
  }
  
  return sentMessages;
}

