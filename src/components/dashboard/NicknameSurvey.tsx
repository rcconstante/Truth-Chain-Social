import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Star, Sparkles, Heart, Brain, Target, Trophy, Globe, 
  Camera, Settings, Bell, Shield, Lock, Mail, BookOpen, 
  Zap, Palette, Coffee, Music, ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

interface NicknameSurveyProps {
  onComplete: (nickname: string, bio: string) => void;
  isOpen: boolean;
}

export function NicknameSurvey({ onComplete, isOpen }: NicknameSurveyProps) {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    // Validate step 1
    if (step === 1) {
      if (!nickname.trim()) {
        setErrors({ nickname: 'Please enter a nickname' });
        return;
      }
      if (nickname.length < 2) {
        setErrors({ nickname: 'Nickname must be at least 2 characters' });
        return;
      }
      if (nickname.length > 20) {
        setErrors({ nickname: 'Nickname must be 20 characters or less' });
        return;
      }
      
      // Save to localStorage for persistence
      localStorage.setItem('truthchain-survey-nickname', nickname);
      setErrors({});
      setStep(2);
    }
  };

  const handleComplete = async () => {
    if (!user?.id) return;
    
    // Validate final data
    const finalNickname = nickname.trim() || 'TruthSeeker';
    const finalBio = bio.trim();
    
    // Save to localStorage for persistence
    localStorage.setItem('truthchain-survey-nickname', finalNickname);
    localStorage.setItem('truthchain-survey-bio', finalBio);
    
    setIsSubmitting(true);
    try {
      // Update user profile in profiles table
      await updateProfile({
        username: finalNickname,
        bio: finalBio,
        onboarding_completed: true, // Mark onboarding as completed
        wallet_connected: false // Will be set to true after wallet connection
      });
      
      toast({
        title: "Welcome to TruthChain!",
        description: "Your profile has been successfully created",
      });
      
      onComplete(finalNickname, finalBio);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Setup Failed",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    const defaultNickname = nickname || 'TruthSeeker';
    
    if (user?.id) {
      setIsSubmitting(true);
      try {
        // Update profile with default values and mark onboarding as completed
        await updateProfile({
          username: user.profile?.username || defaultNickname,
          onboarding_completed: true,
          wallet_connected: false
        });
        
        toast({
          title: "Setup Skipped",
          description: "You can update your profile later in settings",
        });
      } catch (error) {
        console.error('Error updating profile:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
    
    onComplete(defaultNickname, bio);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-lg relative"
      >
        <Card className="bg-card/95 border-border backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
                <User className="w-10 h-10 text-white" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-purple-400/30"
              />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Welcome to TruthChain!
            </CardTitle>
            <p className="text-muted-foreground text-lg mt-2">
              Let's personalize your truth-seeking journey
            </p>
            
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <div className={`w-3 h-3 rounded-full transition-colors ${step >= 1 ? 'bg-purple-500' : 'bg-muted'}`} />
              <div className={`w-8 h-1 rounded-full transition-colors ${step >= 2 ? 'bg-purple-500' : 'bg-muted'}`} />
              <div className={`w-3 h-3 rounded-full transition-colors ${step >= 2 ? 'bg-purple-500' : 'bg-muted'}`} />
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-purple-400 mb-3">
                      <Star className="w-5 h-5" />
                      <span className="font-medium">Step 1 of 2</span>
                      <Star className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground">Choose Your Identity</h3>
                    <p className="text-muted-foreground">What should the TruthChain community call you?</p>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-card-foreground">
                      Nickname <span className="text-purple-400">*</span>
                    </label>
                    <Input
                      placeholder="Enter your nickname..."
                      value={nickname}
                      onChange={(e) => {
                        setNickname(e.target.value);
                        if (errors.nickname) setErrors({});
                      }}
                      className={`bg-background/60 border-border text-card-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 transition-all h-12 text-lg ${
                        errors.nickname ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                      maxLength={20}
                    />
                    {errors.nickname && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm flex items-center gap-1"
                      >
                        <span>⚠️</span> {errors.nickname}
                      </motion.p>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">This will be your display name on TruthChain</span>
                      <span className="text-muted-foreground">{nickname.length}/20</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-purple-400 mb-3">
                      <Heart className="w-5 h-5" />
                      <span className="font-medium">Step 2 of 2</span>
                      <Heart className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground">Tell Your Story</h3>
                    <p className="text-muted-foreground">Share what brings you to the fight against misinformation</p>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-card-foreground">
                      About You <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <textarea
                      placeholder="What interests you about truth verification? What's your background?"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full h-32 px-4 py-3 bg-background/60 border border-border rounded-lg text-card-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all"
                      maxLength={150}
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Help others understand your perspective</span>
                      <span className="text-muted-foreground">{bio.length}/150</span>
                    </div>
                  </div>

                  {/* Preview Card */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {nickname?.charAt(0).toUpperCase() || 'T'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-card-foreground">{nickname || 'TruthSeeker'}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Target className="w-3 h-3" />
                          <span>New Truth Seeker</span>
                        </div>
                      </div>
                    </div>
                    {bio && (
                      <p className="text-sm text-muted-foreground italic">"{bio}"</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex justify-between gap-3 pt-4">
              {step === 1 ? (
                <div className="flex gap-3 w-full">
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Skip for now
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={isSubmitting || !nickname.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3 w-full">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <span>Back</span>
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Setting up...</span>
                      </div>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span>Complete Setup</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 