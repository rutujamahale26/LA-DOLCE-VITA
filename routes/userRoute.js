import express from 'express';
import { createUser, deleteUser, getUsers  } from '../controllers/userController.js';

const router = express.Router();

router.post('/create-customer', createUser);
router.get('/customer-list', getUsers)
router.delete('/delete-customer/:id', deleteUser)

export default router