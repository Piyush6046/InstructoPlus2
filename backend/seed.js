/**
 * InstructoPlus — Database Seed Script
 * Run with: node seed.js
 *
 * Seeds:
 *  - 2 Educators
 *  - 4 Students
 *  - 4 Courses (various categories)
 *  - 3-4 Lectures per course (YouTube embeds so no upload needed)
 *  - Course Progress for students
 *  - Reviews
 *  - Announcements + Notifications
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

// ── Models ────────────────────────────────────────
import User from "./model/user.Model.js";
import Course from "./model/course.Model.js";
import Lecture from "./model/lecture.Model.js";
import Review from "./model/review.Model.js";
import CourseProgress from "./model/courseProgress.Model.js";
import Announcement from "./model/announcement.Model.js";
import Notification from "./model/notification.Model.js";

const MONGO_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/lms";

// ─────────────────────────────────────────────────
//  SEED DATA
// ─────────────────────────────────────────────────

const hashedPassword = await bcrypt.hash("Test@1234", 10);

// ── Users ─────────────────────────────────────────
const usersData = [
  // Educators
  {
    name: "Rahul Sharma",
    email: "rahul.educator@instructoplus.com",
    password: hashedPassword,
    role: "educator",
    description:
      "Senior Full-Stack Developer with 8 years of experience. Passionate about teaching web technologies and helping students build real-world projects.",
    photoUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul&backgroundColor=b6e3f4",
  },
  {
    name: "Priya Mehta",
    email: "priya.educator@instructoplus.com",
    password: hashedPassword,
    role: "educator",
    description:
      "Data Scientist & ML Engineer at top MNC. 5+ years in AI/ML. Love simplifying complex concepts for beginners.",
    photoUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=priya&backgroundColor=ffdfbf",
  },

  // Students
  {
    name: "Arjun Patel",
    email: "arjun.student@gmail.com",
    password: hashedPassword,
    role: "student",
    description: "CS student passionate about web development and open source.",
    photoUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=arjun&backgroundColor=c0aede",
  },
  {
    name: "Sneha Reddy",
    email: "sneha.student@gmail.com",
    password: hashedPassword,
    role: "student",
    description: "Final year engineering student exploring data science and ML.",
    photoUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=sneha&backgroundColor=ffd5dc",
  },
  {
    name: "Kunal Joshi",
    email: "kunal.student@gmail.com",
    password: hashedPassword,
    role: "student",
    description: "Freelance developer looking to upskill in modern web tech.",
    photoUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=kunal&backgroundColor=d1f4d4",
  },
  {
    name: "Ananya Singh",
    email: "ananya.student@gmail.com",
    password: hashedPassword,
    role: "student",
    description: "Business graduate transitioning into tech. Loves UI/UX design.",
    photoUrl:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=ananya&backgroundColor=ffeaa7",
  },
];

// ── Course Definitions ─────────────────────────────
const coursesData = [
  {
    title: "Complete React & Node.js Full-Stack Bootcamp",
    subTitle: "Build production-ready apps with React 19, Node.js, MongoDB & more",
    description:
      "Master modern full-stack web development from scratch. Learn React hooks, Redux Toolkit, Express.js, MongoDB, JWT authentication, file uploads, payment integration and deploy real projects. Perfect for students and job-seekers.",
    category: "Web Development",
    level: "Intermediate",
    price: 1299,
    thumbnail:
      "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&q=80",
    educatorIndex: 0,
    lectures: [
      {
        lectureTitle: "Introduction to React 19 & Project Setup",
        description:
          "Overview of React 19 features, setting up Vite, understanding JSX, and creating your first component. We cover props, state, and the component lifecycle.",
        videoUrl: "https://www.youtube.com/embed/dGcsHMXbSOA",
        duration: "PT14M32S",
        isYoutubeVideo: true,
        youtubeVideoId: "dGcsHMXbSOA",
        isPreviewFree: true,
      },
      {
        lectureTitle: "React Hooks Deep Dive — useState & useEffect",
        description:
          "Master useState for state management and useEffect for side effects. Learn dependency arrays, cleanup functions, and common pitfalls to avoid.",
        videoUrl: "https://www.youtube.com/embed/O6P86uwfdR0",
        duration: "PT22M15S",
        isYoutubeVideo: true,
        youtubeVideoId: "O6P86uwfdR0",
        isPreviewFree: false,
      },
      {
        lectureTitle: "Redux Toolkit for State Management",
        description:
          "Learn Redux Toolkit (RTK) — createSlice, configureStore, useSelector, useDispatch. Build a global state solution for large React apps.",
        videoUrl: "https://www.youtube.com/embed/bbkBuqC1rU4",
        duration: "PT28M44S",
        isYoutubeVideo: true,
        youtubeVideoId: "bbkBuqC1rU4",
        isPreviewFree: false,
      },
      {
        lectureTitle: "Building REST APIs with Express.js & MongoDB",
        description:
          "Set up an Express server, connect MongoDB with Mongoose, define schemas, and build full CRUD REST APIs. Learn middleware, error handling and route protection.",
        videoUrl: "https://www.youtube.com/embed/fgTGADljAeg",
        duration: "PT35M10S",
        isYoutubeVideo: true,
        youtubeVideoId: "fgTGADljAeg",
        isPreviewFree: false,
      },
    ],
  },
  {
    title: "Machine Learning & AI for Beginners",
    subTitle: "Learn ML from scratch — Python, NumPy, Pandas, Scikit-learn, and real projects",
    description:
      "Start your AI/ML journey with zero prior experience. This course covers Python essentials, data preprocessing, supervised & unsupervised learning, model evaluation, and building your first ML projects. Includes hands-on Jupyter notebooks.",
    category: "AI/ML",
    level: "Beginner",
    price: 999,
    thumbnail:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
    educatorIndex: 1,
    lectures: [
      {
        lectureTitle: "Python for Machine Learning — Quick Crash Course",
        description:
          "Python basics you need for ML: lists, dicts, functions, list comprehensions, NumPy arrays, and Pandas DataFrames. Hands-on exercises included.",
        videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
        duration: "PT16M20S",
        isYoutubeVideo: true,
        youtubeVideoId: "rfscVS0vtbw",
        isPreviewFree: true,
      },
      {
        lectureTitle: "Understanding Linear Regression",
        description:
          "Learn how linear regression works, cost function, gradient descent, and implement it from scratch with NumPy. Then use Scikit-learn to do the same in 5 lines.",
        videoUrl: "https://www.youtube.com/embed/nk2CQITm_eo",
        duration: "PT19M55S",
        isYoutubeVideo: true,
        youtubeVideoId: "nk2CQITm_eo",
        isPreviewFree: false,
      },
      {
        lectureTitle: "Classification with Decision Trees & Random Forest",
        description:
          "Understand how decision trees split data, learn entropy and information gain, and build a Random Forest classifier on a real dataset with Scikit-learn.",
        videoUrl: "https://www.youtube.com/embed/RmajweUFKvM",
        duration: "PT24M30S",
        isYoutubeVideo: true,
        youtubeVideoId: "RmajweUFKvM",
        isPreviewFree: false,
      },
    ],
  },
  {
    title: "UI/UX Design Masterclass — Figma to Code",
    subTitle: "Design beautiful interfaces with Figma and implement them with HTML/CSS/Tailwind",
    description:
      "Learn professional UI/UX design principles, create stunning designs in Figma, and then translate them into responsive web pages using HTML, CSS and Tailwind CSS. Covers color theory, typography, spacing, and modern design trends.",
    category: "UI/UX Design",
    level: "Beginner",
    price: 799,
    thumbnail:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    educatorIndex: 0,
    lectures: [
      {
        lectureTitle: "Figma Crash Course for Developers",
        description:
          "Learn Figma from zero — frames, auto-layout, components, design tokens, and exporting assets. By the end, you'll design a full landing page.",
        videoUrl: "https://www.youtube.com/embed/FTFaQWZBqQ8",
        duration: "PT12M10S",
        isYoutubeVideo: true,
        youtubeVideoId: "FTFaQWZBqQ8",
        isPreviewFree: true,
      },
      {
        lectureTitle: "Color Theory & Typography for UI Design",
        description:
          "Why colors matter, building a color palette, understanding contrast ratios for accessibility, choosing font pairings, and applying type hierarchy.",
        videoUrl: "https://www.youtube.com/embed/c2nykC54qRE",
        duration: "PT17M40S",
        isYoutubeVideo: true,
        youtubeVideoId: "c2nykC54qRE",
        isPreviewFree: false,
      },
      {
        lectureTitle: "Building Responsive Layouts with Tailwind CSS",
        description:
          "Learn Tailwind CSS utility classes, responsive breakpoints, flexbox and grid utilities. Convert your Figma design into a responsive web page step by step.",
        videoUrl: "https://www.youtube.com/embed/pfaSUYaSgRo",
        duration: "PT31M05S",
        isYoutubeVideo: true,
        youtubeVideoId: "pfaSUYaSgRo",
        isPreviewFree: false,
      },
    ],
  },
  {
    title: "Data Structures & Algorithms in JavaScript",
    subTitle: "Ace coding interviews — arrays, trees, graphs, dynamic programming and more",
    description:
      "A complete DSA course in JavaScript designed for placement and technical interviews. Covers time & space complexity, arrays, linked lists, stacks, queues, trees, graphs, sorting algorithms, and dynamic programming with 100+ practice problems.",
    category: "Web Development",
    level: "Advanced",
    price: 1499,
    thumbnail:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
    educatorIndex: 1,
    lectures: [
      {
        lectureTitle: "Big O Notation & Complexity Analysis",
        description:
          "Understand time and space complexity, Big O, Big Theta, Big Omega. Analyze real code examples and learn to evaluate algorithm efficiency.",
        videoUrl: "https://www.youtube.com/embed/D6xkbGLQesk",
        duration: "PT18M22S",
        isYoutubeVideo: true,
        youtubeVideoId: "D6xkbGLQesk",
        isPreviewFree: true,
      },
      {
        lectureTitle: "Arrays, Strings & Two Pointer Technique",
        description:
          "Deep dive into array operations, string manipulation, sliding window, and two pointer patterns. Solve 10 interview problems from LeetCode.",
        videoUrl: "https://www.youtube.com/embed/RBSGKlAvoiM",
        duration: "PT26M18S",
        isYoutubeVideo: true,
        youtubeVideoId: "RBSGKlAvoiM",
        isPreviewFree: false,
      },
      {
        lectureTitle: "Binary Trees & Binary Search Trees",
        description:
          "Learn tree traversals (inorder, preorder, postorder), BST operations, height, depth, LCA, and solve the most common tree interview questions.",
        videoUrl: "https://www.youtube.com/embed/fAAZixBzIAI",
        duration: "PT29M50S",
        isYoutubeVideo: true,
        youtubeVideoId: "fAAZixBzIAI",
        isPreviewFree: false,
      },
      {
        lectureTitle: "Dynamic Programming — Memoization & Tabulation",
        description:
          "Learn the DP mindset: overlapping subproblems, optimal substructure. Solve Fibonacci, 0/1 Knapsack, Longest Common Subsequence with both approaches.",
        videoUrl: "https://www.youtube.com/embed/oBt53YbR9Kk",
        duration: "PT33M25S",
        isYoutubeVideo: true,
        youtubeVideoId: "oBt53YbR9Kk",
        isPreviewFree: false,
      },
    ],
  },
];

// ── Review templates per course ────────────────────────────────
const reactReviews = [
  {
    rating: 5,
    review:
      "This is hands-down the best React + Node.js course I've taken. The instructor explains Redux Toolkit in a way that finally clicked for me after 3 other failed attempts. The YouTube playlist import feature project was mind-blowing — I built it and added it to my portfolio. Got placed at a startup within 2 months of completing this!",
  },
  {
    rating: 4,
    review:
      "Really solid full-stack course. The JWT authentication section was excellent and I directly used that pattern in my internship project. Would love more content on testing with Jest, but overall this is a 9/10 course. The instructor responds to questions in announcements which is a huge plus.",
  },
  {
    rating: 5,
    review:
      "Coming from a PHP background, this course was exactly what I needed to transition to MERN stack. The Cloudinary video upload integration, payment gateway (Razorpay), and MongoDB schema design sections are production-grade. I now feel confident building full-stack apps professionally.",
  },
];

const mlReviews = [
  {
    rating: 5,
    review:
      "I had zero ML knowledge and now I can confidently explain linear regression, decision trees, and model evaluation to interviewers. The hands-on Jupyter notebook exercises made everything practical. Priya ma'am's way of breaking down gradient descent visually is something I've never seen done better anywhere.",
  },
  {
    rating: 4,
    review:
      "Great introduction to ML. The Python crash course at the beginning was super helpful — I was worried I wasn't ready but it covered exactly what was needed. The Random Forest section could go deeper into hyperparameter tuning, but the fundamentals are rock solid. Already using this in a college project.",
  },
];

const uiReviews = [
  {
    rating: 5,
    review:
      "Finally understood what auto-layout in Figma actually does! The instructor takes you from zero to designing a complete landing page and then implementing it in Tailwind. The section on color theory and contrast ratios completely changed how I approach UI design. My portfolio looks 10x better now.",
  },
  {
    rating: 4,
    review:
      "Really enjoyed this course. The Figma → Tailwind workflow they teach is exactly what companies use in the real world. I showed my certificate to an interviewer who immediately asked me to design a component on the spot — I nailed it because of this course.",
  },
  {
    rating: 5,
    review:
      "As someone switching from graphic design to UI/UX, this course bridged the gap perfectly. The typography section alone was worth it. I learned more in 3 lectures here than in 2 months of self-learning. The assignments are challenging but very satisfying to complete.",
  },
  {
    rating: 3,
    review:
      "Good content overall but some screen recordings are a bit fast to follow. I had to pause and rewind frequently. The Figma sections are excellent but the Tailwind part assumes some prior CSS knowledge. Recommend slowing down slightly in the coding sections. Still worth it though.",
  },
];

const dsaReviews = [
  {
    rating: 5,
    review:
      "This DSA course is incredibly well structured for placement prep. The Big O notation lecture should be mandatory for every CS student. The DP section with memoization vs tabulation comparison — that's the clearest explanation I've ever seen. Solved 4 LeetCode mediums after just the first 2 lectures.",
  },
  {
    rating: 5,
    review:
      "I was struggling with tree problems for months. After the binary trees lecture here, I solved 8 tree problems on LeetCode in a single sitting. The instructor builds intuition first, then shows the code — that approach is different from every other DSA resource I've tried and it works.",
  },
];

// ─────────────────────────────────────────────────
//  MAIN SEED FUNCTION
// ─────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB:", MONGO_URL);

    // ── Clean existing data ─────────────────────────
    console.log("\n🗑️  Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Lecture.deleteMany({}),
      Review.deleteMany({}),
      CourseProgress.deleteMany({}),
      Announcement.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log("   Done.");

    // ── Create Users ────────────────────────────────
    console.log("\n👤 Creating users...");
    const users = await User.insertMany(usersData);
    const educators = users.filter((u) => u.role === "educator");
    const students = users.filter((u) => u.role === "student");
    console.log(`   ${educators.length} educators, ${students.length} students created.`);

    // ── Create Courses + Lectures ───────────────────
    console.log("\n📚 Creating courses and lectures...");
    const createdCourses = [];

    for (const courseData of coursesData) {
      const { lectures: lecturesData, educatorIndex, ...courseFields } = courseData;
      const educator = educators[educatorIndex];

      // Create course
      const course = await Course.create({
        ...courseFields,
        creator: educator._id,
        isPublished: true,
      });

      // Create lectures and link to course
      const lectureIds = [];
      for (const lectureData of lecturesData) {
        const lecture = await Lecture.create({
          ...lectureData,
          courseId: course._id,
        });
        lectureIds.push(lecture._id);
      }

      // Update course with lecture IDs
      course.lectures = lectureIds;
      await course.save();

      createdCourses.push(course);
      console.log(`   ✓ "${course.title}" (${lectureIds.length} lectures)`);
    }

    // ── Enroll Students ─────────────────────────────
    console.log("\n🎓 Enrolling students...");

    // Arjun: enrolled in React course + DSA course
    const arjun = students[0];
    const reactCourse = createdCourses[0];
    const dsaCourse = createdCourses[3];

    arjun.enrolledCourses.push(reactCourse._id, dsaCourse._id);
    await arjun.save();
    reactCourse.enrolledStudents.push(arjun._id);
    dsaCourse.enrolledStudents.push(arjun._id);
    await reactCourse.save();
    await dsaCourse.save();
    console.log(`   ✓ ${arjun.name} → React course + DSA course`);

    // Sneha: enrolled in ML course + UI/UX course
    const sneha = students[1];
    const mlCourse = createdCourses[1];
    const uiCourse = createdCourses[2];

    sneha.enrolledCourses.push(mlCourse._id, uiCourse._id);
    await sneha.save();
    mlCourse.enrolledStudents.push(sneha._id);
    uiCourse.enrolledStudents.push(sneha._id);
    await mlCourse.save();
    await uiCourse.save();
    console.log(`   ✓ ${sneha.name} → ML course + UI/UX course`);

    // Kunal: enrolled in React course + UI/UX course
    const kunal = students[2];
    kunal.enrolledCourses.push(reactCourse._id, uiCourse._id);
    await kunal.save();
    reactCourse.enrolledStudents.push(kunal._id);
    uiCourse.enrolledStudents.push(kunal._id);
    await reactCourse.save();
    await uiCourse.save();
    console.log(`   ✓ ${kunal.name} → React course + UI/UX course`);

    // Ananya: enrolled in UI/UX course
    const ananya = students[3];
    ananya.enrolledCourses.push(uiCourse._id);
    await ananya.save();
    uiCourse.enrolledStudents.push(ananya._id);
    await uiCourse.save();
    console.log(`   ✓ ${ananya.name} → UI/UX course`);

    // ── Course Progress ─────────────────────────────
    console.log("\n📊 Creating course progress...");

    // Arjun has completed 3/4 lectures in React course
    const reactLectures = await Lecture.find({ courseId: reactCourse._id });
    await CourseProgress.create({
      userId: arjun._id,
      courseId: reactCourse._id,
      completedLectures: reactLectures.slice(0, 3).map((l) => l._id),
    });
    console.log(`   ✓ ${arjun.name} — React: 3/${reactLectures.length} lectures done`);

    // Arjun has completed 2/4 lectures in DSA
    const dsaLectures = await Lecture.find({ courseId: dsaCourse._id });
    await CourseProgress.create({
      userId: arjun._id,
      courseId: dsaCourse._id,
      completedLectures: dsaLectures.slice(0, 2).map((l) => l._id),
    });
    console.log(`   ✓ ${arjun.name} — DSA: 2/${dsaLectures.length} lectures done`);

    // Sneha has completed all ML lectures (100%)
    const mlLectures = await Lecture.find({ courseId: mlCourse._id });
    await CourseProgress.create({
      userId: sneha._id,
      courseId: mlCourse._id,
      completedLectures: mlLectures.map((l) => l._id),
    });
    console.log(`   ✓ ${sneha.name} — ML: ${mlLectures.length}/${mlLectures.length} lectures done (100%!)`);

    // Sneha has completed 1/3 UI/UX
    const uiLectures = await Lecture.find({ courseId: uiCourse._id });
    await CourseProgress.create({
      userId: sneha._id,
      courseId: uiCourse._id,
      completedLectures: [uiLectures[0]._id],
    });
    console.log(`   ✓ ${sneha.name} — UI/UX: 1/${uiLectures.length} lectures done`);

    // Kunal just started React (0 completed)
    await CourseProgress.create({
      userId: kunal._id,
      courseId: reactCourse._id,
      completedLectures: [],
    });
    console.log(`   ✓ ${kunal.name} — React: 0 lectures done (just enrolled)`);

    // ── Reviews ─────────────────────────────────────
    console.log("\n⭐ Creating reviews...");

    const reviewsToCreate = [
      // React course reviews (3 reviewers)
      { user: arjun._id, course: reactCourse._id, instructor: educators[0]._id, ...reactReviews[0] },
      { user: kunal._id, course: reactCourse._id, instructor: educators[0]._id, ...reactReviews[1] },
      { user: sneha._id, course: reactCourse._id, instructor: educators[0]._id, ...reactReviews[2] },

      // ML course reviews (2 reviewers)
      { user: sneha._id, course: mlCourse._id, instructor: educators[1]._id, ...mlReviews[0] },
      { user: ananya._id, course: mlCourse._id, instructor: educators[1]._id, ...mlReviews[1] },

      // UI/UX course reviews (4 reviewers)
      { user: sneha._id, course: uiCourse._id, instructor: educators[0]._id, ...uiReviews[0] },
      { user: kunal._id, course: uiCourse._id, instructor: educators[0]._id, ...uiReviews[1] },
      { user: ananya._id, course: uiCourse._id, instructor: educators[0]._id, ...uiReviews[2] },
      { user: arjun._id, course: uiCourse._id, instructor: educators[0]._id, ...uiReviews[3] },

      // DSA reviews (2 reviewers)
      { user: arjun._id, course: dsaCourse._id, instructor: educators[1]._id, ...dsaReviews[0] },
      { user: kunal._id, course: dsaCourse._id, instructor: educators[1]._id, ...dsaReviews[1] },
    ];

    const createdReviews = [];
    for (const reviewData of reviewsToCreate) {
      const review = await Review.create(reviewData);
      createdReviews.push(review);
    }

    // Link reviews to courses
    reactCourse.reviews.push(
      ...createdReviews.filter((r) => r.course.toString() === reactCourse._id.toString()).map((r) => r._id)
    );
    mlCourse.reviews.push(
      ...createdReviews.filter((r) => r.course.toString() === mlCourse._id.toString()).map((r) => r._id)
    );
    uiCourse.reviews.push(
      ...createdReviews.filter((r) => r.course.toString() === uiCourse._id.toString()).map((r) => r._id)
    );
    dsaCourse.reviews.push(
      ...createdReviews.filter((r) => r.course.toString() === dsaCourse._id.toString()).map((r) => r._id)
    );

    await Promise.all([
      reactCourse.save(),
      mlCourse.save(),
      uiCourse.save(),
      dsaCourse.save(),
    ]);
    console.log(`   ✓ ${createdReviews.length} reviews created`);

    // ── Announcements + Notifications ───────────────
    console.log("\n📣 Creating announcements & notifications...");

    const announcement1 = await Announcement.create({
      title: "New React 19 Module Added!",
      description:
        "We've added a brand new module covering React Server Components and the new Actions API in React 19. Check out the updated course content. Happy learning!",
      sender: educators[0]._id,
      courseIds: [reactCourse._id],
      recipientStudents: [arjun._id, kunal._id],
      deliveryType: "inapp",
    });

    const announcement2 = await Announcement.create({
      title: "Live Doubt Session This Saturday",
      description:
        "Join us for a live Q&A session on Zoom this Saturday at 6 PM IST. We'll cover ML model evaluation, cross-validation, and answer your project questions.",
      sender: educators[1]._id,
      courseIds: [mlCourse._id],
      recipientStudents: [sneha._id],
      deliveryType: "both",
    });

    const announcement3 = await Announcement.create({
      title: "Figma Assignment Due — Submit by Friday",
      description:
        "Don't forget to submit your Figma assignment (Landing Page Redesign) by this Friday. Upload the link in the submission form in the course portal.",
      sender: educators[0]._id,
      courseIds: [uiCourse._id],
      recipientStudents: [sneha._id, kunal._id, ananya._id],
      deliveryType: "inapp",
    });

    // Create notifications for each student
    await Notification.create([
      { userId: arjun._id, announcementId: announcement1._id, isRead: true },
      { userId: kunal._id, announcementId: announcement1._id, isRead: false },
      { userId: sneha._id, announcementId: announcement2._id, isRead: false },
      { userId: sneha._id, announcementId: announcement3._id, isRead: true },
      { userId: kunal._id, announcementId: announcement3._id, isRead: false },
      { userId: ananya._id, announcementId: announcement3._id, isRead: false },
    ]);

    console.log(`   ✓ 3 announcements + 6 notifications created`);

    // ─────────────────────────────────────────────
    //  SUMMARY
    // ─────────────────────────────────────────────
    console.log("\n" + "═".repeat(55));
    console.log("🎉  SEED COMPLETE!");
    console.log("═".repeat(55));
    console.log("\n📋 LOGIN CREDENTIALS (password for all: Test@1234)\n");
    console.log("  EDUCATORS:");
    console.log("    📧 rahul.educator@instructoplus.com");
    console.log("    📧 priya.educator@instructoplus.com");
    console.log("\n  STUDENTS:");
    console.log("    📧 arjun.student@gmail.com   (React 75% done, DSA 50% done)");
    console.log("    📧 sneha.student@gmail.com   (ML 100% done, UI/UX 33% done)");
    console.log("    📧 kunal.student@gmail.com   (React just enrolled)");
    console.log("    📧 ananya.student@gmail.com  (UI/UX enrolled)");
    console.log("\n  Password: Test@1234");
    console.log("═".repeat(55) + "\n");

    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected. Done!");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Seed failed:", err.message);
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
