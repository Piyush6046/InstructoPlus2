import mongoose from "mongoose";

// Tracks which lectures a student has completed for a specific course
// One document per student per course (enforced by unique compound index)
const courseProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // Array of lectureIds the student has marked as complete
    completedLectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
  },
  { timestamps: true }
);

// Compound unique index: one progress document per user per course
courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model("CourseProgress", courseProgressSchema);
