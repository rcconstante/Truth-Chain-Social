import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { useAlgorandWallet } from '../algorand/AlgorandWallet';
import { useAuth } from '../../lib/auth';

interface FloatingHeaderProps {
  onSignIn?: () => void;
}

export function FloatingHeader({ onSignIn }: FloatingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { peraWallet } = useAlgorandWallet();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFeatureClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignInClick = () => {
    // Check if user is already logged in
    if (user) {
      console.log('🔄 User already authenticated, redirecting to dashboard...');
      navigate('/dashboard');
      return;
    }
    if (onSignIn) {
      onSignIn();
    }
  };

  const handleConnectWalletClick = () => {
    // Check if user is already logged in
    if (user) {
      console.log('🔄 User already authenticated, redirecting to dashboard...');
      navigate('/dashboard');
      return;
    }
    peraWallet.connect();
  };

  const navItems = [
    { label: "Features", path: "/#features", onClick: handleFeatureClick },
    { label: "How it Works", path: "/how-it-works" },
    { label: "Community", path: "/community" },
    { label: "Docs", path: "/docs" }
  ];

  return (
    <>
      {/* Original Header */}
      <header className="w-full z-50">
        <div className="w-full py-6 px-6">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <img
                className="w-[34px] h-[33px] mr-3 object-cover"
                alt="AA Logo"
                src="/AA-removebg-preview.png"
              />
              <div className="font-bold text-white text-xl tracking-wider">
                TRUTHCHAIN
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="text-white hover:text-gray-300 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="h-10 rounded-lg text-sm bg-transparent text-white border-2 border-gray-600 hover:border-white hover:bg-white hover:text-black transition-all font-medium"
                onClick={handleSignInClick}
              >
                Sign in
              </Button>
              <Button 
                className="h-10 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 transition-all font-medium shadow-lg hover:shadow-xl"
                onClick={handleConnectWalletClick}
              >

                <span className="font-semibold text-sm">Connect Wallet</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Header */}
      <AnimatePresence>
        {isScrolled && (
          <motion.header 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 w-full z-50 flex justify-center px-4 pointer-events-none"
          >
            <div className="w-full max-w-6xl mt-4 pointer-events-auto">
              <motion.div 
                className="w-full bg-black/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-lg px-6 py-4"
              >
                <div className="flex items-center justify-between">
                  <Link to="/" className="flex items-center">
                    <img
                      className="w-[34px] h-[33px] mr-3 object-cover"
                      alt="AA Logo"
                      src="/AA-removebg-preview.png"
                    />
                    <div className="font-bold text-white text-xl tracking-wider">
                      TRUTHCHAIN
                    </div>
                  </Link>

                  <nav className="hidden md:flex items-center space-x-8">
                    {navItems.map((item, index) => (
                      <Link
                        key={index}
                        to={item.path}
                        onClick={item.onClick}
                        className="text-white/80 hover:text-white transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-purple-500 after:to-pink-500 hover:after:w-full after:transition-all"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      className="h-10 rounded-lg text-sm bg-transparent text-white border-2 border-gray-600 hover:border-white hover:bg-white hover:text-black transition-all font-medium"
                      onClick={handleSignInClick}
                    >
                      Sign in
                    </Button>
                    <Button 
                      className="h-10 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 transition-all font-medium shadow-lg hover:shadow-xl"
                      onClick={handleConnectWalletClick}
                    >
                      
                      <span className="font-semibold text-sm">Connect Wallet</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>
    </>
  );
}