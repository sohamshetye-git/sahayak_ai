/**
 * Application Repository
 * Handles persistence of scheme applications in DynamoDB
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { Application } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class ApplicationRepository {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor(tableName?: string) {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = tableName || process.env.DYNAMODB_APPLICATIONS_TABLE || 'sahayak-applications';
  }

  /**
   * Create a new application
   */
  async createApplication(
    userId: string,
    schemeId: string,
    schemeName: string,
    totalSteps: number
  ): Promise<Application> {
    const now = Date.now();
    const application: Application = {
      applicationId: uuidv4(),
      userId,
      schemeId,
      schemeName,
      status: 'draft',
      progress: 0,
      currentStep: 1,
      totalSteps,
      completedSteps: [],
      createdAt: now,
      updatedAt: now,
      ttl: Math.floor(now / 1000) + 365 * 24 * 60 * 60, // 1 year from now
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: application,
      })
    );

    return application;
  }

  /**
   * Get an application by ID
   */
  async getApplication(applicationId: string): Promise<Application | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { applicationId },
      })
    );

    return (result.Item as Application) || null;
  }

  /**
   * Update an application
   */
  async updateApplication(
    applicationId: string,
    updates: {
      status?: 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
      currentStep?: number;
      completedSteps?: number[];
      documents?: Array<{ name: string; url: string; uploadedAt: number }>;
      submittedAt?: number;
      reviewedAt?: number;
      rejectionReason?: string;
    }
  ): Promise<void> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (updates.status) {
      updateExpressions.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = updates.status;
    }

    if (updates.currentStep !== undefined) {
      updateExpressions.push('#currentStep = :currentStep');
      expressionAttributeNames['#currentStep'] = 'currentStep';
      expressionAttributeValues[':currentStep'] = updates.currentStep;
    }

    if (updates.completedSteps) {
      updateExpressions.push('#completedSteps = :completedSteps');
      expressionAttributeNames['#completedSteps'] = 'completedSteps';
      expressionAttributeValues[':completedSteps'] = updates.completedSteps;

      // Calculate progress
      const application = await this.getApplication(applicationId);
      if (application) {
        const progress = Math.round((updates.completedSteps.length / application.totalSteps) * 100);
        updateExpressions.push('#progress = :progress');
        expressionAttributeNames['#progress'] = 'progress';
        expressionAttributeValues[':progress'] = progress;
      }
    }

    if (updates.documents) {
      updateExpressions.push('#documents = :documents');
      expressionAttributeNames['#documents'] = 'documents';
      expressionAttributeValues[':documents'] = updates.documents;
    }

    if (updates.submittedAt) {
      updateExpressions.push('#submittedAt = :submittedAt');
      expressionAttributeNames['#submittedAt'] = 'submittedAt';
      expressionAttributeValues[':submittedAt'] = updates.submittedAt;
    }

    if (updates.reviewedAt) {
      updateExpressions.push('#reviewedAt = :reviewedAt');
      expressionAttributeNames['#reviewedAt'] = 'reviewedAt';
      expressionAttributeValues[':reviewedAt'] = updates.reviewedAt;
    }

    if (updates.rejectionReason) {
      updateExpressions.push('#rejectionReason = :rejectionReason');
      expressionAttributeNames['#rejectionReason'] = 'rejectionReason';
      expressionAttributeValues[':rejectionReason'] = updates.rejectionReason;
    }

    // Always update updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = Date.now();

    await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { applicationId },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );
  }

  /**
   * Get all applications for a user
   */
  async getUserApplications(
    userId: string,
    status?: 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected',
    limit: number = 20
  ): Promise<Application[]> {
    const params: any = {
      TableName: this.tableName,
      IndexName: 'userId-createdAt-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false, // Sort by createdAt descending
      Limit: limit,
    };

    if (status) {
      params.FilterExpression = '#status = :status';
      params.ExpressionAttributeNames = { '#status': 'status' };
      params.ExpressionAttributeValues[':status'] = status;
    }

    const result = await this.docClient.send(new QueryCommand(params));

    return (result.Items as Application[]) || [];
  }
}
