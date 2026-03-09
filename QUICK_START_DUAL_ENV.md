# 🚀 Quick Start: Dual-Environment Setup

## 5-Minute Local Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Set Up Local PostgreSQL

```bash
# Install PostgreSQL (if not installed)
# Windows: Download from postgresql.org
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql

# Create database
createdb sahayak_db

# Or using psql
psql -U postgres
CREATE DATABASE sahayak_db;
\q
```

### Step 3: Set Up Local Redis

```bash
# Install Redis (if not installed)
# Windows: Download from redis.io or use WSL
# Mac: brew install redis
# Linux: sudo apt-get install redis-server

# Start Redis
redis-server

# Test Redis
redis-cli ping
# Should return: PONG
```

### Step 4: Configure Environment

```bash
# Copy .env.local to .env
cp .env.local .env

# Edit .env with your local credentials
# DB_PASSWORD=your_local_postgres_password
# GEMINI_API_KEY=your_gemini_key
# SARVAM_API_KEY=your_sarvam_key
```

### Step 5: Run Application

```bash
# Development mode (uses .env.local automatically)
npm run dev

# You should see:
# ✓ Database connected: localhost:5432/sahayak_db
# ✓ Redis client connected: localhost:6379 (TLS: false)
# ✓ Local server running on http://localhost:3001
```

## AWS Production Setup (30 Minutes)

### Step 1: Create AWS Resources

#### 1.1 RDS PostgreSQL

```bash
# AWS Console → RDS → Create Database
# Settings:
# - Engine: PostgreSQL 15
# - Template: Free tier
# - DB instance identifier: sahayak-db
# - Master username: admin
# - Master password: [create strong password]
# - DB instance class: db.t3.micro
# - Storage: 20 GB
# - Public access: No (if using EC2) or Yes (if using Lambda)
# - VPC security group: Create new → Allow PostgreSQL (5432)

# Wait 5-10 minutes for creation
# Copy endpoint: sahayak-db.xxxxx.ap-south-1.rds.amazonaws.com
```

#### 1.2 ElastiCache Redis

```bash
# AWS Console → ElastiCache → Create Redis cluster
# Settings:
# - Cluster mode: Disabled
# - Name: sahayak-redis
# - Engine version: 7.0
# - Node type: cache.t3.micro
# - Number of replicas: 0
# - Subnet group: Create new
# - Security group: Create new → Allow Redis (6379)
# - Encryption in-transit: Enabled
# - Encryption at-rest: Enabled

# Wait 5-10 minutes for creation
# Copy endpoint: sahayak-redis.xxxxx.cache.amazonaws.com
```

#### 1.3 S3 Bucket

```bash
# AWS Console → S3 → Create bucket
# Settings:
# - Bucket name: sahayak-data-bucket-[your-unique-id]
# - Region: ap-south-1
# - Block all public access: Yes
# - Versioning: Disabled
# - Encryption: Enabled (SSE-S3)

# Upload data files
aws s3 cp data/schemes.json s3://sahayak-data-bucket/
aws s3 cp data/service_centers.json s3://sahayak-data-bucket/

# Or use AWS Console → Upload
```

#### 1.4 IAM User

```bash
# AWS Console → IAM → Users → Create user
# Settings:
# - User name: sahayak-app
# - Access type: Programmatic access
# - Permissions: Attach policies directly
#   - AmazonRDSFullAccess
#   - AmazonElastiCacheFullAccess
#   - AmazonS3ReadOnlyAccess

# Save credentials:
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
```

### Step 2: Configure Production Environment

```bash
# Edit .env.production
NODE_ENV=production

# RDS
DB_HOST=sahayak-db.xxxxx.ap-south-1.rds.amazonaws.com
DB_PASSWORD=[your RDS password]

# ElastiCache
REDIS_HOST=sahayak-redis.xxxxx.cache.amazonaws.com
REDIS_PASSWORD=[if you set one]

# S3
S3_BUCKET=sahayak-data-bucket
S3_REGION=ap-south-1

# AWS
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=[your access key]
AWS_SECRET_ACCESS_KEY=[your secret key]
```

### Step 3: Deploy to AWS

#### Option A: EC2 Deployment

```bash
# 1. Launch EC2 instance
# AWS Console → EC2 → Launch Instance
# - AMI: Amazon Linux 2023
# - Instance type: t2.micro (Free tier)
# - Key pair: Create new or use existing
# - Security group: Allow SSH (22), HTTP (80), Custom TCP (3001)

# 2. Connect to EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# 3. Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

# 4. Clone repository
git clone https://github.com/your-repo/sahayak-ai.git
cd sahayak-ai/backend

# 5. Install dependencies
npm install

# 6. Copy production environment
cp .env.production .env

# 7. Start application
NODE_ENV=production npm start

# 8. Use PM2 for process management
npm install -g pm2
pm2 start npm --name "sahayak-backend" -- start
pm2 save
pm2 startup
```

#### Option B: Lambda Deployment

```bash
# 1. Install Serverless Framework
npm install -g serverless

# 2. Create serverless.yml
cat > serverless.yml << EOF
service: sahayak-backend

provider:
  name: aws
  runtime: nodejs18.x
  region: ap-south-1
  environment:
    NODE_ENV: production
    DB_HOST: \${env:DB_HOST}
    DB_PASSWORD: \${env:DB_PASSWORD}
    REDIS_HOST: \${env:REDIS_HOST}
    S3_BUCKET: \${env:S3_BUCKET}

functions:
  api:
    handler: dist/lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
EOF

# 3. Deploy
serverless deploy
```

### Step 4: Test Production

```bash
# Test database connection
curl https://your-api-endpoint/health

# Test API
curl https://your-api-endpoint/api/schemes

# Check logs
# EC2: tail -f logs/app.log
# Lambda: AWS Console → CloudWatch → Log groups
```

## Verification Checklist

### Local Development ✓

- [ ] PostgreSQL running on localhost:5432
- [ ] Redis running on localhost:6379
- [ ] Backend starts without errors
- [ ] Can access http://localhost:3001/api/schemes
- [ ] Logs show: "Database connected: localhost:5432"
- [ ] Logs show: "Redis client connected: localhost:6379 (TLS: false)"

### AWS Production ✓

- [ ] RDS instance status: Available
- [ ] ElastiCache cluster status: Available
- [ ] S3 bucket contains schemes.json and service_centers.json
- [ ] IAM user has correct permissions
- [ ] Backend starts without errors
- [ ] Can access production API endpoint
- [ ] Logs show: "Database connected: [RDS endpoint]"
- [ ] Logs show: "Redis client connected: [ElastiCache endpoint] (TLS: true)"

## Common Issues & Solutions

### Issue: "Cannot connect to database"

```bash
# Local:
# - Check PostgreSQL is running: pg_isready
# - Check credentials in .env
# - Check database exists: psql -l

# AWS:
# - Check RDS security group allows inbound on port 5432
# - Check VPC settings if using private subnet
# - Test connection: psql -h [RDS endpoint] -U admin -d sahayak_production
```

### Issue: "Redis connection failed"

```bash
# Local:
# - Check Redis is running: redis-cli ping
# - Check port 6379 is not blocked

# AWS:
# - ElastiCache is VPC-only, cannot connect from outside
# - Check security group allows inbound on port 6379
# - Must be in same VPC as your application
```

### Issue: "Cannot load data from S3"

```bash
# Check IAM permissions
aws s3 ls s3://sahayak-data-bucket/

# Check bucket policy
# AWS Console → S3 → Bucket → Permissions

# Check files exist
aws s3 ls s3://sahayak-data-bucket/ --recursive
```

## Cost Estimate

### Free Tier (First 12 Months)

- RDS db.t3.micro: 750 hours/month = **FREE**
- ElastiCache cache.t3.micro: 750 hours/month = **FREE**
- S3: 5 GB storage = **FREE**
- Lambda: 1M requests = **FREE**

**Total: $0/month** (within free tier limits)

### After Free Tier

- RDS db.t3.micro: ~$15/month
- ElastiCache cache.t3.micro: ~$12/month
- S3: ~$0.10/month (for 5 GB)
- Lambda: ~$0.20/month (for 100K requests)

**Total: ~$27/month**

## Next Steps

1. ✅ Complete local setup
2. ✅ Test all features locally
3. ⬜ Create AWS resources
4. ⬜ Deploy to AWS
5. ⬜ Set up monitoring (CloudWatch)
6. ⬜ Configure CI/CD (GitHub Actions)
7. ⬜ Set up domain and SSL (Route 53 + ACM)

## Support

Need help? Check:
- Full documentation: `DUAL_ENVIRONMENT_ARCHITECTURE.md`
- AWS documentation: https://docs.aws.amazon.com
- Troubleshooting: See "Common Issues" section above
