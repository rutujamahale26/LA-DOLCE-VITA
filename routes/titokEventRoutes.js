import express from 'express';
import { addEvent, deleteEvent, getEventById, getEvents, updateEvent } from '../controllers/titokEventController.js';

const router = express.Router();

router.post('/create-live-event', addEvent)
router.get('/event-list', getEvents);
router.put("/update-event/:id", updateEvent);
router.get("/event-details/:id", getEventById);
router.delete('/delete-event/:id', deleteEvent)

export default router