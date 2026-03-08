/**
 * DynamoDB Table Definitions
 * Defines schemas for ChatSessions and Applications tables
 */

export const ChatSessionsTableDefinition = {
  TableName: process.env.DYNAMODB_CHAT_SESSIONS_TABLE || 'sahayak-chat-sessions',
  KeySchema: [
    { AttributeName: 'sessionId', KeyType: 'HASH' }, // Partition key
  ],
  AttributeDefinitions: [
    { AttributeName: 'sessionId', AttributeType: 'S' },
    { AttributeName: 'userId', AttributeType: 'S' },
    { AttributeName: 'createdAt', AttributeType: 'N' },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'userId-createdAt-index',
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' },
        { AttributeName: 'createdAt', KeyType: 'RANGE' },
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
  ],
  BillingMode: 'PAY_PER_REQUEST',
  TimeToLiveSpecification: {
    Enabled: true,
    AttributeName: 'ttl',
  },
  PointInTimeRecoverySpecification: {
    PointInTimeRecoveryEnabled: true,
  },
  Tags: [
    { Key: 'Project', Value: 'SahayakAI' },
    { Key: 'Environment', Value: process.env.ENVIRONMENT || 'development' },
  ],
};

export const ApplicationsTableDefinition = {
  TableName: process.env.DYNAMODB_APPLICATIONS_TABLE || 'sahayak-applications',
  KeySchema: [
    { AttributeName: 'applicationId', KeyType: 'HASH' }, // Partition key
  ],
  AttributeDefinitions: [
    { AttributeName: 'applicationId', AttributeType: 'S' },
    { AttributeName: 'userId', AttributeType: 'S' },
    { AttributeName: 'createdAt', AttributeType: 'N' },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'userId-createdAt-index',
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' },
        { AttributeName: 'createdAt', KeyType: 'RANGE' },
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
  ],
  BillingMode: 'PAY_PER_REQUEST',
  TimeToLiveSpecification: {
    Enabled: true,
    AttributeName: 'ttl',
  },
  PointInTimeRecoverySpecification: {
    PointInTimeRecoveryEnabled: true,
  },
  Tags: [
    { Key: 'Project', Value: 'SahayakAI' },
    { Key: 'Environment', Value: process.env.ENVIRONMENT || 'development' },
  ],
};

/**
 * ChatSession DynamoDB Item Structure
 */
export interface ChatSessionItem {
  sessionId: string; // Partition Key (UUID)
  userId: string; // GSI Partition Key
  createdAt: number; // GSI Sort Key (epoch ms)
  updatedAt: number; // Timestamp (epoch ms)
  language: 'hi' | 'en';
  messages: MessageItem[];
  userProfile: Partial<UserProfileItem>;
  stage: 'greeting' | 'info_collection' | 'eligibility_check' | 'guidance';
  ttl: number; // Auto-delete after 90 days (epoch seconds)
}

export interface MessageItem {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    voiceInput?: boolean;
    confidence?: number;
  };
}

export interface UserProfileItem {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  occupation?: string;
  state?: string;
  district?: string;
  income?: number;
  casteCategory?: 'general' | 'obc' | 'sc' | 'st';
  hasDisability?: boolean;
  completeness: number; // 0-100 percentage
}

/**
 * Application DynamoDB Item Structure
 */
export interface ApplicationItem {
  applicationId: string; // Partition Key (UUID)
  userId: string; // GSI Partition Key
  schemeId: string;
  schemeName: string;
  status: 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  progress: number; // 0-100 percentage
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  submittedAt?: number;
  createdAt: number; // GSI Sort Key (epoch ms)
  updatedAt: number;
  ttl: number; // Auto-delete after 2 years (epoch seconds)
}

/**
 * Helper function to calculate TTL
 * @param daysFromNow Number of days from now
 * @returns TTL in epoch seconds
 */
export function calculateTTL(daysFromNow: number): number {
  const now = Date.now();
  const ttlMs = now + daysFromNow * 24 * 60 * 60 * 1000;
  return Math.floor(ttlMs / 1000); // Convert to seconds
}

/**
 * Helper function to create a new ChatSession item
 */
export function createChatSessionItem(
  sessionId: string,
  userId: string,
  language: 'hi' | 'en'
): ChatSessionItem {
  const now = Date.now();
  return {
    sessionId,
    userId,
    createdAt: now,
    updatedAt: now,
    language,
    messages: [],
    userProfile: { completeness: 0 },
    stage: 'greeting',
    ttl: calculateTTL(90), // 90 days
  };
}

/**
 * Helper function to create a new Application item
 */
export function createApplicationItem(
  applicationId: string,
  userId: string,
  schemeId: string,
  schemeName: string,
  totalSteps: number
): ApplicationItem {
  const now = Date.now();
  return {
    applicationId,
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
    ttl: calculateTTL(730), // 2 years
  };
}
