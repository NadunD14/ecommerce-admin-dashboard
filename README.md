# E-Commerce Admin Dashboard

A full-featured e-commerce admin dashboard built with Node.js, Express, PostgreSQL, Sequelize, and AdminJS. It includes JWT authentication, role-based access control (RBAC), AdminJS web UI, and a REST API.

## Features

- Full CRUD for all resources (Users, Categories, Products, Orders, OrderItems, Settings)
- AdminJS web interface at /admin with authentication
- JWT-based login via /api/login and token verification via /api/verify
- Role-based access control: Admin vs Regular user
- Password hashing with bcrypt
- PostgreSQL database with Sequelize ORM
- CORS enabled for browser requests
- Environment-based configuration via .env

## Tech Stack

- Node.js, Express 4.x
- AdminJS 7.x, @adminjs/express
- Sequelize ORM + PostgreSQL
- JWT (jsonwebtoken) + bcrypt

## Folder Structure

```
ecommerce-admin-dashboard/
├── .env                      # Environment variables (not committed)
├── .gitignore
├── package.json
├── server.js                 # App entrypoint (Express + AdminJS)
└── src/
    ├── config/
    │   ├── admin.js         # AdminJS configuration (resources, RBAC, dashboard)
    │   └── database.js      # Sequelize connection
    ├── controllers/
    │   └── authcontroller.js# Login + token verify
    ├── middleware/
    │   ├── authMiddleware.js# JWT verification
    │   └── roleMiddleware.js# Role-based access
    └── models/
        ├── inedx.js         # Model associations (typo kept)
        ├── User.js
        ├── Category.js
        ├── Product.js
        ├── Order.js
        ├── OrderItem.js
        └── Setting.js
```

## Prerequisites

- Node.js 16+
- PostgreSQL 12+
- Git and npm

## Setup: Clone and Run

### 1) Clone

```powershell
git clone https://github.com/NadunD14/ecommerce-admin-dashboard.git
cd ecommerce-admin-dashboard
```

### 2) Install dependencies

```powershell
npm install
```

### 3) Create PostgreSQL database

Connect to PostgreSQL and create the database:

```sql
CREATE DATABASE ecommerce_db;
```

### 4) Create .env

Create a file named .env in the project root:

```env
# Database
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASS=your_postgres_password
DB_HOST=localhost
DB_DIALECT=postgres

# App
PORT=3000
JWT_SECRET=your_very_strong_secret_key_here
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=securepassword123
```

### 5) Run

```powershell
# Development (auto-restart)
npm run dev

# or Production
npm start
```

When the server starts, it will:
- Sync the database schema
- Create the default admin user if it doesn't exist
- Print the AdminJS URL

## Access URLs

- API root: http://localhost:3000/
- AdminJS: http://localhost:3000/admin
- Login API: POST http://localhost:3000/api/login

### Default Admin Login

- Email: admin@example.com
- Password: securepassword123

Important: Change these credentials in production.

## API Usage (PowerShell)

### Login

```powershell
$body = @{ email = "admin@example.com"; password = "securepassword123" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "Token: $token"
```

### Authenticated request

```powershell
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3000/api/verify" -Headers $headers
```

## API Endpoints

### Public
- POST /api/login — Login with email and password, returns JWT token

### Protected (JWT)
- GET /api/verify — Verify JWT token validity
- GET /api/admin/stats — Admin statistics (admin role only)

## Database Models

1. User — User accounts with role-based access (admin/regular)
2. Category — Product categories
3. Product — Products with pricing, stock, and category relation
4. Order — Customer orders with status tracking
5. OrderItem — Individual items within orders
6. Setting — Application settings (admin-only)

### Relationships

- Product belongs to Category
- Order belongs to User
- OrderItem belongs to Order
- OrderItem belongs to Product

## Role-Based Access (AdminJS)

### Admin
- Full access to all resources
- Can manage users and settings
- Custom dashboard with system statistics

### Regular User
- Can access products, categories, orders, and order items
- Cannot access users or settings
- Limited dashboard view

## Troubleshooting

- AdminJS assets show "Unexpected token '<'": Ensure Express 4.x and no server errors
- Login hangs in browser: CORS is enabled globally; check request URL/headers
- DB auth fails: Verify DB_PASS in .env and that PostgreSQL is running
- Port already in use: Change PORT in .env or stop the process using that port

## AWS Deployment (EC2 + RDS) — Summary

1) Create RDS PostgreSQL (Free Tier), note endpoint and credentials
2) Launch EC2 Ubuntu (Free Tier), install Node.js, Git, PM2
3) Clone repo, npm install, create .env with RDS values
4) Start with PM2: pm2 start server.js --name "ecommerce-admin"; pm2 save
5) Optional: Nginx reverse proxy and Let's Encrypt SSL

Detailed step-by-step commands are included later in this README under “AWS Deployment Guide”.

## Development

Run in development mode:

```powershell
npm run dev
```

Database sync on startup:

```javascript
sequelize.sync({ alter: true })
```

## License

ISC

---

## AWS Deployment Guide (EC2 + RDS)

### Step 1: RDS PostgreSQL
- Engine: PostgreSQL, Free Tier template, db.t3.micro, ~20GB storage
- Create DB ecommerce_db; note endpoint, username, password
- Security group: allow inbound 5432 from your EC2 security group

### Step 2: EC2 Instance
- Launch Ubuntu 22.04 LTS, t2.micro, your key pair
- Open ports: 22 (SSH from your IP), 80 (HTTP), 3000 (optional for testing)

### Step 3: Connect and Install

```powershell
ssh -i "path\to\your-key.pem" ubuntu@<EC2-Public-IP>
```

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git
sudo npm install -g pm2
```

### Step 4: Deploy App

```bash
git clone https://github.com/NadunD14/ecommerce-admin-dashboard.git
cd ecommerce-admin-dashboard
npm install
```

Create .env with your RDS values:

```env
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASS=your_rds_master_password
DB_HOST=ecommerce-db.xxxxx.us-east-1.rds.amazonaws.com
DB_DIALECT=postgres
PORT=3000
JWT_SECRET=your_very_strong_secret_key_change_this
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=strong_admin_password_change_this
```

Start with PM2:

```bash
pm2 start server.js --name "ecommerce-admin"
pm2 save
pm2 status
```

### Optional: Nginx Reverse Proxy

```bash
sudo apt install nginx -y
sudo tee /etc/nginx/sites-available/ecommerce-admin > /dev/null <<'NGINX'
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

sudo ln -s /etc/nginx/sites-available/ecommerce-admin /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

### Optional: SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Maintenance

```bash
pm2 logs ecommerce-admin
pm2 restart ecommerce-admin
cd ~/ecommerce-admin-dashboard && git pull origin main && npm install && pm2 restart ecommerce-admin
```

## Contributing

1. Fork the repository
2. Create your feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m "Add some amazing feature")
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

---

Need help? Open an issue on GitHub: https://github.com/NadunD14/ecommerce-admin-dashboard/issues
