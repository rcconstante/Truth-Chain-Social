import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Users, 
  Shield, 
  Coins, 
  Brain, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Target,
  Award
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface UserResponses {
  experience: string;
  interests: string[];
  goals: string[];
  truthPriority: string;
  stakingComfort: string;
  communicationStyle: string;
}

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Welcome to TruthChain",
    subtitle: "Let's get you started on your truth-seeking journey"
  },
  {
    id: 2,
    title: "Your Experience",
    subtitle: "Tell us about your background with fact-checking"
  },
  {
    id: 3,
    title: "Your Interests",
    subtitle: "What topics are you most passionate about?"
  },
  {
    id: 4,
    title: "Your Goals",
    subtitle: "What do you hope to achieve on TruthChain?"
  },
  {
    id: 5,
    title: "Truth Standards",
    subtitle: "How do you approach truth verification?"
  },
  {
    id: 6,
    title: "Staking Preference",
    subtitle: "What's your comfort level with financial stakes?"
  },
  {
    id: 7,
    title: "Profile Complete",
    subtitle: "You're ready to start your TruthChain journey!"
  }
];

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'New to fact-checking', description: 'I\'m just starting to learn about verifying information' },
  { value: 'intermediate', label: 'Some experience', description: 'I check sources and cross-reference information regularly' },
  { value: 'advanced', label: 'Experienced fact-checker', description: 'I have professional or extensive experience in verification' },
  { value: 'expert', label: 'Domain expert', description: 'I\'m an expert in specific fields (science, journalism, etc.)' }
];

const INTEREST_OPTIONS = [
  { value: 'science', label: 'Science & Research', icon: Brain },
  { value: 'technology', label: 'Technology', icon: Sparkles },
  { value: 'health', label: 'Health & Medicine', icon: Shield },
  { value: 'politics', label: 'Politics & Policy', icon: Users },
  { value: 'climate', label: 'Climate & Environment', icon: Target },
  { value: 'economics', label: 'Economics & Finance', icon: Coins },
  { value: 'education', label: 'Education', icon: Award },
  { value: 'general', label: 'General Discussion', icon: Users }
];

const GOAL_OPTIONS = [
  { value: 'learn', label: 'Learn & Verify', description: 'I want to learn and verify information' },
  { value: 'contribute', label: 'Contribute Knowledge', description: 'I want to share my expertise' },
  { value: 'earn', label: 'Earn Rewards', description: 'I want to earn through accurate contributions' },
  { value: 'community', label: 'Build Community', description: 'I want to connect with truth-seekers' }
];

const TRUTH_PRIORITY_OPTIONS = [
  { value: 'evidence', label: 'Evidence-Based', description: 'Scientific evidence and peer review' },
  { value: 'sources', label: 'Source Quality', description: 'Reputation and credibility of sources' },
  { value: 'consensus', label: 'Expert Consensus', description: 'What experts in the field agree on' },
  { value: 'transparency', label: 'Transparency', description: 'Open data and clear methodology' }
];

const STAKING_COMFORT_OPTIONS = [
  { value: 'conservative', label: 'Conservative (0.1-1 ALGO)', description: 'I prefer small, safe stakes' },
  { value: 'moderate', label: 'Moderate (1-5 ALGO)', description: 'I\'m comfortable with medium stakes' },
  { value: 'aggressive', label: 'Aggressive (5+ ALGO)', description: 'I\'m confident and stake high' },
  { value: 'custom', label: 'Custom Approach', description: 'I adjust based on confidence level' }
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState<UserResponses>({
    experience: '',
    interests: [],
    goals: [],
    truthPriority: '',
    stakingComfort: '',
    communicationStyle: ''
  });
  const [loading, setLoading] = useState(false);

  const progress = (currentStep / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update user profile with onboarding responses
      await supabase
        .from('profiles')
        .update({
          bio: `${responses.experience} truth-seeker interested in ${responses.interests.join(', ')}`,
          // Store onboarding data in metadata (you might want to add a separate table for this)
          onboarding_completed: true,
          experience_level: responses.experience,
          interests: responses.interests,
          truth_goals: responses.goals,
          truth_priority: responses.truthPriority,
          staking_preference: responses.stakingComfort
        })
        .eq('id', user.id);

      // Give welcome bonus
      await supabase
        .from('profiles')
        .update({
          algo_balance: 20.0 // Welcome bonus
        })
        .eq('id', user.id);

      // Record welcome transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'receive',
          amount: 20.0,
          description: 'Welcome bonus for completing onboarding!'
        });

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">Welcome to TruthChain!</h2>
              <p className="text-gray-400 text-lg">
                A decentralized platform where truth is verified through community consensus and blockchain technology.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <Users className="w-8 h-8 text-blue-400 mb-2 mx-auto" />
                <h3 className="font-semibold text-white">Community Driven</h3>
                <p className="text-sm text-gray-400">Truth verified by experts and the community</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <Coins className="w-8 h-8 text-yellow-400 mb-2 mx-auto" />
                <h3 className="font-semibold text-white">Stake to Verify</h3>
                <p className="text-sm text-gray-400">Put your reputation and ALGO on the line</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <Award className="w-8 h-8 text-purple-400 mb-2 mx-auto" />
                <h3 className="font-semibold text-white">Earn Rewards</h3>
                <p className="text-sm text-gray-400">Get rewarded for accurate contributions</p>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">What's your experience level?</h2>
              <p className="text-gray-400">This helps us tailor your experience and suggest appropriate stakes.</p>
            </div>
            <div className="space-y-3">
              {EXPERIENCE_OPTIONS.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => setResponses({ ...responses, experience: option.value })}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    responses.experience === option.value
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-sm text-gray-400">{option.description}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">What topics interest you?</h2>
              <p className="text-gray-400">Select all that apply. This helps us show you relevant content.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {INTEREST_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = responses.interests.includes(option.value);
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => {
                      const newInterests = isSelected
                        ? responses.interests.filter(i => i !== option.value)
                        : [...responses.interests, option.value];
                      setResponses({ ...responses, interests: newInterests });
                    }}
                    className={`p-4 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">{option.label}</div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">What are your goals?</h2>
              <p className="text-gray-400">Select what you hope to achieve on TruthChain.</p>
            </div>
            <div className="space-y-3">
              {GOAL_OPTIONS.map((option) => {
                const isSelected = responses.goals.includes(option.value);
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => {
                      const newGoals = isSelected
                        ? responses.goals.filter(g => g !== option.value)
                        : [...responses.goals, option.value];
                      setResponses({ ...responses, goals: newGoals });
                    }}
                    className={`w-full p-4 text-left rounded-lg border transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm text-gray-400">{option.description}</div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">How do you prioritize truth?</h2>
              <p className="text-gray-400">What's most important to you when verifying information?</p>
            </div>
            <div className="space-y-3">
              {TRUTH_PRIORITY_OPTIONS.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => setResponses({ ...responses, truthPriority: option.value })}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    responses.truthPriority === option.value
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-sm text-gray-400">{option.description}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">What's your staking comfort level?</h2>
              <p className="text-gray-400">How much ALGO are you comfortable staking on posts?</p>
            </div>
            <div className="space-y-3">
              {STAKING_COMFORT_OPTIONS.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => setResponses({ ...responses, stakingComfort: option.value })}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    responses.stakingComfort === option.value
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-sm text-gray-400">{option.description}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">You're All Set!</h2>
              <p className="text-gray-400 text-lg">
                Welcome to TruthChain! We've prepared your profile based on your preferences.
              </p>
            </div>
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="w-6 h-6 text-yellow-400" />
                <span className="text-xl font-bold text-white">Welcome Bonus!</span>
              </div>
              <p className="text-yellow-400">
                You've received 20 ALGO to get started with your first posts and stakes.
              </p>
            </div>
            <div className="text-left bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h3 className="font-semibold text-white mb-3">Your Profile Summary:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Experience:</span>
                  <Badge variant="secondary">{responses.experience}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Interests:</span>
                  <span className="text-white">{responses.interests.length} topics</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Goals:</span>
                  <span className="text-white">{responses.goals.length} selected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Staking Style:</span>
                  <Badge variant="secondary">{responses.stakingComfort}</Badge>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return responses.experience !== '';
      case 3:
        return responses.interests.length > 0;
      case 4:
        return responses.goals.length > 0;
      case 5:
        return responses.truthPriority !== '';
      case 6:
        return responses.stakingComfort !== '';
      case 7:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-gray-900/95 border border-gray-700/50 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mb-4">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Step {currentStep} of {ONBOARDING_STEPS.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </div>
            <CardTitle className="text-xl text-white">
              {ONBOARDING_STEPS[currentStep - 1]?.title}
            </CardTitle>
            <p className="text-gray-400">
              {ONBOARDING_STEPS[currentStep - 1]?.subtitle}
            </p>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
            
            <div className="flex justify-between mt-8">
              <Button
                onClick={handleBack}
                variant="outline"
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {currentStep === ONBOARDING_STEPS.length ? (
                  loading ? 'Setting up...' : 'Get Started'
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 