import express from 'express';
import { addEvent } from '../controllers/titokEventController.js';

const router = express.Router();

router.post('/create-live-event', addEvent)


export default router