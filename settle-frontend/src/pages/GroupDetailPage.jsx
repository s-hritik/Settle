import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Receipt, ArrowLeft, Plus, DollarSign } from 'lucide-react';
import apiClient from '../lib/api.js';
import toast from 'react-hot-toast';

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {

      try {
        setLoading(true);
        const groupPromise = apiClient.get(`/groups/${groupId}`);
        const expensesPromise = apiClient.get(`/expenses/group/${groupId}`);
        
        const [groupRes, expensesRes] = await Promise.all([groupPromise, expensesPromise]);
        
        setGroup(groupRes.data.data);
        setExpenses(expensesRes.data.data);
      } catch (error) {
        toast.error("Could not load group details.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId]);

  if (loading) {
    return <div className="text-center p-8">Loading group details...</div>;
  }

  if (!group) {
    return <div className="text-center p-8">Group not found.</div>;
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/groups" className="flex items-center text-gray-500 hover:text-gray-800 mb-4">
          <ArrowLeft size={20} className="mr-2" />
          Back to all groups
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{group.name}</h1>
            <p className="text-gray-600 mt-1">{group.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/settle" state={{ groupId: group._id }} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700">
                <DollarSign size={16} className="mr-2" /> Settle Up
            </Link>
            <Link to="/add-expense" state={{ groupId: group._id }} className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700">
                <Plus size={20} className="mr-2" /> Add Expense
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Receipt className="mr-3 text-emerald-500"/>
            Expenses
          </h2>
          <div className="space-y-3">
            {expenses.map(expense => (
              <div key={expense._id} className="p-4 rounded-lg hover:bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{expense.title}</p>
                  <p className="text-sm text-gray-500">Paid by: {expense.splits.find(s => s.paid > 0)?.user}</p>
                </div>
                <div>
                  <p className="font-bold text-lg">${expense.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 text-right">{new Date(expense.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {expenses.length === 0 && <p className="text-gray-500">No expenses have been added to this group yet.</p>}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-2xl font-semibold mb-4 flex items-center"><Users className="mr-3 text-blue-500"/>Members</h2>
          <ul className="space-y-2">
            {group.members.map(member => (
              <li key={member} className="p-2 rounded-lg hover:bg-gray-50">{member}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}