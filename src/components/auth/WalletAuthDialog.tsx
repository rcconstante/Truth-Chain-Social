import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Link, Shield, AlertCircle, CheckCircle2, X, Star, Zap, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../ui/use-toast';
import { LoadingSpinner } from '../ui/loading-spinner';
import { useAuth } from '../../lib/auth';
import { AlgorandWallet } from '../algorand/AlgorandWallet';

interface WalletAuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnect?: () => void;
}

export function WalletAuthDialog({ isOpen, onClose, onWalletConnect }: WalletAuthDialogProps) {
  const [isLinking, setIsLinking] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { user, connectWallet, unlinkWallet, walletAddress: linkedAddress } = useAuth();
  const { toast } = useToast();

  const handleWalletConnect = (address: string | null) => {
    setWalletAddress(address);
  };

  const handleLinkWallet = async () => {
    if (!walletAddress) {
      toast({
        title: "No Wallet Connected",
        description: "Please connect your wallet first.",
        variant: "destructive"
      });
      return;
    }

    setIsLinking(true);
    try {
      await connectWallet(walletAddress);
      toast({
        title: "Wallet Linked Successfully",
        description: "Your Algorand wallet is now linked to your TruthChain account.",
      });
      if (onWalletConnect) {
        onWalletConnect();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Failed to link wallet:', error);
      toast({
        title: "Linking Failed",
        description: "Could not link wallet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkWallet = async () => {
    try {
      await unlinkWallet();
      setWalletAddress(null);
      toast({
        title: "Wallet Unlinked",
        description: "Your wallet has been unlinked from your account.",
      });
    } catch (error) {
      console.error('Failed to unlink wallet:', error);
      toast({
        title: "Unlinking Failed",
        description: "Could not unlink wallet. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isLinked = linkedAddress && walletAddress === linkedAddress;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <AnimatePresence mode="wait">
        {isOpen && (
          <DialogContent className="sm:max-w-[1200px] w-[95vw] h-[80vh] bg-card/95 backdrop-blur-xl border border-border text-card-foreground overflow-hidden p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative h-full flex"
            >
              {/* Enhanced Background Effects */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  animate={{
                    background: [
                      'radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.15) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
                      'radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
                    ]
                  }}
                  transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
                  className="absolute inset-0"
                />
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
              </div>

              {/* Custom close button */}
              <button
                onClick={onClose}
                className="absolute right-6 top-6 z-50 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
                aria-label="Close dialog"
              >
                <X size={20} className="text-muted-foreground hover:text-foreground" />
              </button>

              {/* Left Side - Branding & Benefits */}
              <div className="flex-1 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-pink-600/10 p-8 flex flex-col justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-pink-500/5" />
                <div className="relative z-10 max-w-md mx-auto">
                  
                  {/* Logo and Title */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center mb-8"
                  >
                    <div className="flex justify-center mb-6">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="relative"
                      >
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                          <Wallet className="w-12 h-12 text-white" />
                        </div>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 rounded-full border-2 border-dashed border-purple-400/30"
                        />
                      </motion.div>
                    </div>
                    
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent mb-4">
                      Wallet Authentication
                    </h1>
                    <p className="text-muted-foreground text-lg">
                      Unlock the full potential of TruthChain with your Algorand wallet
                    </p>
                  </motion.div>

                  {/* Enhanced Benefits List */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 backdrop-blur-sm">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">Enhanced Security</h3>
                        <p className="text-sm text-muted-foreground">Multi-factor authentication via wallet signatures</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Zap className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">Direct Staking</h3>
                        <p className="text-sm text-muted-foreground">Seamlessly stake ALGO on truth verification</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Award className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">Reputation Boost</h3>
                        <p className="text-sm text-muted-foreground">Verified wallets earn higher reputation scores</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Star className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">Exclusive Features</h3>
                        <p className="text-sm text-muted-foreground">Access premium features and rewards</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Right Side - Wallet Connection */}
              <div className="flex-1 p-8 flex flex-col justify-center bg-card/50 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="max-w-md mx-auto w-full space-y-6"
                >
                  
                  {/* Connection Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-card-foreground mb-2">Connect Your Wallet</h2>
                    <p className="text-muted-foreground">
                      Securely link your Algorand wallet to get started
                    </p>
                  </div>

                  {/* Wallet Connection Component */}
                  <Card className="bg-card/60 border-border backdrop-blur-sm">
                    <CardContent className="p-6">
                      <AlgorandWallet 
                        onAccountChange={handleWalletConnect}
                        className="mb-4"
                      />

                      {/* Connection Status */}
                      {walletAddress && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-6 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-full ${isLinked ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                              {isLinked ? (
                                <CheckCircle2 className="w-6 h-6 text-green-400" />
                              ) : (
                                <AlertCircle className="w-6 h-6 text-yellow-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-card-foreground text-lg">
                                {isLinked ? 'Wallet Successfully Linked' : 'Wallet Connected'}
                              </p>
                              <p className="text-sm text-muted-foreground font-mono">
                                {walletAddress.slice(0, 12)}...{walletAddress.slice(-12)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            {isLinked ? (
                              <>
                                <Button
                                  onClick={handleUnlinkWallet}
                                  variant="outline"
                                  className="flex-1 text-red-400 border-red-400/30 hover:bg-red-400/10"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Unlink Wallet
                                </Button>
                                <Button
                                  onClick={() => {
                                    if (onWalletConnect) {
                                      onWalletConnect();
                                    } else {
                                      onClose();
                                    }
                                  }}
                                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Continue
                                </Button>
                              </>
                            ) : (
                              <Button
                                onClick={handleLinkWallet}
                                disabled={isLinking}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                              >
                                {isLinking ? (
                                  <div className="flex items-center gap-2">
                                    <LoadingSpinner size="sm" />
                                    <span>Linking...</span>
                                  </div>
                                ) : (
                                  <>
                                    <Link className="w-4 h-4 mr-2" />
                                    Link Wallet
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>

                  {/* User Profile Status */}
                  {user?.profile && (
                    <Card className="bg-gradient-to-r from-card/60 to-muted/40 border-border backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {user.profile.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-card-foreground text-lg">{user.profile.username}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400" />
                                Reputation: {user.profile.reputation_score}
                              </span>
                              <span>
                                Accuracy: {(user.profile.accuracy_rate * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          
                          {linkedAddress && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-green-500/20 border border-green-500/30">
                              <Shield className="w-4 h-4 text-green-400" />
                              <span className="text-sm font-medium text-green-400">Verified</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="flex-1"
                    >
                      {walletAddress && isLinked ? 'Continue' : 'Skip for now'}
                    </Button>
                    {walletAddress && isLinked && (
                      <Button
                        onClick={() => {
                          if (onWalletConnect) {
                            onWalletConnect();
                          } else {
                            onClose();
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Get Started
                      </Button>
                    )}
                  </div>

                </motion.div>
              </div>

            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
} 