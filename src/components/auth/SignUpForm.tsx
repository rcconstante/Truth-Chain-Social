import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { LoadingSpinner } from '../ui/loading-spinner';
import { SuccessAnimation } from '../ui/success-animation';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/use-toast';
import { validateEmail, validatePassword, validateUsername } from '../../lib/validation';
import { useAuth } from '../../lib/auth';

interface SignUpFormProps {
  onSuccess: () => void;
  onSwitchToSignIn?: () => void;
}

export function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const { signUp } = useAuth();

  // Real-time validation states
  const [validations, setValidations] = useState({
    email: false,
    password: false,
    username: false
  });

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setValidations(prev => ({ ...prev, email: validateEmail(value) }));
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setValidations(prev => ({ ...prev, password: validatePassword(value) }));
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setValidations(prev => ({ ...prev, username: validateUsername(value) }));
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Basic validation
    const validationErrors: { [key: string]: string } = {};
    
    if (!username.trim()) {
      validationErrors.username = 'Username is required';
    } else if (username.length < 3) {
      validationErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!email.trim()) {
      validationErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      validationErrors.password = 'Password is required';
    } else if (password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 Using TruthChain Auth System...');

      const result = await signUp(email, password, username.trim());

      if (result.user) {
        console.log('✅ Account created successfully!');
        
        // Show success animation
        setShowSuccess(true);
        
        // Call success callback after a delay
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        throw new Error('Account creation failed');
      }

    } catch (error: any) {
      console.error('❌ Signup failed:', error);
      
      let errorMessage = 'Failed to create account. Please try again.';
      
      // Provide more user-friendly error messages
      if (error.message?.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.message?.includes('Password should be')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('signup disabled')) {
        errorMessage = 'Account creation is temporarily disabled. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });

      setErrors({ form: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <SuccessAnimation 
        type="signup" 
        message="Please check your email and click the verification link to activate your account."
      />
    );
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-6 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {errors.form && (
          <motion.div
            key="form-error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
          >
            {errors.form}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Label htmlFor="username" className="text-gray-200">Username</Label>
        <div className="relative">
          <Input
            id="username"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            required
            placeholder="Choose a unique username"
            className={`bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all pr-12 ${
              errors.username ? 'border-red-500 focus:border-red-500' : validations.username ? 'border-green-500' : ''
            }`}
          />
          {username && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validations.username ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        <AnimatePresence mode="wait">
          {errors.username && (
            <motion.p
              key="username-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-red-400"
            >
              {errors.username}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Label htmlFor="email" className="text-gray-200">Email Address</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            required
            placeholder="Enter your email address"
            className={`bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all pr-12 ${
              errors.email ? 'border-red-500 focus:border-red-500' : validations.email ? 'border-green-500' : ''
            }`}
          />
          {email && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validations.email ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        <AnimatePresence mode="wait">
          {errors.email && (
            <motion.p
              key="email-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-red-400"
            >
              {errors.email}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Label htmlFor="password" className="text-gray-200">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            required
            placeholder="Create a strong password"
            className={`bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all pr-12 ${
              errors.password ? 'border-red-500 focus:border-red-500' : validations.password ? 'border-green-500' : ''
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        {password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    passwordStrength >= level
                      ? level <= 2
                        ? 'bg-red-500'
                        : level <= 4
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Password strength: {
                passwordStrength <= 2 ? 'Weak' :
                passwordStrength <= 4 ? 'Medium' : 'Strong'
              }
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {errors.password && (
            <motion.p
              key="password-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-red-400"
            >
              {errors.password}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          disabled={loading || !validations.email || !validations.password || !validations.username}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <LoadingSpinner size="sm" />
              <span>Creating account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </Button>
      </motion.div>



      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-sm text-gray-400"
      >
        Already have an account?{' '}
        <button
          type="button"
          className="text-purple-400 hover:text-purple-300 transition-colors underline"
          onClick={onSwitchToSignIn}
        >
          Sign in here
        </button>
      </motion.div>
    </motion.form>
  );
}