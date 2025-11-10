# Deployment Guide - Render.com

## 🚀 Deploy Backend to Render

### Method 1: Using Render Dashboard (Recommended)

1. **Create New Web Service**

   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**

   - **Name**: `websocket-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `./Dockerfile` (root Dockerfile that includes backend)
   - **Docker Build Context**: `./` (root directory)

3. **Environment Variables**
   Add these in Render dashboard:

   ```
   DATABASE_URL=<your_postgres_connection_string>
   PORT=3000
   NODE_ENV=production
   ```

4. **Health Check**

   - **Health Check Path**: `/health`

5. **Click "Create Web Service"**

### Method 2: Using render.yaml (Infrastructure as Code)

1. **Add render.yaml to your repo** (already created)

2. **In Render Dashboard**

   - Go to "Blueprint" → "New Blueprint Instance"
   - Select your repository
   - Render will read `render.yaml` and create services automatically

3. **The render.yaml includes:**
   - Web Service (backend)
   - PostgreSQL Database
   - Environment variables
   - Health check

## 🗄️ Database Setup

### Create PostgreSQL Database

1. In Render Dashboard → "New +" → "PostgreSQL"
2. **Name**: `websocket-db`
3. **Database**: `websocket_demo`
4. **User**: `admin`
5. **Region**: Same as web service
6. Click "Create Database"

### Get Connection String

1. Go to your PostgreSQL database page
2. Copy "Internal Database URL" (for same region)
3. Add to backend environment variables as `DATABASE_URL`

## 🔧 Configuration

### Backend Environment Variables

Required:

- `DATABASE_URL`: PostgreSQL connection string from Render
- `PORT`: 3000 (or Render's default)
- `NODE_ENV`: production

### CORS Configuration

The backend is configured to allow all origins (`cors: { origin: '*' }`).

For production, update `backend/server.js`:

```javascript
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  },
});
```

## 📱 Update Mobile App

After deployment, update `mobile/App.js`:

```javascript
const SOCKET_URL = "https://your-app.onrender.com";
```

Replace `your-app` with your actual Render service name.

## ✅ Verify Deployment

### Test Backend

1. **Health Check**

   ```bash
   curl https://your-app.onrender.com/health
   ```

   Should return:

   ```json
   {
     "status": "OK",
     "message": "WebSocket server is running",
     "timestamp": "..."
   }
   ```

2. **Get Messages**

   ```bash
   curl https://your-app.onrender.com/api/messages
   ```

3. **WebSocket Connection**
   - Update mobile app with new URL
   - Test sending messages
   - Should work across internet!

## 🐛 Troubleshooting

### Build Fails

**Error: "Could not read package.json"**

Solution: Make sure Dockerfile at root copies backend files:

```dockerfile
COPY backend/package*.json ./
COPY backend/ ./
```

**Error: "Module not found"**

Solution: Check that all dependencies are in `backend/package.json`

### Database Connection Fails

1. Check `DATABASE_URL` environment variable
2. Verify database is in same region as web service
3. Check database is running (not suspended)
4. Use "Internal Database URL" not "External"

### WebSocket Not Connecting

1. Render provides HTTPS by default
2. Use `wss://` for WebSocket in production (but `http://` works with Socket.io)
3. Check CORS configuration
4. Verify health check passes

### Cold Starts

Render free tier has cold starts (services sleep after inactivity).

Solutions:

- Upgrade to paid plan
- Use cron job to ping health endpoint
- Accept 30-60 second startup delay

## 💰 Render Pricing

### Free Tier

- ✅ 750 hours/month web service
- ✅ PostgreSQL database (90 days, then suspended)
- ❌ Cold starts (services sleep)
- ❌ Custom domains (paid feature)

### Paid Plans

- **Starter**: $7/month (no cold starts)
- **Standard**: $25/month (more resources)
- Database: $7/month (persistent)

## 🔒 Security Best Practices

### For Production:

1. **Update CORS**

   ```javascript
   cors: {
     origin: 'https://your-mobile-app.com',
     methods: ['GET', 'POST']
   }
   ```

2. **Add Rate Limiting**

   ```bash
   npm install express-rate-limit
   ```

3. **Use Environment Variables**

   - Never commit credentials
   - Use Render's environment variables

4. **Enable HTTPS Only**

   - Render provides free SSL
   - Redirect HTTP to HTTPS

5. **Add Authentication**
   - JWT tokens
   - User authentication
   - Message authorization

## 📊 Monitoring

### Render Dashboard

- View logs in real-time
- Monitor CPU/Memory usage
- Check deployment history
- Set up alerts

### Health Check

Backend has `/health` endpoint:

```javascript
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "WebSocket server is running",
    timestamp: new Date().toISOString(),
  });
});
```

## 🔄 Continuous Deployment

Render auto-deploys when you push to GitHub:

1. Push to `main` branch
2. Render detects changes
3. Builds new Docker image
4. Deploys automatically
5. Zero-downtime deployment

## 📝 Deploy Checklist

- [ ] Create PostgreSQL database on Render
- [ ] Create Web Service on Render
- [ ] Set environment variables (DATABASE_URL, PORT, NODE_ENV)
- [ ] Configure health check path: `/health`
- [ ] Wait for deployment to complete
- [ ] Test health endpoint
- [ ] Test API endpoints
- [ ] Update mobile app with production URL
- [ ] Test WebSocket connection
- [ ] Test sending messages

## 🎯 Next Steps

After successful deployment:

1. **Custom Domain**: Add your domain in Render
2. **Monitoring**: Set up logging service
3. **Scaling**: Monitor and upgrade as needed
4. **Security**: Add authentication
5. **Features**: Add more features to your app

## 📚 Resources

- [Render Documentation](https://render.com/docs)
- [Render Docker Deploy](https://render.com/docs/docker)
- [Render PostgreSQL](https://render.com/docs/databases)
- [Render Environment Variables](https://render.com/docs/environment-variables)

---

**Happy Deploying! 🚀**
