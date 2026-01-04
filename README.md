# 🪄 Nuxt Magic Auth Starter

[![Nuxt](https://img.shields.io/badge/nuxt-4.svg)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/vue-blue)](https://vuejs.org)
[![license](https://img.shields.io/badge/license-mit-brightgreen.svg)](https://en.wikipedia.org/wiki/MIT_License)

Welcome to **Nuxt Magic Auth Starter**, a production-ready starter template for Nuxt.js applications with passwordless magic link authentication. This starter provides a complete authentication system using email-based magic links, eliminating the need for traditional passwords.

<img width="1707" height="1068" alt="Zrzut ekranu 2026-01-4 o 19 54 54" src="https://github.com/user-attachments/assets/8088cb4d-7b20-48f3-b998-82f41370c38b" />

## ✨ Features

- 🔐 **Magic Link Authentication** - Passwordless login via email
- 🎯 **JWT Token Management** - Secure token-based authentication
- 📧 **Email Provider Agnostic** - Support for Console (dev), Resend, and SMTP/Nodemailer
- 🎨 **Tailwind CSS** - Beautiful, responsive UI out of the box
- 📦 **TypeScript** - Full type safety and IntelliSense
- 🚀 **Production Ready** - Includes security best practices, rate limiting, and error handling
- 🔧 **Zero Config** - Works out-of-the-box with sensible defaults
- 📱 **Responsive Design** - Mobile-first, accessible components

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

```typescript
export default defineNuxtConfig({
  extends: ['nuxt-magic-auth-starter'],
  modules: ['@nuxtjs/tailwindcss'],
  
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    emailProvider: process.env.EMAIL_PROVIDER || 'console',
    emailConfig: {
      fromEmail: process.env.FROM_EMAIL,
      fromName: process.env.FROM_NAME
    },
    public: {
      appUrl: process.env.APP_URL
    }
  }
})
```

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
| `useAuth()` composable | Complete auth state management |
| `/api/auth/*` endpoints | Ready-to-use authentication API |
| `<AuthMagicLinkForm>` | Complete login form with title, description, messages |
| `<AuthStarterPage>` | Ready-to-use landing page component |
| `<AuthUserMenu>` | User dropdown with logout |
| `<AuthLoginButton>` | Styled login button with variants |
| `<AuthProtectedContent>` | Show content only to logged-in users |
| `<AuthLoadingSpinner>` | Loading indicator component |
| `auth` middleware | Protect routes easily |
| `guest` middleware | Redirect logged-in users |
| Prisma schema | User & VerificationToken models |
| Email templates | Beautiful magic link emails |

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
# Provider: console | resend | nodemailer
EMAIL_PROVIDER="console"
FROM_EMAIL="noreply@yourapp.com"
FROM_NAME="Your App Name"

# Resend (if EMAIL_PROVIDER=resend)
RESEND_API_KEY="re_your_api_key"

# SMTP (if EMAIL_PROVIDER=nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/send-magic-link` | Send magic link to email |
| `POST` | `/api/auth/verify-token` | Verify token and authenticate |
| `GET` | `/api/auth/me` | Get current authenticated user |
| `POST` | `/api/auth/logout` | Clear authentication cookie |

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
function onSuccess(email) {
  console.log('Magic link sent to:', email)
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

**Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `@success` | `email: string` | Emitted when magic link is sent successfully |
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

**Sizes:** `sm`, `md`, `lg` | **Colors:** `primary`, `white`, `gray`

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
  sendMagicLink,  // (email: string, options?: { name?: string }) => Promise
  verifyToken,    // (token: string) => Promise
  logout,         // () => Promise
  refreshUser     // () => Promise
} = useAuth()
```

**Example Usage:**

```vue
<script setup>
const { user, isLoggedIn, sendMagicLink, logout, loading } = useAuth()

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
</script>

<template>
  <div v-if="isLoggedIn">
    <p>Welcome, {{ user?.name }}!</p>
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

### Prisma Models

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model VerificationToken {
  id        String   @id @default(cuid())
  token     String   @unique
  email     String
  expires   DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Database Commands

```bash
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio
```

## 📧 Email Providers

### Console (Development)

Default provider. Magic links are logged to the terminal - no configuration required.

```env
EMAIL_PROVIDER="console"
```

### Resend

Modern email API for production.

```bash
npm install resend
```

```env
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_your_api_key"
```

### Nodemailer (SMTP)

Universal SMTP support for Gmail, Outlook, or custom servers.

```bash
npm install nodemailer @types/nodemailer
```

```env
EMAIL_PROVIDER="nodemailer"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## 🧪 Testing

The project includes 93+ unit tests covering all utilities, API logic, and composables.

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
