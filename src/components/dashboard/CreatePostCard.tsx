import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { ImageUpload } from '../ui/image-upload';
import { TruthReminder } from '../ui/truth-reminder';
import { Sparkles, AlertCircle, CheckCircle, Send, X, Coins, TrendingUp, Target, Calendar, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

interface CreatePostCardProps {
  onPostCreated?: () => void;
}

export function CreatePostCard({ onPostCreated }: CreatePostCardProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [stakeAmount, setStakeAmount] = useState(1.0);
  const [truthConfidence, setTruthConfidence] = useState(75);
  const [category, setCategory] = useState('General');
  const [timeFrame, setTimeFrame] = useState(7); // Days
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  const categories = [
    'General', 'Technology', 'Science', 'Politics', 'Health', 
    'Environment', 'Economics', 'Education', 'Entertainment'
  ];

  const timeFrameOptions = [
    { value: 1, label: '1 Day' },
    { value: 3, label: '3 Days' },
    { value: 7, label: '7 Days' },
    { value: 14, label: '2 Weeks' },
    { value: 21, label: '3 Weeks' },
    { value: 30, label: '1 Month' }
  ];

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `post-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!content.trim()) {
      setNotification({
        type: 'error',
        message: 'Please enter some content for your post'
      });
      return;
    }

    if (content.trim().length < 10) {
      setNotification({
        type: 'error',
        message: 'Content must be at least 10 characters long'
      });
      return;
    }

    if (!user?.id) {
      setNotification({
        type: 'error',
        message: 'You must be logged in to create posts'
      });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      console.log('Creating post with REAL blockchain staking:', { 
        content: content.trim(), 
        stakeAmount, 
        truthConfidence, 
        category 
      });

      // Check if user has wallet connected for staking
      if (stakeAmount > 0 && (!user.profile?.wallet_connected || !user.profile?.algo_address)) {
        setNotification({
          type: 'warning',
          message: 'Connect your Algorand wallet to stake ALGO on your posts'
        });
        setIsSubmitting(false);
        return;
      }
      
      // First, ensure the user profile exists in the database
      try {
        // Try to get existing profile
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, algo_balance, algo_address, wallet_connected')
          .eq('id', user.id)
          .single();

        // If profile doesn't exist, create it
        if (!existingProfile && profileError?.code === 'PGRST116') {
          console.log('📋 Creating profile for fallback user...');
          
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: user.profile?.username || user.email?.split('@')[0] || 'Anonymous',
              bio: user.profile?.bio || 'TruthChain user',
              avatar_url: user.profile?.avatar_url || '',
              reputation_score: 100,
              algo_balance: 0,
              algo_address: user.profile?.algo_address || null,
              total_stakes: 0,
              successful_challenges: 0,
              accuracy_rate: 1.0,
              onboarding_completed: true,
              wallet_connected: false
            });

          if (createError && createError.code !== '23505') { // Ignore duplicate key errors
            console.warn('⚠️ Profile creation warning:', createError);
          } else {
            console.log('✅ Profile created successfully');
          }
        }
      } catch (profileError) {
        console.warn('⚠️ Profile handling failed, proceeding with post creation:', profileError);
      }

      // Process ALGO stake if amount > 0
      let finalStakeAmount = stakeAmount;
      let newUserBalance = user.profile?.algo_balance || 0;
      
      if (stakeAmount > 0 && user.profile?.wallet_connected) {
        console.log('💰 Processing ALGO stake for post creation...');
        
        // Import AlgorandService dynamically
        const { default: AlgorandService } = await import('../../lib/algorand-service');
        
        // Check if user has sufficient balance
        const balanceCheck = await AlgorandService.canUserStake(user.id, stakeAmount);
        if (!balanceCheck.canStake) {
          setNotification({
            type: 'error',
            message: `Insufficient balance. You have ${balanceCheck.currentBalance.toFixed(3)} ALGO but need ${stakeAmount} ALGO`
          });
          setIsSubmitting(false);
          return;
        }

        // Create a temporary post ID for the stake
        const tempPostId = 'temp-' + Date.now();
        
        // Process the stake transaction
        const stakeResult = await AlgorandService.processStake(
          user.id,
          tempPostId, // We'll update this after post creation
          stakeAmount,
          'verification' // User is staking on their own post as initial verification
        );
        
        if (!stakeResult.success) {
          setNotification({
            type: 'error',
            message: stakeResult.error || 'Failed to process ALGO stake'
          });
          setIsSubmitting(false);
          return;
        }
        
        console.log(`✅ ALGO stake processed! TxID: ${stakeResult.txId}`);
      }

      // Calculate expiration date based on selected timeframe
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + timeFrame);

      // Upload image if selected
      let imageUrl: string | null = null;
      if (selectedImage) {
        setNotification({
          type: 'info',
          message: 'Uploading image...'
        });
        
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          setNotification({
            type: 'error',
            message: 'Failed to upload image. Please try again.'
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Create the post in database
      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert({
          content: content.trim(),
          user_id: user.id,
          stake_amount: stakeAmount,
          verification_status: 'pending',
          image_url: imageUrl,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (postError) {
        console.error('❌ Supabase error:', postError);
        throw new Error(`Database error: ${postError.message}`);
      }

      if (!newPost) {
        throw new Error('No data returned from database');
      }

      console.log('✅ Post created successfully:', newPost);

      // If we processed a stake, update the transaction record with the real post ID
      if (stakeAmount > 0 && user.profile?.wallet_connected) {
        try {
          await supabase
            .from('transactions')
            .update({ related_post_id: newPost.id })
            .eq('user_id', user.id)
            .eq('related_post_id', 'temp-' + Date.now());
        } catch (updateError) {
          console.warn('⚠️ Failed to update transaction post ID:', updateError);
        }
      }

      // Reset form
      setContent('');
      setStakeAmount(1.0);
      setTruthConfidence(75);
      setCategory('General');
      setTimeFrame(7);
      setSelectedImage(null);
      setImagePreview(null);
      
      const successMessage = stakeAmount > 0 && user.profile?.wallet_connected
        ? `🎉 Post created with ${stakeAmount} ALGO stake! Your balance: ${newUserBalance.toFixed(3)} ALGO`
        : `🎉 Post created with ${truthConfidence}% confidence!`;
      
      setNotification({
        type: 'success',
        message: successMessage
      });

      // Call callback to refresh posts
      if (onPostCreated) {
        onPostCreated();
      }

      // Auto-hide success notification
      setTimeout(() => setNotification(null), 4000);

    } catch (error: any) {
      console.error('❌ Post creation error:', error);
      
      let errorMessage = `Failed to create post: ${error.message || 'Unknown error'}`;
      
      // Provide more user-friendly error messages
      if (error.message?.includes('foreign key')) {
        errorMessage = 'Account setup incomplete. Please try refreshing the page and signing in again.';
      } else if (error.message?.includes('permission')) {
        errorMessage = 'Permission denied. Please ensure you are properly logged in.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('profiles')) {
        errorMessage = 'User profile not found. Please refresh the page and try again.';
      } else if (error.message?.includes('Insufficient balance')) {
        errorMessage = error.message; // Keep the balance error message as-is
      }
      
      setNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const getConfidenceColor = () => {
    if (truthConfidence >= 80) return 'from-green-500 to-emerald-500';
    if (truthConfidence >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getConfidenceLabel = () => {
    if (truthConfidence >= 90) return 'Extremely Confident';
    if (truthConfidence >= 80) return 'Very Confident';
    if (truthConfidence >= 70) return 'Confident';
    if (truthConfidence >= 60) return 'Moderately Confident';
    if (truthConfidence >= 40) return 'Somewhat Confident';
    return 'Low Confidence';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      {/* Landscape Layout - Wider Card */}
      <Card className="relative bg-gradient-to-br from-gray-900/90 to-black/90 border border-purple-500/20 backdrop-blur-xl shadow-2xl overflow-hidden max-w-6xl mx-auto">
        {/* Header */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
        
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Stake Your Truth</h3>
              <p className="text-gray-400 text-sm">Create truth claims backed by ALGO stakes and confidence levels</p>
            </div>
          </div>

          {/* Truth Reminder */}
          <TruthReminder type="post" className="mb-6" />

          {/* Notification */}
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-4 p-4 rounded-xl border flex items-center gap-3 ${
                notification.type === 'success' ? 'bg-green-900/20 border-green-500/30 text-green-300' :
                notification.type === 'warning' ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300' :
                notification.type === 'error' ? 'bg-red-900/20 border-red-500/30 text-red-300' :
                'bg-blue-900/20 border-blue-500/30 text-blue-300'
              }`}
            >
              {notification.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
              {notification.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <span className="text-sm font-medium flex-1">{notification.message}</span>
              <Button
                onClick={clearNotification}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* Enhanced Landscape Form Layout */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content Input - Full Width */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Your Truth Claim</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share a factual statement you're confident about and willing to stake ALGO on..."
                className="w-full h-32 p-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 resize-none transition-all duration-200"
                required
                disabled={isSubmitting}
              />
              <div className="text-xs text-gray-400 text-right">{content.length} characters</div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                Attach Image (Optional)
              </label>
              <ImageUpload
                onImageSelect={handleImageSelect}
                onImageRemove={handleImageRemove}
                imagePreview={imagePreview}
                disabled={isSubmitting}
              />
            </div>

            {/* Landscape Layout: Side by Side Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Category Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200"
                  disabled={isSubmitting}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-gray-800">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Frame Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  Thread Duration
                </label>
                <select
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(Number(e.target.value))}
                  className="w-full p-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200"
                  disabled={isSubmitting}
                >
                  {timeFrameOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-gray-800">
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-400">
                  Thread expires in {timeFrame} day{timeFrame !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Truth Confidence Slider */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Truth Confidence
                </label>
                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                  <Slider
                    value={[truthConfidence]}
                    onValueChange={([value]) => setTruthConfidence(value)}
                    min={10}
                    max={100}
                    step={5}
                    className="py-2"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-lg font-bold bg-gradient-to-r ${getConfidenceColor()} bg-clip-text text-transparent`}>
                      {truthConfidence}%
                    </span>
                    <span className="text-xs text-gray-400">
                      {getConfidenceLabel()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stake Amount */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  Stake Amount (ALGO)
                </label>
                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                  <Slider
                    value={[stakeAmount]}
                    onValueChange={([value]) => setStakeAmount(value)}
                    min={0.1}
                    max={10}
                    step={0.1}
                    className="py-2"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-yellow-400">
                      {stakeAmount.toFixed(1)} ALGO
                    </span>
                    <span className="text-xs text-gray-400">
                      ~${(stakeAmount * 0.25).toFixed(2)} USD
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Staking & Publishing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>Stake {stakeAmount.toFixed(1)} ALGO & Publish ({truthConfidence}% Confidence)</span>
                  </div>
                )}
              </Button>

              {/* Demo Button */}
              <Button
                type="button"
                onClick={() => {
                  setContent("Breakthrough in quantum computing: IBM's new error correction method achieves 99.9% fidelity, making practical quantum computers feasible within 5 years. This will revolutionize cryptography, drug discovery, and AI.");
                  setStakeAmount(3.5);
                  setTruthConfidence(85);
                  setCategory("Technology");
                  setTimeFrame(14);
                }}
                variant="outline"
                className="px-6 h-12 border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-purple-500/50 transition-all duration-200"
                disabled={isSubmitting}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Demo High-Stakes Claim
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </motion.div>
  );
}