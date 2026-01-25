# Vercel Deployment Guide for StudentHire

## Prerequisites
- GitHub repository: https://github.com/eldasdev/testing.git
- Vercel account (sign up at https://vercel.com)
- PostgreSQL database (can use Vercel Postgres, Neon, Supabase, or any PostgreSQL provider)

## Step-by-Step Deployment

### 1. Connect GitHub Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select **"GitHub"** and authorize if needed
5. Find and select your repository: **`eldasdev/testing`**
6. Click **"Import"**

### 2. Configure Project Settings

#### Framework Preset
- **Framework Preset**: Next.js (should auto-detect)

#### Build Settings
- **Build Command**: `npm run build` (or leave default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)
- **Root Directory**: `./` (default)

### 3. Environment Variables

Add the following environment variables in Vercel:

#### Required Variables:
```
DATABASE_URL=your_postgresql_connection_string
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_key
```

#### Optional Variables (if used):
```
NODE_ENV=production
```

**How to add:**
1. In the project settings, go to **"Environment Variables"**
2. Add each variable for **Production**, **Preview**, and **Development** environments
3. Click **"Save"**

### 4. Database Setup

#### Option A: Use Vercel Postgres (Recommended)
1. In your Vercel project, go to **"Storage"** tab
2. Click **"Create Database"** → Select **"Postgres"**
3. Copy the connection string and add it as `DATABASE_URL`

#### Option B: Use External PostgreSQL (Neon, Supabase, etc.)
1. Get your PostgreSQL connection string from your provider
2. Add it as `DATABASE_URL` environment variable

#### Run Database Migrations:
After setting up the database, you'll need to run migrations:

**Option 1: Using Vercel CLI (Recommended)**
```bash
npm i -g vercel
vercel login
vercel link
npx prisma migrate deploy
```

**Option 2: Using Prisma Studio or your database provider's console**
- Run the SQL migrations manually from `prisma/migrations` folder

### 5. Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

### 6. Deploy

1. Click **"Deploy"** button
2. Vercel will:
   - Install dependencies
   - Run `prisma generate` (via postinstall script)
   - Build your Next.js app
   - Deploy to production

### 7. Post-Deployment

#### Seed Database (Optional)
If you want to seed the database with initial data:
```bash
vercel env pull .env.local
npx prisma db seed
```

Or run seed script manually through your database provider.

#### Verify Deployment
1. Visit your deployment URL: `https://your-app.vercel.app`
2. Test authentication
3. Test database connections
4. Check admin panel functionality

## Troubleshooting

### Build Errors

**Prisma Client not generated:**
- Ensure `postinstall` script runs: `prisma generate`
- Check that `DATABASE_URL` is set correctly

**Database connection errors:**
- Verify `DATABASE_URL` format: `postgresql://user:password@host:port/database?sslmode=require`
- Check database provider allows connections from Vercel IPs
- Ensure SSL is enabled for production databases

**NextAuth errors:**
- Verify `NEXTAUTH_URL` matches your deployment URL
- Ensure `NEXTAUTH_SECRET` is set and secure

### Common Issues

1. **"Module not found" errors**: Ensure all dependencies are in `package.json`
2. **"Prisma Client not found"**: Run `prisma generate` in build command
3. **"Database connection failed"**: Check `DATABASE_URL` and network access

## Continuous Deployment

Once connected:
- Every push to `master` branch → Auto-deploys to Production
- Every pull request → Creates Preview deployment
- Every push to other branches → Creates Preview deployment

## Useful Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link local project to Vercel
vercel link

# Pull environment variables
vercel env pull .env.local

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs
```

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment
