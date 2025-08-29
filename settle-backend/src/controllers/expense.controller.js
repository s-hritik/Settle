import mongoose from 'mongoose';
import { Expense } from '../models/expense.model.js';
import { Group } from '../models/group.model.js';
import { ApiError } from '../utility/ApiError.js';
import { ApiResponse } from '../utility/ApiResponse.js';
import { AsyncHandler } from '../utility/AsyncHandler.js';
import { sendEmail } from '../utility/EmailService.js';
import {User} from '../models/user.model.js'

const getExpensesByGroup = AsyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const group = await Group.findOne({ _id: groupId, members: req.user.email });
    if (!group) {
        throw new ApiError(404, "Group not found or you're not a member");
    }
    const expenses = await Expense.find({ group_id: groupId }).sort({ date: -1 });
    return res.status(200).json(new ApiResponse(200, expenses, 'Expenses fetched successfully'));
});

const addExpenseToGroup = AsyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { title, amount, category, date, splits } = req.body;

    if (!title || !amount || !category || !date || !splits || splits.length === 0) {
        throw new ApiError(400, 'All fields are required');
    }

    const group = await Group.findById(groupId);
    if (!group) {
        throw new ApiError(404, "Group not found");
    }
    if (!group.members.includes(req.user.email)) {
        throw new ApiError(403, "You are not a member of this group");
    }

    const totalPaid = splits.reduce((sum, s) => sum + s.paid, 0);
    const totalOwed = splits.reduce((sum, s) => sum + s.owes, 0);

    if (Math.abs(totalPaid - amount) > 0.01 || Math.abs(totalOwed - amount) > 0.01) {
        throw new ApiError(400, 'The sum of splits must equal the total expense amount.');
    }
    
    const payer = splits.find(s => s.paid > 0);
    if (!payer) {
        throw new ApiError(400, 'Expense must have a payer.');
    }

    const expenseData = {
        group_id: groupId,
        title,
        amount,
        category,
        date,
        splits
    };

    const createdExpense = await Expense.create(expenseData);

    if (!createdExpense) {
        throw new ApiError(500, "Something went wrong while creating the expense");
    }

    if (group) {
        group.members.forEach(memberEmail => {
            req.io.to(memberEmail).emit('new_expense', createdExpense);
        });

        const participantEmails = splits.filter(s => s.owes > 0 && s.user !== payer.user).map(s => s.user);
        try {
            const usersToNotify = await User.find({
                email: { $in: participantEmails },
                'preferences.notifications': { $ne: false }
            });

            usersToNotify.forEach(user => {
                sendEmail({
                    to: user.email,
                    subject: `New expense in ${group.name}`,
                    text: `${payer.user} added a new expense "${title}" for $${amount}. Your share is $${splits.find(s => s.user === user.email).owes.toFixed(2)}.`
                }).catch(err => console.error("Failed to send email:", err));
            });
        } catch (error) {
            console.error("Failed to fetch users for email notification:", error);
        }
    }

    return res.status(201).json(new ApiResponse(201, createdExpense, 'Expense added successfully'));
});


const getGroupAnalytics = AsyncHandler(async (req, res) => {
    const { groupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        throw new ApiError(400, "Invalid Group ID");
    }

    const analytics = await Expense.aggregate([
        { $match: { group_id: new mongoose.Types.ObjectId(groupId) } },
        { $group: { _id: "$category", totalAmount: { $sum: "$amount" } } },
        { $project: { _id: 0, category: "$_id", totalAmount: 1 } }
    ]);

    return res.status(200).json(new ApiResponse(200, analytics, "Group analytics fetched successfully"));
});

export { getExpensesByGroup, addExpenseToGroup, getGroupAnalytics };