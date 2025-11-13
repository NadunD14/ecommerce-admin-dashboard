#!/bin/bash

# AWS EC2 Initial Setup Script
# Run this script once on your EC2 instance to prepare it for deployments

set -e

echo "🚀 Starting EC2 initial setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
echo "📦 Installing Git..."
sudo apt install git -y

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
echo "📦 Installing Nginx..."
sudo apt install nginx -y

# Create application directory
echo "📁 Creating application directory..."
mkdir -p ~/ecommerce-admin-dashboard
cd ~/ecommerce-admin-dashboard

# Configure PM2 to start on boot
echo "⚙️ Configuring PM2 startup..."
pm2 startup systemd -u $USER --hp $HOME

# Display versions
echo ""
echo "✅ Installation complete!"
echo ""
echo "Installed versions:"
node -v
npm -v
pm2 -v
nginx -v

echo ""
echo "📝 Next steps:"
echo "1. Configure GitHub Actions secrets in your repository"
echo "2. Push your code to trigger the deployment workflow"
echo "3. Your app will be automatically deployed to this EC2 instance"
echo ""
echo "🎉 EC2 instance is ready for deployments!"
