# Deploy Classifier Microservice to Render

## Overview

The classifier microservice is a Flask-based AI service that uses Hugging Face transformers for text classification. It needs to be deployed separately as it's a Python service.

## Prerequisites
- Backend already deployed on Render (✓)
- GitHub repository with code (✓)

## Important Notes

⚠️ **Resource Requirements:**
- The model download is ~1.6GB+ on first run
- Free tier may be slow for this service
- Consider using a paid plan for better performance
- First startup will take 5-10 minutes to download model

## Step 1: Deploy to Render

### Create New Web Service

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo: `piyushgaikwad0205/Evo-ps16`
4. Select the `dev` branch

### Configure Service

**Name:** `campus-connect-classifier`

**Root Directory:** `classifier_server`

**Environment:** `Python 3`

**Build Command:**
```bash
pip install -r requirements.txt && pip install torch --index-url https://download.pytorch.org/whl/cpu
```

**Start Command:**
```bash
python classifier_api.py
```

**Instance Type:** 
- Minimum: Starter ($7/month) - Recommended
- Free tier will work but be very slow

### Environment Variables

Add in Render dashboard:
```
PORT=5000
FLASK_ENV=production
```

## Step 2: Wait for Model Download

The first deployment will take 10-15 minutes because:
1. Docker container builds
2. Dependencies install (~2-3 min)
3. Model downloads from Hugging Face (~1.6GB, 5-10 min)
4. Service starts

**Check logs in Render dashboard:**
```
Downloading model...
Classifier initialized successfully
Running on http://0.0.0.0:5000
```

## Step 3: Get Your Classifier URL

After deployment, Render gives you a URL like:
```
https://campus-connect-classifier.onrender.com
```

**Test it:**
```bash
curl -X POST https://campus-connect-classifier.onrender.com/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "I love playing football and basketball"}'
```

Expected response:
```json
{
  "response": {
    "categories": [
      {"label": "Sports", "score": 0.95},
      {"label": "Gaming", "score": 0.02},
      ...
    ]
  }
}
```

## Step 4: Update Backend Environment Variables

Go to your **backend service** on Render and add:

```
CLASSIFIER_API_URL=https://campus-connect-classifier.onrender.com/classify
```

Save and redeploy the backend.

## Step 5: Verify Integration

Test from your main backend that it can call the classifier:

1. Create a post with content
2. Check if categories are auto-detected
3. Monitor backend logs for classifier API calls

## Performance Optimization

### Option 1: Use Docker Image (Faster Startup)

If you want faster deployments, use the pre-built Docker image:

**Build Command:** (leave empty)

**Docker Command:**
```bash
docker run -p 5000:5000 neaz/classifier_api
```

### Option 2: Cache Model Files

To avoid downloading on every deploy, you can:
1. Download model locally
2. Upload to cloud storage (S3, GCS)
3. Download from storage in start script

## Troubleshooting

### Issue: Service times out on startup
**Solution:** 
- Increase startup timeout in Render settings
- Use paid tier for more resources
- Check logs for download progress

### Issue: Out of memory
**Solution:**
- Upgrade to Starter plan (512MB → 2GB)
- The model needs ~1.5GB RAM to run

### Issue: Model download fails
**Solution:**
- Check Hugging Face status
- Try redeploying
- Verify internet connectivity from container

### Issue: 500 errors from classifier
**Solution:**
- Check classifier logs in Render
- Verify model initialized: "Classifier initialized successfully"
- Test endpoint directly with curl

## Alternative: Deploy on Railway.app

If Render is slow, try Railway (similar pricing):

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select repo and branch
4. Root directory: `classifier_server`
5. Use Dockerfile for deployment
6. Add PORT=5000 environment variable

## Cost Comparison

| Platform | Free Tier | Paid Tier | Notes |
|----------|-----------|-----------|-------|
| Render | 512MB RAM | $7/mo (2GB) | Slow on free tier |
| Railway | $5 credit | Pay-as-you-go | Faster cold starts |
| Heroku | None | $5-7/mo | Good performance |

## Model Information

**Model:** `facebook/bart-large-mnli`
- Size: ~1.6GB
- Categories: 18 predefined labels
- Framework: PyTorch
- Zero-shot classification

## Health Check

Add to backend to verify classifier is up:

```javascript
// In your backend
app.get('/health/classifier', async (req, res) => {
  try {
    const response = await axios.get(process.env.CLASSIFIER_API_URL.replace('/classify', ''));
    res.json({ status: 'ok', classifier: response.data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
```

## Summary Checklist

- [ ] Classifier deployed on Render
- [ ] Model downloaded successfully (check logs)
- [ ] Classifier URL obtained
- [ ] `CLASSIFIER_API_URL` added to backend
- [ ] Backend redeployed with new env var
- [ ] Test classifier endpoint directly
- [ ] Test from backend (create post with auto-categorization)
- [ ] Monitor performance and errors

## Final URLs

- **Frontend:** https://your-app.vercel.app
- **Backend:** https://campusconnect-naip.onrender.com
- **Classifier:** https://campus-connect-classifier.onrender.com
- **Database:** MongoDB Atlas
