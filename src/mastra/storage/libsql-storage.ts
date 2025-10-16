import { createClient } from '@libsql/client';
import type { Client } from '@libsql/client';
import { MastraStorage } from '@mastra/core/storage';
import type { TABLE_NAMES } from '@mastra/core/storage';

export class LibSQLStorage extends MastraStorage {
  private client: Client;
  private initialized: boolean = false;

  constructor({ url }: { url: string }) {
    super({ name: 'libsql-storage' });
    
    this.client = createClient({
      url,
    });
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Create basic tables needed for memory
      await this.createTable({
        tableName: 'mastra_threads' as TABLE_NAMES,
        schema: {},
      });
      
      await this.createTable({
        tableName: 'mastra_messages' as TABLE_NAMES,
        schema: {},
      });
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize LibSQL storage:', error);
      throw error;
    }
  }

  async createTable({ tableName }: { tableName: TABLE_NAMES; schema?: Record<string, any> }): Promise<void> {
    // Basic table creation - in production you'd use proper schemas
    if (tableName === 'mastra_threads') {
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id TEXT PRIMARY KEY,
          resourceId TEXT,
          title TEXT,
          metadata TEXT,
          createdAt TEXT,
          updatedAt TEXT
        )
      `);
    } else if (tableName === 'mastra_messages') {
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id TEXT PRIMARY KEY,
          threadId TEXT,
          role TEXT,
          content TEXT,
          createdAt TEXT,
          metadata TEXT
        )
      `);
    }
  }

  async clearTable({ tableName }: { tableName: TABLE_NAMES }): Promise<void> {
    await this.client.execute(`DELETE FROM ${tableName}`);
  }

  async dropTable({ tableName }: { tableName: TABLE_NAMES }): Promise<void> {
    await this.client.execute(`DROP TABLE IF EXISTS ${tableName}`);
  }

  async alterTable(): Promise<void> {
    // Not implemented for basic usage
  }

  async insert({ tableName, record }: { tableName: TABLE_NAMES; record: Record<string, any> }): Promise<void> {
    const keys = Object.keys(record);
    const values = Object.values(record);
    const placeholders = keys.map(() => '?').join(', ');
    
    await this.client.execute({
      sql: `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`,
      args: values,
    });
  }

  async batchInsert({ tableName, records }: { tableName: TABLE_NAMES; records: Record<string, any>[] }): Promise<void> {
    for (const record of records) {
      await this.insert({ tableName, record });
    }
  }

  async load<R>({ tableName, keys }: { tableName: TABLE_NAMES; keys: Record<string, any> }): Promise<R | null> {
    const conditions = Object.keys(keys).map(k => `${k} = ?`).join(' AND ');
    const values = Object.values(keys);
    
    const result = await this.client.execute({
      sql: `SELECT * FROM ${tableName} WHERE ${conditions} LIMIT 1`,
      args: values,
    });
    
    return (result.rows[0] as R) || null;
  }

  async getThreadById({ threadId }: { threadId: string }): Promise<any> {
    return this.load({
      tableName: 'mastra_threads' as TABLE_NAMES,
      keys: { id: threadId },
    });
  }

  async saveThread({ thread }: { thread: any }): Promise<any> {
    const exists = await this.getThreadById({ threadId: thread.id });
    
    if (exists) {
      // Update existing thread
      await this.client.execute({
        sql: `UPDATE mastra_threads SET resourceId = ?, title = ?, metadata = ?, updatedAt = ? WHERE id = ?`,
        args: [
          thread.resourceId || '',
          thread.title || '',
          JSON.stringify(thread.metadata || {}),
          new Date().toISOString(),
          thread.id,
        ],
      });
    } else {
      // Insert new thread
      await this.insert({
        tableName: 'mastra_threads' as TABLE_NAMES,
        record: {
          id: thread.id,
          resourceId: thread.resourceId || '',
          title: thread.title || '',
          metadata: JSON.stringify(thread.metadata || {}),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }
    
    return thread;
  }

  async getThreadsByResourceId({ resourceId }: { resourceId: string }): Promise<any[]> {
    const result = await this.client.execute({
      sql: `SELECT * FROM mastra_threads WHERE resourceId = ?`,
      args: [resourceId],
    });
    
    return result.rows as any[];
  }

  async saveMessages({ messages }: { messages: any[] }): Promise<any[]> {
    for (const message of messages) {
      await this.insert({
        tableName: 'mastra_messages' as TABLE_NAMES,
        record: {
          id: message.id || `msg-${Date.now()}-${Math.random()}`,
          threadId: message.threadId,
          role: message.role,
          content: JSON.stringify(message.content),
          createdAt: message.createdAt || new Date().toISOString(),
          metadata: JSON.stringify(message.metadata || {}),
        },
      });
    }
    return messages;
  }

  async getMessages({ threadId }: { threadId: string }): Promise<any[]> {
    const result = await this.client.execute({
      sql: `SELECT * FROM mastra_messages WHERE threadId = ? ORDER BY createdAt ASC`,
      args: [threadId],
    });
    
    return result.rows.map((row: any) => ({
      ...row,
      content: JSON.parse(row.content),
      metadata: JSON.parse(row.metadata || '{}'),
    }));
  }

  async close(): Promise<void> {
    this.client.close();
  }
}

