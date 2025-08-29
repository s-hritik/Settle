import mongoose from 'mongoose';
import { Expense } from '../models/expense.model.js';
import { Payment } from '../models/payment.model.js';
import { ApiResponse } from '../utility/ApiResponse.js';
import { AsyncHandler } from '../utility/AsyncHandler.js';
import { Group } from '../models/group.model.js'; 

const getOverallBalance = AsyncHandler(async (req, res) => {
    const userEmail = req.user.email;

    const expenseAggregation = await Expense.aggregate([
        { $unwind: "$splits" },
        {
            $group: {
                _id: "$splits.user",
                totalPaid: { $sum: "$splits.paid" },
                totalOwed: { $sum: "$splits.owes" }
            }
        },
        { $match: { _id: userEmail } }
    ]);
    
    const paymentsMade = await Payment.aggregate([
        { $match: { from: userEmail } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const paymentsReceived = await Payment.aggregate([
        { $match: { to: userEmail } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const userExpense = expenseAggregation[0] || { totalPaid: 0, totalOwed: 0 };
    const paidByMe = userExpense.totalPaid + (paymentsMade[0]?.total || 0);
    const myShare = userExpense.totalOwed;
    const paidToMe = paymentsReceived[0]?.total || 0;

    const owedToMe = Math.max(0, paidByMe - myShare - paidToMe);
    const iOwe = Math.max(0, myShare - paidByMe + paidToMe);
    
    const balances = {
        owedToMe,
        iOwe
    };

    return res.status(200).json(new ApiResponse(200, balances, "Overall balance fetched"));
});

const getGroupSummary = AsyncHandler(async (req, res) => {
    const { groupId } = req.params;

    const expenseTotalResult = await Expense.aggregate([
        { $match: { group_id: new mongoose.Types.ObjectId(groupId) } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const paymentTotalResult = await Payment.aggregate([
        { $match: { group_id: new mongoose.Types.ObjectId(groupId) } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const summary = {
        totalExpenses: expenseTotalResult[0]?.total || 0,
        settledAmount: paymentTotalResult[0]?.total || 0
    };

    return res.status(200).json(new ApiResponse(200, summary, "Group summary fetched"));
});

const getRecentExpenses = AsyncHandler(async (req, res) => {
   
    const userGroups = await Group.find({ members: req.user.email }).select('_id');
    const groupIds = userGroups.map(group => group._id);

    const recentExpenses = await Expense.find({ group_id: { $in: groupIds } })
        .sort({ date: -1, createdAt: -1 })
        .limit(5)
        .populate('group_id', 'name');

    return res.status(200).json(new ApiResponse(200, recentExpenses, "Recent expenses fetched successfully"));
});

const getTotalExpensesCount = AsyncHandler(async (req, res) => {

    const userGroups = await Group.find({ members: req.user.email }).select('_id');

    const groupIds = userGroups.map(group => group._id);
    const totalCount = await Expense.countDocuments({ group_id: { $in: groupIds } });
    
    return res.status(200).json(new ApiResponse(200, { totalCount }, "Total expense count fetched"));
});

export { getOverallBalance, getGroupSummary, getRecentExpenses , getTotalExpensesCount};