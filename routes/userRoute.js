import express from 'express';
import { createUser, deleteUser, getUsers, updateUser  } from '../controllers/userController.js';

const router = express.Router();

router.post('/create-customer', createUser);
router.get('/customer-list', getUsers)
router.delete('/delete-customer/:id', deleteUser)
router.put('/update-customer/:id', updateUser)

export default router