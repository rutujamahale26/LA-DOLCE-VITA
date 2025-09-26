import express from 'express';
import { createUser, deleteUser, getUserById, getUserDetailsWithOrders, getUsers, searchUser, toggleBlockCustomer, updateCustomerAddress, updateUser  } from '../controllers/userController.js';

const router = express.Router();

router.post('/create-customer', createUser);
router.get('/customer-list', getUsers)
router.get("/user-details/:id", getUserById);
router.delete('/delete-customer/:id', deleteUser)
router.put('/update-customer/:id', updateUser)

// ✅ Get user profile + stats + product order history
router.get("/orders/:userId", getUserDetailsWithOrders);
router.put('/block/:id', toggleBlockCustomer);
router.put('/address/:id', updateCustomerAddress)

// // 2️⃣ Fallback → use `search` param and detect type
router.get('/search', searchUser)

export default router 