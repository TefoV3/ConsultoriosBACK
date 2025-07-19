import { ActivityRecordController } from "../controllers/ActivityRecordController.js";
import { Router } from "express";

export const ActivityRecordRouter = Router();

// Get all activity records
ActivityRecordRouter.get('/activity-record', ActivityRecordController.getAll);

// Get all records for a specific activity
ActivityRecordRouter.get('/activity-record/activity/:activityId', ActivityRecordController.getByActivityId);

// Get a specific record by ID
ActivityRecordRouter.get('/activity-record/:id', ActivityRecordController.getById);

// Create a new activity record
ActivityRecordRouter.post('/activity-record', ActivityRecordController.create);

// Update an existing activity record
ActivityRecordRouter.put('/activity-record/:id', ActivityRecordController.update);

// Delete an activity record
ActivityRecordRouter.delete('/activity-record/:id', ActivityRecordController.delete);