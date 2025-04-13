'use client';

import ProfilePage from '@/components/profile-page';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

export default function ProfileRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error checking authentication:', error);
          setIsAuthenticated(false);
          return;
        }
        setIsAuthenticated(!!data.session);
      } catch (error) {
        console.error('Unexpected error during auth check:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900">
        <Loader className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="mt-4 text-gray-400">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfilePage />
      </div>
    </div>
  );
}