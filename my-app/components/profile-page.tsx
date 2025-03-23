'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Save, Upload, User } from 'lucide-react';
import DebugProfileButton from './debug-profile-button';

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    First: '',
    Last: '',
    Uniqname: '',
    profileUrl: '',
    Role: ''
  });

  // Default profile image URL
  const defaultProfileImage = "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=";

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }

      if (session) {
        // Get user info from your "Users" table using uid
        const { data: userInfo, error: userError } = await supabase
          .from('Users')
          .select('*')
          .eq('uid', session.user.id)
          .single();

        if (userError) {
          console.error('Error fetching user info:', userError);
        } else {
          // Get the Google photo URL from provider details if available
          const googlePhotoURL = session.user?.user_metadata?.avatar_url || null;
          
          // Use profileUrl from database or fall back to Google photo or default
          const profileUrl = userInfo.profileUrl || googlePhotoURL || defaultProfileImage;
          
          // Combine Supabase user data with authentication metadata
          const combinedUserData = {
            ...userInfo,
            email: session.user.email,
            googlePhotoURL: googlePhotoURL,
            profileUrl: profileUrl
          };
          
          setUserData(combinedUserData);
          setFormData({
            First: combinedUserData.First || '',
            Last: combinedUserData.Last || '',
            Uniqname: combinedUserData.Uniqname || '',
            profileUrl: profileUrl,
            Role: combinedUserData.Role || ''
          });
        }
      }
      
      setLoading(false);
    };

    fetchUserData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle profile image URL change
  const handleProfileUrlChange = (e) => {
    setFormData({ ...formData, profileUrl: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const supabase = createClient();
      
      // Log the data being sent for debugging
      console.log('Updating profile with data:', formData);
      
      // Update user profile in the database
      const { error, data } = await supabase
        .from('Users')
        .update({
          First: formData.First,
          Last: formData.Last,
          Uniqname: formData.Uniqname,
          profileUrl: formData.profileUrl,
          Role: formData.Role
        })
        .eq('uid', userData.uid)
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log('Supabase update response:', data);
      
      // Fetch the updated user data to confirm changes
      const { data: updatedUser, error: fetchError } = await supabase
        .from('Users')
        .select('*')
        .eq('uid', userData.uid)
        .single();
        
      if (fetchError) {
        console.error('Error fetching updated user data:', fetchError);
      } else {
        console.log('Updated user data from database:', updatedUser);
        
        // Update local state with fresh data from database
        setUserData({
          ...userData,
          ...updatedUser,
          profileUrl: updatedUser.profileUrl || userData.googlePhotoURL || defaultProfileImage
        });
        
        // Update form data to match what's now in the database
        setFormData({
          ...formData,
          profileUrl: updatedUser.profileUrl || userData.googlePhotoURL || defaultProfileImage
        });
      }
      
      setMessage({ 
        text: `Profile updated successfully! Profile URL is now: ${updatedUser?.profileUrl || 'not set'}`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        text: `Error updating profile: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setSaving(false);
      
      // Clear success message after 6 seconds
      if (message.type === 'success') {
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 6000);
      }
    }
  };

  // Upload and handle file changes
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setMessage({ text: 'Uploading image...', type: 'info' });
      
      const supabase = createClient();
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userData.uid}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file);
        
      if (error) throw error;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);
        
      // Update form data with the new URL
      const newProfileUrl = urlData.publicUrl;
      setFormData({ ...formData, profileUrl: newProfileUrl });
      
      setMessage({ 
        text: 'Image uploaded successfully! Click Save to update your profile.', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ 
        text: `Error uploading image: ${error.message}`, 
        type: 'error' 
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto my-10 p-8 bg-neutral-800 rounded-lg shadow-md">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-neutral-700 h-32 w-32 mb-6"></div>
          <div className="h-8 bg-neutral-700 rounded w-1/3 mb-6"></div>
          <div className="h-4 bg-neutral-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-neutral-700 rounded w-5/6 mb-6"></div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="h-12 bg-neutral-700 rounded"></div>
            <div className="h-12 bg-neutral-700 rounded"></div>
            <div className="h-12 bg-neutral-700 rounded"></div>
            <div className="h-12 bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="max-w-3xl mx-auto my-10 p-8 bg-neutral-800 rounded-lg shadow-md">
        <div className="text-center text-gray-300">
          <User className="h-20 w-20 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-semibold mb-4">Not Signed In</h2>
          <p>Please sign in to view and edit your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-10 p-8 bg-neutral-800 rounded-lg shadow-md">
      {/* Profile Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">View and update your profile information</p>
        </div>
        <a 
          href="/" 
          className="flex items-center px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-md text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </a>
      </div>

      {/* Message Display */}
      {message.text && (
        <div 
          className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-800 text-green-100' :
            message.type === 'error' ? 'bg-red-800 text-red-100' :
            'bg-blue-800 text-blue-100'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Section */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-neutral-700 flex-shrink-0 border-2 border-indigo-500">
            <img 
              src={formData.profileUrl || defaultProfileImage} 
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultProfileImage;
              }}
            />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <label htmlFor="profileUrl" className="block text-sm font-medium text-gray-400 mb-1">
                Profile Image URL
              </label>
              <input 
                type="text" 
                id="profileUrl" 
                name="profileUrl" 
                value={formData.profileUrl} 
                onChange={handleProfileUrlChange}
                className="w-full p-2 rounded bg-neutral-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter image URL"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <label 
                htmlFor="profileImage" 
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white cursor-pointer transition-colors"
              >
                <Upload size={18} />
                <span>Upload New Image</span>
                <input 
                  type="file" 
                  id="profileImage" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="First" className="block text-sm font-medium text-gray-400 mb-1">
              First Name
            </label>
            <input 
              type="text" 
              id="First" 
              name="First" 
              value={formData.First} 
              onChange={handleChange}
              className="w-full p-2 rounded bg-neutral-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="Last" className="block text-sm font-medium text-gray-400 mb-1">
              Last Name
            </label>
            <input 
              type="text" 
              id="Last" 
              name="Last" 
              value={formData.Last} 
              onChange={handleChange}
              className="w-full p-2 rounded bg-neutral-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="Uniqname" className="block text-sm font-medium text-gray-400 mb-1">
              Uniqname
            </label>
            <input 
              type="text" 
              id="Uniqname" 
              name="Uniqname" 
              value={formData.Uniqname} 
              onChange={handleChange}
              className="w-full p-2 rounded bg-neutral-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              Email
            </label>
            <input 
              type="email" 
              id="email" 
              value={userData.email} 
              className="w-full p-2 rounded bg-neutral-700 text-gray-400 border border-gray-600 cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="Role" className="block text-sm font-medium text-gray-400 mb-1">
              Role
            </label>
            <select
              id="Role"
              name="Role"
              value={formData.Role}
              onChange={handleChange}
              className="w-full p-2 rounded bg-neutral-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select a role</option>
              <option value="Member">Member</option>
              <option value="Project Lead">Project Lead</option>
              <option value="E-Board">E-Board</option>
            </select>
          </div>

          <div>
            <label htmlFor="Project" className="block text-sm font-medium text-gray-400 mb-1">
              Project
            </label>
            <input 
              type="text" 
              id="Project" 
              value={userData.Project || 'Not assigned'} 
              className="w-full p-2 rounded bg-neutral-700 text-gray-400 border border-gray-600 cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Projects are assigned by E-Board</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
        
        {/* Debug Button */}
        <DebugProfileButton />
      </form>
    </div>
  );
}