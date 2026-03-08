# 🏗️ Dual-Environment Architecture Guide

## Overview

This project supports **BOTH** local development and AWS cloud production using the **same codebase**. Environment switching is automatic based on `NODE_ENV`.

## Architecture Comparison

### Local Development
```
┌─────────────────────────────────────┐
│   Developer Laptop                  │
│                                     │
│  ┌──────────────┐                  │
│  │  Node.js App │                  │
│  └──────┬───────┘                  │
│         │                           │
│    ┌────┴────┬────────┬──────┐    │
│    │         │        │      │    │
│  ┌─▼──┐  ┌──▼──┐  ┌──▼─┐  ┌─▼─┐  │
│  │ PG │  │Redis│  │JSON│  │AI │  │
│  │SQL │  │     │  │File│  │API│  │
│  └────┘  └─────┘  └────┘  └───┘  │
│                                     │
└─────────────────────────────────────┘
```

### AWS Production
```
┌──────────────────────────────────────────┐
│           AWS Cloud                      │
│                                          │
│  ┌────────────────┐                     │
│  │  API Gateway   │                     │
│  └────────┬───────┘                     │
│           │                              │
│  ┌────────▼────────┐                    │
│  │  Lambda/EC2     │                    │
│  │  (Node.js App)  │                    │
│  └────┬────┬───┬───┘                    │
│       │    │   │                         │
│   ┌───▼┐ ┌─▼──┐ ┌▼──┐                  │
│   │RDS │ │Elasti│ │S3│                  │
│   │(PG)│ │Cache│ │   │                  │
│   └────┘ └─────┘ └───┘                  │
│                                          │
└──────────────────────────────────────────┘
```

## Environment Detection

The system automatically detects the environment using `NODE_ENV`:

| Environment | NODE_ENV | Config File | Database | Cache | Data Storage |
|-------------|----------|-------------|----------|-------|--------------|
| **Local** | `development` | `.env.local` | Local PostgreSQL | Local Redis | Filesystem |
| **Production** | `production` | `.env.production` | AWS RDS | AWS ElastiCache | AWS S3 |

## File Structure

```
sahayak_ai/
├── .env.local              # Local development config
├── .env.production         # AWS production config
├── .env                    # Fallback (not committed)
├── backend/
│   └── src/
│       ├── config/
│       │   └── index.ts    # Central config loader
│       ├── db/
│       │   ├── connection.ts    # PostgreSQL manager
│       │   └── redis-client.ts  # Redis manager
│       └── utils/
│           └── data-loader.ts   # JSON loader (local/S3)
└── data/                   # Local JSON files
    ├── schemes.json
    └── service_centers.json
```

## Configuration System

### 1. Environment Files

**`.env.local` (Development)**
```env
NODE_ENV=development
PORT=3001

# Local PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sahayak_db
DB_USER=postgres
DB_PASSWORD=your_password

# Local Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Local Data
DATA_PATH=./data

# AI Keys
GEMINI_API_KEY=your_key
SARVAM_API_KEY=your_key
```

**`.env.production` (AWS)**
```env
NODE_ENV=production
PORT=3001

# AWS RDS PostgreSQL
DB_HOST=sahayak-db.xxxxx.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=sahayak_production
DB_USER=admin
DB_PASSWORD=your_rds_password

# AWS ElastiCache Redis
REDIS_HOST=sahayak-redis.xxxxx.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# AWS S3
S3_BUCKET=sahayak-data-bucket
S3_REGION=ap-south-1

# AWS Credentials
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# AI Keys
GEMINI_API_KEY=your_key
SARVAM_API_KEY=your_key
```

### 2. Config Loader (`backend/src/config/index.ts`)

Automatically loads the correct environment file:

```typescript
import { config } from './config';

// Automatically uses:
// - .env.local if NODE_ENV=development
// - .env.production if NODE_ENV=production

console.log(config.database.host); // localhost or RDS endpoint
console.log(config.redis.tls);     // false or true
console.log(config.dataStorage.type); // 'local' or 's3'
```

## Component Details

### 1. Database Connection

**File**: `backend/src/db/connection.ts`

```typescript
import { getDatabase } from './db/connection';

// Automatically connects to:
// - Local PostgreSQL (development)
// - AWS RDS (production)

const db = getDatabase();
const result = await db.query('SELECT * FROM schemes');
```

**Features**:
- SSL enabled automatically in production
- Connection pooling (5 local, 20 production)
- Auto-reconnect on failure

### 2. Redis Connection

**File**: `backend/src/db/redis-client.ts`

```typescript
import { getRedisClient } from './db/redis-client';

// Automatically connects to:
// - Local Redis (development)
// - AWS ElastiCache with TLS (production)

const redis = getRedisClient();
await redis.set('key', 'value');
```

**Features**:
- TLS enabled automatically in production
- Retry strategy with exponential backoff
- Health check support

### 3. Data Loader

**File**: `backend/src/utils/data-loader.ts`

```typescript
import { loadSchemesData, loadServiceCentersData } from './utils/data-loader';

// Automatically loads from:
// - ./data/schemes.json (development)
// - s3://sahayak-data-bucket/schemes.json (production)

const schemes = await loadSchemesData();
const centers = await loadServiceCentersData();
```

**Features**:
- Automatic source detection
- In-memory caching (5 min TTL)
- Error handling

## Running the Application

### Local Development

```bash
# Set environment
export NODE_ENV=development

# Or use npm script
npm run dev

# Backend starts with:
# - Local PostgreSQL
# - Local Redis
# - Local JSON files
```

### AWS Production

```bash
# Set environment
export NODE_ENV=production

# Start application
npm start

# Backend starts with:
# - AWS RDS
# - AWS ElastiCache
# - AWS S3
```

## AWS Setup Guide

### 1. Create RDS PostgreSQL

```bash
# AWS Console → RDS → Create Database
# - Engine: PostgreSQL 15
# - Instance: db.t3.micro (Free Tier)
# - Storage: 20 GB
# - Public Access: No
# - VPC: Default
# - Security Group: Allow port 5432 from your app

# Get endpoint:
# sahayak-db.xxxxx.ap-south-1.rds.amazonaws.com
```

### 2. Create ElastiCache Redis

```bash
# AWS Console → ElastiCache → Create Redis Cluster
# - Engine: Redis 7.x
# - Node Type: cache.t3.micro (Free Tier)
# - Number of Replicas: 0
# - Encryption: Enable TLS
# - Security Group: Allow port 6379 from your app

# Get endpoint:
# sahayak-redis.xxxxx.cache.amazonaws.com
```

### 3. Create S3 Bucket

```bash
# AWS Console → S3 → Create Bucket
# - Name: sahayak-data-bucket
# - Region: ap-south-1
# - Block Public Access: Yes
# - Versioning: Disabled

# Upload files:
aws s3 cp data/schemes.json s3://sahayak-data-bucket/
aws s3 cp data/service_centers.json s3://sahayak-data-bucket/
```

### 4. Create IAM User

```bash
# AWS Console → IAM → Users → Create User
# - Name: sahayak-app
# - Permissions:
#   - AmazonRDSFullAccess
#   - AmazonElastiCacheFullAccess
#   - AmazonS3ReadOnlyAccess

# Get credentials:
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
```

## Security Best Practices

### 1. Never Commit Credentials

```bash
# Add to .gitignore
.env
.env.local
.env.production
.env.*.local
```

### 2. Use AWS Secrets Manager (Production)

```typescript
// Instead of environment variables, use AWS Secrets Manager
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

async function getSecret(secretName: string) {
  const client = new SecretsManagerClient({ region: 'ap-south-1' });
  const response = await client.send(new GetSecretValueCommand({ SecretId: secretName }));
  return JSON.parse(response.SecretString!);
}
```

### 3. Use IAM Roles (EC2/Lambda)

```bash
# Instead of access keys, attach IAM role to EC2/Lambda
# - No credentials in code
# - Automatic credential rotation
# - Better security
```

## Cost Optimization

### Free Tier Usage

| Service | Free Tier | Monthly Cost (After Free Tier) |
|---------|-----------|-------------------------------|
| RDS (db.t3.micro) | 750 hours/month | ~$15/month |
| ElastiCache (cache.t3.micro) | 750 hours/month | ~$12/month |
| S3 | 5 GB storage | ~$0.023/GB |
| Lambda | 1M requests | ~$0.20/1M requests |

### Cost-Saving Tips

1. **Use RDS Snapshots**: Stop RDS when not in use, restore from snapshot
2. **Use S3 Intelligent-Tiering**: Automatic cost optimization
3. **Use Lambda instead of EC2**: Pay only for execution time
4. **Enable CloudWatch Alarms**: Monitor costs in real-time

## Deployment Flow

```
┌──────────────┐
│  Development │
│   (Local)    │
└──────┬───────┘
       │
       │ git push
       ▼
┌──────────────┐
│   GitHub     │
│  Repository  │
└──────┬───────┘
       │
       │ CI/CD (GitHub Actions)
       ▼
┌──────────────┐
│   Testing    │
│  Environment │
└──────┬───────┘
       │
       │ Manual Approval
       ▼
┌──────────────┐
│  Production  │
│    (AWS)     │
└──────────────┘
```

## Troubleshooting

### Issue: Cannot connect to RDS

```bash
# Check security group
# - Inbound rule: PostgreSQL (5432) from your IP/VPC
# - Outbound rule: All traffic

# Test connection
psql -h sahayak-db.xxxxx.ap-south-1.rds.amazonaws.com -U admin -d sahayak_production
```

### Issue: Cannot connect to ElastiCache

```bash
# ElastiCache is VPC-only
# - Must be in same VPC as your app
# - Cannot connect from local machine
# - Use EC2 bastion host for testing

# Test from EC2
redis-cli -h sahayak-redis.xxxxx.cache.amazonaws.com --tls
```

### Issue: Cannot read from S3

```bash
# Check IAM permissions
# - s3:GetObject on sahayak-data-bucket/*

# Test with AWS CLI
aws s3 cp s3://sahayak-data-bucket/schemes.json -
```

## Next Steps

1. ✅ Set up local PostgreSQL and Redis
2. ✅ Test application locally
3. ⬜ Create AWS resources (RDS, ElastiCache, S3)
4. ⬜ Update `.env.production` with AWS endpoints
5. ⬜ Deploy to AWS (EC2/Lambda)
6. ⬜ Test production environment
7. ⬜ Set up monitoring (CloudWatch)
8. ⬜ Configure auto-scaling

## Support

For issues or questions:
- Check logs: `console.log` shows which environment is active
- Verify config: `config.env`, `config.database.host`, etc.
- Test connections: Use health check endpoints
