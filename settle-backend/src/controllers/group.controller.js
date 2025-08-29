import { Group } from '../models/group.model.js';
import { ApiError } from '../utility/ApiError.js';
import { ApiResponse } from '../utility/ApiResponse.js';
import { AsyncHandler } from '../utility/AsyncHandler.js';
import { sendEmail } from '../utility/EmailService.js';
import {User} from '../models/user.model.js'


const getGroups = AsyncHandler(async (req, res) => {

    const groups = await Group.find({ members: req.user.email }).sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, groups, 'Groups fetched successfully'));
});

const addGroup = AsyncHandler(async (req, res) => {
    const { name, description } = req.body;
    let { members } = req.body;

    if (!name || !members || members.length === 0) {
        throw new ApiError(400, 'Group name and at least one member are required');
    }

    const creatorEmail = req.user.email;
    if (!members.includes(creatorEmail)) {
        members.push(creatorEmail);
    }

    const group = new Group({
        name,
        description,
        members,
        created_by: req.user._id,
    });

    const createdGroup = await group.save();

    members.forEach(memberEmail => {
        req.io.to(memberEmail).emit('new_group', createdGroup);
    });

     const membersToNotifyByEmail = members.filter(email => email !== creatorEmail);
    try {
     
        const usersToNotify = await User.find({
            email: { $in: membersToNotifyByEmail },
            'preferences.notifications': { $ne: false } 
        });

        await Promise.all(usersToNotify.map(user => {
            return sendEmail({
                to: user.email,
                subject: `You've been added to a new group: ${name}`,
                text: `Hi there,\n\n${req.user.name} (${req.user.email}) has added you to a new expense splitting group called "${name}".\n\nYou can now split expenses with them!\n\nBest,\nThe Settle Team`
            });
        }));
    } catch (error) {
        console.error("Failed to send email notifications:", error);
    }

    return res.status(201).json(new ApiResponse(201, createdGroup, 'Group created successfully'));
});


const getGroupById = AsyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);

    if (!group) {
        throw new ApiError(404, "Group not found");
    }

    const isCreator = group.created_by.equals(req.user._id);
    const isMember = group.members.includes(req.user.email);
    
    if (!isCreator && !isMember) {
        throw new ApiError(403, "You do not have permission to view this group");
    }

    return res.status(200).json(new ApiResponse(200, group, "Group fetched successfully"));
});

export { getGroups, addGroup, getGroupById };