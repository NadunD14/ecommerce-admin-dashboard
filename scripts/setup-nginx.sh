#!/bin/bash

# Nginx Configuration Script
# Sets up reverse proxy for the Node.js application

set -e

echo "🔧 Configuring Nginx reverse proxy..."

# Create Nginx configuration
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

# Enable the site
sudo ln -sf /etc/nginx/sites-available/ecommerce-admin /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx on boot
sudo systemctl enable nginx

echo "✅ Nginx configured successfully!"
echo "Your app is now accessible at http://YOUR_EC2_PUBLIC_IP"
