@@ .. @@
 | **Error Handling**    | Custom ExpressError class and middleware        |
 
 
+## 🚀 Deployment
 
+### Vercel Deployment
 
+1. **Environment Variables**: Set up the following environment variables in your Vercel dashboard:
+   - `ATLASDB_URL` - Your MongoDB Atlas connection string
+   - `SECRET` - Session secret key
+   - `CLOUD_NAME` - Cloudinary cloud name
+   - `CLOUD_API_KEY` - Cloudinary API key
+   - `CLOUD_API_SECRET` - Cloudinary API secret
+   - `MAP_TOKEN` - Mapbox access token
+   - `NODE_ENV` - Set to "production"
 
+2. **Deploy**: Connect your GitHub repository to Vercel and deploy
 
+3. **Health Check**: Visit `/api/health` to verify the deployment is working
 
+### Important Notes for Vercel:
+- Make sure all environment variables are properly set in Vercel dashboard
+- The app uses serverless functions, so database connections are handled differently
+- Static files are served from the `/public` directory
+- All routes are handled through the main Express app
 
 📋 Features