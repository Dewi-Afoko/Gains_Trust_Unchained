# Password Reset Setup Guide

This guide will help you configure the password reset functionality for the Gains Trust application.

## Backend Setup

### 1. Environment Variables

Create a `.env` file in the `Gains_Trust` directory with the following variables:

```env
# Database Configuration
DATABASE_NAME=gains_trust
DATABASE_USER=dewi
DATABASE_PASSWORD=your_db_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Email Configuration for Password Reset
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=your_email@gmail.com

# Password Reset Settings
PASSWORD_RESET_TIMEOUT=3600  # Token expires in 1 hour (3600 seconds)
```

### 2. Email Provider Setup

#### Gmail Setup:
1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings → Security → 2-Step Verification → App passwords
3. Generate a new app password for "Mail"
4. Use this app password as `EMAIL_HOST_PASSWORD` (not your regular Gmail password)

#### Other Email Providers:
- **Outlook/Hotmail**: `smtp-mail.outlook.com`, port `587`
- **Yahoo**: `smtp.mail.yahoo.com`, port `587`
- **Custom SMTP**: Contact your provider for settings

### 3. Run Database Migration

```bash
cd Gains_Trust
python manage.py migrate
```

## Frontend Setup

The frontend components are already configured and will work automatically once the backend is set up.

## API Endpoints

The following endpoints have been added:

- `POST /password-reset/request/` - Request password reset (send email)
- `POST /password-reset/confirm/` - Confirm password reset with token

## How It Works

1. User clicks "Forgot your password?" on the login page
2. User enters their email address
3. System sends a password reset email with a unique token
4. User clicks the link in the email
5. User enters a new password
6. Password is updated and user is redirected to login

## Security Features

- Tokens expire after 1 hour (configurable)
- Tokens can only be used once
- Password validation enforced
- Secure token generation using UUID4

## Testing

To test the functionality:

1. Ensure your email configuration is correct
2. Register a user account with a valid email
3. Navigate to `/forgot-password`
4. Enter the registered email address
5. Check your email for the reset link
6. Follow the link to reset your password

## Troubleshooting

### Email Not Sending
- Check your email credentials in `.env`
- Verify that 2FA is enabled and you're using an app password (for Gmail)
- Check Django logs for specific error messages

### Token Expired
- Default expiration is 1 hour
- Adjust `PASSWORD_RESET_TIMEOUT` in `.env` if needed

### Invalid Token
- Tokens can only be used once
- Request a new password reset if the token is invalid 