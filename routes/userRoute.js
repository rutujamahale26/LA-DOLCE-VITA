import express from 'express';
import { createUser, getUsers  } from '../controllers/userController.js';

const router = express.Router();

router.post('/create-customer', createUser);
router.get('/customer-list', getUsers)

export default router