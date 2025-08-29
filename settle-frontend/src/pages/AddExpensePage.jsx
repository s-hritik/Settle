import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Receipt, DollarSign, Users, Calendar, ArrowLeft, Calculator, ChevronDown } from 'lucide-react';
import apiClient from '../lib/api.js';
import toast from 'react-hot-toast';

export default function AddExpensePage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [groupId, setGroupId] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [splitType, setSplitType] = useState('equal');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [customSplits, setCustomSplits] = useState({});

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

  const selectedGroup = groups.find(g => g._id === groupId);

  const handleGroupChange = (e) => {

    const newGroupId = e.target.value;
    setGroupId(newGroupId);
    const group = groups.find(g => g._id === newGroupId);

    if (group) {
        setSelectedMembers(group.members);
    } else {
        setSelectedMembers([]);
    }

    setPaidBy('');
    setCustomSplits({});
  };

  const handleMemberToggle = (memberEmail) => {

    setSelectedMembers(prev =>
      prev.includes(memberEmail)
        ? prev.filter(email => email !== memberEmail)
        : [...prev, memberEmail]
    );

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (parseFloat(amount) <= 0 || !title || !groupId || !paidBy || !category || selectedMembers.length === 0) {
      return toast.error("Please fill out all required fields.");
    }

    let finalSplits = [];
    const expenseAmount = parseFloat(amount);

    if (splitType === 'equal') {

      const splitAmount = expenseAmount / selectedMembers.length;

      finalSplits = selectedGroup.members.map(email => ({
        user: email,
        paid: email === paidBy ? expenseAmount : 0,
        owes: selectedMembers.includes(email) ? splitAmount : 0,

      }));
    } else {

      const totalCustom = Object.values(customSplits).reduce((sum, val) => sum + parseFloat(val || 0), 0);

      if (Math.abs(totalCustom - expenseAmount) > 0.01) {
        return toast.error("Custom split amounts must add up to the total expense.");
      }

      finalSplits = selectedGroup.members.map(email => ({
        user: email,
        paid: email === paidBy ? expenseAmount : 0,
        owes: parseFloat(customSplits[email] || 0),
      }));
    }

    const payload = { title, amount: expenseAmount, category, date, splits: finalSplits };
    const loadingToast = toast.loading("Adding expense...");

    try {

      await apiClient.post(`/expenses/group/${groupId}`, payload);
      toast.dismiss(loadingToast);
      toast.success("Expense added successfully!");
      navigate('/groups');

    } catch (error) {

      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || "Failed to add expense.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Add New Expense</h1>
            <div className="w-9" />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-6 space-y-4 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
               <Receipt className="w-5 h-5 mr-2 text-emerald-600" />Expense Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Title *" 
                className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-emerald-500" />

              <input 
                type="number" 
                step="0.01" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="Amount *" 
                className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-emerald-500" />

              <div className="relative">
                <select value={groupId} 
                        onChange={handleGroupChange} 
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 appearance-none">
                    <option value="">Select a group *</option>
                    {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 appearance-none">
                    <option value="">Select a category *</option>
                    {['Food & Drinks', 'Transportation', 'Accommodation', 'Entertainment', 'Utilities', 'Other'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              <input type="date" 
                     value={date} 
                     onChange={(e) => setDate(e.target.value)} 
                     className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-emerald-500" />
                <div className="relative">
                  <select value={paidBy} 
                          onChange={(e) => setPaidBy(e.target.value)} 
                          disabled={!selectedGroup} 
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white disabled:bg-gray-100 focus:ring-2 focus:ring-emerald-500 appearance-none">
                      <option value="">Paid by *</option>
                      {selectedGroup?.members.map(email => <option key={email} value={email}>{email}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
            </div>
          </div>

          {selectedGroup && (
            <div className="bg-gray-50 rounded-lg p-6 space-y-4 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Split Between
              </h2>

              <div className="flex flex-wrap gap-2">
                <button type="button" 
                        onClick={() => setSplitType('equal')} 
                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${splitType === 'equal' ? 'bg-emerald-600 text-white shadow' : 'bg-white hover:bg-gray-100 border'}`}>
                    <Users size={16} className="mr-2" />
                    Equal Split
                </button>

                <button type="button" 
                        onClick={() => setSplitType('custom')} 
                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${splitType === 'custom' ? 'bg-emerald-600 text-white shadow' : 'bg-white hover:bg-gray-100 border'}`}>
                    <Calculator size={16} className="mr-2" />
                    Custom Split
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {selectedGroup.members.map(email => (
                  <div key={email} className={`border-2 rounded-lg p-3 transition-all ${selectedMembers.includes(email) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input type="checkbox" 
                               checked={selectedMembers.includes(email)} 
                               onChange={() => handleMemberToggle(email)} 
                               className="h-4 w-4 rounded mr-3 text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                        <span>{email}</span>
                      </div>

                      {splitType === 'custom' && selectedMembers.includes(email) && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <input type="number" 
                                 step="0.01" 
                                 placeholder="0.00" 
                                 onChange={(e) => setCustomSplits({ ...customSplits, [email]: e.target.value })} 
                                 className="w-24 p-1 border border-gray-300 rounded text-right" onClick={(e) => e.stopPropagation()} />
                        </div>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <button type="submit" className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              Add Expense
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}