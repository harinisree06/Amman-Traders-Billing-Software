# MongoDB Setup Guide for Billing Software

## Step 1: Create MongoDB Atlas Account (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new **Free** cluster (M0 Sandbox)
4. Choose a cloud provider and region (closest to you)
5. Click "Create Cluster"

## Step 2: Create Database User

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create username and password (save these!)
5. Set privileges to **"Atlas Admin"** or **"Read and write to any database"**
6. Click **"Add User"**

## Step 3: Whitelist IP Address

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development) or add specific IPs
4. Click **"Confirm"**

## Step 4: Get Connection String

1. Go to **Clusters** → Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your database user credentials
5. Add database name at the end: `...mongodb.net/billing?retryWrites=true&w=majority`

**Final connection string should look like:**
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/billing?retryWrites=true&w=majority
```

## Step 5: Set Environment Variable

### For Railway (Backend Deployment):

1. Go to your Railway project
2. Click on your `billing-server` service
3. Go to **Variables** tab
4. Add new variable:
   - **Key**: `MONGODB_URI`
   - **Value**: Your connection string from Step 4
5. Save

### For Local Development:

Create a `.env` file in the `server` directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/billing?retryWrites=true&w=majority
PORT=4000
NODE_ENV=development
```

**Important:** Add `.env` to `.gitignore` (already done)

## Step 6: Deploy

1. Push your code to GitHub
2. Railway will automatically redeploy
3. Check Railway logs to see: `✅ Connected to MongoDB`

## Troubleshooting

### Connection Failed
- Check your connection string (username/password correct?)
- Verify IP is whitelisted in Network Access
- Check Railway logs for specific error messages

### Authentication Failed
- Verify database user credentials
- Make sure username/password don't have special characters (or URL encode them)

### Database Not Found
- MongoDB Atlas creates databases automatically when you first write data
- The database name in connection string should be `billing`

## Security Notes

- Never commit `.env` file to Git
- Use environment variables in production
- Keep your MongoDB password secure
- Consider using IP whitelisting for production

## Testing

After deployment, test the connection:
1. Visit: `https://your-backend.railway.app/health`
2. Should show: `{"ok": true, "db": "connected"}`
3. Create a test invoice with "Save: Yes"
4. Check MongoDB Atlas → Collections → `invoices` to see your data

