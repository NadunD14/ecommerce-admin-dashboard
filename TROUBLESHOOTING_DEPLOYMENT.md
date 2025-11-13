# Fixing GitHub Actions SSH Connection Timeout

## The Problem

The error `ssh: connect to host *** port 22: Connection timed out` occurs because **GitHub Actions runners cannot connect to your EC2 instance**. This happens because:

1. **EC2 Security Group blocks GitHub's IP ranges** - GitHub Actions use dynamic IPs from various ranges
2. **SSH port 22 is restricted** to specific IPs (like "My IP")
3. **GitHub Actions runners are outside AWS network**

---

## ✅ Solution 1: Allow GitHub Actions IP Ranges (Recommended)

### Step 1: Get GitHub Actions IP Ranges

GitHub Actions uses these IP ranges (updated periodically):
```
4.175.114.51/32
20.51.246.37/32
20.119.139.227/32
20.59.116.119/32
140.82.112.0/20
143.55.64.0/20
185.199.108.0/22
192.30.252.0/22
```

Full list: https://api.github.com/meta (look for `actions` field)

### Step 2: Update EC2 Security Group

1. Go to **AWS EC2 Console → Security Groups**
2. Find your `ec2-security-group`
3. Click **Edit inbound rules**
4. **Modify the SSH rule:**
   - Type: `SSH`
   - Port: `22`
   - Source: `0.0.0.0/0` (Anywhere) - **Temporary for testing**
   - Description: `GitHub Actions SSH access`

5. Click **Save rules**

### Step 3: Test Deployment

```powershell
# Push to trigger deployment
git add .
git commit -m "Test deployment with open SSH"
git push origin main
```

### Step 4: Restrict Access (Security Best Practice)

After confirming deployment works:

1. **Option A:** Whitelist specific GitHub IP ranges
   - Add multiple SSH rules, one for each GitHub Actions IP range
   
2. **Option B:** Use a bastion host or VPN
   - More secure but requires additional setup

---

## ✅ Solution 2: Use Self-Hosted GitHub Runner (Best for Production)

This runs the GitHub Actions workflow **directly on your EC2 instance**, eliminating SSH connection issues.

### Step 1: Install GitHub Runner on EC2

SSH to your EC2:
```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

Run these commands:
```bash
# Create a directory for the runner
mkdir -p ~/actions-runner && cd ~/actions-runner

# Download the latest runner package
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract the installer
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
```

### Step 2: Configure the Runner

1. Go to your **GitHub repository**
2. Click **Settings → Actions → Runners**
3. Click **New self-hosted runner**
4. Follow the instructions, which will give you a token

On EC2, run:
```bash
# Configure the runner (use the token from GitHub)
./config.sh --url https://github.com/NadunD14/ecommerce-admin-dashboard --token YOUR_TOKEN_HERE

# Choose:
# - Runner name: ec2-runner (or any name)
# - Runner group: Default
# - Labels: self-hosted,Linux,X64
# - Work folder: _work (default)
```

### Step 3: Install Runner as a Service

```bash
# Install as a service
sudo ./svc.sh install

# Start the service
sudo ./svc.sh start

# Check status
sudo ./svc.sh status
```

### Step 4: Update Workflow to Use Self-Hosted Runner

The workflow file `.github/workflows/deploy-self-hosted.yml` has already been created.

**To use it:**

1. **Disable the original workflow:**
   ```powershell
   # Rename original workflow to disable it
   git mv .github/workflows/deploy.yml .github/workflows/deploy.yml.disabled
   ```

2. **Activate self-hosted workflow:**
   ```powershell
   git add .
   git commit -m "Switch to self-hosted runner"
   git push origin main
   ```

### Step 5: Verify

1. Go to **GitHub → Actions**
2. You should see the runner online
3. Deployments will now run directly on your EC2

---

## ✅ Solution 3: Use AWS CodeDeploy (Alternative)

If you prefer AWS-native solutions:

1. Use AWS CodeDeploy instead of GitHub Actions
2. Configure GitHub → CodePipeline → CodeDeploy
3. More complex setup but better AWS integration

---

## ✅ Solution 4: Manual Pull Deployment (Simple Alternative)

Instead of pushing from GitHub to EC2, have EC2 pull from GitHub:

### Create a Webhook Listener on EC2

1. Create `webhook-listener.js`:
```javascript
const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.json());

app.post('/deploy', (req, res) => {
  // Verify GitHub webhook signature here (recommended)
  
  console.log('Deployment triggered');
  
  exec('cd ~/ecommerce-admin-dashboard && git pull origin main && npm install --production && pm2 restart ecommerce-admin', 
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error}`);
        return res.status(500).send('Deployment failed');
      }
      console.log(stdout);
      res.send('Deployment successful');
    }
  );
});

app.listen(3001, () => {
  console.log('Webhook listener running on port 3001');
});
```

2. Run it:
```bash
pm2 start webhook-listener.js --name webhook
```

3. Configure GitHub webhook:
   - Go to **Settings → Webhooks → Add webhook**
   - Payload URL: `http://YOUR_EC2_IP:3001/deploy`
   - Content type: `application/json`
   - Events: `Just the push event`

---

## Quick Fix Commands

### Test SSH Connection Locally

```powershell
# From your local machine
ssh -i "your-key.pem" -o ConnectTimeout=10 ubuntu@YOUR_EC2_IP "echo 'Connection successful'"
```

If this fails, the issue is with security groups, not GitHub Actions.

### Check EC2 Security Group

```bash
# List security groups
aws ec2 describe-security-groups --group-ids sg-xxxxx

# Add GitHub Actions IP range
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0
```

### Check EC2 SSH Service

```bash
# SSH to EC2
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP

# Check SSH service
sudo systemctl status ssh

# Check firewall
sudo ufw status
```

---

## Recommended Approach

**For your Free Tier project, I recommend Solution 2 (Self-Hosted Runner):**

✅ **Pros:**
- No SSH connection issues
- Runs directly on EC2
- Free (no additional costs)
- Faster deployments
- More secure (no open SSH to internet)

❌ **Cons:**
- Requires initial setup (10 minutes)
- Runner uses EC2 resources (minimal impact on t2.micro)

**Quick Setup:**
1. SSH to EC2
2. Install GitHub Actions runner (5 commands)
3. Use `deploy-self-hosted.yml` workflow
4. Done! ✅

---

## Summary

| Solution | Difficulty | Security | Speed | Cost |
|----------|-----------|----------|-------|------|
| Open SSH to 0.0.0.0/0 | Easy | ⚠️ Low | Fast | Free |
| Whitelist GitHub IPs | Medium | ⭐⭐⭐ Good | Fast | Free |
| Self-Hosted Runner | Medium | ⭐⭐⭐⭐ Best | Very Fast | Free |
| AWS CodeDeploy | Hard | ⭐⭐⭐⭐ Best | Medium | Small cost |
| Webhook Pull | Easy | ⭐⭐ OK | Fast | Free |

**Choose based on your priority:**
- **Quick fix**: Open SSH to 0.0.0.0/0 (test only!)
- **Best practice**: Self-hosted runner
- **Production**: Self-hosted runner + IP whitelisting

---

Need help with any of these solutions? Let me know which one you'd like to implement!
