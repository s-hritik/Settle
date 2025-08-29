import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, ArrowRight, ChevronDown } from 'lucide-react';
import apiClient from '../lib/api.js';
import { api } from '../lib/api.js';
import toast from 'react-hot-toast';
import { useApp } from '../context/AuthContext.jsx';

export default function SettleUpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useApp();
  
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(location.state?.groupId || '');
  const [members, setMembers] = useState([]);
  
  const [fromUser, setFromUser] = useState('');
  const [toUser, setToUser] = useState('');
  const [amount, setAmount] = useState('');
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await apiClient.get('/groups');
        setGroups(res.data.data);
      } catch (error) {
        toast.error("Could not fetch groups.");
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {

    if (selectedGroupId) {
      const selectedGroup = groups.find(g => g._id === selectedGroupId);
      if (selectedGroup) {
        setMembers(selectedGroup.members);
        setFromUser(state.user.email);
      }
    } else {
      setMembers([]);
    }
  }, [selectedGroupId, groups, state.user.email]);

  const handleSubmit = async (e) => {

    e.preventDefault();
    if (!selectedGroupId || !fromUser || !toUser || !amount) {
      return toast.error("Please fill out all fields.");
    }
    if (fromUser === toUser) {
      return toast.error("Payer and recipient cannot be the same person.");
    }
    if (parseFloat(amount) <= 0) {
        return toast.error("Amount must be greater than zero.");
    }

    const paymentData = {
      from: fromUser,
      to: toUser,
      amount: parseFloat(amount),
    };

    const loadingToast = toast.loading("Recording payment...");

    try {
      await api.payments.settleUp(selectedGroupId, paymentData);
      toast.dismiss(loadingToast);
      toast.success("Payment recorded successfully!");
      navigate(`/groups/${selectedGroupId}`);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || "Failed to record payment.");
    }
  };

  return (
    
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-white/50">
        <div className="text-center mb-8">
            <DollarSign className="w-16 h-16 mx-auto text-emerald-500 mb-4 bg-emerald-100 p-3 rounded-full"/>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settle Up</h1>
            <p className="text-gray-600">Record a payment between members.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
            <div className="relative">
              <select 
                value={selectedGroupId} 
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full p-3 pl-4 pr-10 border border-gray-200 rounded-xl shadow-sm bg-gray-50 focus:ring-2 focus:ring-emerald-500 appearance-none"
              >
                <option value="">-- Select a Group --</option>
                {groups.map(group => <option key={group._id} value={group._id}>{group.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">From (Payer)</label>
              <div className="relative">
                <select 
                  value={fromUser}
                  onChange={(e) => setFromUser(e.target.value)}
                  disabled={!selectedGroupId}
                  className="w-full p-3 pl-4 pr-10 border border-gray-200 rounded-xl shadow-sm bg-gray-50 disabled:bg-gray-200 focus:ring-2 focus:ring-emerald-500 appearance-none"
                >
                  <option value="">-- Select Payer --</option>
                  {members.map(member => <option key={member} value={member}>{member}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="pt-8">
                <ArrowRight className="w-6 h-6 text-gray-400" />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">To (Recipient)</label>
              <div className="relative">
                <select 
                  value={toUser}
                  onChange={(e) => setToUser(e.target.value)}
                  disabled={!selectedGroupId}
                  className="w-full p-3 pl-4 pr-10 border border-gray-200 rounded-xl shadow-sm bg-gray-50 disabled:bg-gray-200 focus:ring-2 focus:ring-emerald-500 appearance-none"
                >
                  <option value="">-- Select Recipient --</option>
                  {members.map(member => <option key={member} value={member}>{member}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input 
                type="number" 
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-3 pl-7 border border-gray-200 rounded-xl shadow-sm bg-gray-50 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
                type="submit" 
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:shadow-xl transition-all group font-semibold"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}