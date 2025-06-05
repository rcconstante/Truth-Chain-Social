import React from 'react';
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 py-4 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src="/AA-removebg-preview.png"
            alt="TruthChain"
            className="w-8 h-8"
          />
          <h1 className="text-white text-xl font-bold">TruthChain</h1>
        </div>

        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="text-gray-400 hover:text-white"
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
}