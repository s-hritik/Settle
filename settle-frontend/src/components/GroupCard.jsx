import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, DollarSign, Calendar, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiClient from '../lib/api.js';

export default function GroupCard({ group, index }) {

  const [summary, setSummary] = useState({ totalExpenses: 0, settledAmount: 0 });

  useEffect(() => {
  
    const fetchSummary = async () => {

      try {
        const res = await apiClient.get(`/dashboard/group-summary/${group._id}`);
        setSummary(res.data.data);
      } catch (error) {
        console.error(`Failed to fetch summary for group ${group.name}`, error);
      }
    };

    fetchSummary();
  }, [group._id, group.name]);

  const settlementProgress = summary.totalExpenses > 0
    ? (summary.settledAmount / summary.totalExpenses) * 100
    : 0;

  return (

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{
        scale: 1.03,
        rotateY: 3,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)"
      }}
      className="h-full">

      <Link
        to={`/groups/${group._id}`}
        className=" bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-500 group overflow-hidden relative h-full flex flex-col p-6" >
         <div className="flex items-start justify-between mb-4">
           <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
             <Users className="w-8 h-8 text-white" />
           </div>
           <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full font-medium border border-blue-200">
            {group.members.length} members
           </span>
         </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-300">{group.name}</h3>
         {group.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{group.description}</p>
          )}

        <div className="space-y-3 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <DollarSign className="w-4 h-4 mr-2 text-blue-500" />
              <span className="text-sm font-medium">Total Expenses</span>
            </div>
            <span className="font-semibold text-gray-900">${summary.totalExpenses.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-purple-500" />
              <span className="text-sm font-medium">Created On</span>
            </div>
            <span className="text-sm text-gray-600">{new Date(group.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1 font-medium">
            <span>Settlement Progress</span>
            <span className="text-blue-600">{Math.round(settlementProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200/70 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${settlementProgress}%` }}
            />
          </div>
        </div>

        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
        </div>
      </Link>
      
    </motion.div>
  );
}