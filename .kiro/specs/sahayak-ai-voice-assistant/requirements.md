# Requirements Document

## Introduction

Sahayak AI is a voice-first AI assistant designed to help Indian citizens discover government welfare schemes, check their eligibility, and receive guided support through the application process. The system prioritizes accessibility for low-literacy users through natural language conversation and voice interaction, making government services more accessible to all citizens regardless of education level or technical proficiency.

## Glossary

- **Sahayak_System**: The complete voice-first AI assistant platform including frontend, backend, and AI services
- **User**: A citizen seeking information about government welfare schemes
- **Scheme**: A government welfare program with specific eligibility criteria and benefits
- **Eligibility_Engine**: The rule-based system that evaluates user attributes against scheme criteria
- **Conversation_Orchestrator**: The component managing chat context and conversation flow
- **Ranking_Engine**: The system that prioritizes eligible schemes based on relevance
- **Voice_Provider**: A service that provides speech-to-text or text-to-speech capabilities
- **AI_Provider**: A service that provides natural language understanding and generation
- **Service_Center**: A physical location where citizens can receive assistance with applications
- **User_Profile**: The collection of user attributes gathered through conversation
- **Chat_Session**: A conversation instance with associated context and history
- **Application_Workflow**: The step-by-step process for applying to a specific scheme

## Requirements

### Requirement 1: Natural Language Scheme Query

**User Story:** As a citizen, I want to ask about government schemes in natural language, so that I can find relevant programs without knowing technical terms or scheme names.

#### Acceptance Criteria

1. WHEN a User submits a text query, THE Conversation_Orchestrator SHALL send the query to the AI_Provider within 100ms
2. WHEN the AI_Provider returns a response, THE Sahayak_System SHALL display the response to the User within 500ms
3. THE Conversation_Orchestrator SHALL maintain Chat_Session context across multiple queries
4. WHEN a User asks about schemes in Hindi or English, THE AI_Provider SHALL understand and respond in the same language
5. IF the AI_Provider fails to respond, THEN THE Sahayak_System SHALL attempt the request with the fallback AI_Provider

### Requirement 2: Conversational Eligibility Data Collection

**User Story:** As a citizen, I want to provide my information through natural conversation, so that I don't need to fill complex forms.

#### Acceptance Criteria

1. WHEN the Conversation_Orchestrator identifies missing eligibility information, THE Sahayak_System SHALL ask the User for that information conversationally
2. THE Conversation_Orchestrator SHALL extract and store User_Profile attributes from conversational responses
3. THE Sahayak_System SHALL collect age, gender, occupation, state, district, income, caste category, and disability status through conversation
4. WHEN a User provides ambiguous information, THE Sahayak_System SHALL ask clarifying questions
5. THE Conversation_Orchestrator SHALL validate collected attributes against expected data types and ranges

### Requirement 3: Scheme Eligibility Evaluation

**User Story:** As a citizen, I want to know which schemes I'm eligible for, so that I can apply to relevant programs.

#### Acceptance Criteria

1. WHEN the User_Profile contains sufficient information, THE Eligibility_Engine SHALL evaluate eligibility against all schemes in the Scheme dataset
2. THE Eligibility_Engine SHALL compare User_Profile attributes with scheme eligibility rules using exact matching for categorical attributes
3. THE Eligibility_Engine SHALL compare numeric attributes using range-based matching
4. WHEN a User meets all criteria for a Scheme, THE Eligibility_Engine SHALL mark that Scheme as eligible
5. THE Eligibility_Engine SHALL complete evaluation for all schemes within 2 seconds

### Requirement 4: Scheme Ranking and Recommendation

**User Story:** As a citizen, I want to see the most relevant schemes first, so that I can focus on programs that best match my situation.

#### Acceptance Criteria

1. WHEN the Eligibility_Engine returns eligible schemes, THE Ranking_Engine SHALL rank them by relevance score
2. THE Ranking_Engine SHALL assign higher scores to schemes matching the User occupation
3. THE Ranking_Engine SHALL assign higher scores to schemes matching the User state
4. THE Ranking_Engine SHALL assign higher scores to schemes with higher benefit values
5. THE Sahayak_System SHALL display ranked schemes with the highest scoring schemes first

### Requirement 5: Voice Input Processing

**User Story:** As a low-literacy citizen, I want to speak my queries instead of typing, so that I can use the system without reading or writing skills.

#### Acceptance Criteria

1. WHEN a User activates voice input, THE Sahayak_System SHALL start recording audio through the active Voice_Provider
2. WHEN the User stops speaking, THE Voice_Provider SHALL convert speech to text within 3 seconds
3. THE Sahayak_System SHALL support multiple Voice_Provider implementations through a modular interface
4. WHERE Web Speech API is configured, THE Sahayak_System SHALL use browser-based speech recognition
5. WHERE Amazon Transcribe is configured, THE Sahayak_System SHALL send audio to Amazon Transcribe for conversion
6. IF speech-to-text conversion fails, THEN THE Sahayak_System SHALL display an error message and allow the User to retry

### Requirement 6: Voice Output Generation

**User Story:** As a low-literacy citizen, I want to hear responses spoken aloud, so that I can understand information without reading.

#### Acceptance Criteria

1. WHEN the Sahayak_System generates a text response, THE Sahayak_System SHALL convert it to speech using the active Voice_Provider
2. THE Sahayak_System SHALL play audio responses automatically after generation
3. WHERE Web Speech API is configured, THE Sahayak_System SHALL use browser-based speech synthesis
4. WHERE Amazon Polly is configured, THE Sahayak_System SHALL send text to Amazon Polly for conversion
5. THE Sahayak_System SHALL support voice provider switching through configuration
6. THE Sahayak_System SHALL allow Users to pause, resume, and stop audio playback

### Requirement 7: Service Center Location Lookup

**User Story:** As a citizen, I want to find nearby service centers, so that I can get in-person help with my application.

#### Acceptance Criteria

1. WHEN a User requests service center information, THE Sahayak_System SHALL query service centers by district
2. THE Sahayak_System SHALL return service center name, address, contact information, and operating hours
3. THE Sahayak_System SHALL display service centers on a map interface using OpenStreetMap or Google Maps
4. THE Sahayak_System SHALL sort service centers by distance from the User location when location is available
5. WHEN no service centers exist in the User district, THE Sahayak_System SHALL display service centers from neighboring districts

### Requirement 8: Application Guidance

**User Story:** As a citizen, I want step-by-step guidance for applying to schemes, so that I can complete applications correctly.

#### Acceptance Criteria

1. WHEN a User selects a Scheme, THE Sahayak_System SHALL retrieve the Application_Workflow for that Scheme
2. THE Sahayak_System SHALL display application steps in sequential order
3. THE Sahayak_System SHALL display required documents for each application step
4. THE Sahayak_System SHALL provide conversational guidance for completing each step
5. THE Sahayak_System SHALL allow Users to save application progress and resume later

### Requirement 9: Scheme Dataset Management

**User Story:** As a system administrator, I want to manage scheme data from a CSV file, so that I can easily update scheme information.

#### Acceptance Criteria

1. THE Sahayak_System SHALL load scheme data from data/schemes.csv at startup
2. THE Sahayak_System SHALL parse CSV columns for scheme name, description, eligibility criteria, benefits, and application process
3. WHEN the CSV file is updated, THE Sahayak_System SHALL reload scheme data without requiring system restart
4. THE Sahayak_System SHALL validate CSV data format and log errors for invalid entries
5. THE Sahayak_System SHALL store parsed scheme data in RDS PostgreSQL for query performance

### Requirement 10: Chat Session Persistence

**User Story:** As a citizen, I want my conversation history saved, so that I can continue where I left off in future sessions.

#### Acceptance Criteria

1. WHEN a User starts a conversation, THE Sahayak_System SHALL create a Chat_Session in DynamoDB
2. THE Sahayak_System SHALL store each message exchange in the Chat_Session history
3. THE Sahayak_System SHALL store collected User_Profile attributes in the Chat_Session
4. WHEN a User returns, THE Sahayak_System SHALL retrieve the previous Chat_Session by user identifier
5. THE Sahayak_System SHALL allow Users to start a new Chat_Session while preserving previous sessions

### Requirement 11: Multi-Language Support

**User Story:** As a citizen, I want to use the system in my preferred language, so that I can understand information clearly.

#### Acceptance Criteria

1. THE Sahayak_System SHALL support Hindi and English languages
2. WHEN a User selects a language, THE Sahayak_System SHALL display all UI text in that language
3. THE AI_Provider SHALL generate responses in the User selected language
4. THE Voice_Provider SHALL use speech recognition and synthesis for the User selected language
5. THE Sahayak_System SHALL allow Users to switch languages during a Chat_Session

### Requirement 12: Modular AI Provider Interface

**User Story:** As a developer, I want to switch between AI providers easily, so that I can optimize for cost and performance.

#### Acceptance Criteria

1. THE Sahayak_System SHALL define a standard interface for AI_Provider implementations
2. WHERE Amazon Bedrock is configured, THE Sahayak_System SHALL use Amazon Bedrock Nova Lite or Claude 3 Haiku
3. WHERE Google Gemini is configured, THE Sahayak_System SHALL use Google Gemini API
4. THE Sahayak_System SHALL support AI_Provider switching through configuration without code changes
5. FOR ALL AI_Provider implementations, THE Sahayak_System SHALL handle requests and responses using the same interface contract

### Requirement 13: Response Caching

**User Story:** As a system operator, I want to cache common responses, so that I can reduce AI API costs and improve response times.

#### Acceptance Criteria

1. WHEN the Sahayak_System receives a query, THE Sahayak_System SHALL check Redis cache for similar queries
2. WHEN a cached response exists and is less than 1 hour old, THE Sahayak_System SHALL return the cached response
3. WHEN no cached response exists, THE Sahayak_System SHALL request a response from the AI_Provider and cache it
4. THE Sahayak_System SHALL cache scheme data in Redis for 24 hours
5. THE Sahayak_System SHALL invalidate cached scheme data when the Scheme dataset is updated

### Requirement 14: Scheme Exploration Interface

**User Story:** As a citizen, I want to browse all available schemes, so that I can discover programs I might not know to ask about.

#### Acceptance Criteria

1. THE Sahayak_System SHALL display a list of all schemes grouped by category
2. THE Sahayak_System SHALL allow Users to filter schemes by state, category, and target beneficiary
3. WHEN a User selects a Scheme, THE Sahayak_System SHALL display detailed information including eligibility, benefits, and application process
4. THE Sahayak_System SHALL display scheme cards with scheme name, brief description, and key benefits
5. THE Sahayak_System SHALL allow Users to search schemes by keyword

### Requirement 15: Application Tracking

**User Story:** As a citizen, I want to track my scheme applications, so that I can monitor their status.

#### Acceptance Criteria

1. WHEN a User initiates an application, THE Sahayak_System SHALL create an application record in DynamoDB
2. THE Sahayak_System SHALL store application status, submission date, and associated Scheme information
3. THE Sahayak_System SHALL display all User applications on a "My Applications" page
4. THE Sahayak_System SHALL allow Users to view application details and current status
5. THE Sahayak_System SHALL display application progress as a percentage of completed steps

### Requirement 16: API Endpoint Implementation

**User Story:** As a frontend developer, I want well-defined API endpoints, so that I can build the user interface efficiently.

#### Acceptance Criteria

1. THE Sahayak_System SHALL expose a POST /chat endpoint that accepts user messages and returns AI responses
2. THE Sahayak_System SHALL expose a POST /check-eligibility endpoint that accepts User_Profile and returns eligible schemes
3. THE Sahayak_System SHALL expose a GET /schemes endpoint that returns all schemes with optional filtering
4. THE Sahayak_System SHALL expose a GET /service-centers endpoint that accepts district and returns service center information
5. THE Sahayak_System SHALL expose a POST /applications endpoint that creates application records
6. THE Sahayak_System SHALL return responses in JSON format with appropriate HTTP status codes

### Requirement 17: Error Handling and Resilience

**User Story:** As a citizen, I want the system to handle errors gracefully, so that I can continue using it even when problems occur.

#### Acceptance Criteria

1. WHEN an AI_Provider request fails, THE Sahayak_System SHALL retry with exponential backoff up to 3 attempts
2. IF all AI_Provider retry attempts fail, THEN THE Sahayak_System SHALL attempt the request with the fallback AI_Provider
3. WHEN a Voice_Provider fails, THE Sahayak_System SHALL display an error message and allow text input as fallback
4. WHEN a database query fails, THE Sahayak_System SHALL log the error and return a user-friendly error message
5. THE Sahayak_System SHALL maintain Chat_Session state even when individual requests fail

### Requirement 18: Local Development Setup

**User Story:** As a developer, I want to run the system locally, so that I can develop and test features efficiently.

#### Acceptance Criteria

1. THE Sahayak_System SHALL provide a package.json with all required dependencies
2. WHEN a developer runs "npm install", THE Sahayak_System SHALL install all dependencies successfully
3. WHEN a developer runs "npm run dev", THE Sahayak_System SHALL start the development server on localhost
4. THE Sahayak_System SHALL use local PostgreSQL, Redis, and JSON files when NODE_ENV is "development"
5. THE Sahayak_System SHALL provide environment variable configuration for API keys and service endpoints

### Requirement 18.5: Dual-Environment Architecture

**User Story:** As a developer and DevOps engineer, I want the same codebase to run in both local development and AWS production environments, so that I can develop locally and deploy to AWS without code changes.

#### Acceptance Criteria

1. THE Sahayak_System SHALL automatically detect the environment using NODE_ENV variable
2. WHEN NODE_ENV is "development", THE Sahayak_System SHALL use local PostgreSQL, local Redis, and local filesystem for data storage
3. WHEN NODE_ENV is "production", THE Sahayak_System SHALL use AWS RDS PostgreSQL, AWS ElastiCache Redis, and AWS S3 for data storage
4. THE Sahayak_System SHALL provide a centralized configuration manager (`backend/src/config/index.ts`) that loads environment-specific settings
5. THE Sahayak_System SHALL provide separate configuration files (`.env.local` and `.env.production`) for each environment
6. THE Sahayak_System SHALL enable SSL/TLS automatically for database and Redis connections in production
7. THE Sahayak_System SHALL use connection pooling with environment-appropriate pool sizes (5 for local, 20 for production)
8. THE Sahayak_System SHALL provide database, Redis, and data loader components that automatically adapt to the detected environment
9. THE Sahayak_System SHALL log the active environment and connection details on startup (without exposing sensitive credentials)
10. THE Sahayak_System SHALL support health check endpoints that verify connectivity to all environment-specific services

### Requirement 19: AWS Deployment Configuration

**User Story:** As a DevOps engineer, I want deployment instructions for AWS, so that I can deploy the system to production.

#### Acceptance Criteria

1. THE Sahayak_System SHALL provide infrastructure-as-code configuration for AWS services
2. THE Sahayak_System SHALL document required AWS services: Lambda, API Gateway, DynamoDB, RDS PostgreSQL, S3, ElastiCache, Bedrock
3. THE Sahayak_System SHALL provide deployment scripts for AWS Amplify or S3 with CloudFront
4. THE Sahayak_System SHALL document required IAM permissions for each service
5. THE Sahayak_System SHALL provide environment-specific configuration for development, staging, and production

### Requirement 20: Accessibility Compliance

**User Story:** As a low-literacy citizen with disabilities, I want the system to be accessible, so that I can use it independently.

#### Acceptance Criteria

1. THE Sahayak_System SHALL provide keyboard navigation for all interactive elements
2. THE Sahayak_System SHALL use high contrast colors with minimum 4.5:1 ratio for text
3. THE Sahayak_System SHALL provide text alternatives for all visual information
4. THE Sahayak_System SHALL support screen reader navigation with proper ARIA labels
5. THE Sahayak_System SHALL use simple language and avoid complex terminology in all user-facing text
