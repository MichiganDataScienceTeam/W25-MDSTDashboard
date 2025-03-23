'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function DebugProfileButton() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showData, setShowData] = useState(false);

  const checkProfile = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Not logged in!');
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('Users')
        .select('*')
        .eq('uid', session.user.id)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        alert(`Error fetching profile: ${error.message}`);
      } else {
        console.log('Raw profile data:', data);
        setUserData(data);
        setShowData(true);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={checkProfile}
        className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded flex items-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
            Checking...
          </>
        ) : (
          'Debug: Check Profile in Database'
        )}
      </button>
      
      {showData && userData && (
        <div className="mt-4 p-4 bg-neutral-700 rounded-md">
          <h3 className="font-medium text-lg mb-2">Database Profile Data:</h3>
          <pre className="text-xs overflow-auto p-2 bg-neutral-800 rounded max-h-60">
            {JSON.stringify(userData, null, 2)}
          </pre>
          <button 
            onClick={() => setShowData(false)} 
            className="mt-2 text-sm text-gray-400 hover:text-white"
          >
            Hide
          </button>
        </div>
      )}
    </div>
  );
}