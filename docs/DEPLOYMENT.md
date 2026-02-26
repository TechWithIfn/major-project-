# ShikshaSahayak - Deployment Guide

## Overview
ShikshaSahayak is an offline-first NCERT AI tutor built with Next.js 16, React 19, and Tailwind CSS. This guide covers deployment, optimization, and best practices.

## Pre-Deployment Checklist

### 1. Environment Setup
- All dependencies installed via pnpm
- TypeScript compilation successful
- Build completes without errors
- All environment variables configured (if any)

### 2. Performance Optimization
The application is optimized with:
- React Compiler enabled for better performance
- Turbopack as the default bundler (Next.js 16)
- Image optimization enabled
- CSS compression enabled
- Font optimization enabled

### 3. Build Command
```bash
pnpm build
```

### 4. Preview Deployment
```bash
pnpm start
```

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)
Vercel is the recommended platform as it's built by the creators of Next.js.

1. Push your code to GitHub/GitLab
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" and connect your repository
4. Select the project folder
5. Click "Deploy"

**Environment Variables:**
- No required environment variables for offline mode
- Optional: Add API keys for future cloud integrations

**Post-Deployment:**
- Test the application at your deployment URL
- Monitor performance in Vercel Analytics
- Enable Automatic Deployments for continuous updates

### Option 2: Deploy to Other Platforms

#### Docker Deployment
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Traditional Server (AWS EC2, DigitalOcean, etc.)
1. Install Node.js 20+ and pnpm
2. Clone repository
3. Run `pnpm install && pnpm build`
4. Use PM2 for process management
5. Set up Nginx as reverse proxy

## Performance Optimization

### Core Web Vitals
The application is optimized for:
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Optimization Techniques Implemented
1. **Code Splitting:** Automatic via Next.js
2. **Image Optimization:** All images are optimized
3. **Font Loading:** System fonts with fallbacks
4. **Bundle Analysis:** Check with `next/bundle-analyzer`

### Further Optimization Options
```javascript
// next.config.mjs additions for advanced optimization
experimental: {
  esmExternals: true,
  serverMinification: true,
}
```

## Scaling Considerations

### Current Architecture
- Client-side RAG processing (no backend needed)
- Offline-first approach
- Minimal API calls
- Stateless architecture

### Future Scaling
If adding backend features:
1. Use Vercel Functions or serverless alternatives
2. Implement caching with Redis
3. Use CDN for static assets
4. Consider database like Supabase or Neon

## Monitoring

### Vercel Analytics
- Real user monitoring (RUM)
- Performance metrics
- Error tracking
- Web Vitals tracking

### Custom Analytics (Optional)
Add with services like:
- PostHog
- Plausible
- Mixpanel

## Rollback Procedure

### Vercel Rollback
1. Go to project settings
2. Click "Deployments"
3. Find the previous stable deployment
4. Click "Rollback to this deployment"

### Manual Rollback
1. Keep previous build artifacts
2. Revert to previous commit: `git revert <commit-hash>`
3. Deploy: `pnpm build && pnpm start`

## Maintenance

### Regular Tasks
- Monitor error logs weekly
- Review performance metrics monthly
- Update dependencies quarterly
- Test new features before production

### Dependency Updates
```bash
pnpm update
pnpm outdated
```

## Security Best Practices

1. **No Sensitive Data in Code:**
   - All credentials in environment variables
   - No API keys in source code

2. **HTTPS Only:**
   - Automatic on Vercel
   - Configure on custom domains

3. **Headers Security:**
   - Content Security Policy configured
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff

## Support & Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs
- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com

## Troubleshooting

### Build Failures
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `pnpm install`
- Check Node version: `node -v` (requires 20+)

### Performance Issues
- Check bundle size: `npm run analyze`
- Profile with Chrome DevTools
- Monitor Vercel Analytics

### Deployment Issues
- Check build logs in Vercel dashboard
- Verify all environment variables
- Test locally with `pnpm build && pnpm start`

## Version Information
- Next.js: 16.1.6
- React: 19.2.3
- Node.js: 20+
- Package Manager: pnpm
