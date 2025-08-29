import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Receipt, DollarSign, TrendingUp, Plus, ArrowRight, Zap, Star, Activity, Calendar } from 'lucide-react';
import { useApp } from '../context/AuthContext.jsx';
import apiClient from '../lib/api.js';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { state } = useApp();
  const { user } = state;
  const [stats, setStats] = useState({ owedToMe: 0, iOwe: 0, totalExpensesCount: 0 });
  const [groups, setGroups] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {

      try {
        const balancePromise = apiClient.get('/dashboard/balance');
        const groupsPromise = apiClient.get('/groups');
        const recentExpensesPromise = apiClient.get('/dashboard/recent-expenses');
        const totalExpensesPromise = apiClient.get('/dashboard/total-expenses-count');
        const [balanceRes, groupsRes, recentExpensesRes, totalExpensesRes] = await Promise.all([
            balancePromise, groupsPromise, recentExpensesPromise, totalExpensesPromise
        ]);
        setStats({
            owedToMe: balanceRes.data.data.owedToMe,
            iOwe: balanceRes.data.data.iOwe,
            totalExpensesCount: totalExpensesRes.data.data.totalCount
        });
        setGroups(groupsRes.data.data);
        setRecentExpenses(recentExpensesRes.data.data);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        toast.error("Could not load dashboard data.");

      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const statCards = [
    { name: 'Total Groups',
      value: groups.length.toString(), 
      icon: Users, 
      color: 'from-blue-500 to-blue-600', 
      bgColor: 'from-blue-50 to-blue-100', 
      change: '+12%', 
      trend: 'up' 
    },
    { name: 'Total Expenses', 
      value: stats.totalExpensesCount.toString(), 
      icon: Receipt, 
      color: 'from-emerald-500 to-emerald-600', 
      bgColor: 'from-emerald-50 to-emerald-100', 
      change: '+8%', 
      trend: 'up' 
    },
    { name: 'You Owe', 
      value: `$${stats.iOwe.toFixed(2)}`, 
      icon: DollarSign, 
      color: 'from-red-500 to-red-600', 
      bgColor: 'from-red-50 to-red-100', 
      change: '-5%', 
      trend: 'down' 
    },
    { name: 'Owed to You', 
      value: `$${stats.owedToMe.toFixed(2)}`, 
      icon: TrendingUp, 
      color: 'from-green-500 to-green-600', 
      bgColor: 'from-green-50 to-green-100', 
      change: '+15%', 
      trend: 'up' },
  ];

  if (loading) return <div>Loading Dashboard...</div>;

  return (
    <div className="space-y-8">
      <motion.div 
         initial={{ opacity: 0, y: 20 }} 
         animate={{ opacity: 1, y: 0 }} 
         className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 text-lg mt-2">
             Welcome- 
             <span className="font-semibold text-emerald-600">{user?.name}</span>
          </p>
        </div>

        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}>
          <Link to="/add-expense" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 group">
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-semibold">Add Expense</span>
            <Zap className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div 
             key={stat.name} 
             initial={{ opacity: 0, y: 20 }} 
             animate={{ opacity: 1, y: 0 }} 
             transition={{ delay: index * 0.1 }} 
             whileHover={{ scale: 1.05, rotateY: 5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }} 
             className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-2xl transition-all duration-500 backdrop-blur-sm relative overflow-hidden group cursor-pointer`}>

            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
             <div className="flex items-center">
              <div className={`bg-gradient-to-br ${stat.color} rounded-xl p-3 mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-white group-hover:animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className={`flex items-center text-xs font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    <Activity className="w-3 h-3 mr-1" />
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
              </div>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"><Star className="w-4 h-4 text-yellow-400 animate-pulse" /></div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
           initial={{ opacity: 0, x: -20 }} 
           animate={{ opacity: 1, x: 0 }} 
           transition={{ delay: 0.2 }} 
           className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">

          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-blue-50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-emerald-600" />
              Recent Expenses
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {recentExpenses.map((expense, index) => (
              <motion.div 
                key={expense._id} 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: index * 0.1 }} 
                whileHover={{ scale: 1.02, x: 4 }} 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-emerald-50 hover:to-blue-50 transition-all duration-300 border border-gray-100 hover:border-emerald-200 hover:shadow-md cursor-pointer group">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl p-2 mr-3 group-hover:scale-110 transition-transform duration-300">
                    <Receipt className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-emerald-700 transition-colors duration-200">{expense.title}</p>
                    <p className="text-sm text-gray-600 flex items-center"><Users className="w-3 h-3 mr-1" />{expense.group_id.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors duration-200">${expense.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />{new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2">
                  <ArrowRight className="w-4 h-4 text-emerald-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.3 }} 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">

          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Active Groups
              </h2>
              <Link to="/groups" className="text-blue-600 hover:text-blue-700 font-medium flex items-center transition-all duration-200 hover:bg-blue-100 px-3 py-1 rounded-lg group">
                <>
                  View all
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {groups.slice(0, 3).map((group, index) => (
              <motion.div 
                 key={group._id} 
                 initial={{ opacity: 0, x: 20 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 transition={{ delay: index * 0.1 }} 
                 whileHover={{ scale: 1.02, x: 4 }}>

                <Link to={`/groups/${group._id}`} className="block p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-md group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl p-2 mr-3 group-hover:scale-110 transition-transform duration-300">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">{group.name}</p>
                        <p className="text-sm text-gray-600 flex items-center"><Users className="w-3 h-3 mr-1" />{group.members.length} members</p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2"><ArrowRight className="w-4 h-4 text-blue-500" /></div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }} 
          className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
        <h2 className="text-3xl font-bold mb-6 flex items-center">
          <Zap className="w-8 h-8 mr-3" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: "/create-group", 
              icon: Users, 
              title: "Create Group", 
              desc: "Start splitting expenses", 
              delay: 0.1 
            },
            { to: "/add-expense", 
              icon: Plus, 
              title: "Add Expense", 
              desc: "Record a new expense", 
              delay: 0.2 
            },
            { to: "/settle", 
              icon: DollarSign, 
              title: "Settle Up", 
              desc: "Pay or record payments", 
              delay: 0.3 
            }
          ].map((action) => (
            <motion.div 
                key={action.to} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: action.delay }} 
                whileHover={{ scale: 1.05, rotateY: 5 }} 
                whileTap={{ scale: 0.95 }}>
                  
              <Link to={action.to} className="block bg-white/20 backdrop-blur-sm rounded-xl p-6 hover:bg-white/30 transition-all duration-300 transform hover:shadow-2xl border border-white/20 h-full">
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-lg mr-4"><action.icon className="w-6 h-6" /></div>
                  <div>
                    <h3 className="font-bold text-lg">{action.title}</h3>
                    <p className="text-sm text-white/80 mt-1">{action.desc}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}