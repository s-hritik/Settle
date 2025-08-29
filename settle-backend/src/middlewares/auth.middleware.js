import {ApiError} from '../utility/ApiError.js';
import { AsyncHandler } from '../utility/AsyncHandler.js';
import jwt from 'jsonwebtoken';
import { User} from '../models/user.model.js';

export const verifyJWT = AsyncHandler (async (req, res, next) => {
    try {

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if(!token) throw new ApiError(401, 'Unauthorized access');

        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password");

        if(!user) throw new ApiError(401 , ' Invalid Access Token');

        req.user = user;
        next(); 

    }
    catch (error) {
        console.log("TOKEN VERIFICATION FAILED:", error.name, error.message); 
        throw new ApiError(401, 'Unauthorized access');
    }
})