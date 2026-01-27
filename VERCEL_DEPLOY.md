# Vercel Deployment Guide

## Prerequisites
- Vercel account
- GitHub/GitLab/Bitbucket repository
- Database connection string (PostgreSQL)

## Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret (generate with: `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your production URL (e.g., `https://your-app.vercel.app`)

### Optional
- `NODE_ENV` - Set to `production`

## Deployment Steps

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub/GitLab repository

2. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

3. **Set Environment Variables**
   - Add all required environment variables in project settings

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically:
     - Install dependencies (`npm install`)
     - Run Prisma generate (`postinstall` script)
     - Build the application (`npm run build`)
     - Deploy to production

## Post-Deployment

1. **Run Database Migrations**
   ```bash
   npx prisma migrate deploy
   ```
   Or use Vercel CLI:
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

2. **Seed Database (if needed)**
   - Access admin panel
   - Use "Seed Catalog" button for skills

## File Uploads

- Uploads are stored in `public/uploads/`
- For production, consider using:
  - Vercel Blob Storage
  - AWS S3
  - Cloudinary
  - Or other cloud storage solutions

## Troubleshooting

- **Build fails**: Check environment variables are set
- **Database connection**: Verify `DATABASE_URL` is correct
- **Prisma errors**: Ensure `postinstall` script runs (`prisma generate`)
- **Image uploads**: Files are stored locally; consider cloud storage for production
