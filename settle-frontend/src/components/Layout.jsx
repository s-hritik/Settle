import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Users, PlusCircle, BarChart3, User, LogOut, Sparkles, Menu, X } from 'lucide-react';
import { useApp } from '../context/AuthContext.jsx';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Groups', href: '/groups', icon: Users },
  { name: 'Add Expense', href: '/add-expense', icon: PlusCircle },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Layout({ children }) {
  const location = useLocation();
  const { state, signOut } = useApp();
  const { user } = state;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"/>

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl border-r border-gray-100">

              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-blue-50">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl p-2 mr-3">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    Settle
                  </h2>
                </div>
                <button 
                   onClick={() => setMobileMenuOpen(false)} 
                   className="p-2 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200">
                      <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-6 space-y-3">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;

                  return (
                    <motion.div 
                      key={item.name} 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}>
                      <Link
                         to={item.href}
                         onClick={() => setMobileMenuOpen(false)}
                         className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                           isActive
                             ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg transform scale-105'
                             : 'text-gray-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 hover:text-gray-900 hover:shadow-md'
                        }`}>

                        <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'animate-pulse' : ''}`} />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 px-6 pb-4">
          <div className="flex h-20 shrink-0 items-center">
            <motion.div 
              className="flex items-center" 
              whileHover={{ scale: 1.05 }} 
              transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                 <div>
                   <Sparkles className="w-6 h-6 mr-3 text-blue-500" />
                 </div>
                 <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Settle</h1>
            </motion.div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-2">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;

                    return (
                      <li key={item.name}>
                        <motion.div 
                           whileHover={{ scale: 1.02, x: 4 }} 
                           whileTap={{ scale: 0.98 }} 
                           transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                             <Link to={item.href} className={`group relative flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg' : 'text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-emerald-400 hover:to-blue-400 hover:shadow-md'}`}>
                               <item.icon className={`h-6 w-6 shrink-0 transition-all duration-300 ${isActive ? 'text-white animate-pulse' : 'text-gray-400 group-hover:text-white group-hover:scale-110'}`} />
                               <span className="relative">{item.name}
                                 {isActive && (<motion.div layoutId="activeTab" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full" initial={false} transition={{ type: "spring", stiffness: 500, damping: 30 }}/>)}
                               </span>
                             </Link>
                        </motion.div>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li className="mt-auto -mx-2">
                <div className="text-xs font-semibold leading-6 text-gray-400 p-2">Your Account</div>
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900">
                  <img src={user?.avatar} alt="User Avatar" className="h-8 w-8 rounded-full bg-gray-200 object-cover" />
                  <span aria-hidden="true">{user?.name}</span>
                </div>
                <button onClick={signOut} className="group flex w-full gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 text-red-500 hover:bg-red-50 hover:text-red-700"><LogOut className="h-6 w-6 shrink-0" />Sign Out</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:hidden">
        <div className="flex h-16 items-center justify-between px-4 bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 shadow-sm">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 transition-all duration-200">
            <Menu className="w-6 h-6 text-gray-700" />
          </motion.button>
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg p-1.5 mr-2"><Sparkles className="w-5 h-5 text-white" /></div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">SplitWise</h1>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="lg:pl-72">
        <main className="py-6 lg:py-10 min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}