# Vercel Deployment

## Quick Deploy

1. **Push to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Add environment variables (see below)
   - Click "Deploy"

## Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-app.vercel.app
```

## Build Configuration

- ✅ Build Command: `npm run build` (auto-detected)
- ✅ Install Command: `npm install` (auto-detected)
- ✅ Postinstall: Automatically runs `prisma generate`
- ✅ Framework: Next.js (auto-detected)

## Post-Deployment

1. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

2. Seed database (optional):
   - Use admin panel "Seed Catalog" button

## Notes

- File uploads stored in `public/uploads/` (consider cloud storage for production)
- Prisma Client auto-generated on install
- All builds verified and passing
