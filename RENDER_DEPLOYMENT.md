# Deploy Backend to Render

## Prerequisites
- GitHub repository with your code (✓ Already done)
- MongoDB Atlas database (✓ Already have connection string)
- Render account (create at https://render.com if needed)

## Step 1: Create New Web Service on Render

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select repository: `piyushgaikwad0205/Evo-ps16`
4. Select the `dev` branch

## Step 2: Configure Build Settings

**Name:** `campus-connect-backend` (or any name you prefer)

**Root Directory:** `server`

**Environment:** `Node`

**Build Command:** `npm install`

**Start Command:** `npm run production`

## Step 3: Add Environment Variables

In Render dashboard, add these environment variables:

```
PORT=4000
NODE_ENV=production

MONGODB_URI=mongodb+srv://gaikwadpiyush488_db_user:piyush@cumpusconnect.tqp6riw.mongodb.net/?appName=cumpusconnect

SECRET=campus
REFRESH_SECRET=campus

CLIENT_URL=http://localhost:3000

ENABLE_KEEP_ALIVE=true
SERVER_URL=https://your-render-url.onrender.com

CLOUDINARY_CLOUD_NAME=dg4jjj0ag
CLOUDINARY_API_KEY=749975565943534
CLOUDINARY_API_SECRET=xxwk6NuKDh_ilor4Q5qowNrvYkI

EMAIL_USER=gaikwadpiyush488@gmail.com
EMAIL_PASS=dlda hpnn fmum urjk

FIREBASE_PROJECT_ID=compusconnect002
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDChGOPAyxTNQZv\n9RFYOftROJK0irpjHW4fYcBmdiOlMKR2pxPXORULAyUGbnrYCgbMCD6zSV6hGYrN\nq9zOtn6nZU9yM0BZzlbPUTQwYPysh19AFLilywFQVMaTsfTFOVBb+f6wZt+zC7Tr\n5fbrqDOeElTZ9MyCUN40PaQ+nQ9G29suICqbAVmyv/NUTraJ8YdjDDKWNfVI6i3v\npJPCwFGXw68vHsdE5Wtw4ko9Qon8kugPEHU65WvSWQCH/GnwfoiVdoLXJjOyPG8p\noMvpOvdavf6x4ZI5WPeyIdeXITin6Hb9nvNyjXfzANqRd9EdjcgpmiNnmUrYJ1jX\ncmI8MzjdAgMBAAECggEAOTIhbi9iLLNGScxXRciCz/6hEKpMJRHFzD97igVJ9OxJ\nJ8R4Doxv1hWeIPaCc5z7I6p2+VPlGdy/VjunSTcbJdCh3DQaw21rVDmN7X3PPlHt\n3ZNaOhHnuH29CDfG/+ka6ninfao6M9UI5WZwxRln2B6Oyan0Kotp0xWfAnQ/Rjej\nTXbXfwHESQKHQnyXhwEiDytLrbe8KM8DH5TMdKiC0Lg6cRcCLVRtqBHdZDtvvb5u\nEthn6eUoJYOHyH+jAaWVj2/Bzvey64XjJ+pwUr3Nfmg7v9IH2OnRR6DRw36O8k71\nTYzzc6r9ap3XF6eBP1f0pI2zr7+xlUZT9/o2YccfpwKBgQDhaX8XrYdlwFLwwSmE\nQRa97S4MrU5E0VR3Z2cXH+CFKqjeBe/4prWnj5L7OqP14JEkidckQ2/GfdIsZklt\nlbAWQdNg0fAjr0M6dxd8wqvC7HB+8FJOWnzlamFFD0+n6I9rf+CpG8wG7SBKrKwP\nW4/65bpGO6hCnCRaVgvgIdS/TwKBgQDc6aUKNwk+LWlmVAuu6Y/5YWQ83YV1VJIz\nPVziaOae2bf8BO4RY2NDTjrFbyFFuLPb4XBbfZslxrmZJ4uhVPJdgnDvF039UTqL\nJjXaOWbgXQlTyJOo+uNLrv3omohDFMFoKFBJoGft1imNIXBJkVqdUjDNtYZMtcdz\nFi9dq5UaEwKBgQCmcwqAZ4lV36DfWyPXH2E1ulCI1+i19IWU7mw3rThT3V55JJVB\nXYlCREja70Bnrf4/pvGRO6LsRbjPRHDwVNqEdPMryZq0HxVbtNlJLU88Tu/7LGb6\nqOMVXWqaXmYJrTdKwFEbTwVoD+4KdltPs+Mr+DuG5UKofThy5Js8VH8PDQKBgQCg\ngts52tdKaDCG+1Yp1uaXah4s4z/PCo3X0SQmFdZLYSH/aY2Y8L/07Whif+aLBDMa\n9mhu8YrDHetIzqTzqgcXzmlEL4ipIFYLOM40KzUGnFLkn346b2CrYxB166JKK1CD\n35bGiFg7RTqXos41hflzCX8QWG6mWgX7JwlvY/ZIJQKBgC8sIu5lFTNixRsIGmOO\nrF/X1LKg9gvw6J4jFkbSAA1hSlUDbV8idFwzGoB2+N1uvxAnLcJTEzvtb1Of16Er\nSuDltcTWz2+0qj9+3D4qjzkHNYvmfi0q0ajMFKAtFJTbqejvP9eUN4DhXtFejmaC\ny1QsnUYWMSiel8/OneLIZHYQ\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@compusconnect002.iam.gserviceaccount.com
```

## Step 4: Important Updates After Deployment

Once deployed, Render will give you a URL like: `https://campus-connect-backend.onrender.com`

Update these variables in Render:
- `SERVER_URL` → Your actual Render URL
- `CLIENT_URL` → Your frontend URL (once deployed)

## Step 5: Deploy

Click **"Create Web Service"** and Render will:
1. Clone your repository
2. Install dependencies
3. Start your server
4. Give you a live URL

## Step 6: Verify Deployment

Test your API:
```
https://your-render-url.onrender.com/health
https://your-render-url.onrender.com/colleges
```

## Notes

⚠️ **Free Tier Limitations:**
- Service spins down after 15 mins of inactivity
- Takes ~30 seconds to wake up on first request
- `ENABLE_KEEP_ALIVE=true` helps prevent this

💡 **After Backend is Live:**
- Update CLIENT_URL in Render dashboard
- Deploy frontend with backend URL
- Test signup/login flow end-to-end
