import { Router } from 'express';
import { getGroups, addGroup } from '../controllers/group.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getGroupById } from '../controllers/group.controller.js'; 

const router = Router();

router.use(verifyJWT);

router.route('/')
    .get(getGroups)
    .post(addGroup);

router.route('/:groupId').get(getGroupById);

export default router;