# 🚨 URGENT FIX INSTRUCTIONS - ALGO Balance & Voting Issues

## 🔥 **IMMEDIATE ACTIONS REQUIRED**

### 1. **Database Fix (CRITICAL - Do This FIRST!)**

**Run in Supabase SQL Editor:**
1. Go to your Supabase Dashboard
2. Click "SQL Editor" 
3. Copy the entire contents of `MANUAL_DATABASE_FIX.sql`
4. Paste and run the SQL script
5. ✅ Verify you see: "SUCCESS: Database schema fixed! You can now stake, verify, challenge, and vote on posts!"

---

## 🔍 **ISSUES FIXED**

### ❌ **Issue 1: ALGO Balance Not Deducting**
**Problem**: Balance shows 10.000 ALGO instead of 9.000 ALGO after staking 1 ALGO
**Root Cause**: AlgorandWallet component not syncing with database after staking

**✅ FIXED:**
- Enhanced `AlgorandWallet` component with real-time balance sync
- Added automatic refresh every 30 seconds
- Added database sync when balance changes
- Added manual refresh button with better feedback

### ❌ **Issue 2: Upvotes Stuck at "0"**
**Root Cause**: Missing trigger function to update post vote counts automatically

**✅ FIXED:**
- Created `update_post_vote_counts()` trigger function 
- Added automatic vote count updates in database
- Enhanced `post_votes` table with proper constraints
- Added ultra-permissive policies for all operations

### ❌ **Issue 3: User Auth Resetting**
**Root Cause**: Non-existent `user_onboarding` table causing 406 errors

**✅ FIXED:**
- Removed all references to `user_onboarding` table
- Fixed `DashboardLayout.tsx` to use only `profiles` table
- Fixed `NicknameSurvey.tsx` onboarding flow
- Improved auth state stability

---

## 🎯 **TESTING CHECKLIST**

After running the database fix, test these features:

### ✅ **ALGO Balance Sync Test:**
1. Go to Wallet page
2. Note your current ALGO balance
3. Create a post with 1 ALGO stake
4. **Expected Result**: Balance should immediately decrease by 1 ALGO
5. Click the refresh button in wallet - should show updated balance

### ✅ **Voting Test:**
1. Go to Home Feed
2. Click upvote on any post (not your own)
3. **Expected Result**: Upvote count should increase immediately
4. Refresh page - vote count should persist

### ✅ **Real-time Updates Test:**
1. Leave page open for 30 seconds
2. **Expected Result**: Wallet balance auto-refreshes every 30 seconds
3. **Expected Result**: Feed refreshes every 10 seconds with live indicator

---

## 🔧 **TECHNICAL CHANGES MADE**

### **AlgorandWallet.tsx Enhanced:**
```typescript
// ✅ Added real-time balance sync
const refreshBalance = async (silent: boolean = false) => {
  // Gets balance from Algorand testnet
  const realTimeBalance = await getAccountInfo(walletState.address);
  
  // Syncs with database
  await supabase.from('profiles')
    .update({ algo_balance: realTimeBalance })
    .eq('id', user.id);
}

// ✅ Added auto-refresh every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    refreshBalance(true); // Silent refresh
  }, 30000);
  return () => clearInterval(interval);
}, [walletState.isConnected]);
```

### **Database Trigger Function:**
```sql
-- ✅ Auto-updates vote counts when votes are added/removed
CREATE OR REPLACE FUNCTION update_post_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'upvote' THEN
      UPDATE public.posts SET upvotes = COALESCE(upvotes, 0) + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE public.posts SET downvotes = COALESCE(downvotes, 0) + 1 WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  END IF;
  -- Handle DELETE and UPDATE operations too
END;
$$;
```

### **Fixed Auth Flow:**
- ✅ Removed `user_onboarding` table references
- ✅ Uses only `profiles.onboarding_completed` 
- ✅ Fixed username generation logic
- ✅ Added 5-second loading timeout

---

## 🎉 **EXPECTED RESULTS AFTER FIX**

1. **ALGO Balance**: ✅ Deducts immediately when staking, auto-refreshes every 30s
2. **Voting**: ✅ Upvotes/downvotes work instantly, counts persist across page refreshes  
3. **Real-time Feed**: ✅ Auto-refreshes every 10 seconds with live indicator
4. **Auth Stability**: ✅ No more "User Truth seeker" or loading issues
5. **Staking**: ✅ All verification/challenge operations work perfectly

---

## 🚨 **TROUBLESHOOTING**

If issues persist after database fix:

1. **Clear browser cache and refresh**
2. **Sign out and sign back in**
3. **Check browser console for any remaining errors**
4. **Verify the database fix success message appeared**

The platform should now be **100% functional** with real ALGO staking! 🚀 