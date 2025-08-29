import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, X, ArrowLeft, Check, Sparkles, UserPlus } from 'lucide-react';
import apiClient from '../lib/api.js';
import toast from 'react-hot-toast';

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState([]);
  const [memberEmail, setMemberEmail] = useState('');

  const addMember = () => {

    const trimmedEmail = memberEmail.trim();

    if (trimmedEmail && !members.includes(trimmedEmail)) {
      setMembers([...members, trimmedEmail]);
      setMemberEmail('');
    } else {
      toast.error('Please enter a valid, unique email.');
    }
  };

  const removeMember = (emailToRemove) => {

    setMembers(members.filter(email => email !== emailToRemove));
  };

  const handleNext = () => {

    if (step === 1 && groupName.trim()) {
      setStep(2);
    } else if (step === 1) {
      toast.error('Group name is required.');
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {

    const loadingToast = toast.loading('Creating group...');

    try {
      await apiClient.post('/groups', {
        name: groupName,
        description,
        members,
      });
      toast.dismiss(loadingToast);
      toast.success('Group created successfully!');
      navigate('/groups');

    } catch (error) {

      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Failed to create group.');
      console.error(error);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (

    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 overflow-hidden"
      >
        {/* Header with Progress */}
        <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Create New Group</h1>
          <div className="flex justify-center items-center">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg transition-colors duration-300 ${
                    step >= stepNumber ? 'bg-gradient-to-br from-emerald-500 to-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                  animate={{ scale: step === stepNumber ? 1.1 : 1 }}
                  transition={{ type: 'spring' }}
                >
                  {step > stepNumber ? <Check /> : stepNumber}
                </motion.div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 transition-colors duration-300 ${step > stepNumber ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="text-center">
                  <UserPlus className="mx-auto h-12 w-12 text-blue-500" />
                  <h2 className="mt-2 text-xl font-semibold">Group Details</h2>
                  <p className="text-gray-500">Start by giving your group a name.</p>
                </div>
                <input type="text" 
                       value={groupName} 
                       onChange={(e) => setGroupName(e.target.value)} 
                       placeholder="Group Name (e.g., Weekend Trip)" 
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                <textarea value={description} 
                          onChange={(e) => setDescription(e.target.value)} 
                          rows={3} 
                          placeholder="Description (Optional)" 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" 
                          variants={stepVariants} 
                          initial="hidden" 
                          animate="visible" 
                          exit="exit" 
                          className="space-y-6">
                <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-blue-500" />
                  <h2 className="mt-2 text-xl font-semibold">Add Members</h2>
                  <p className="text-gray-500">Add people to your group by email.</p>
                </div>
                <div className="flex gap-2">
                  <input type="email" 
                         value={memberEmail} 
                         onChange={(e) => setMemberEmail(e.target.value)} 
                         placeholder="Member's email" 
                         className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" onKeyPress={(e) => e.key === 'Enter' && addMember()} />
                  <button type="button" onClick={addMember} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"><Plus /></button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {members.map(email => (
                    <motion.div key={email} 
                                initial={{ opacity: 0, y: -10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-700">{email}</span>
                      <button 
                        type="button" 
                        onClick={() => removeMember(email)} 
                        className="text-gray-400 hover:text-red-500">
                          <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                 <div className="text-center">
                  <Sparkles className="mx-auto h-12 w-12 text-blue-500" />
                  <h2 className="mt-2 text-xl font-semibold">Review & Create</h2>
                  <p className="text-gray-500">Does everything look correct?</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                  <div><strong className="font-medium text-gray-800">Name:</strong> {groupName}</div>
                  {description && <div><strong className="font-medium text-gray-800">Description:</strong> {description}</div>}
                  <div><strong className="font-medium text-gray-800">Members ({members.length}):</strong></div>
                  <ul className="list-disc list-inside pl-4 text-gray-600 text-sm">
                    {members.map(email => <li key={email}>{email}</li>)}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/groups')} className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step < 3 ? (
            <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Next</button>
          ) : (
            <button onClick={handleSubmit} className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">Create Group</button>
          )}
        </div>
      </motion.div>
    </div>
  );
}