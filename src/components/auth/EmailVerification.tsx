import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Mail, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  ArrowRight,
  Shield,
  Sparkles,
  Send
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/use-toast';

interface EmailVerificationProps {
  email: string;
  onSuccess?: () => void;
  onResend?: () => void;
  type?: 'signup' | 'resend';
}

export function EmailVerification({ email, onSuccess, onResend, type = 'signup' }: EmailVerificationProps) {
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) throw error;

      toast({
        title: "Email Sent!",
        description: "A new verification email has been sent to your inbox.",
      });

      setTimeLeft(60);
      setCanResend(false);
      if (onResend) onResend();
    } catch (error: any) {
      toast({
        title: "Failed to Send Email",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (data.user?.email_confirmed_at) {
        toast({
          title: "Email Verified!",
          description: "Your account has been successfully verified.",
        });
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: "Not Verified Yet",
          description: "Please check your email and click the verification link.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Verification Check Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
            >
              <Mail className="w-8 h-8 text-white" />
            </motion.div>
            
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Check Your Email
            </CardTitle>
            
            <p className="text-gray-300 text-sm">
              We've sent a verification link to
            </p>
            
            <Badge variant="outline" className="mt-2 bg-purple-500/20 border-purple-500/30 text-purple-300">
              {email}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-blue-400">1</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Check your inbox</p>
                    <p className="text-gray-400 text-xs">Look for an email from TruthChain</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-purple-400">2</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Click the verification link</p>
                    <p className="text-gray-400 text-xs">This will confirm your email address</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-green-400">3</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Start using TruthChain</p>
                    <p className="text-gray-400 text-xs">Begin your journey to verified truth</p>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-300 text-xs font-medium">Security Notice</span>
                </div>
                <p className="text-gray-300 text-xs">
                  Don't see the email? Check your spam folder. The link expires in 24 hours.
                </p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <Button
                onClick={handleCheckVerification}
                disabled={isChecking}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all duration-200"
              >
                {isChecking ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Checking...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I've Verified My Email</span>
                  </div>
                )}
              </Button>

              <Button
                onClick={handleResendEmail}
                disabled={!canResend || isResending}
                variant="outline"
                className="w-full bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500 transition-all"
              >
                {isResending ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : canResend ? (
                  <div className="flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>Resend Email</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Resend in {timeLeft}s</span>
                  </div>
                )}
              </Button>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                <Sparkles className="w-3 h-3" />
                <span>Powered by TruthChain's secure verification system</span>
                <Sparkles className="w-3 h-3" />
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>
    </div>
  );
} 