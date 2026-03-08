/**
 * Chat Session Repository
 * Handles persistence of chat sessions in DynamoDB
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { ChatSession, Message, UserProfile } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class ChatSessionRepository {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor(tableName?: string) {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = tableName || process.env.DYNAMODB_CHAT_SESSIONS_TABLE || 'sahayak-chat-sessions';
  }

  /**
   * Create a new chat session
   */
  async createSession(
    userId: string,
    language: 'hi' | 'en',
    userProfile?: Partial<UserProfile>
  ): Promise<ChatSession> {
    const now = Date.now();
    const session: ChatSession = {
      sessionId: uuidv4(),
      userId,
      language,
      messages: [],
      userProfile: userProfile || { completeness: 0 },
      stage: 'greeting',
      createdAt: now,
      updatedAt: now,
      ttl: Math.floor(now / 1000) + 90 * 24 * 60 * 60, // 90 days from now
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: session,
      })
    );

    return session;
  }

  /**
   * Get a chat session by ID
   */
  async getSession(sessionId: string): Promise<ChatSession | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { sessionId },
      })
    );

    return (result.Item as ChatSession) || null;
  }

  /**
   * Update a chat session
   */
  async updateSession(
    sessionId: string,
    updates: {
      messages?: Message[];
      userProfile?: Partial<UserProfile>;
      stage?: string;
    }
  ): Promise<void> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (updates.messages) {
      updateExpressions.push('#messages = :messages');
      expressionAttributeNames['#messages'] = 'messages';
      expressionAttributeValues[':messages'] = updates.messages;
    }

    if (updates.userProfile) {
      updateExpressions.push('#userProfile = :userProfile');
      expressionAttributeNames['#userProfile'] = 'userProfile';
      expressionAttributeValues[':userProfile'] = updates.userProfile;
    }

    if (updates.stage) {
      updateExpressions.push('#stage = :stage');
      expressionAttributeNames['#stage'] = 'stage';
      expressionAttributeValues[':stage'] = updates.stage;
    }

    // Always update updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = Date.now();

    await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { sessionId },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string, limit: number = 20): Promise<ChatSession[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'userId-createdAt-index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
        ScanIndexForward: false, // Sort by createdAt descending
        Limit: limit,
      })
    );

    return (result.Items as ChatSession[]) || [];
  }

  /**
   * Delete a session (for testing or cleanup)
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { sessionId },
      })
    );
  }
}
