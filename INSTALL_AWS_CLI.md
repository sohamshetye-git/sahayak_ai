# Install AWS CLI on Windows

## Quick Installation

### Option 1: MSI Installer (Recommended)
1. Download: https://awscli.amazonaws.com/AWSCLIV2.msi
2. Run the installer
3. Follow the installation wizard
4. Restart your terminal/PowerShell

### Option 2: Command Line (if you have winget)
```powershell
winget install Amazon.AWSCLI
```

### Option 3: Chocolatey (if installed)
```powershell
choco install awscli
```

## Verify Installation
```powershell
aws --version
```

Should output: `aws-cli/2.x.x Python/3.x.x Windows/...`

## Configure AWS Credentials
```powershell
aws configure
```

You'll be prompted for:
- AWS Access Key ID: [Your access key]
- AWS Secret Access Key: [Your secret key]
- Default region name: ap-south-1
- Default output format: json

## Test Configuration
```powershell
aws sts get-caller-identity
```

Should return your AWS account details.

## Next Steps
After AWS CLI is installed and configured, run:
```powershell
.\deploy-to-s3.ps1
```
