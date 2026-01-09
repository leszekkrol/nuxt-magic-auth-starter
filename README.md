# 🪄 Nuxt Magic Auth Starter

[![Nuxt](https://img.shields.io/badge/nuxt-4.svg)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/vue-blue)](https://vuejs.org)
[![license](https://img.shields.io/badge/license-mit-brightgreen.svg)](https://en.wikipedia.org/wiki/MIT_License)

Welcome to **Nuxt Magic Auth Starter**, a production-ready starter template for Nuxt.js applications with passwordless magic link authentication. This starter provides a complete authentication system using email-based magic links, eliminating the need for traditional passwords.

<img width="1707" height="1068" alt="Zrzut ekranu 2026-01-4 o 19 54 54" src="https://github.com/user-attachments/assets/8088cb4d-7b20-48f3-b998-82f41370c38b" />

## ✨ Features

- 🔐 **Magic Link Authentication** - Passwordless login via email
- 🎯 **JWT Token Management** - Secure token-based authentication with automatic refresh
- 📧 **Email Provider Agnostic** - Support for Console (dev), Resend, and SMTP/Nodemailer
- 💳 **Stripe Integration** - Built-in payment processing with automatic customer creation
- 🔒 **Subscription Paywall** - Ready-to-use component for premium content protection
- 👤 **Flexible User Updates** - Update any user field via REST API (PATCH endpoint)
- 📊 **Complete User Data** - GET endpoint returns all fields including custom ones
- 🎨 **Tailwind CSS** - Beautiful, responsive UI out of the box
- 📦 **TypeScript** - Full type safety and IntelliSense
- 🚀 **Production Ready** - Includes security best practices, rate limiting, and error handling
- 🔧 **Zero Config** - Works out-of-the-box with sensible defaults
- 📱 **Responsive Design** - Mobile-first, accessible components
- 🧪 **Fully Tested** - 233 unit tests with Vitest

## 🛠 Technology Stack

- [Nuxt 4](https://nuxt.com) - The Intuitive Vue Framework. Build your next Vue.js application with confidence using Nuxt.
- [Tailwind CSS](https://tailwindcss.com) - A utility-first CSS framework for rapidly building custom user interfaces.
- [Prisma 7](https://www.prisma.io) - Next-generation ORM for Node.js and TypeScript with PostgreSQL adapter.
- [JWT](https://jwt.io) - JSON Web Tokens for secure authentication.
- [TypeScript](https://www.typescriptlang.org) - Typed JavaScript at any scale.
- [VueUse](https://vueuse.org) - Collection of essential Vue Composition Utilities.

## 🚀 Quick Start (Recommended)

Get up and running in under 2 minutes:

```bash
# 1. Create a new Nuxt project
npx nuxi init my-app
cd my-app

# 2. Install the magic auth starter (includes all dependencies!)
npm install nuxt-magic-auth-starter
```

**3. Extend your `nuxt.config.ts`:**

Choose the configuration that matches your email provider:

<details>
<summary>📺 <strong>Console (Development)</strong> - Logs magic links to terminal</summary>

```typescript
// nuxt.config.ts - Console Provider (Development)
export default defineNuxtConfig({
  extends: ['nuxt-magic-auth-starter'],
  modules: ['@nuxtjs/tailwindcss'],
  
  runtimeConfig: {
    // Database
    databaseUrl: process.env.DATABASE_URL,
    
    // Authentication
    jwtSecret: process.env.JWT_SECRET,
    
    // Email Provider
    emailProvider: 'console',
    emailConfig: {
      fromEmail: 'noreply@localhost',
      fromName: 'My App (Dev)'
    },
    
    public: {
      appUrl: process.env.APP_URL || 'http://localhost:3000'
    }
  }
})
```

**.env file:**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
APP_URL="http://localhost:3000"
```

</details>

<details>
<summary>📧 <strong>Resend</strong> - Modern email API for production</summary>

```typescript
// nuxt.config.ts - Resend Provider (Production)
export default defineNuxtConfig({
  extends: ['nuxt-magic-auth-starter'],
  modules: ['@nuxtjs/tailwindcss'],
  
  runtimeConfig: {
    // Database
    databaseUrl: process.env.DATABASE_URL,
    
    // Authentication
    jwtSecret: process.env.JWT_SECRET,
    
    // Email Provider
    emailProvider: 'resend',
    emailConfig: {
      fromEmail: process.env.FROM_EMAIL,
      fromName: process.env.FROM_NAME,
      // Resend specific
      resendApiKey: process.env.RESEND_API_KEY
    },
    
    public: {
      appUrl: process.env.APP_URL
    }
  }
})
```

**.env file:**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
APP_URL="https://myapp.com"

# Resend Configuration
FROM_EMAIL="noreply@myapp.com"
FROM_NAME="My App"
RESEND_API_KEY="re_your_resend_api_key"
```

</details>

<details>
<summary>✉️ <strong>AutoSend</strong> - Modern email API for developers</summary>

```typescript
// nuxt.config.ts - AutoSend Provider (Production)
export default defineNuxtConfig({
  extends: ['nuxt-magic-auth-starter'],
  modules: ['@nuxtjs/tailwindcss'],
  
  runtimeConfig: {
    // Database
    databaseUrl: process.env.DATABASE_URL,
    
    // Authentication
    jwtSecret: process.env.JWT_SECRET,
    
    // Email Provider
    emailProvider: 'autosend',
    emailConfig: {
      fromEmail: process.env.FROM_EMAIL,
      fromName: process.env.FROM_NAME,
      // AutoSend specific
      autosendApiKey: process.env.AUTOSEND_API_KEY
    },
    
    public: {
      appUrl: process.env.APP_URL
    }
  }
})
```

**.env file:**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
APP_URL="https://myapp.com"

# AutoSend Configuration
FROM_EMAIL="noreply@myapp.com"
FROM_NAME="My App"
AUTOSEND_API_KEY="as_your_autosend_api_key"
```

**Setup Instructions:**
1. Sign up at [AutoSend](https://autosend.com)
2. Add and verify your domain in the [Domain section](https://docs.autosend.com/getting-started)
3. Generate API key in [Settings > API Keys](https://docs.autosend.com/api-keys)
4. Use a verified email address as `FROM_EMAIL`

</details>

<details>
<summary>📬 <strong>Nodemailer (SMTP)</strong> - Gmail, Outlook, or custom SMTP</summary>

```typescript
// nuxt.config.ts - Nodemailer/SMTP Provider (Production)
export default defineNuxtConfig({
  extends: ['nuxt-magic-auth-starter'],
  modules: ['@nuxtjs/tailwindcss'],
  
  runtimeConfig: {
    // Database
    databaseUrl: process.env.DATABASE_URL,
    
    // Authentication
    jwtSecret: process.env.JWT_SECRET,
    
    // Email Provider
    emailProvider: 'nodemailer',
    emailConfig: {
      fromEmail: process.env.FROM_EMAIL,
      fromName: process.env.FROM_NAME,
      // SMTP specific
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT,
      smtpSecure: process.env.SMTP_SECURE,
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS
    },
    
    public: {
      appUrl: process.env.APP_URL
    }
  }
})
```

**.env file (Gmail example):**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
APP_URL="https://myapp.com"

# SMTP Configuration (Gmail)
FROM_EMAIL="noreply@myapp.com"
FROM_NAME="My App"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

**.env file (Outlook example):**
```bash
# SMTP Configuration (Outlook)
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
```

**.env file (Custom SMTP example):**
```bash
# SMTP Configuration (Custom Server)
SMTP_HOST="mail.yourserver.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="noreply@yourserver.com"
SMTP_PASS="your-smtp-password"
```

</details>

<details open>
<summary>⚡ <strong>Quick Config</strong> - Minimal setup with environment variables</summary>

```typescript
// nuxt.config.ts - Environment-driven configuration
export default defineNuxtConfig({
  extends: ['nuxt-magic-auth-starter'],
  modules: ['@nuxtjs/tailwindcss'],
  
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    emailProvider: process.env.EMAIL_PROVIDER || 'console',
    emailConfig: {
      fromEmail: process.env.FROM_EMAIL,
      fromName: process.env.FROM_NAME,
      // Resend
      resendApiKey: process.env.RESEND_API_KEY,
      // AutoSend
      autosendApiKey: process.env.AUTOSEND_API_KEY,
      // SMTP
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT,
      smtpSecure: process.env.SMTP_SECURE,
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS
    },
    public: {
      appUrl: process.env.APP_URL
    }
  }
})
```

</details>

**4. Set up environment and database:**

```bash
# Copy environment template
cp node_modules/nuxt-magic-auth-starter/.env.example .env

# Edit .env with your DATABASE_URL and JWT_SECRET

# Initialize Prisma with the schema from the package
npx prisma init
cp node_modules/nuxt-magic-auth-starter/prisma/schema.prisma prisma/

# Run migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

🎉 **Done!** You now have full magic link authentication. Focus on your app logic!

### What You Get Out of the Box

| Feature | Description |
|---------|-------------|
| `useAuth()` composable | Complete auth state management with auto token refresh |
| `/api/auth/*` endpoints | Ready-to-use authentication API with rate limiting |
| `<AuthMagicLinkForm>` | Complete login form with title, description, messages |
| `<AuthStarterPage>` | Ready-to-use landing page component |
| `<AuthUserMenu>` | User dropdown with logout |
| `<AuthLoginButton>` | Styled login button with variants |
| `<AuthProtectedContent>` | Show content only to logged-in users |
| `<AuthLoadingSpinner>` | Loading indicator component |
| `<StripeProtectedContent>` | Subscription paywall component |
| `auth` middleware | Protect routes easily |
| `guest` middleware | Redirect logged-in users |
| Prisma schema | User & VerificationToken models with Stripe |
| Email templates | Customizable magic link & welcome emails |
| User updates | Flexible PATCH endpoint for profile changes |
| Stripe payments | Complete payment & subscription system |
| `useStripe()` composable | Subscription status management |

### Updating the Package

When a new version is released, simply run:

```bash
npm update nuxt-magic-auth-starter
```

Your customizations stay intact while you get the latest features and security updates!

---

## 📦 Alternative: Clone as Template

For full control over the codebase or to customize everything:

```bash
# Clone the repository
git clone https://github.com/leszekkrol/nuxt-magic-auth-starter.git my-app
cd my-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start PostgreSQL database
docker-compose up -d

# Run database migrations
npm run db:migrate

# (Optional) Seed with demo data
npm run db:seed

# Start development server
npm run dev
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in your project root:

```bash
# ==============================================
# DATABASE
# ==============================================
DATABASE_URL="postgresql://user:password@localhost:5432/magic_auth"

# ==============================================
# AUTHENTICATION
# ==============================================
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"

# ==============================================
# APPLICATION
# ==============================================
APP_URL="http://localhost:3000"

# ==============================================
# EMAIL CONFIGURATION
# ==============================================
# Provider: console | resend | autosend | nodemailer
EMAIL_PROVIDER="console"
FROM_EMAIL="noreply@yourapp.com"
FROM_NAME="Your App Name"

# Resend (if EMAIL_PROVIDER=resend)
RESEND_API_KEY="re_your_api_key"

# AutoSend (if EMAIL_PROVIDER=autosend)
AUTOSEND_API_KEY="as_your_api_key"

# SMTP (if EMAIL_PROVIDER=nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Stripe (for payment processing)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

## 🔐 Authentication Flow

The magic link authentication process is designed to be secure, simple, and passwordless. Here's how it works:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MAGIC LINK AUTHENTICATION FLOW                       │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────┐                    ┌──────────┐                 ┌──────────┐
    │  Client  │                    │  Server  │                 │ Database │
    └────┬─────┘                    └────┬─────┘                 └────┬─────┘
         │                               │                            │
    ═════╪═══════════════════════════════╪════════════════════════════╪═════
         │  STEP 1: REQUEST MAGIC LINK   │                            │
    ═════╪═══════════════════════════════╪════════════════════════════╪═════
         │                               │                            │
         │  POST /api/auth/send-magic-link                            │
         │  { email, name? }             │                            │
         │ ─────────────────────────────>│                            │
         │                               │                            │
         │                               │  Generate secure token     │
         │                               │  (crypto.randomBytes)      │
         │                               │                            │
         │                               │  Store SHA-256 hash        │
         │                               │ ──────────────────────────>│
         │                               │                            │
         │                               │  Send email with link      │
         │                               │  ┌─────────────────────┐   │
         │                               │  │ 📧 Magic Link Email │   │
         │                               │  │ Click to sign in:   │   │
         │                               │  │ /verify?token=xxx   │   │
         │                               │  └─────────────────────┘   │
         │                               │            │               │
         │  { success: true }            │            │               │
         │ <─────────────────────────────│            ▼               │
         │                               │      User's Inbox          │
         │                               │                            │
    ═════╪═══════════════════════════════╪════════════════════════════╪═════
         │  STEP 2: USER CLICKS LINK     │                            │
    ═════╪═══════════════════════════════╪════════════════════════════╪═════
         │                               │                            │
         │  GET /verify?token=xxx        │                            │
         │ ─────────────────────────────>│                            │
         │                               │                            │
         │  POST /api/auth/verify-token  │                            │
         │  { token }                    │                            │
         │ ─────────────────────────────>│                            │
         │                               │                            │
         │                               │  Hash token & lookup       │
         │                               │ ──────────────────────────>│
         │                               │                            │
         │                               │  Validate: not expired,    │
         │                               │  not used, exists          │
         │                               │ <──────────────────────────│
         │                               │                            │
         │                               │  Mark token as used        │
         │                               │ ──────────────────────────>│
         │                               │                            │
         │                               │  Create/get user           │
         │                               │ ──────────────────────────>│
         │                               │                            │
         │                               │  Generate JWT              │
         │                               │  Set HTTP-only cookie      │
         │                               │                            │
         │  { success, user, isNewUser } │                            │
         │  + Set-Cookie: auth_token     │                            │
         │ <─────────────────────────────│                            │
         │                               │                            │
    ═════╪═══════════════════════════════╪════════════════════════════╪═════
         │  STEP 3: AUTHENTICATED        │                            │
    ═════╪═══════════════════════════════╪════════════════════════════╪═════
         │                               │                            │
         │  GET /api/auth/me             │                            │
         │  Cookie: auth_token=jwt       │                            │
         │ ─────────────────────────────>│                            │
         │                               │                            │
         │                               │  Verify JWT signature      │
         │                               │  Extract user ID           │
         │                               │ ──────────────────────────>│
         │                               │                            │
         │  { user: {...} }              │                            │
         │ <─────────────────────────────│                            │
         │                               │                            │
    ─────┴─────────────────────────────────────────────────────────────┴─────
```

### Security Features

| Feature | Description |
|---------|-------------|
| 🔑 **Token Hashing** | Only SHA-256 hash stored in database, raw token sent via email |
| ⏰ **Token Expiration** | Tokens expire after 15 minutes (configurable) |
| 🔒 **Single Use** | Each token can only be used once |
| 🍪 **HTTP-Only Cookies** | JWT stored in secure, HTTP-only cookie to prevent XSS |
| 🛡️ **CSRF Protection** | SameSite cookie attribute prevents cross-site attacks |
| 📧 **Email Verification** | User proves email ownership by clicking the link |

### Token Lifecycle

```
Token Created ──► Email Sent ──► User Clicks ──► Token Verified ──► Token Marked Used
     │                                                                      │
     │              15 min expiration                                       │
     └──────────────────────────────────────────────────────────────────────┘
                              Token Invalid After
```

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/send-magic-link` | Send magic link to email |
| `POST` | `/api/auth/verify-token` | Verify token and authenticate |
| `GET` | `/api/auth/me` | Get current authenticated user (returns all user fields) |
| `PATCH` | `/api/auth/me` | Update current authenticated user (any fields) |
| `POST` | `/api/auth/logout` | Clear authentication cookie |

### Stripe Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stripe/subscription` | Get current user's subscription status |
| `POST` | `/api/stripe/checkout` | Create checkout session for products/subscriptions |
| `POST` | `/api/stripe/billing-portal` | Create billing portal session for subscription management |
| `POST` | `/api/stripe/webhook` | Handle Stripe webhook events |

### Example: Send Magic Link

```typescript
// Request
const response = await $fetch('/api/auth/send-magic-link', {
  method: 'POST',
  body: { 
    email: 'user@example.com',
    name: 'John Doe' // optional
  }
})

// Response
{ success: true, message: 'Magic link sent to your email' }
```

### Example: Verify Token

```typescript
// Request
const response = await $fetch('/api/auth/verify-token', {
  method: 'POST',
  body: { token: 'your-magic-link-token' }
})

// Response
{
  success: true,
  user: { id: '...', email: 'user@example.com', name: 'John Doe' },
  isNewUser: false
}
```

### Example: Get Current User

```typescript
// Request
const response = await $fetch('/api/auth/me')

// Response - Returns ALL user fields from database
{
  user: {
    id: 'clx...',
    email: 'user@example.com',
    name: 'John Doe',
    stripeCustomerId: 'cus_...', // Included if Stripe integration enabled
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
    // Plus any additional custom fields you've added to the User model
  }
}

// Or if not authenticated
{
  user: null
}
```

> **Note:** The `/api/auth/me` endpoint returns **all fields** from the User model in your database. This means if you add custom fields to your Prisma schema (e.g., `avatar`, `bio`, `role`, `preferences`), they will automatically be included in the response without any code changes.

### Example: Update User

```typescript
// Request - Update single field
const response = await $fetch('/api/auth/me', {
  method: 'PATCH',
  body: { name: 'John Doe' }
})

// Request - Update multiple fields
const response = await $fetch('/api/auth/me', {
  method: 'PATCH',
  body: {
    name: 'John Doe',
    bio: 'Full-stack developer',
    avatar: 'https://example.com/avatar.jpg',
    preferences: { theme: 'dark', language: 'en' }
  }
})

// Response
{
  success: true,
  user: {
    id: 'clx...',
    email: 'user@example.com',
    name: 'John Doe',
    bio: 'Full-stack developer',
    avatar: 'https://example.com/avatar.jpg',
    preferences: { theme: 'dark', language: 'en' },
    stripeCustomerId: 'cus_...',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T12:30:00.000Z' // Updated automatically
  }
}
```

**Features:**
- ✅ **Flexible** - Update any field from your User model
- ✅ **Bulk updates** - Update multiple fields in one request
- ✅ **Protected fields** - Automatically excludes `id` and `createdAt`
- ✅ **Email validation** - Checks if new email is already in use
- ✅ **Type-safe** - Prisma validates field types automatically
- ✅ **Authenticated only** - Requires valid auth token

## 🧩 Components

### `<AuthMagicLinkForm />`

Complete magic link login form with customizable title, description, and messages.

```vue
<template>
  <AuthMagicLinkForm 
    title="Sign in to your account"
    description="Enter your email and we'll send you a magic link"
    button-text="Send Magic Link"
    success-text="Check your email!"
    error-text="Something went wrong"
    show-name
    @success="onSuccess"
    @failed="onFailed"
  />
</template>

<script setup>
function onSuccess(user) {
  console.log('Magic link sent to:', user.email)
  console.log('User name:', user.name)
}

function onFailed(message) {
  console.error('Error:', message)
}
</script>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `''` | Form title (h1) |
| `description` | `string` | `''` | Description text below title |
| `showName` | `boolean` | `false` | Show optional name input field |
| `buttonText` | `string` | `'Send Magic Link'` | Submit button text |
| `successText` | `string` | `'Check your email for the magic link!'` | Success message |
| `errorText` | `string` | `'Failed to send magic link'` | Fallback error message |
| `redirectTo` | `string` | `''` | Route to redirect after success |

**Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `@success` | `{ email: string, name?: string }` | Emitted when magic link is sent successfully |
| `@failed` | `message: string` | Emitted when sending fails |

### `<AuthStarterPage />`

Ready-to-use landing page component with features showcase.

```vue
<template>
  <AuthStarterPage />
</template>
```

### `<AuthUserMenu />`

Dropdown menu for authenticated users with profile link and logout.

```vue
<template>
  <AuthUserMenu v-if="isLoggedIn" />
</template>

<script setup>
const { isLoggedIn } = useAuth()
</script>
```

### `<AuthLoginButton />`

Styled login button with variant support.

```vue
<template>
  <AuthLoginButton to="/login" variant="primary">
    Sign In
  </AuthLoginButton>
</template>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `to` | `string` | `'/login'` | Navigation target |
| `variant` | `string` | `'primary'` | Visual style variant |

**Variants:** `primary`, `secondary`, `outline`

### `<AuthProtectedContent />`

Wrapper that shows content only to authenticated users.

```vue
<template>
  <AuthProtectedContent>
    <p>This content is only visible to logged-in users.</p>
    
    <template #fallback>
      <p>Please sign in to view this content.</p>
    </template>
  </AuthProtectedContent>
</template>
```

### `<AuthLoadingSpinner />`

Loading indicator with size and color options.

```vue
<template>
  <AuthLoadingSpinner size="lg" color="primary" label="Loading..." />
</template>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `string` | `'md'` | Spinner size |
| `color` | `string` | `'primary'` | Color theme |
| `label` | `string` | - | Optional text label |
| `containerClass` | `string` | `''` | Additional CSS classes |

**Sizes:** `sm`, `md`, `lg` | **Colors:** `primary`, `white`, `gray`

### `<StripeProtectedContent />`

Shows content only to users with active Stripe subscription. Perfect for premium content, paywalls, and subscription-gated features.

```vue
<template>
  <!-- Basic usage - check for any active subscription -->
  <StripeProtectedContent>
    <h2>Premium Content</h2>
    <p>This is only visible to subscribers!</p>
  </StripeProtectedContent>

  <!-- Check for specific price -->
  <StripeProtectedContent priceId="price_premium">
    <h2>Premium Plan Content</h2>
    <p>Only for premium subscribers!</p>
  </StripeProtectedContent>

  <!-- Check for specific product -->
  <StripeProtectedContent productId="prod_pro">
    <h2>Pro Features</h2>
    <p>Pro plan exclusive content</p>
  </StripeProtectedContent>

  <!-- Custom paywall -->
  <StripeProtectedContent priceId="price_premium">
    <template #default>
      <p>Premium content here</p>
    </template>
    
    <template #paywall>
      <div class="custom-paywall">
        <h3>Upgrade to Premium</h3>
        <p>Get access to exclusive features</p>
        <button @click="navigateTo('/pricing')">
          View Plans
        </button>
      </div>
    </template>
  </StripeProtectedContent>

  <!-- Custom loading state -->
  <StripeProtectedContent>
    <template #loading>
      <div>Checking subscription...</div>
    </template>
    <p>Premium content</p>
  </StripeProtectedContent>
</template>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `priceId` | `string` | - | Stripe price ID to check for (optional) |
| `productId` | `string` | - | Stripe product ID to check for (optional) |
| `checkoutUrl` | `string` | - | Custom URL for upgrade button |
| `autoCheck` | `boolean` | `true` | Auto-check subscription on mount |

**Slots:**

| Slot | Description |
|------|-------------|
| `default` | Content shown to subscribers |
| `paywall` | Custom paywall UI (has default) |
| `loading` | Custom loading state (has default) |
| `error` | Custom error message |

**Exposed Methods:**

```typescript
const component = ref<InstanceType<typeof StripeProtectedContent>>()

// Manually refresh subscription status
component.value?.checkAccess()
```

**Example - Real-world usage:**

```vue
<script setup>
const showPremium = ref(false)
</script>

<template>
  <div>
    <h1>My Dashboard</h1>
    
    <!-- Free content for everyone -->
    <section>
      <h2>Basic Features</h2>
      <p>Available to all users</p>
    </section>
    
    <!-- Premium content with paywall -->
    <StripeProtectedContent 
      priceId="price_premium"
      checkoutUrl="/pricing?plan=premium"
    >
      <section>
        <h2>🌟 Premium Analytics</h2>
        <AdvancedCharts />
        <DetailedReports />
      </section>
      
      <template #paywall>
        <div class="paywall-card">
          <div class="icon">🔒</div>
          <h3>Premium Feature</h3>
          <p>Unlock advanced analytics with Premium plan</p>
          <ul>
            <li>✓ Real-time data</li>
            <li>✓ Custom reports</li>
            <li>✓ Export to CSV</li>
          </ul>
          <button class="upgrade-btn">
            Upgrade to Premium - $29/mo
          </button>
        </div>
      </template>
    </StripeProtectedContent>
  </div>
</template>
```

## 📝 Composables

### `useStripe()`

Composable for Stripe subscription management with reactive state.

```typescript
const {
  // State
  subscription,     // Ref<StripeSubscription | null> - Current subscription
  loading,          // Ref<boolean> - Loading state
  error,            // Ref<string | null> - Error message
  hasSubscription,  // ComputedRef<boolean> - Has any subscription
  isActive,         // ComputedRef<boolean> - Has active/trialing subscription
  
  // Actions
  fetchSubscription,  // (options?: { priceId?: string, productId?: string }) => Promise<SubscriptionStatus>
  hasPrice,          // (priceId: string) => Promise<boolean>
  hasProduct,        // (productId: string) => Promise<boolean>
  clearSubscription  // () => void
} = useStripe()
```

**Example Usage:**

```vue
<script setup>
const { subscription, hasSubscription, hasPrice, isActive } = useStripe()

// Check if user has specific subscription
onMounted(async () => {
  const hasPremium = await hasPrice('price_premium')
  console.log('Has premium:', hasPremium)
})

// Check subscription details
watchEffect(() => {
  if (subscription.value) {
    console.log('Subscription status:', subscription.value.status)
    console.log('Renews:', new Date(subscription.value.currentPeriodEnd * 1000))
  }
})
</script>

<template>
  <div v-if="hasSubscription">
    <p>Status: {{ subscription?.status }}</p>
    <p v-if="subscription?.cancelAtPeriodEnd">
      ⚠️ Subscription will cancel at period end
    </p>
  </div>
</template>
```

## 📝 Composables

### `useAuth()`

Main composable for authentication state and actions.

```typescript
const {
  // State
  user,           // Ref<User | null> - Current user
  isLoggedIn,     // ComputedRef<boolean> - Auth status
  loading,        // Ref<boolean> - Loading state
  error,          // Ref<string | null> - Error message

  // Actions
  sendMagicLink,  // (email: string, options?: { name?: string }) => Promise<SendMagicLinkResult>
  verifyToken,    // (token: string) => Promise<VerifyTokenResult>
  logout,         // () => Promise<void>
  refreshUser     // () => Promise<void>
} = useAuth()
```

**User Type:**

```typescript
interface User {
  id: string
  email: string
  name: string | null
  createdAt?: string
}
```

**Example Usage:**

```vue
<script setup>
const { user, isLoggedIn, sendMagicLink, logout, loading, refreshUser } = useAuth()

async function handleLogin() {
  try {
    await sendMagicLink('user@example.com', { name: 'John' })
    // Show success message
  } catch (err) {
    // Handle error
  }
}

async function handleLogout() {
  await logout()
  navigateTo('/')
}

// Update user profile
async function updateProfile(data: any) {
  try {
    await $fetch('/api/auth/me', {
      method: 'PATCH',
      body: data
    })
    // Refresh user data in composable
    await refreshUser()
  } catch (err) {
    // Handle error
  }
}
</script>

<template>
  <div v-if="isLoggedIn">
    <p>Welcome, {{ user?.name }}!</p>
    <p v-if="user?.bio">{{ user.bio }}</p>
    
    <button @click="updateProfile({ name: 'New Name', bio: 'Developer' })">
      Update Profile
    </button>
    
    <button @click="handleLogout" :disabled="loading">
      Logout
    </button>
  </div>
</template>
```

## 🛡️ Middleware

### `auth` Middleware

Protects routes for authenticated users only. Redirects to `/login` if not authenticated.

```vue
<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>
```

### `guest` Middleware

Protects routes for non-authenticated users only. Redirects to `/dashboard` if already authenticated.

```vue
<script setup>
definePageMeta({
  middleware: 'guest'
})
</script>
```

## 📄 Pages

| Page | Path | Description |
|------|------|-------------|
| Landing | `/` | Public homepage with features |
| Login | `/login` | Magic link request form |
| Verify | `/verify?token=...` | Token verification handler |
| Dashboard | `/dashboard` | Protected user dashboard |
| Profile | `/profile` | Protected user profile |

## 🗃️ Database Schema

This starter uses **Prisma ORM** with PostgreSQL. The schema is minimal but production-ready.

### Entity Relationship

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                                │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────┐      ┌─────────────────────────────────┐
    │           users             │      │       verification_tokens       │
    ├─────────────────────────────┤      ├─────────────────────────────────┤
    │ id visiblePK     String     │      │ id         PK     String        │
    │ email      UK    String     │◄─ ─ ─│ email            String        │
    │ name             String?    │      │ token      UK    String        │
    │ createdAt        DateTime   │      │ expires          DateTime       │
    │ updatedAt        DateTime   │      │ used             Boolean        │
    └─────────────────────────────┘      │ createdAt        DateTime       │
                                         │ updatedAt        DateTime       │
                                         └─────────────────────────────────┘
    
    PK = Primary Key    UK = Unique Key    ◄─ ─ ─ = Logical relation (by email)
```

### Prisma Schema

```prisma
// =============================================================================
// Prisma Schema - Magic Link Authentication
// =============================================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

// =============================================================================
// User Model
// =============================================================================

/// Registered application user
/// Created when user first verifies their email via magic link
model User {
  id        String   @id @default(cuid())
  /// User's email address (unique identifier for login)
  email     String   @unique
  /// User's display name (optional, can be set during registration)
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

// =============================================================================
// Verification Token Model
// =============================================================================

/// Magic link verification token
/// Stores hashed tokens with expiration and usage tracking
model VerificationToken {
  id        String   @id @default(cuid())
  /// SHA-256 hash of the actual token (never store plain tokens)
  token     String   @unique
  /// Email address this token was sent to
  email     String
  /// Token expiration timestamp (default: 15 minutes from creation)
  expires   DateTime
  /// Whether token has been consumed (prevents replay attacks)
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  /// Index for fast token lookup during verification
  @@index([token])
  /// Index for finding user's pending tokens
  @@index([email])
  /// Index for cleanup of expired tokens
  @@index([expires])
  @@map("verification_tokens")
}
```

### Model Details

#### User

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID format) |
| `email` | `String` | User's email address (unique, used for login) |
| `name` | `String?` | Optional display name |
| `createdAt` | `DateTime` | Account creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

#### VerificationToken

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID format) |
| `token` | `String` | SHA-256 hash of the magic link token |
| `email` | `String` | Email address the token was sent to |
| `expires` | `DateTime` | Token expiration time (15 min default) |
| `used` | `Boolean` | Whether token has been consumed |
| `createdAt` | `DateTime` | Token creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Database Indexes

```
verification_tokens_token_key     UNIQUE (token)     Fast token lookup
verification_tokens_email_idx     INDEX  (email)     Find user's tokens
verification_tokens_expires_idx   INDEX  (expires)   Cleanup expired tokens
users_email_key                   UNIQUE (email)     Prevent duplicates
```

### Database Commands

```bash
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes (dev only)
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio GUI
```

### Seed Data

The `prisma/seed.ts` creates a demo user for testing:

```typescript
// Demo user created by seed
{
  email: 'demo@example.com',
  name: 'Demo User'
}
```

Run with: `npm run db:seed`

## 📧 Email Providers

### Console (Development)

Default provider. Magic links are logged to the terminal - no configuration required.

```env
EMAIL_PROVIDER="console"
```

### Resend

Modern email API for production.

```env
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_your_api_key"
```

**Links:** [Website](https://resend.com) | [Documentation](https://resend.com/docs)

### AutoSend

Email platform for developers and marketers. Send transactional and marketing emails.

```env
EMAIL_PROVIDER="autosend"
AUTOSEND_API_KEY="as_your_api_key"
```

**Links:** [Website](https://autosend.com) | [Documentation](https://docs.autosend.com)

### Nodemailer (SMTP)

Universal SMTP support for Gmail, Outlook, or custom servers. Package is included in dependencies.

```env
EMAIL_PROVIDER="nodemailer"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Custom Email Templates

Email templates are located in the `templates/` directory:
- `magic-link.html` - Magic link authentication email
- `welcome.html` - Welcome email for new users

Templates support `{{placeholder}}` syntax for variable substitution.

## 💳 Stripe Integration

This starter includes built-in Stripe integration for payment processing and subscription management. When a user creates an account, a Stripe customer is automatically created and linked to their profile.

### 🔄 Updating from Version 1.1.0 or Earlier

If you're upgrading from an earlier version, follow these steps to enable Stripe integration:

**1. Update the package:**

```bash
npm update nuxt-magic-auth-starter
```

**2. Update Prisma schema:**

The `User` model now includes a `stripeCustomerId` field. Copy the updated schema:

```bash
cp node_modules/nuxt-magic-auth-starter/prisma/schema.prisma prisma/
```

Or manually add this field to your `prisma/schema.prisma`:

```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String?
  stripeCustomerId String? @unique  // 👈 Add this line
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("users")
}
```

**3. Create and run database migration:**

```bash
# Generate Prisma client with new schema
npx prisma generate

# Create migration
npx prisma migrate dev --name add-stripe-customer-id

# Or for production (without prompts)
npx prisma migrate deploy
```

**4. Install Stripe package (if not auto-installed):**

```bash
npm install stripe
```

**5. Add Stripe configuration to `.env`:**

```bash
# Add these lines to your .env file
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

**6. Update your `nuxt.config.ts`:**

Add Stripe configuration to runtimeConfig:

```typescript
export default defineNuxtConfig({
  extends: ['nuxt-magic-auth-starter'],
  
  runtimeConfig: {
    // ... existing config
    
    // Add Stripe config
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    
    public: {
      // ... existing public config
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    }
  }
})
```

**7. Restart your development server:**

```bash
npm run dev
```

✅ **Done!** New users will automatically get a Stripe customer ID upon registration.

**Optional - Backfill existing users:**

If you have existing users without Stripe customer IDs, create a migration script:

```typescript
// scripts/backfill-stripe-customers.ts
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

async function backfillStripeCustomers() {
  const usersWithoutStripe = await prisma.user.findMany({
    where: { stripeCustomerId: null }
  })

  console.log(`Found ${usersWithoutStripe.length} users without Stripe customer ID`)

  for (const user of usersWithoutStripe) {
    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id }
      })

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id }
      })

      console.log(`✓ Created Stripe customer for ${user.email}`)
    } catch (error) {
      console.error(`✗ Failed for ${user.email}:`, error)
    }
  }

  console.log('Backfill complete!')
}

backfillStripeCustomers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
```

Run it with:
```bash
npx tsx scripts/backfill-stripe-customers.ts
```

---

### Setup

1. **Create a Stripe account** at [https://stripe.com](https://stripe.com)

2. **Get your API keys** from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)

3. **Add keys to your `.env` file:**

```bash
# Get these from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"

# Optional: For webhook signature verification
# Get from: https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

4. **Update your `nuxt.config.ts`** (already configured if you followed the quick start):

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    
    public: {
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    }
  }
})
```

### Features

| Feature | Description |
|---------|-------------|
| 🎫 **Auto Customer Creation** | Stripe customer automatically created on user registration |
| 💰 **Checkout Sessions** | Create payment and subscription checkout flows |
| 🏪 **Billing Portal** | Let customers manage subscriptions and payment methods |
| 🔔 **Webhook Support** | Handle Stripe events (subscriptions, payments, etc.) |
| 🔐 **Secure** | Uses server-side API keys, never exposes secrets to client |

### Usage Examples

#### Create Checkout Session

```typescript
// In your component or page
async function startCheckout() {
  try {
    const response = await $fetch('/api/stripe/checkout', {
      method: 'POST',
      body: {
        priceId: 'price_1234567890',  // Your Stripe price ID
        mode: 'subscription',          // or 'payment' for one-time
        successUrl: window.location.origin + '/success',
        cancelUrl: window.location.origin + '/cancelled'
      }
    })
    
    // Redirect to Stripe checkout
    window.location.href = response.url
  } catch (error) {
    console.error('Checkout failed:', error)
  }
}
```

#### Open Billing Portal

```typescript
// Let users manage their subscriptions
async function openBillingPortal() {
  try {
    const response = await $fetch('/api/stripe/billing-portal', {
      method: 'POST',
      body: {
        returnUrl: window.location.origin + '/profile'
      }
    })
    
    // Redirect to Stripe billing portal
    window.location.href = response.url
  } catch (error) {
    console.error('Failed to open billing portal:', error)
  }
}
```

#### Example Vue Component

```vue
<template>
  <div>
    <h2>Choose Your Plan</h2>
    
    <button @click="subscribe('price_basic')">
      Basic Plan - $9/month
    </button>
    
    <button @click="subscribe('price_pro')">
      Pro Plan - $29/month
    </button>
    
    <button v-if="isLoggedIn" @click="manageBilling">
      Manage Billing
    </button>
  </div>
</template>

<script setup>
const { isLoggedIn } = useAuth()

async function subscribe(priceId) {
  const { url } = await $fetch('/api/stripe/checkout', {
    method: 'POST',
    body: { priceId }
  })
  
  window.location.href = url
}

async function manageBilling() {
  const { url } = await $fetch('/api/stripe/billing-portal', {
    method: 'POST'
  })
  
  window.location.href = url
}
</script>
```

### Webhooks

To handle Stripe events (subscriptions, payments, etc.), configure webhooks in your [Stripe Dashboard](https://dashboard.stripe.com/webhooks):

1. **Add endpoint URL:** `https://yourdomain.com/api/stripe/webhook`

2. **Select events to listen to:**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`

3. **Copy webhook signing secret** and add to `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

4. **Customize webhook handler** in `server/api/stripe/webhook.post.ts` to update your database based on events.

### Database Schema

The `User` model includes a `stripeCustomerId` field:

```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String?
  stripeCustomerId String? @unique  // Automatically populated on registration
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Testing

Use Stripe's test mode for development:

- Test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Any postal code

See [Stripe Testing Documentation](https://stripe.com/docs/testing) for more test cards.

### Production Checklist

- [ ] Replace test API keys with live keys
- [ ] Configure live webhook endpoint
- [ ] Test checkout flow end-to-end
- [ ] Test billing portal functionality
- [ ] Verify webhook events are processed correctly
- [ ] Enable Stripe Radar for fraud prevention
- [ ] Set up email receipts in Stripe Dashboard

## 🧪 Testing

The project includes 233 unit tests covering all utilities, API logic, composables, components, and Stripe integration.

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 🧪 Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate
```

## ✍️ Development

It brings immense joy and excitement to know that you're keen on contributing to the projects I'm working on. There's always a world of possibilities that can be explored, and having talented individuals like you onboard can truly make a massive difference. Your interest is deeply appreciated, and it's a reminder of the magic ✨ that happens when open-source developers come together and collaborate.

Open-source is the foundation of many groundbreaking innovations, and it's the community of developers like you who fuel this ceaseless evolution. Your ideas 💡, your code 💻, and your passion ❤️ can significantly impact the shape of the projects and contribute to the larger world of technology.

Let's build 🛠️, create 🎨, and revolutionize 🚀 together. Let's take these projects to new heights 🏔️ and unlock their true potential. Your skills 🎯 and ideas 💭 are more than welcome here - they're necessary, valued, and have the potential to spark real change.

So, yes, absolutely, your participation is eagerly welcomed! I'm thrilled 😄 at the prospect of working with you, and I can't wait to see the incredible contributions you'll bring to these projects. Thanks again for showing your interest and excitement. It truly means the world! 🌍

Let's do this, and let's make amazing things happen together. 🚀

## 🌟 Share with Friends!
If you're enjoying the projects and want to send some love back my way, that's music to my ears! Your support is the fuel that keeps this creative machine running, and I am forever grateful for that.

Here are some super cool ways you can express your appreciation and help keep this development train chugging:

- 🌟 Show some love with a GitHub star on the project! It's like applause, but for coders!
- 🐦 Share the love on Twitter! Tweeting about the project helps spread the word and attract more rockstars like you. Don't forget to tag me [@leszekkrol](https://twitter.com/leszekkrol) and use the hashtag `#leszekkrol`!

Your voice is powerful, and your support means the world. Thank you, from the bottom of my heart, for your interest in the development of my community. 🙏

_**PS:** Consider sponsoring my work ([Leszek W. Król](https://www.leszekkrol.com)) on [Kup mi kawę](https://buycoffee.to/leszekkrol)_

<a href="https://buycoffee.to/leszekkrol" target="_blank"><img src="https://buycoffee.to/btn/buycoffeeto-btn-primary.svg" style="width: 200px" alt="Postaw mi kawę na buycoffee.to"></a>

## ⭐️ Author

The author of the project is:
- <b><a href="http://linkedin.com/in/leszekkrol/">Leszek W. Król</a></b>

## 📝 Changelog

### Version 1.2.0 (Latest)
- ✨ **NEW**: Full Stripe integration for payment processing
- ✨ **NEW**: Automatic Stripe customer creation on user registration
- ✨ **NEW**: `<StripeProtectedContent>` component for subscription paywalls
- ✨ **NEW**: `useStripe()` composable for subscription management
- ✨ **NEW**: `GET /api/stripe/subscription` endpoint for checking subscription status
- ✨ **NEW**: Billing portal endpoint for subscription management
- ✨ **NEW**: Checkout session endpoint for purchases
- ✨ **NEW**: Webhook handler for Stripe events
- ✨ **NEW**: `PATCH /api/auth/me` endpoint for flexible user profile updates
- ✨ **NEW**: `requireUser()` helper function in auth utilities
- ✨ **NEW**: `GET /api/auth/me` now returns all user fields (including custom fields)
- ✨ **NEW**: 55 additional unit tests (32 Stripe + 9 subscription + 10 user updates + 4 auth)
- 📚 Updated documentation with comprehensive Stripe setup guide
- 📚 Added examples for user profile updates and subscription paywalls
- 🔄 Added migration guide for existing projects
- 🔧 Improved test coverage to 98%+ for auth utilities
- 🎯 Total: 233 unit tests (178 → 233)

### Version 1.1.0
- Initial stable release
- Magic link authentication system
- JWT token management
- Email provider support (Console, Resend, AutoSend, Nodemailer)
- Fully tested with 178 unit tests

## 🧐 Bug Reports and Feature Requests

Please use the Issue Tracker tool to submit any bug reports and feature requests. When reporting bugs, remember to provide additional information about your hardware configuration and the versions of libraries you are using.

## 🔗 Follow me

<p valign="center">
  <a href="https://twitter.com/leszekkrol"><img width="20px" src="./.github/assets/twitter.svg" alt="Twitter"></a>&nbsp;&nbsp;<a href="https://github.com/leszekkrol"><img width="20px" src="./.github/assets/github.svg" alt="GitHub"></a>
</p>

<p align="center">
  <a href="https://www.leszekkrol.com/"><strong>See the website</strong></a> · 
  <a href="https://twitter.com/leszekkrol"><strong>Leszek W. Król on Twitter</strong></a>
</p>
