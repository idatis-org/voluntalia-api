# SendGrid Email Configuration Guide

This document explains how to configure SendGrid for the Voluntalia API email system, including setup for development, staging, and production environments.

## Overview

The Voluntalia API uses SendGrid to send:

- Welcome emails to new volunteers with password reset links
- Password reset emails
- Notification emails (future feature)

## Current Implementation

### Files Involved

- `src/services/emailService.js` - Email service with SendGrid integration
- `src/controllers/authController.js` - Triggers welcome emails on registration
- `.env` - Environment variables for API key and configuration

### Environment Variables Required

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@voluntalia.org
FRONTEND_URL=http://localhost:3000
```

## Setting Up SendGrid

### 1. Create SendGrid Account

1. Go to [SendGrid.com](https://sendgrid.com)
2. Sign up for an account or use existing company account
3. Verify your email address
4. Complete account setup

### 2. Domain Authentication (Recommended for Production)

1. In SendGrid Dashboard → Settings → Sender Authentication
2. Click "Authenticate Your Domain"
3. Add your domain (e.g., `voluntalia.org`)
4. Follow DNS configuration instructions
5. Verify domain authentication

### 3. Create API Key

1. Go to Settings → API Keys
2. Click "Create API Key"
3. Choose "Restricted Access"
4. Set permissions:
   - **Mail Send**: Full Access
   - **Mail Settings**: Read Access (optional)
   - **Tracking**: Read Access (optional)
5. Copy the API key (save it securely!)

### 4. Configure Sender Identity

If not using domain authentication:

1. Go to Settings → Sender Authentication
2. Click "Create a Single Sender"
3. Fill in sender details:
   - **From Name**: Voluntalia
   - **From Email**: noreply@voluntalia.org (or verified email)
   - **Reply To**: support@voluntalia.org
4. Verify the email address

## Environment Configuration

### Development Environment

```bash
# .env.development
SENDGRID_API_KEY=SG.development_api_key_here
SENDGRID_FROM_EMAIL=dev@voluntalia.org
FRONTEND_URL=http://localhost:3000
```

### Staging Environment

```bash
# .env.staging
SENDGRID_API_KEY=SG.staging_api_key_here
SENDGRID_FROM_EMAIL=staging@voluntalia.org
FRONTEND_URL=https://staging.voluntalia.org
```

### Production Environment

```bash
# .env.production
SENDGRID_API_KEY=SG.production_api_key_here
SENDGRID_FROM_EMAIL=noreply@voluntalia.org
FRONTEND_URL=https://voluntalia.org
```

## Switching to Company Account

### Step 1: Account Transfer

1. **Current Account**: Individual developer account
2. **Target Account**: Company SendGrid account
3. **Coordination**: Work with company admin to:
   - Add your email to company SendGrid account
   - Grant appropriate permissions
   - Provide access to existing domain authentication

### Step 2: Update Configuration

1. **Get New API Key** from company account with same permissions
2. **Update Environment Variables**:

   ```bash
   # Old (individual account)
   SENDGRID_API_KEY=SG.old_individual_key
   SENDGRID_FROM_EMAIL=dev@personal.domain

   # New (company account)
   SENDGRID_API_KEY=SG.new_company_key
   SENDGRID_FROM_EMAIL=noreply@voluntalia.org
   ```

### Step 3: Verify Email Templates

1. **Test welcome email** in new environment
2. **Check sender reputation** (should be better with company domain)
3. **Verify deliverability** to common email providers (Gmail, Outlook, etc.)

### Step 4: Update DNS (if needed)

If company uses different domain authentication:

1. **Remove old domain** authentication records
2. **Add new domain** authentication records
3. **Update SENDGRID_FROM_EMAIL** to match authenticated domain

## Email Templates

### Current Templates

- **Welcome Email**: Responsive HTML with password reset link
- **Template Location**: `src/services/emailService.js` → `getWelcomeEmailTemplate()`

### Template Customization

To update email branding for company account:

1. **Update Logo/Branding**:

   ```javascript
   // In getWelcomeEmailTemplate()
   <h1 style="color: #2563eb;">🤝 Voluntalia</h1>
   // Change to:
   <img src="https://voluntalia.org/logo.png" alt="Voluntalia" height="40">
   ```

2. **Update Colors**:

   ```javascript
   // Current blue: #2563eb
   // Update to company brand colors
   style = 'background: #your-brand-color;';
   ```

3. **Update Footer**:
   ```javascript
   <p>© 2025 Voluntalia. All rights reserved.</p>
   // Update to include company info
   ```

## Testing Email Configuration

### Test Commands

```bash
# Test welcome email (triggers on registration)
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "VOLUNTEER"
  }'

# Test password reset
curl -X POST http://localhost:4000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "token_from_email",
    "newPassword": "newpassword123"
  }'
```

### Verification Checklist

- [ ] Email arrives in inbox (check spam folder)
- [ ] Email displays correctly on mobile and desktop
- [ ] "Set Your Password" button works
- [ ] Reset link contains correct frontend URL
- [ ] Password reset completes successfully
- [ ] Email sender shows correct "From" name and email

## Monitoring and Analytics

### SendGrid Dashboard

Monitor email performance:

1. **Statistics** → Overview for delivery rates
2. **Activity** → Recent email activity and bounces
3. **Suppressions** → Blocked/bounced email addresses
4. **Alerts** → Set up notifications for delivery issues

### Application Logs

Monitor in application:

```bash
# Success logs
✅ Welcome email sent successfully to user@example.com (User ID: 123)
✅ Password reset successful for token: a1b2c3d4e5...

# Error logs
❌ Failed to send welcome email: { error: "SendGrid API error", ... }
```

## Troubleshooting

### Common Issues

#### 1. API Key Invalid

```bash
Error: Unauthorized
```

**Solution**: Verify API key is correct and has Mail Send permissions

#### 2. From Email Not Verified

```bash
Error: The from address does not match a verified Sender Identity
```

**Solution**: Add sender identity or complete domain authentication

#### 3. Rate Limiting

```bash
Error: Rate limit exceeded
```

**Solution**: Upgrade SendGrid plan or implement request throttling

#### 4. Emails Going to Spam

**Solutions**:

- Complete domain authentication (SPF, DKIM, DMARC)
- Use company domain instead of personal domain
- Monitor sender reputation in SendGrid dashboard
- Avoid spam trigger words in subject/content

### Support Resources

- **SendGrid Documentation**: https://docs.sendgrid.com/
- **SendGrid Support**: Available through dashboard
- **API Reference**: https://docs.sendgrid.com/api-reference/

## Security Best Practices

### API Key Management

1. **Never commit API keys** to version control
2. **Use environment variables** for all configurations
3. **Rotate API keys** periodically (quarterly recommended)
4. **Use restricted permissions** (only Mail Send for application)
5. **Different keys per environment** (dev/staging/prod)

### Email Security

1. **Domain authentication** prevents spoofing
2. **SPF/DKIM/DMARC** records for deliverability
3. **Rate limiting** prevents abuse
4. **Input validation** for email addresses

## Migration Checklist

When switching to company account:

- [ ] Company SendGrid account set up
- [ ] Domain authentication configured
- [ ] New API key created with proper permissions
- [ ] Environment variables updated in all environments
- [ ] Email templates tested with new configuration
- [ ] DNS records updated (if domain changed)
- [ ] Monitoring/alerts configured
- [ ] Team members granted access to SendGrid dashboard
- [ ] Documentation updated with new account details
- [ ] Old API keys revoked for security

---

**Last Updated**: October 28, 2025  
**Maintained By**: Development Team  
**Review Schedule**: Quarterly or when switching accounts
