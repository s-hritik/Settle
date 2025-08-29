import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, ChevronDown } from 'lucide-react';
import apiClient from '../lib/api.js';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await apiClient.get('/groups');
        setGroups(res.data.data);
      } catch (error) {
        toast.error("Could not fetch groups.");
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroupId) {
      setAnalyticsData([]);
      return;
    }

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/expenses/analytics/${selectedGroupId}`);
        setAnalyticsData(res.data.data);
      } catch (error) {
        toast.error("Could not fetch analytics for this group.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [selectedGroupId]);
  
  const totalAmount = analyticsData.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
          Analytics
        </h1>
        <p className="text-gray-600 text-lg mt-2">Visualize your group spending habits.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
        <label htmlFor="group-select" className="block text-lg font-semibold text-gray-800 mb-3">
          Select a Group to Analyze
        </label>
        <div className="relative w-full max-w-md">
          <select
            id="group-select"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full p-3 pl-4 pr-10 border border-gray-200 rounded-xl shadow-sm bg-gray-50 focus:ring-2 focus:ring-emerald-500 appearance-none"
          >
            <option value="">-- Select a Group --</option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50 min-h-[300px]">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="w-6 h-6 mr-3 text-emerald-600" />
            Category Breakdown
        </h2>
        <div className="flex items-center justify-center">
            {loading ? (
             <p className="text-gray-500">Loading analytics...</p>
            ) : !selectedGroupId ? (
             <div className="text-center text-gray-500 py-10">
                <TrendingUp size={48} className="mx-auto mb-4 text-gray-300"/>
                <p>Please select a group to see the analytics.</p>
             </div>
            ) : analyticsData.length === 0 ? (
             <div className="text-center text-gray-500 py-10">
                <BarChart3 size={48} className="mx-auto mb-4 text-gray-300"/>
                <p>No expenses found for this group to analyze.</p>
             </div>
            ) : (
             <div className="w-full space-y-4">
                {analyticsData.map((item) => (
                <div key={item.category}>
                    <div className="flex justify-between mb-1 text-sm font-medium">
                        <span className="text-gray-800">{item.category}</span>
                        <span className="text-gray-600">${item.totalAmount.toFixed(2)} ({((item.totalAmount / totalAmount) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <motion.div
                        className="bg-gradient-to-r from-emerald-400 to-blue-500 h-4 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.totalAmount / totalAmount) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    </div>
                </div>
                ))}
             </div>
            )}
        </div>
      </motion.div>
    </div>
  );
}