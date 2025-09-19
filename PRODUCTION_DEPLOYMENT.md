# Production Deployment Guide - FAQ Frontend

This guide provides step-by-step instructions for deploying the FAQ Frontend Next.js application to production with the backend API at `https://api.faqhub.ir/api`.

## 📋 Prerequisites

- Node.js 18+ installed on the server
- PM2 (for process management)
- Domain name configured
- Optional: SSL certificate (for HTTPS)

## 🚀 Quick Start

### Option 1: Using the Deployment Script

```bash
# Make the script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh production

# The script will create a 'deploy' directory with all necessary files
```

### Option 2: Manual Deployment

```bash
# 1. Install dependencies
npm ci --only=production

# 2. Build the application
npm run build:prod

# 3. Start the application
npm run start:prod
```

## 🔧 PM2 Deployment (Recommended)

### Using PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the application with PM2
pm2 start ecosystem.config.js --env production

# View application status
pm2 status

# View logs
pm2 logs faq-frontend

# Restart application
pm2 restart faq-frontend
```

## ⚙️ Server Configuration

### 1. Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2
```

### 2. Configure PM2

```bash
# Start the application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### 3. Optional: Setup SSL Certificate (Let's Encrypt)

If you want HTTPS, you can use a reverse proxy like Nginx or Caddy:

```bash
# Install Nginx (optional)
sudo apt install nginx -y

# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## 🔧 Environment Configuration

### Production Environment Variables

Create `.env.production` file:

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.faqhub.ir/api
```

### Optional Environment Variables

```bash
# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your-ga-id

# Error tracking
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Performance monitoring
NEXT_PUBLIC_HOTJAR_ID=your-hotjar-id
```

## 📊 Monitoring and Logging

### PM2 Monitoring

```bash
# View application status
pm2 status

# View logs
pm2 logs faq-frontend

# Monitor resources
pm2 monit

# Restart application
pm2 restart faq-frontend
```

### Log Management

```bash
# Create logs directory
mkdir -p logs

# View application logs
tail -f logs/combined.log

# View error logs
tail -f logs/error.log
```

## 🔄 Deployment Process

### Automated Deployment with Git Hooks

1. **Setup Git Repository on Server**

```bash
# Clone repository
git clone https://github.com/iranpsc/faq-frontend.git
cd faq-frontend

# Create deployment script
cat > deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
npm ci --only=production

# Build application
npm run build:prod

# Restart PM2
pm2 restart faq-frontend

echo "✅ Deployment completed!"
EOF

chmod +x deploy.sh
```

2. **Setup Webhook (Optional)**

```bash
# Install webhook server
npm install -g webhook

# Create webhook configuration
cat > webhook.conf << 'EOF'
{
  "id": "faq-frontend-deploy",
  "execute-command": "/path/to/faq-frontend/deploy.sh",
  "command-working-directory": "/path/to/faq-frontend"
}
EOF

# Start webhook server
webhook -hooks webhook.conf -verbose
```

## 🛡️ Security Considerations

### 1. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow application port
sudo ufw allow 3000

# Optional: Allow HTTP and HTTPS (if using reverse proxy)
sudo ufw allow 80
sudo ufw allow 443
```

### 2. Security Headers

The application includes security headers in `next.config.ts`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin

### 3. Environment Security

```bash
# Secure environment files
chmod 600 .env.production

# Use non-root user for application
sudo useradd -m -s /bin/bash faq-app
sudo chown -R faq-app:faq-app /var/www/faq-frontend
```

## 📈 Performance Optimization

### 1. Enable Gzip Compression

Already configured in Nginx configuration.

### 2. Static File Caching

Already configured for static assets.

### 3. Direct Access Setup

Your application will be accessible directly on port 3000. If you want to use a custom domain:

```bash
# Configure DNS A record to point to your server IP
# Access your application at: http://your-domain.com:3000
# Or configure a reverse proxy for port 80/443
```

## 🔍 Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   pm2 logs faq-frontend
   
   # Check environment variables
   pm2 env faq-frontend
   ```

2. **Application not accessible**
   ```bash
   # Check if application is running
   pm2 status
   
   # Check if port 3000 is open
   sudo ufw status
   
   # Test local connection
   curl http://localhost:3000
   ```

3. **Port Access Issues**
   ```bash
   # Check if port is in use
   sudo netstat -tlnp | grep :3000
   
   # Check firewall status
   sudo ufw status verbose
   
   # Test external access
   curl http://your-server-ip:3000
   ```

### Health Checks

```bash
# Application health
curl http://localhost:3000/health

# External access test
curl http://your-domain.com:3000/health

# PM2 process health
pm2 status
```

## 📝 Maintenance

### Regular Tasks

1. **Update Dependencies**
   ```bash
   npm audit
   npm update
   ```

2. **Monitor Resources**
   ```bash
   pm2 monit
   df -h
   free -h
   ```

3. **Backup Configuration**
   ```bash
   # Backup PM2 configuration
   pm2 save
   
   # Backup application files
   tar -czf backup-$(date +%Y%m%d).tar.gz /path/to/faq-frontend
   ```

### Updates

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm ci --only=production

# Build and restart
npm run build:prod
pm2 restart faq-frontend
```

## 📞 Support

For issues related to:
- **Frontend**: Check this repository issues
- **Backend API**: Contact backend team
- **Server**: Contact DevOps team

## 🎯 Production Checklist

- [ ] Domain configured and pointing to server (optional)
- [ ] Environment variables set correctly
- [ ] PM2 configured and running
- [ ] Firewall configured (port 3000 open)
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Health checks working
- [ ] Performance optimization applied
- [ ] SSL certificate (optional, if using reverse proxy)

---

**Note**: Replace `your-domain.com` with your actual domain name throughout this guide.
