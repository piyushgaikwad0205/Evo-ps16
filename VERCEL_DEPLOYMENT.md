# Deploy Frontend to Vercel

## Prerequisites
- GitHub repository with your code (✓ Already done)
- Backend deployed on Render (✓ URL: https://campusconnect-naip.onrender.com)
- Vercel account (create at https://vercel.com if needed)

## Step 1: Create `.env.production` File

First, create environment file for production in the `client` folder:

Create `client/.env.production`:
```
REACT_APP_API_URL=https://campusconnect-naip.onrender.com
```

## Step 2: Update Backend CORS

Before deploying, ensure your backend allows your Vercel domain. The backend will need to update `CLIENT_URL` after you get your Vercel URL.

## Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `piyushgaikwad0205/Evo-ps16`
4. Configure project:
   - **Framework Preset:** Create React App
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`

5. **Environment Variables:**
   Add this in Vercel dashboard:
   ```
   REACT_APP_API_URL=https://campusconnect-naip.onrender.com
   ```

6. Click **"Deploy"**

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to client folder
cd client

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: campus-connect-frontend
# - Directory: ./
# - Build settings: Auto-detected (Create React App)

# Deploy to production
vercel --prod
```

## Step 4: Update Backend Environment Variables

After deployment, Vercel will give you a URL like:
`https://campus-connect-frontend.vercel.app`

Update your backend on Render:
1. Go to Render Dashboard → Your service
2. Update environment variable:
   ```
   CLIENT_URL=https://campus-connect-frontend.vercel.app
   ```
3. Save (this will redeploy the backend)

## Step 5: Configure Vercel Rewrites (if needed)

If you get 404 errors on refresh, create `client/vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Try signing up with a college email
3. Test login
4. Check if all features work

## Common Issues & Solutions

### Issue: Vercel deployment fails during build
**Symptoms:** Build fails with errors about missing dependencies or modules
**Solution:** 
```bash
# Clean and rebuild locally first
cd client
rm -rf node_modules package-lock.json
npm install
npm run build

# If successful, commit and push
git add .
git commit -m "Fix dependencies for Vercel"
git push origin dev
```

### Issue: Build succeeds but deployment still fails
**Solution:** Check these in Vercel dashboard:
- Root Directory is set to `client` (not the repo root)
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`
- Node Version: 18.x or higher (set in Environment Variables: `NODE_VERSION=18`)

### Issue: "Failed to compile" during Vercel build
**Solution:** 
1. Check for TypeScript errors (even if using JavaScript)
2. Fix any ESLint errors that block build
3. Ensure all imports are correct
4. Add to `client/.env.production`:
   ```
   GENERATE_SOURCEMAP=false
   CI=false
   ```

### Issue: API calls failing
**Solution:** Check CORS settings in backend. Ensure `CLIENT_URL` matches your Vercel domain.

### Issue: 404 on page refresh
**Solution:** The `vercel.json` file should handle this. If still happening:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Issue: Environment variables not working
**Solution:** 
- Ensure `REACT_APP_API_URL` is set in Vercel dashboard
- Redeploy after adding environment variables
- Check browser console for API URL
- Verify the variable name starts with `REACT_APP_`

### Issue: Build fails with "JavaScript heap out of memory"
**Solution:** Add this to Vercel environment variables:
```
NODE_OPTIONS=--max_old_space_size=4096
```

### Issue: CSS/Tailwind not working in production
**Warning:** You have a CSS nesting warning. To fix:
1. Install postcss-nesting:
   ```bash
   cd client
   npm install -D postcss-nesting
   ```
2. Update `postcss.config.js`:
   ```javascript
   module.exports = {
     plugins: {
       'postcss-nesting': {},
       tailwindcss: {},
       autoprefixer: {},
     },
   };
   ```

### Issue: Build succeeds locally but fails on Vercel
**Solution:**
1. Check Node version mismatch - add to Vercel Environment Variables:
   ```
   NODE_VERSION=18
   ```
2. Clear Vercel build cache:
   - Go to Project Settings → General
   - Scroll down and click "Clear Build Cache"
3. Check for case-sensitive imports (Linux is case-sensitive)

## Troubleshooting: Deploy Using Vercel CLI

If dashboard deployment keeps failing, try CLI:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login
vercel login

# Go to client folder
cd client

# Run deployment
vercel

# When prompted:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name: campus-connect-frontend
# - Directory: ./ (current directory)
# - Override settings? No

# For production deployment
vercel --prod
```

## Step 7: Manual Build Test Before Deploying

## Auto-Deploy on Git Push

Vercel automatically redeploys when you push to GitHub:
- Push to `dev` branch → Automatic preview deployment
- Push to `main` branch → Production deployment

## Performance Tips

1. **Enable Vercel Analytics** (optional)
2. **Use Vercel's Edge Network** for global CDN
3. **Monitor build times** and optimize if needed

## Post-Deployment Checklist

- [ ] Frontend is live on Vercel
- [ ] Backend CLIENT_URL updated with Vercel URL
- [ ] Can access homepage without errors
- [ ] Signup/login works
- [ ] API calls work (check network tab)
- [ ] College dropdown loads
- [ ] Firebase authentication works (if used)
- [ ] Images upload to Cloudinary
- [ ] All pages load correctly

## URLs Summary

- **Frontend (Vercel):** https://your-app.vercel.app
- **Backend (Render):** https://campusconnect-naip.onrender.com
- **Database:** MongoDB Atlas (already configured)

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Check deployment logs in Vercel dashboard
- Check browser console for errors
