import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Users, Search, Filter, Sparkles, TrendingUp } from 'lucide-react';
import apiClient from '../lib/api.js';
import GroupCard from '../components/GroupCard';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchGroups = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/groups');
        setGroups(res.data.data);
      } catch (error) {
        console.error("Failed to fetch groups", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const filteredAndSortedGroups = useMemo(() => {
    
    return groups
      .filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'members':
            return b.members.length - a.members.length;
          case 'date':
          default:
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
  }, [groups, searchTerm, sortBy]);

  if (loading) {
    return <div>Loading your groups...</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Groups
          </h1>
          <p className="text-gray-600 text-lg mt-2 flex items-center"><Users className="w-5 h-5 text-blue-500 mr-2" /> Manage your expense sharing groups</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/create-group" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all group">
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
            <span className="font-semibold">Create Group</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <TrendingUp className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto pl-12 pr-8 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="date">Sort by Newest</option>
              <option value="name">Sort by Name (A-Z)</option>
              <option value="members">Sort by Members</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredAndSortedGroups.map((group, index) => (
          <GroupCard key={group._id} group={group} index={index} />
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredAndSortedGroups.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 px-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50">
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-lg">
            <Users className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">{searchTerm ? 'No Groups Found' : 'Your Groups Await'}</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {searchTerm ? `We couldn't find any groups matching your search. Try different keywords!` : 'Create a group to share expenses for trips, projects, or with housemates.'}
          </p>
        </motion.div>
      )}
    </div>
  );
}