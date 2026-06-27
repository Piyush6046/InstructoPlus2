import CourseProgress from "../model/courseProgress.Model.js";
import Course from "../model/course.Model.js";

// GET /api/progress/:courseId
// Returns current user's progress for a course
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    // Find or return empty progress
    const progress = await CourseProgress.findOne({ userId, courseId });

    const course = await Course.findById(courseId).populate("lectures");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const totalLectures = course.lectures.length;
    const completedLectures = progress ? progress.completedLectures : [];
    const completedCount = completedLectures.length;

    // Calculate percentage (0 if no lectures)
    const percentage =
      totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

    return res.status(200).json({
      success: true,
      completedLectures, // array of lectureIds
      totalLectures,
      completedCount,
      percentage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error getting course progress",
      error: error.message,
    });
  }
};

// POST /api/progress/:courseId/:lectureId/complete
// Toggle: mark a lecture as complete or incomplete
export const markLectureComplete = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.userId;

    // Find existing progress or create a new doc for this user+course
    let progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      progress = await CourseProgress.create({
        userId,
        courseId,
        completedLectures: [lectureId],
      });
    } else {
      const alreadyCompleted = progress.completedLectures
        .map((id) => id.toString())
        .includes(lectureId);

      if (alreadyCompleted) {
        // Toggle OFF: remove from completed
        progress.completedLectures = progress.completedLectures.filter(
          (id) => id.toString() !== lectureId
        );
      } else {
        // Toggle ON: add to completed
        progress.completedLectures.push(lectureId);
      }
      await progress.save();
    }

    // Re-calculate and return updated progress
    const course = await Course.findById(courseId).populate("lectures");
    const totalLectures = course.lectures.length;
    const completedCount = progress.completedLectures.length;
    const percentage =
      totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

    return res.status(200).json({
      success: true,
      message: "Progress updated",
      completedLectures: progress.completedLectures,
      totalLectures,
      completedCount,
      percentage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating progress",
      error: error.message,
    });
  }
};
