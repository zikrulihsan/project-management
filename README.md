# Project Management App

A lightweight, scalable project management application built with React, TypeScript, Vite, and Supabase.

## 🚀 Live Demo

**Deployed Application**: [https://project-and-note-v1.netlify.app](https://project-and-note-v1.netlify.app)

## 📋 Features

- **Project Management**: Create, read, update, and delete projects
- **Notes System**: Organize notes within projects
- **User Authentication**: Secure login/signup with Supabase Auth
- **Role-Based Access Control**: Admin, Manager, Member, and Viewer roles
- **Real-time Updates**: Live data synchronization across clients
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool (fast dev server & builds)
- **React Router v6** - Client-side routing
- **Lucide React** - Icon library

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Edge Functions (API layer)
  - Real-time subscriptions

## 📦 Prerequisites

Before running this project, ensure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **Yarn** package manager ([Install](https://yarnpkg.com/getting-started/install))
- **Supabase Account** ([Sign up](https://supabase.com/))

## ⚙️ Environment Variables

This project requires Supabase credentials to run. These are stored in environment variables for security.

### Required Variables

Create a `.env` file in the root directory with the following:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Getting Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project (or create a new one)
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Environment Variable Example

See `.env.example` for a template:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Important**:
> - Never commit `.env` to version control (already in `.gitignore`)
> - The `VITE_` prefix is required for Vite to expose variables to the client
> - The anon key is safe to expose to the client (protected by RLS policies)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd project-management
```

### 2. Install Dependencies

```bash
yarn install
```

This will install all required packages from `package.json`.

### 3. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Supabase credentials
```

### 4. Set Up Database

Run the SQL setup script in your Supabase project:

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-setup.sql`
4. Run the SQL script

This will create all necessary tables, policies, and functions.

### 5. Deploy Edge Functions (Optional but Recommended)

This project uses Supabase Edge Functions for the API layer. Deploy them:

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy get-projects
supabase functions deploy create-project
supabase functions deploy get-project
supabase functions deploy get-notes
supabase functions deploy create-note
supabase functions deploy update-project
supabase functions deploy delete-project
supabase functions deploy update-note
supabase functions deploy delete-note
```

See `EDGE-FUNCTIONS-MIGRATION.md` for more details.

### 6. Run Development Server

```bash
yarn dev
```

The app will be available at: **http://localhost:5173**

## 📝 Available Scripts

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Preview production build locally
yarn preview

# Run linter
yarn lint

# Type check
tsc --noEmit
```

## 🏗️ Project Structure

```
project-management/
├── src/
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React Context providers (Auth, etc.)
│   ├── lib/              # Utilities and configurations
│   │   └── supabase.ts   # Supabase client setup
│   ├── pages/            # Page components (Projects, Notes, etc.)
│   ├── App.tsx           # Main app component with routing
│   ├── App.css           # Global styles
│   ├── index.css         # Base styles
│   └── main.tsx          # App entry point
├── supabase/             # Supabase Edge Functions
│   └── functions/        # Individual function directories
├── public/               # Static assets
├── .env                  # Environment variables (not committed)
├── .env.example          # Environment variables template
├── netlify.toml          # Netlify deployment config
├── supabase-setup.sql    # Database schema and policies
├── DEPLOYMENT.md         # Deployment guide
├── TECHNICAL_REPORT.md   # Architecture decisions
└── package.json          # Dependencies and scripts
```

## 🔐 Authentication

The app uses Supabase Authentication with:

- **Email/Password** login
- **Magic Link** authentication
- **Social OAuth** (Google, GitHub - configurable)
- **JWT-based** sessions
- **Automatic token refresh**

### First Time Setup

1. Run the app: `yarn dev`
2. Click "Sign Up" to create an account
3. Verify your email (check Supabase email settings)
4. Login and start using the app

## 🛡️ Security

This project implements multiple security layers:

1. **Row Level Security (RLS)**: Database-level access control
2. **Role-Based Access Control (RBAC)**: User roles (Admin, Manager, Member, Viewer)
3. **Environment Variables**: Sensitive data not in code
4. **HTTPS Only**: Enforced in production
5. **Security Headers**: Configured in `netlify.toml`
6. **XSS Protection**: React automatically escapes content

## 🌐 Deployment

The app is deployed on Netlify with automatic deployments from the `main` branch.

### Deploy Your Own

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

See `DEPLOYMENT.md` for detailed deployment instructions.

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - How to deploy to Netlify
- **[TECHNICAL_REPORT.md](./TECHNICAL_REPORT.md)** - Architecture & design decisions
- **[EDGE-FUNCTIONS-MIGRATION.md](./EDGE-FUNCTIONS-MIGRATION.md)** - Edge Functions guide
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions

## 🔧 Troubleshooting

### Common Issues

#### 1. "Supabase client initialization error"

**Solution**: Check that your `.env` file has valid credentials:
```bash
# Verify .env exists and has correct format
cat .env
```

#### 2. "Failed to fetch" errors

**Solution**:
- Ensure Supabase project is not paused
- Check network connection
- Verify environment variables start with `VITE_`

#### 3. Build fails with TypeScript errors

**Solution**:
```bash
# Check for type errors
yarn tsc --noEmit

# Fix errors and rebuild
yarn build
```

#### 4. Authentication not working

**Solution**:
- Verify email provider is enabled in Supabase
- Check Site URL in Supabase Authentication settings
- Ensure redirect URLs are configured correctly

### Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Check Supabase logs in the dashboard
3. Review the documentation files
4. Check that all environment variables are set correctly

## 🎯 Development Workflow

### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and test locally:
   ```bash
   yarn dev
   ```

3. Build to check for errors:
   ```bash
   yarn build
   ```

4. Commit and push:
   ```bash
   git add .
   git commit -m "Add your feature"
   git push origin feature/your-feature-name
   ```

5. Create a Pull Request on GitHub

### Code Quality

- **TypeScript**: Enforces type safety
- **ESLint**: Catches common issues
- **Vite**: Fast feedback loop during development

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

Built as a technical assessment demonstrating:
- Clean, scalable architecture
- Modern React patterns
- Backend abstraction for easy migration
- Security best practices
- Comprehensive documentation

---

**Questions?** Open an issue or check the documentation files.

**Live Demo**: [https://project-and-note-v1.netlify.app](https://project-and-note-v1.netlify.app)