import { Payment } from '../models/payment.model.js';
import { Group } from '../models/group.model.js';
import { ApiError } from '../utility/ApiError.js';
import { ApiResponse } from '../utility/ApiResponse.js';
import { AsyncHandler } from '../utility/AsyncHandler.js';

const settleUp = AsyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { from, to, amount } = req.body;

    if (!from || !to || !amount) {
        throw new ApiError(400, 'From, to, and amount are required');
    }

    const group = await Group.findById(groupId);
    if (!group) {
        throw new ApiError(404, 'Group not found');
    }
    if (!group.members.includes(req.user.email)) {
        throw new ApiError(403, "You are not authorized to perform this action in this group");
    }

    const paymentData = {
        group_id: groupId,
        from,
        to,
        amount
    };

    const createdPayment = await Payment.create(paymentData);

    if (!createdPayment) {
        throw new ApiError(500, 'Something went wrong while recording the payment');
    }

    group.members.forEach(memberEmail => {
        req.io.to(memberEmail).emit('new_payment', createdPayment);
    });

    return res.status(201).json(new ApiResponse(201, createdPayment, 'Payment recorded successfully'));
});

export { settleUp };