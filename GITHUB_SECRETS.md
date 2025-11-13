# GitHub Secrets Configuration

This file lists all the secrets you need to add to your GitHub repository for automated deployment.

## How to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below

---

## Required Secrets

### EC2 Connection

**EC2_SSH_KEY**
```
Your EC2 private key (.pem file) content
Include the entire file from:
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

**EC2_HOST**
```
Your EC2 public IP address
Example: 54.123.456.78
```

**EC2_USER**
```
ubuntu
```

---

### Database Configuration

**DB_NAME**
```
ecommerce_db
```

**DB_USER**
```
postgres
```

**DB_PASS**
```
Your RDS master password
```

**DB_HOST**
```
Your RDS endpoint
Example: ecommerce-db.xxxxx.us-east-1.rds.amazonaws.com
```

---

### Application Configuration

**JWT_SECRET**
```
A strong random string (minimum 32 characters)
Example: your-super-secret-jwt-key-change-this-to-something-random
```

**ADMIN_EMAIL**
```
admin@yourdomain.com
```

**ADMIN_PASSWORD**
```
A strong password for the admin user
Example: SecurePassword123!
```

---

## Quick Copy Template

```
EC2_SSH_KEY=<paste your .pem file content>
EC2_HOST=<your EC2 IP>
EC2_USER=ubuntu
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASS=<your RDS password>
DB_HOST=<your RDS endpoint>
JWT_SECRET=<random 32+ char string>
ADMIN_EMAIL=<your admin email>
ADMIN_PASSWORD=<your admin password>
```

---

## Security Notes

- Never commit these secrets to your repository
- Never share your private key (.pem file)
- Use strong passwords (12+ characters, mixed case, numbers, symbols)
- Rotate credentials regularly
- GitHub Secrets are encrypted and only exposed during workflow runs
