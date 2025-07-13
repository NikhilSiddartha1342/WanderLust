@@ .. @@
 🏡 WanderLust - Full-Stack Web Application for Listings & Reviews
+
+## Deployment on Render
+
+### Environment Variables Required:
+- `ATLASDB_URL`: MongoDB Atlas connection string
+- `SECRET`: Session secret key
+- `CLOUD_NAME`: Cloudinary cloud name
+- `CLOUD_API_KEY`: Cloudinary API key
+- `CLOUD_API_SECRET`: Cloudinary API secret
+- `MAP_TOKEN`: Mapbox token (optional)
+- `NODE_ENV`: Set to "production"
+
+### Deployment Steps:
+1. Create a new Web Service on Render
+2. Connect your GitHub repository
+3. Set the build command: `npm install`
+4. Set the start command: `npm start`
+5. Add all required environment variables
+6. Deploy
+
 🚀 About the Project