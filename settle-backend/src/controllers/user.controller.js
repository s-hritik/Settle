import { User } from '../models/user.model.js';
import { ApiError } from '../utility/ApiError.js';
import { ApiResponse } from '../utility/ApiResponse.js';
import { AsyncHandler } from '../utility/AsyncHandler.js';
import { uploadOnCloudinary } from '../utility/Cloudinary.js';
import jwt from 'jsonwebtoken';

const generateAccessToken = (userId) => {

    return jwt.sign({ _id: userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
};

const registerUser = AsyncHandler(async (req, res) => {

    const { name, email, password } = req.body;
    if (!name || !email || !password) throw new ApiError(400, 'All fields are required');

    const existedUser = await User.findOne({ email });
    if (existedUser) throw new ApiError(409, 'User with this email already exists');

    const user = await User.create({ name, email, password });

    const createdUser = user.toObject();
    delete createdUser.password;
    if (!createdUser) throw new ApiError(500, 'Something went wrong while registering the user');

    const accessToken = generateAccessToken(createdUser._id);
    const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production' };

    return res.status(201).cookie("accessToken", accessToken, options).json(new ApiResponse(201, { user: createdUser, accessToken }, 'User registered successfully'));
});

const loginUser = AsyncHandler(async (req, res) => {

    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, 'Email and password are required');

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, 'User does not exist');

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(401, 'Invalid user credentials');

    const accessToken = generateAccessToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password");
    const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production' };

    return res.status(200).cookie("accessToken", accessToken, options).json(new ApiResponse(200, { user: loggedInUser, accessToken }, "User logged in successfully"));
});

const logoutUser = AsyncHandler(async (req, res) => {

    return res.status(200).clearCookie("accessToken").json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getCurrentUser = AsyncHandler(async (req, res) => {

    return res.status(200).json(new ApiResponse(200, req.user, "User profile fetched successfully"));
});

const updateUserProfile = AsyncHandler(async (req, res) => {

    const { name } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');

    user.name = name || user.name;
    if (req.file) {

        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const cloudinaryResponse = await uploadOnCloudinary(dataURI);

        if (cloudinaryResponse) user.avatar = cloudinaryResponse.url;
        else throw new ApiError(500, "Error uploading avatar");
    }

    const updatedUser = await user.save();

    return res.status(200).json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

const updateUserPreferences = AsyncHandler(async (req, res) => {
    const { notifications } = req.body;

    const preferencesToUpdate = {};
    if (typeof notifications === 'boolean') {
        preferencesToUpdate['preferences.notifications'] = notifications;
    }

    if (Object.keys(preferencesToUpdate).length === 0) {
        const existingUser = await User.findById(req.user._id).select("-password");
        return res.status(200).json(new ApiResponse(200, existingUser, "No valid preference fields provided, no changes made."));
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: preferencesToUpdate },
        { new: true }
    ).select("-password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, user, "Preferences updated successfully"));
});

const changeCurrentUserPassword = AsyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) throw new ApiError(400, "Old and new passwords are required");

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) throw new ApiError(401, "Invalid old password");

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});


export { registerUser, loginUser, getCurrentUser, updateUserProfile, updateUserPreferences, changeCurrentUserPassword, logoutUser };