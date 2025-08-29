import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, state } = useApp(); 
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/');
    }
  }, [state.isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const loadingToast = toast.loading('Processing...');

    try {
      if (isSignUp) {
        await signUp(name, email, password);
        toast.success('Account created! Please sign in.');
        setIsSignUp(false);
        setName('');
        setEmail('');
        setPassword('');
      } else {
        await signIn(email, password);
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative flex w-full max-w-4xl bg-white shadow-2xl rounded-2xl overflow-hidden"
      >
        {/* Form Panel */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold flex items-center gap-2 justify-center bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-6">
            <Sparkles className='text-emerald-500' size={28} />
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h2>

          {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center text-sm">{error}</div>}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {isSignUp && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <input
                  type="text"
                  placeholder="Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: isSignUp ? 0.1 : 0 }}>
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: isSignUp ? 0.2 : 0.1 }}>
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold rounded-xl uppercase hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              {!loading && <ArrowRight size={20} />}
            </motion.button>
          </form>
        </div>

        {/* Overlay Panel */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-emerald-500 to-blue-600 text-white p-12 text-center">
          <motion.div
              key={isSignUp ? 'signIn' : 'signUp'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-3">{isSignUp ? 'Already a Member?' : 'Hello, Friend!'}</h2>
              <p className="mb-8">
                {isSignUp ? 'Sign in to access your groups and expenses.' : 'Enter your details and start your journey with us.'}
              </p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSignUp(!isSignUp)}
                className="py-3 px-8 font-bold border-2 border-white rounded-full uppercase hover:bg-white hover:text-emerald-600 transition-all"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </motion.button>
            </motion.div>
        </div>
      </motion.div>
    </div>
  );
}