import express from "express";
import { getCourseProgress, markLectureComplete } from "../controller/progress.controller.js";
import isAuth from "../middleware/isAuth.js";

const progressRouter = express.Router();

// Get progress for a specific course (for the logged-in student)
progressRouter.get("/:courseId", isAuth, getCourseProgress);

// Toggle lecture complete/incomplete
progressRouter.post("/:courseId/:lectureId/complete", isAuth, markLectureComplete);

export default progressRouter;
