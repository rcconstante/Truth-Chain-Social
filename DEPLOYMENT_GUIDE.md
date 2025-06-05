# TruthChain Deployment Guide 🚀

This guide covers the complete deployment of TruthChain to Netlify with Algorand testnet integration.

## Pre-Deployment Checklist ✅

- [ ] Supabase project created and configured
- [ ] Database schema deployed (run migrations)
- [ ] RLS policies applied (nuclear_fix.sql if needed)
- [ ] Algorand testnet access configured
- [ ] Smart contracts ready for deployment
- [ ] Environment variables prepared

## 1. Supabase Setup

### Database Migrations
Run the database migrations to set up the schema:

```sql
-- Run these in Supabase SQL Editor:
-- 1. First run the nuclear_fix.sql to ensure proper RLS policies
-- 2. Verify all tables exist: profiles, posts, post_votes, comments, challenges, post_verifications, transactions
```

### Required Tables
Ensure these tables exist in your Supabase database:
- `profiles` - User profiles with wallet info
- `posts` - Truth posts
- `post_votes` - Voting on posts
- `comments` - Comments on posts
- `challenges` - Challenge records
- `post_verifications` - Verification stakes
- `transactions` - Transaction history

## 2. Environment Variables

### Required Environment Variables for Netlify

Set these in your Netlify dashboard under Site Settings > Environment Variables:

```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Algorand Configuration (REQUIRED)
VITE_ALGORAND_TOKEN=98D9CE80660AD243893D56D9F125CD2D
VITE_ALGORAND_SERVER=https://testnet-api.4160.nodely.io
VITE_ALGORAND_INDEXER=https://testnet-idx.4160.nodely.io
VITE_ALGORAND_PORT=443

# Environment
VITE_ENVIRONMENT=production
VITE_APP_VERSION=1.0.0

# Smart Contract (Optional - set after deployment)
VITE_TRUTHCHAIN_APP_ID=0
VITE_TRUTHCHAIN_APP_ADDRESS=

# Feature Flags (Optional)
VITE_ENABLE_SMART_CONTRACTS=true
VITE_ENABLE_WALLET_CONNECT=true
VITE_ENABLE_TESTNET_FAUCET=true
```

### Getting Supabase Keys
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy the URL and anon public key

## 3. Netlify Deployment

### Option A: Connect GitHub Repository

1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select the TruthChain repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. **Deploy Settings**
   - The `netlify.toml` file is already configured
   - Automatic deployments on main branch push

### Option B: Manual Deployment

1. **Build Locally**
   ```bash
   npm install
   npm run build
   ```

2. **Upload to Netlify**
   - Drag and drop the `dist` folder to Netlify
   - Or use Netlify CLI: `netlify deploy --prod --dir=dist`

### Netlify Configuration
The `netlify.toml` file includes:
- SPA redirect rules
- Security headers
- Caching policies
- Build optimization

## 4. Smart Contract Deployment (Optional)

### Deploy Truth Staking Contract

1. **Setup Python Environment**
   ```bash
   cd smart-contracts
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure Deployment**
   - Edit `deploy_production.py`
   - Set your creator account mnemonic
   - Ensure sufficient testnet ALGO balance

3. **Deploy Contract**
   ```bash
   python deploy_production.py
   ```

4. **Update Environment Variables**
   - Copy the deployed contract ID
   - Update `VITE_TRUTHCHAIN_APP_ID` in Netlify
   - Redeploy the site

## 5. Algorand Wallet Integration

### Testnet Setup
- Network: Algorand Testnet
- Faucet: https://bank.testnet.algorand.network/
- Explorer: https://testnet.algoexplorer.io/

### Wallet Features
- ✅ Pera Wallet integration
- ✅ Real-time balance syncing
- ✅ Automatic testnet detection
- ✅ Staking functionality
- ✅ Transaction history

## 6. Testing Deployment

### Automated Testing
Run the deployment check:
```bash
npm run dev
# Open browser console and run:
# import { checkDeploymentReadiness } from './src/lib/deployment-check.ts'
# checkDeploymentReadiness()
```

### Manual Testing Checklist
- [ ] Website loads correctly
- [ ] User registration/login works
- [ ] Supabase connection active
- [ ] Algorand network accessible
- [ ] Wallet connection functional
- [ ] Post creation/voting works
- [ ] Staking functionality operational
- [ ] Real-time balance updates

## 7. Post-Deployment Setup

### User Onboarding
1. **Create Test Account**
   - Register with email/password
   - Complete profile setup

2. **Connect Wallet**
   - Install Pera Wallet
   - Fund with testnet ALGO
   - Connect to TruthChain

3. **Test Functionality**
   - Create a truth post
   - Vote on posts
   - Add comments
   - Stake ALGO for verification
   - Challenge posts

### Monitor Performance
- Check Netlify deployment logs
- Monitor Supabase usage
- Watch Algorand transaction status
- Verify user interactions

## 8. Troubleshooting

### Common Issues

**Build Fails**
- Check Node.js version (requires 18+)
- Verify all dependencies installed
- Check for TypeScript errors

**Supabase Connection Issues**
- Verify environment variables
- Check RLS policies
- Ensure database schema complete

**Algorand Network Issues**
- Verify testnet connectivity
- Check API token validity
- Ensure wallet funding

**Wallet Connection Problems**
- Clear browser cache
- Try different wallet
- Check network selection

### Debug Mode
Enable debug logging by setting:
```bash
VITE_DEBUG_MODE=true
VITE_VERBOSE_LOGGING=true
```

## 9. Production Considerations

### Security
- ✅ Environment variables secured
- ✅ RLS policies active
- ✅ API keys restricted
- ✅ HTTPS enforced
- ✅ Security headers configured

### Performance
- ✅ Code splitting implemented
- ✅ Asset optimization
- ✅ CDN caching
- ✅ Gzip compression

### Monitoring
- Set up Netlify Analytics
- Monitor Supabase metrics
- Track Algorand usage
- User feedback collection

## 10. Maintenance

### Regular Updates
- Update dependencies
- Monitor security advisories
- Backup database
- Test new features

### Scaling Considerations
- Database performance monitoring
- API rate limit management
- Smart contract optimization
- User growth preparation

---

## Quick Start Commands

```bash
# Development
npm install
npm run dev

# Production Build
npm run build

# Deployment Check
npm run build && echo "✅ Build successful - ready for deployment!"

# Smart Contract Deploy
cd smart-contracts && python deploy_production.py
```

## Support

For deployment issues:
1. Check the [TruthChain Documentation](docs/)
2. Review Netlify deployment logs
3. Verify Supabase configuration
4. Test Algorand connectivity

---

**🎉 Congratulations!** 

Your TruthChain application is now deployed and ready for users to verify truth, stake ALGO, and earn rewards!

**Live Features:**
- ✅ User authentication (Supabase)
- ✅ Real-time ALGO balance syncing
- ✅ Post voting and commenting
- ✅ Verification staking system
- ✅ Challenge mechanism
- ✅ Wallet integration (Pera Wallet)
- ✅ Transaction history
- ✅ Mobile-responsive design
- ✅ Production-ready performance 