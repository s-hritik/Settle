import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Save, Bell, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AuthContext.jsx';
import apiClient from '../lib/api.js';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { state, dispatch, signOut } = useApp();
  const { user } = state;

  if (!user) return <div>Loading profile...</div>;

  const [name, setName] = useState(user.name);
  const [avatarFile, setAvatarFile] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [preferences, setPreferences] = useState(user.preferences || { notifications: true });

  useEffect(() => {

    setPreferences(user.preferences || { notifications: true });
  }, [user.preferences]);

  const handleProfileUpdate = async (e) => {

    e.preventDefault();
    const loadingToast = toast.loading("Updating profile...");
    const formData = new FormData();
    formData.append('name', name);

    if (avatarFile) formData.append('avatar', avatarFile);
    try {
      const res = await apiClient.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      dispatch({ type: 'LOGIN', payload: res.data.data });
      toast.dismiss(loadingToast);
      toast.success("Profile updated!");

    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || "Failed to update profile.");
    }
  };
  
  const handlePasswordChange = async (e) => {

    e.preventDefault();
    if (!oldPassword || !newPassword) return toast.error("Please fill in both password fields.");
    const loadingToast = toast.loading("Changing password...");

    try {
      await apiClient.post('/users/change-password', { oldPassword, newPassword });
      toast.dismiss(loadingToast);
      toast.success("Password changed successfully!");
      setOldPassword('');
      setNewPassword('');

    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || "Failed to change password.");
    }
  };

  const handlePreferenceChange = async (key, value) => {

    setPreferences(prev => ({ ...prev, [key]: value }));

    try {
        const res = await apiClient.put('/users/preferences', { [key]: value });
        dispatch({ type: 'LOGIN', payload: res.data.data }); 
        toast.success("Preferences updated!");

    } catch (error) {
        toast.error("Failed to save preferences.");
        setPreferences(user.preferences);
    }
  };

  return (

    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-500 bg-clip-text text-transparent">Account Settings</h1>
        <p className="text-gray-600 mt-2 text-lg">Manage your profile, preferences, and security</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.1 }} 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="flex items-center space-x-6">
                <img src={user.avatar} alt="User Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                <input type="file" 
                       onChange={(e) => setAvatarFile(e.target.files[0])} 
                       className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" 
                       value={name} 
                       onChange={(e) => setName(e.target.value)} 
                       className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input type="email" 
                       value={user.email} 
                       readOnly 
                       className="w-full px-4 py-3 bg-gray-200 text-gray-500 border-2 border-gray-200 rounded-xl cursor-not-allowed"/>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" 
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg transition-shadow">
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
              </button>
            </div>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.2 }} 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Sparkles className="w-6 h-6 mr-3 text-blue-500"/>
          Preferences
        </h2>
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-100 to-gray-100 rounded-xl hover:from-emerald-50 hover:to-blue-50 transition-all duration-300 border border-gray-100 hover:border-emerald-200 hover:shadow-md cursor-pointer group">
            <div className="flex items-center">
                <Bell className="w-5 h-5 text-gray-600 mr-4" />
                <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Get notified about new expenses and settlements</p>
                </div>
            </div>
            <button onClick={() => handlePreferenceChange('notifications', !preferences.notifications)} 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.notifications ? 'bg-emerald-500' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.3 }} 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Security</h2>
        <div className="space-y-4">
            <div>
                <p className="font-medium text-gray-800 mb-2">Change Password</p>
                <form onSubmit={handlePasswordChange} 
                      className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl hover:from-emerald-100 hover:to-blue-100 transition-all duration-300 border border-emerald-200 cursor-pointer group space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="password" 
                               placeholder="Old Password" 
                               value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} 
                               className="w-full p-3 bg-white border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500"/>

                        <input type="password" 
                               placeholder="New Password" 
                               value={newPassword} onChange={(e) => setNewPassword(e.target.value)} 
                               className="w-full p-3 bg-white border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500"/>
                    </div>
                    <div className="flex justify-end">
                       <button type="submit" 
                               className="inline-flex items-center justify-center px-5 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-xl transition-colors text-sm">
                          <Lock className="w-4 h-4 mr-2" />
                          Update Password
                        </button>
                    </div>
                </form>
            </div>

            <button onClick={signOut} 
                    className="w-full text-left p-4 bg-red-50/50 rounded-xl hover:bg-red-100/70 transition-colors border border-red-100 hover:border-red-200 group flex justify-between items-center">
                <div>
                    <p className="font-medium text-red-900">Sign Out</p>
                    <p className="text-sm text-red-700">Sign out from your current session</p>
                </div>
                <ArrowRight className="w-5 h-5 text-red-500 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
        </div>
      </motion.div>
    </div>
  );
}