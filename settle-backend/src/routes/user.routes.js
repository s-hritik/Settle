import { Router } from 'express';
import { registerUser, loginUser, getCurrentUser, updateUserProfile, updateUserPreferences,changeCurrentUserPassword , logoutUser  } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

// Protected Routes
router.route('/me').get(verifyJWT, getCurrentUser);
router.route('/profile').put(verifyJWT, upload.single('avatar'), updateUserProfile);

router.route('/preferences').put(verifyJWT, updateUserPreferences);
router.route('/change-password').post(verifyJWT, changeCurrentUserPassword);
router.route('/logout').post(verifyJWT, logoutUser);


export default router;