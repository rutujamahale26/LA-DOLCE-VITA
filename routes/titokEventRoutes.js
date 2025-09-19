import express from 'express';
import { addEvent, getEvents } from '../controllers/titokEventController.js';

const router = express.Router();

router.post('/create-live-event', addEvent)
router.get('/event-list', getEvents)

export default router