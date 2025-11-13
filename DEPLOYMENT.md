# AWS Free Tier Deployment with GitHub Actions

This guide walks you through deploying the E-Commerce Admin Dashboard to AWS Free Tier using automated GitHub Actions workflows.

## 📋 Prerequisites

- AWS Account (Free Tier eligible)
- GitHub Account
- Git installed locally
- Basic knowledge of SSH and command line

## 🎯 Deployment Overview

The deployment uses:
- **AWS RDS PostgreSQL** (db.t3.micro - Free Tier)
- **AWS EC2** (t2.micro Ubuntu - Free Tier)
- **GitHub Actions** for automated deployment
- **PM2** for process management
- **Nginx** as reverse proxy (optional)

---

## 📦 Part 1: Set Up AWS RDS (PostgreSQL Database)

### Step 1: Create RDS Instance

1. Go to [AWS RDS Console](https://console.aws.amazon.com/rds/)
2. Click **Create database**
3. Choose these settings:

   **Engine options:**
   - Engine type: `PostgreSQL`
   - Version: Latest (e.g., PostgreSQL 15.x)

   **Templates:**
   - Select `Free tier`

   **Settings:**
   - DB instance identifier: `ecommerce-db`
   - Master username: `postgres`
   - Master password: Create a strong password (save this!)

   **DB instance class:**
   - `db.t3.micro` (Free Tier eligible)

   **Storage:**
   - Allocated storage: `20 GB` (Free Tier limit)
   - Storage type: `General Purpose SSD (gp2)`
   - Disable `Enable storage autoscaling`

   **Connectivity:**
   - Public access: `Yes` (for easier setup; restrict later)
   - VPC security group: Create new → Name it `rds-security-group`

   **Additional configuration:**
   - Initial database name: `ecommerce_db`

4. Click **Create database**
5. Wait 5-10 minutes for provisioning

### Step 2: Note RDS Details

Once created, go to your RDS instance and note:
- **Endpoint** (e.g., `ecommerce-db.xxxxx.us-east-1.rds.amazonaws.com`)
- **Port** (default: 5432)
- **Master username** (postgres)
- **Master password** (you created this)
- **Database name** (ecommerce_db)

### Step 3: Configure RDS Security Group

1. Go to **EC2 Console → Security Groups**
2. Find `rds-security-group`
3. Click **Edit inbound rules**
4. We'll add the EC2 security group later (after creating EC2)

---

## 🖥️ Part 2: Set Up AWS EC2 (Application Server)

### Step 1: Launch EC2 Instance

1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Click **Launch Instance**
3. Configure:

   **Name and tags:**
   - Name: `ecommerce-admin-server`

   **Application and OS Images:**
   - AMI: `Ubuntu Server 22.04 LTS (HVM), SSD Volume Type`
   - Architecture: `64-bit (x86)`

   **Instance type:**
   - `t2.micro` (Free Tier eligible)

   **Key pair:**
   - Click **Create new key pair**
   - Name: `ecommerce-admin-key`
   - Key pair type: `RSA`
   - Private key format: `.pem` (for OpenSSH)
   - Click **Create key pair**
   - **Download and save the .pem file securely**

   **Network settings:**
   - Click **Edit**
   - Auto-assign public IP: `Enable`
   - Create security group:
     - Name: `ec2-security-group`
     - Description: `Security group for ecommerce admin server`
     - Add these rules:
       - **SSH**: Port 22, Source: `My IP` (your current IP)
       - **HTTP**: Port 80, Source: `0.0.0.0/0` (anywhere)
       - **Custom TCP**: Port 3000, Source: `0.0.0.0/0` (for testing; remove after Nginx setup)

   **Configure storage:**
   - 8 GB gp2 (default is fine for Free Tier)

4. Click **Launch instance**
5. Wait for instance state to be **Running**

### Step 2: Note EC2 Details

Once running, note:
- **Public IPv4 address** (e.g., `54.123.456.78`)
- **Public IPv4 DNS** (e.g., `ec2-54-123-456-78.compute-1.amazonaws.com`)
- **Instance ID**
- **Security group ID** (for RDS access)

### Step 3: Update RDS Security Group

Now link EC2 to RDS:

1. Go back to **EC2 Console → Security Groups**
2. Find `rds-security-group` (your RDS security group)
3. Click **Edit inbound rules**
4. Add rule:
   - Type: `PostgreSQL`
   - Port: `5432`
   - Source: Select the `ec2-security-group` security group ID
5. Click **Save rules**

---

## 🔧 Part 3: Set Up EC2 Instance

### Step 1: Connect to EC2

Using PowerShell:

```powershell
# Navigate to where you saved the .pem file
cd C:\path\to\your\key

# Connect to EC2
ssh -i "ecommerce-admin-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

Replace `YOUR_EC2_PUBLIC_IP` with your actual EC2 public IP.

If you get a permissions error on Windows, use Git Bash or WSL.

### Step 2: Run Initial Setup Script

Once connected to EC2:

```bash
# Download and run the setup script
curl -O https://raw.githubusercontent.com/NadunD14/ecommerce-admin-dashboard/main/scripts/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh
```

This script installs:
- Node.js 18.x
- Git
- PM2 (process manager)
- Nginx (reverse proxy)

**Note:** When PM2 asks you to run the startup command, copy and run it:
```bash
# Example (your command will be different):
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### Step 3: Test Connection to RDS

While still on EC2:

```bash
# Install PostgreSQL client
sudo apt install postgresql-client -y

# Test connection (replace with your RDS endpoint)
psql -h ecommerce-db.xxxxx.us-east-1.rds.amazonaws.com -U postgres -d ecommerce_db
# Enter your RDS master password when prompted
# If connected successfully, type \q to quit
```

### Step 4: Setup Nginx (Optional but Recommended)

```bash
# Download and run the Nginx setup script
curl -O https://raw.githubusercontent.com/NadunD14/ecommerce-admin-dashboard/main/scripts/setup-nginx.sh
chmod +x setup-nginx.sh
./setup-nginx.sh
```

This configures Nginx as a reverse proxy on port 80.

---

## 🔐 Part 4: Configure GitHub Secrets

### Step 1: Get Your Private Key Content

On your local machine (PowerShell):

```powershell
# Display your EC2 private key
Get-Content "C:\path\to\your\ecommerce-admin-key.pem"
```

Copy the entire output (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`).

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets one by one:

| Secret Name | Value | Example |
|------------|-------|---------|
| `EC2_SSH_KEY` | Your private key content (from .pem file) | -----BEGIN RSA PRIVATE KEY-----<br/>MIIEp... |
| `EC2_HOST` | Your EC2 public IP or DNS | `54.123.456.78` |
| `EC2_USER` | EC2 username | `ubuntu` |
| `DB_NAME` | Database name | `ecommerce_db` |
| `DB_USER` | Database username | `postgres` |
| `DB_PASS` | Database password | Your RDS master password |
| `DB_HOST` | RDS endpoint | `ecommerce-db.xxxxx.us-east-1.rds.amazonaws.com` |
| `JWT_SECRET` | Random secret key | `your-super-secret-jwt-key-min-32-chars` |
| `ADMIN_EMAIL` | Admin email | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | Admin password | `SecurePassword123!` |

**Important:** Keep these secrets secure and never commit them to your repository!

---

## 🚀 Part 5: Deploy with GitHub Actions

### Workflow File Already Created

The workflow file `.github/workflows/deploy.yml` is already in your repository and will:
1. Trigger on every push to `main` branch
2. Install dependencies
3. Create .env file from secrets
4. Copy files to EC2 via SCP
5. Install packages and restart PM2 on EC2

### First Deployment

1. Commit and push all changes:

```powershell
git add .
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

2. Go to your GitHub repository → **Actions** tab
3. You should see the workflow running
4. Wait for it to complete (usually 2-3 minutes)

### Check Deployment Status

Connect to your EC2:

```bash
ssh -i "ecommerce-admin-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP

# Check PM2 status
pm2 status

# Check application logs
pm2 logs ecommerce-admin

# Check if app is running
curl http://localhost:3000
```

---

## 🌐 Part 6: Access Your Application

### If Using Nginx (Port 80)

Open your browser:
- **Main app**: `http://YOUR_EC2_PUBLIC_IP`
- **AdminJS**: `http://YOUR_EC2_PUBLIC_IP/admin`

### If Not Using Nginx (Port 3000)

- **Main app**: `http://YOUR_EC2_PUBLIC_IP:3000`
- **AdminJS**: `http://YOUR_EC2_PUBLIC_IP:3000/admin`

### Login Credentials

Use the credentials you set in GitHub Secrets:
- Email: Value of `ADMIN_EMAIL` secret
- Password: Value of `ADMIN_PASSWORD` secret

---

## 🔄 Subsequent Deployments

Every time you push to `main` branch:
1. GitHub Actions automatically triggers
2. Code is deployed to EC2
3. PM2 restarts the application
4. Zero downtime deployment!

Just commit and push:

```powershell
git add .
git commit -m "Your changes"
git push origin main
```

---

## 🛠️ Useful Commands

### On EC2 (via SSH)

```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs ecommerce-admin

# Restart application
pm2 restart ecommerce-admin

# Stop application
pm2 stop ecommerce-admin

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx

# Manual deployment (if GitHub Actions fails)
cd ~/ecommerce-admin-dashboard
git pull origin main
npm install --production
pm2 restart ecommerce-admin
```

---

## 🔒 Security Best Practices

### After Initial Setup

1. **Restrict SSH access:**
   - Edit EC2 security group
   - Change SSH source from "My IP" to only your static IP

2. **Remove port 3000 access:**
   - Once Nginx is working, remove the Custom TCP rule for port 3000
   - App should only be accessible through Nginx (port 80)

3. **Set up SSL/HTTPS:**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx -y
   
   # Get SSL certificate (requires a domain name)
   sudo certbot --nginx -d yourdomain.com
   ```

4. **Enable AWS CloudWatch:**
   - Set up monitoring for EC2 and RDS
   - Create alarms for high CPU/memory usage

5. **Enable RDS backups:**
   - Go to RDS Console → Modify database
   - Set backup retention period to 7 days

6. **Rotate credentials:**
   - Change `ADMIN_PASSWORD` regularly
   - Update GitHub Secret after changing

7. **Monitor costs:**
   - Set up AWS Billing Alerts
   - Free Tier limits:
     - EC2: 750 hours/month (1 t2.micro instance)
     - RDS: 750 hours/month (1 db.t3.micro instance)
     - Storage: 20 GB
     - Data transfer: 15 GB/month

---

## 🐛 Troubleshooting

### Deployment Fails in GitHub Actions

**Check logs:**
1. Go to GitHub → Actions tab
2. Click on the failed workflow run
3. Expand each step to see errors

**Common issues:**
- **SSH connection fails**: Check `EC2_SSH_KEY` secret is correctly formatted
- **SCP fails**: Ensure EC2 security group allows SSH (port 22)
- **PM2 not found**: Run `setup-ec2.sh` script on EC2

### Application Won't Start

```bash
# SSH to EC2
ssh -i "ecommerce-admin-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP

# Check PM2 logs
pm2 logs ecommerce-admin --lines 50

# Check if .env exists
cat ~/ecommerce-admin-dashboard/.env

# Try starting manually
cd ~/ecommerce-admin-dashboard
npm install
node server.js
```

### Database Connection Error

```bash
# Test RDS connection
psql -h YOUR_RDS_ENDPOINT -U postgres -d ecommerce_db

# If fails, check:
# 1. RDS security group allows EC2 security group
# 2. RDS is publicly accessible
# 3. Credentials in GitHub Secrets are correct
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running
pm2 status

# Check if app is listening on port 3000
curl http://localhost:3000

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart both
pm2 restart ecommerce-admin
sudo systemctl restart nginx
```

### GitHub Actions: Permission Denied (publickey)

**Fix:**
1. Go to GitHub Secrets
2. Edit `EC2_SSH_KEY`
3. Make sure you copied the **entire** .pem file content including:
   ```
   -----BEGIN RSA PRIVATE KEY-----
   ...all the content...
   -----END RSA PRIVATE KEY-----
   ```

---

## 💰 Cost Estimation

### Free Tier (First 12 Months)
- **EC2 t2.micro**: 750 hours/month FREE
- **RDS db.t3.micro**: 750 hours/month FREE
- **Storage**: 20 GB FREE
- **Data transfer**: 15 GB/month FREE

**Total: $0/month** (within Free Tier limits)

### After Free Tier
- **EC2 t2.micro**: ~$8-10/month
- **RDS db.t3.micro**: ~$15-17/month
- **Data transfer**: ~$1-5/month (varies)

**Total: ~$25-32/month**

### Cost Optimization Tips
- Stop EC2 when not in use (only pay for hours used)
- Use RDS snapshots instead of keeping DB running 24/7
- Delete old snapshots regularly
- Monitor with AWS Cost Explorer

---

## 📚 Additional Resources

- [AWS Free Tier](https://aws.amazon.com/free/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 🎉 Success!

You now have:
- ✅ Fully automated CI/CD pipeline
- ✅ AWS Free Tier deployment
- ✅ PostgreSQL database on RDS
- ✅ Node.js application on EC2
- ✅ PM2 process management
- ✅ Nginx reverse proxy
- ✅ Zero-downtime deployments

Every push to `main` branch automatically deploys to your AWS server!

---

**Need Help?** Open an issue on [GitHub](https://github.com/NadunD14/ecommerce-admin-dashboard/issues)
