import mongoose from 'mongoose';

const splitDetailSchema = new mongoose.Schema({

  user: {
    type: String,
    required: true,
  },
  paid: {
    type: Number,
    default: 0,
  },
  owes: {
    type: Number,
    default: 0,
  }
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['Food & Drinks', 'Transportation', 'Accommodation', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Other'],
    default: 'Other'
  },
  date: {
    type: Date,
    required: true
  },
  splits: [splitDetailSchema]
}, {
  timestamps: true
});

export const Expense = mongoose.model('Expense', expenseSchema);