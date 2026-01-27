# Regenerate Prisma Client
Write-Host "Regenerating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
Write-Host "Prisma Client regenerated successfully!" -ForegroundColor Green
Write-Host "Please restart your dev server (npm run dev)" -ForegroundColor Cyan
