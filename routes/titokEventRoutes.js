import express from 'express';
import { addEvent, deleteEvent, getEvents } from '../controllers/titokEventController.js';

const router = express.Router();

router.post('/create-live-event', addEvent)
router.get('/event-list', getEvents);
router.delete('/delete-event/:id', deleteEvent)

export default router