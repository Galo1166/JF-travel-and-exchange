# AWS Deployment Guide for JF Travel Backend

Complete guide to deploy Laravel 11 backend to AWS Elastic Beanstalk with RDS MySQL.

## Prerequisites

- AWS Account (https://aws.amazon.com/)
- AWS CLI installed
- EB CLI installed (`pip install awseb-cli`)
- Git configured

---

## Step 1: Set Up AWS Account & Services

### 1.1 Create AWS Account
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Complete registration and verification

### 1.2 Create IAM User (Recommended for security)
1. Go to IAM Console → Users
2. Create new user with programmatic access
3. Attach policy: `ElasticBeanstalkFullAccess`
4. Save Access Key ID and Secret Access Key

### 1.3 Install AWS CLI
```bash
# Windows with PowerShell
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Or use pip
pip install awscli
```

### 1.4 Configure AWS CLI
```bash
aws configure
# Enter:
# AWS Access Key ID: [your key]
# AWS Secret Access Key: [your secret]
# Default region: us-east-1 (or your preferred region)
# Default output format: json
```

---

## Step 2: Prepare Laravel Backend for AWS

### 2.1 Create `.ebignore` file
```bash
cd backend/jf-api
```

Create `backend/jf-api/.ebignore`:
```
node_modules/
npm-debug.log
yarn-error.log
.git
.gitignore
.env.local
.env.*.local
tests/
.vscode/
.idea/
*.log
storage/logs/
storage/framework/cache/
```

### 2.2 Update `Dockerfile` for AWS
The current Dockerfile should work. Verify it has:
```dockerfile
FROM php:8.2-fpm
WORKDIR /var/www/html
COPY . .
RUN docker-php-ext-install pdo pdo_mysql
RUN composer install
RUN php artisan storage:link
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
```

### 2.3 Create AWS-specific configuration

Create `backend/jf-api/.platform/nginx/conf.d/custom.conf`:
```nginx
client_max_body_size 20M;
```

Create `backend/jf-api/.platform/hooks/postdeploy/01_migrate.sh`:
```bash
#!/bin/bash
cd /var/app/current
php artisan migrate --force
php artisan storage:link
```

Make it executable:
```bash
chmod +x backend/jf-api/.platform/hooks/postdeploy/01_migrate.sh
```

---

## Step 3: Create RDS MySQL Database

### 3.1 Create RDS Instance
1. Go to AWS RDS Console
2. Click "Create database"
3. Select "MySQL" → "Free tier eligible" (or your preferred tier)
4. **Database name**: `jf_travel`
5. **Username**: `admin`
6. **Password**: Create strong password (save it!)
7. **Publicly accessible**: Yes (for initial setup)
8. Click "Create database"

### 3.2 Get Database Endpoint
1. Wait for DB to be "Available" (5-10 minutes)
2. Go to RDS → Databases → Your DB
3. Copy **Endpoint** (e.g., `jf-travel.xxxxx.us-east-1.rds.amazonaws.com`)
4. Copy **Port** (usually 3306)

### 3.3 Create Security Group Rule
1. Go to RDS → Your DB → VPC security groups
2. Inbound rules → Add rule
3. Type: MySQL (3306)
4. Source: Your IP or 0.0.0.0/0 (less secure but easier)

---

## Step 4: Initialize Elastic Beanstalk

### 4.1 Install EB CLI
```bash
pip install awsebcli --upgrade --user
```

### 4.2 Initialize EB Application
```bash
cd backend/jf-api
eb init -p docker "jf-travel-backend" --region us-east-1
```

When prompted:
- Select your SSH key option
- Choose `docker` platform

### 4.3 Create EB Environment
```bash
eb create jf-travel-prod --instance-type t2.micro --database
```

Or without RDS (use external RDS):
```bash
eb create jf-travel-prod --instance-type t2.micro
```

---

## Step 5: Configure Environment Variables

### 5.1 Create `.env` for Elastic Beanstalk

Create `backend/jf-api/.env.elasticbeanstalk`:
```env
APP_NAME=JFTravel
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://your-eb-domain.elasticbeanstalk.com

DB_CONNECTION=mysql
DB_HOST=jf-travel.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_DATABASE=jf_travel
DB_USERNAME=admin
DB_PASSWORD=YOUR_DB_PASSWORD

CACHE_DRIVER=array
SESSION_DRIVER=cookie
```

### 5.2 Set Environment Variables in EB Console

```bash
eb setenv \
  DB_HOST=jf-travel.xxxxx.us-east-1.rds.amazonaws.com \
  DB_PORT=3306 \
  DB_DATABASE=jf_travel \
  DB_USERNAME=admin \
  DB_PASSWORD=your_password \
  APP_ENV=production \
  APP_DEBUG=false
```

Or use EB Console:
1. Go to Elastic Beanstalk → Your app → Configuration
2. Software → Environment properties
3. Add each key-value pair

---

## Step 6: Deploy Backend

### 6.1 Generate App Key
```bash
cd backend/jf-api
php artisan key:generate
```

### 6.2 Commit Changes
```bash
git add -A
git commit -m "AWS Elastic Beanstalk deployment configuration"
```

### 6.3 Deploy to AWS
```bash
eb deploy
```

Monitor deployment:
```bash
eb logs
```

Get application URL:
```bash
eb open
```

---

## Step 7: Verify Database Connection

### 7.1 Connect to RDS
```bash
mysql -h jf-travel.xxxxx.us-east-1.rds.amazonaws.com -u admin -p

# In MySQL:
USE jf_travel;
SHOW TABLES;
```

### 7.2 Run Migrations
```bash
eb ssh
cd /var/app/current
php artisan migrate --force
php artisan storage:link
exit
```

---

## Step 8: Update Frontend `.env`

Update `frontend/.env`:
```env
VITE_API_URL=https://your-eb-domain.elasticbeanstalk.com/api
```

Rebuild and redeploy frontend to Vercel.

---

## Troubleshooting

### Issue: Deployment fails
**Solution**: Check logs
```bash
eb logs --all
```

### Issue: Database connection refused
**Solution**: 
- Verify RDS endpoint in `.env`
- Check security group allows inbound MySQL
- Verify username/password

### Issue: File permissions error
**Solution**: Add to `.platform/hooks/predeploy/01_permissions.sh`:
```bash
#!/bin/bash
chmod -R 775 /var/app/current/storage
chmod -R 775 /var/app/current/bootstrap/cache
```

### Issue: Storage directory not accessible
**Solution**: EB automatically runs:
```bash
php artisan storage:link
```

---

## Cost Estimation (Free Tier)

- **EC2 (t2.micro)**: Free for 12 months
- **RDS (db.t2.micro)**: Free for 12 months
- **Data transfer**: First 1GB free per month
- **Total**: ~$0/month (first year)

After free tier:
- EC2 t2.micro: ~$10/month
- RDS t2.micro: ~$15/month
- **Total**: ~$25/month

---

## Useful EB Commands

```bash
# View current environment
eb status

# SSH into instance
eb ssh

# View logs
eb logs

# Open application in browser
eb open

# Terminate environment
eb terminate

# View configuration
eb printenv

# Create new environment
eb create jf-travel-staging
```

---

## Next Steps

1. ✅ Create AWS account
2. ✅ Set up RDS MySQL
3. ✅ Configure Elastic Beanstalk
4. ✅ Deploy backend
5. ✅ Update frontend `.env`
6. ✅ Test API endpoints
7. ✅ Configure custom domain (optional)

---

## Custom Domain Setup (Optional)

1. Buy domain (GoDaddy, Namecheap, etc.)
2. Go to Route 53 in AWS
3. Create hosted zone
4. Update nameservers at domain registrar
5. Create CNAME record pointing to EB domain
6. Request SSL certificate from AWS Certificate Manager
7. Update EB to use custom domain

---

**Status**: Ready for AWS deployment! 🚀

For detailed documentation, visit: https://docs.aws.amazon.com/elasticbeanstalk/
