# Quick Fix: GitHub Actions SSH Timeout

## Your Current Error
```
ssh: connect to host *** port 22: Connection timed out
```

## The Problem
Your EC2 security group is blocking GitHub Actions from connecting via SSH.

## ✅ Quick Fix (5 minutes)

### Step 1: Open SSH Port to GitHub Actions

1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Click **Security Groups** in the left menu
3. Find and click your `ec2-security-group`
4. Click **Edit inbound rules**
5. Find the **SSH (Port 22)** rule
6. Click **Edit** on that rule
7. Change **Source** from "My IP" to **`0.0.0.0/0`** (Anywhere)
8. Click **Save rules**

### Step 2: Retry Deployment

```powershell
# Just push again to trigger deployment
git add .
git commit -m "Retry deployment after fixing security group"
git push origin main
```

### Step 3: Check GitHub Actions

1. Go to your GitHub repository
2. Click **Actions** tab
3. Watch the deployment run
4. It should succeed now! ✅

---

## 🔒 Security Note

Opening SSH to `0.0.0.0/0` allows anyone to attempt SSH connections. However:
- ✅ They still need your private key (which is secure in GitHub Secrets)
- ✅ AWS will block brute-force attempts
- ⚠️ For production, use a better solution (see below)

---

## 🎯 Better Solutions (After You Get It Working)

### Option 1: Self-Hosted GitHub Runner (Recommended)

**Pros:** More secure, faster, no SSH needed
**Setup time:** 10 minutes

See `TROUBLESHOOTING_DEPLOYMENT.md` → Solution 2

Quick commands:
```bash
# On EC2
mkdir -p ~/actions-runner && cd ~/actions-runner
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
./config.sh --url https://github.com/NadunD14/ecommerce-admin-dashboard --token YOUR_TOKEN
sudo ./svc.sh install && sudo ./svc.sh start
```

Then use `.github/workflows/deploy-self-hosted.yml` instead.

### Option 2: Whitelist GitHub IP Ranges

**Pros:** More secure than 0.0.0.0/0
**Cons:** GitHub IPs can change

Add these IP ranges to your security group (instead of 0.0.0.0/0):
```
140.82.112.0/20
143.55.64.0/20
185.199.108.0/22
192.30.252.0/22
```

---

## 🧪 Test Commands

### Test SSH from your machine (should work):
```powershell
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP "echo 'Connected!'"
```

### Check EC2 security group (AWS CLI):
```powershell
aws ec2 describe-security-groups --group-ids sg-YOUR_GROUP_ID
```

---

## Summary

1. ✅ Open SSH to 0.0.0.0/0 in EC2 security group
2. ✅ Push to GitHub to retry deployment
3. ✅ Verify it works
4. 🔒 Optional: Upgrade to self-hosted runner for better security

**Estimated time to fix:** 5 minutes

Good luck! 🚀
