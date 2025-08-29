import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
    },
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true
});

export const Payment = mongoose.model('Payment', paymentSchema);