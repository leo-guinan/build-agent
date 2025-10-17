/**
 * Inter-Agent Messaging System Types
 * 
 * Enables async communication between agents via inbox/outbox
 */

export type MessageType = 
  | 'question'       // Ask another agent
  | 'answer'         // Respond to question
  | 'task'           // Assign work
  | 'update'         // Status update
  | 'insight'        // Share discovery
  | 'alert'          // Urgent notification
  | 'validation'     // Request validation
  | 'context';       // Share context/notes

export type MessagePriority = 'low' | 'medium' | 'high' | 'urgent';

export type MessageStatus = 'pending' | 'delivered' | 'read' | 'replied' | 'archived';

/**
 * Message structure
 */
export interface AgentMessage {
  id: string;
  type: MessageType;
  from: string;  // Agent type (entrepreneur, builder, etc.)
  to: string | string[];  // Recipient(s)
  subject: string;
  body: string;
  priority: MessagePriority;
  status: MessageStatus;
  
  // Metadata
  created: string;  // ISO timestamp
  delivered?: string;  // ISO timestamp
  read?: string;  // ISO timestamp
  
  // Threading
  threadId?: string;  // For conversations
  replyTo?: string;  // Message ID this replies to
  
  // Attachments
  attachments?: MessageAttachment[];
  
  // Context
  relatedIdea?: string;  // Which idea workspace
  relatedFile?: string;  // Which file in workspace
}

/**
 * Message attachments
 */
export interface MessageAttachment {
  type: 'note' | 'file' | 'data' | 'link';
  name: string;
  content?: string;  // For notes/data
  path?: string;  // For files
  url?: string;  // For links
}

/**
 * Inbox/Outbox structure
 */
export interface Mailbox {
  agent: string;
  inbox: AgentMessage[];
  outbox: AgentMessage[];
  archived: AgentMessage[];
}

/**
 * Routing rules
 */
export interface RoutingRule {
  messageType: MessageType;
  from: string;
  to: string | string[] | 'ALL' | 'FINANCIAL' | 'PRODUCT' | 'INTELLIGENCE';
  autoDeliver: boolean;
}

/**
 * Notebook entry
 */
export interface NotebookEntry {
  id: string;
  agent: string;
  title: string;
  content: string;
  tags: string[];
  created: string;
  updated: string;
  relatedMessages?: string[];  // Message IDs
  relatedIdea?: string;
}

/**
 * Agent groups for broadcast
 */
export const AGENT_GROUPS = {
  ALL: ['entrepreneur', 'builder', 'activist', 'speculator', 'researcher', 'whale', 'validator'],
  FINANCIAL: ['entrepreneur', 'speculator', 'whale'],
  PRODUCT: ['builder', 'activist'],
  INTELLIGENCE: ['researcher', 'validator'],
  BUSINESS: ['entrepreneur', 'speculator', 'whale'],
  OPERATIONS: ['builder', 'activist', 'validator'],
} as const;

