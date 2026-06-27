import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaPlayCircle, FaRegClock, FaCheckCircle, FaCircle } from "react-icons/fa";
import { FaArrowLeftLong, FaRobot, FaFileLines, FaPaperPlane, FaTrophy } from "react-icons/fa6";
import { MdOutlineMenuBook } from "react-icons/md";
import axios from "axios";
import { serverUrl } from "../App";

// ── Duration helper ──────────────────────────────────────────────────────────
// Handles both ISO 8601 ("PT14M32S" from YouTube) and numeric seconds (Cloudinary)
function parseDuration(duration) {
  if (!duration || duration === 'PT0S') return null;
  // Numeric seconds
  if (!isNaN(duration)) {
    const total = parseInt(duration);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }
  // ISO 8601 e.g. PT14M32S, PT1H2M3S
  const match = String(duration).match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function ViewLecture() {
  const { courseId } = useParams();
  const { courseData } = useSelector((state) => state.course);
  const selectedCourse = courseData?.find((course) => course._id === courseId);

  const [selectedLecture, setSelectedLecture] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("description"); // "description" | "notes" | "ask"
  const navigate = useNavigate();

  // ── Progress State ──────────────────────────────────
  const [completedLectures, setCompletedLectures] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressLoading, setProgressLoading] = useState(false);

  // ── AI Notes State ──────────────────────────────────
  const [aiSummary, setAiSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  // ── Ask AI (RAG) State ──────────────────────────────
  const [chatMessages, setChatMessages] = useState([]);
  const [userQuestion, setUserQuestion] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Initialize first lecture
  useEffect(() => {
    if (selectedCourse?.lectures?.length > 0) {
      setSelectedLecture(selectedCourse.lectures[0]);
    }
  }, [courseId, selectedCourse]);

  // Fetch progress when course loads
  useEffect(() => {
    if (courseId) fetchProgress();
  }, [courseId]);

  // Reset AI state when lecture changes
  useEffect(() => {
    setAiSummary("");
    setSummaryError("");
    setChatMessages([]);
    setActiveTab("description");
  }, [selectedLecture?._id]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ── API Calls ────────────────────────────────────────

  const fetchProgress = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/progress/${courseId}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setCompletedLectures(res.data.completedLectures.map((id) => id.toString()));
        setProgressPercent(res.data.percentage);
      }
    } catch (err) {
      console.error("Error fetching progress:", err);
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedLecture) return;
    setProgressLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/progress/${courseId}/${selectedLecture._id}/complete`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        setCompletedLectures(res.data.completedLectures.map((id) => id.toString()));
        setProgressPercent(res.data.percentage);
      }
    } catch (err) {
      console.error("Error toggling completion:", err);
    } finally {
      setProgressLoading(false);
    }
  };

  const handleGetAiNotes = async (force = false) => {
    if (!selectedLecture) return;
    if (aiSummary && !force) return; // already loaded (skip unless forced retry)
    setSummaryLoading(true);
    setSummaryError("");
    if (force) setAiSummary(""); // clear old notes on retry
    try {
      const res = await axios.get(
        `${serverUrl}/api/course/ai/summary/${selectedLecture._id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setAiSummary(res.data.aiSummary);
      } else {
        setSummaryError("AI notes unavailable. " + (res.data.message || ""));
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      setSummaryError(`Could not generate notes: ${msg}. Check your GEMINI_API_KEY and try again.`);
      console.error("AI Notes error:", err.response?.data || err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!userQuestion.trim() || askLoading) return;
    const question = userQuestion.trim();
    setUserQuestion("");
    setChatMessages((prev) => [...prev, { role: "user", text: question }]);
    setAskLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/course/ai/ask/${selectedLecture._id}`,
        { question },
        { withCredentials: true }
      );
      if (res.data.success) {
        setChatMessages((prev) => [...prev, { role: "ai", text: res.data.answer }]);
      } else {
        setChatMessages((prev) => [...prev, { role: "ai", text: "❌ " + (res.data.message || "Error processing question.") }]);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: `❌ Error: ${msg || "Could not process question. Check backend logs."}` },
      ]);
      console.error("Ask AI error:", err.response?.data || err.message);
    } finally {
      setAskLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "notes" && !aiSummary) handleGetAiNotes();
  };

  const handleLectureSelect = (lecture) => {
    setSelectedLecture(lecture);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredLectures =
    selectedCourse?.lectures?.filter((lecture) =>
      lecture.lectureTitle.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const isCompleted = selectedLecture
    ? completedLectures.includes(selectedLecture._id.toString())
    : false;

  if (!selectedCourse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Course Not Found</h1>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex flex-col">
      {/* Top Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-700 hover:text-black transition"
        >
          <FaArrowLeftLong className="text-xl" />
          <span className="font-medium">Back to Courses</span>
        </button>

        {/* Overall Progress Bar */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">{progressPercent}% Complete</span>
          <div className="w-40 h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-grow">
        {/* ── Left Column: Video + Tabs ── */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4">

          {/* Video Player */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            {selectedLecture?.videoUrl ? (
              selectedLecture.isYoutubeVideo ? (
                <div className="aspect-video bg-black">
                  <iframe
                    className="w-full h-full"
                    src={selectedLecture.videoUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video bg-black">
                  <video
                    src={selectedLecture.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              )
            ) : (
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white p-6">
                  <FaPlayCircle className="text-4xl mx-auto mb-3" />
                  <h3 className="text-xl font-medium">Select a lecture to start watching</h3>
                </div>
              </div>
            )}
          </div>

          {/* Lecture Title + Mark Complete */}
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  {selectedLecture?.lectureTitle || "No Lecture Selected"}
                </h2>
                {selectedLecture?.duration && parseDuration(selectedLecture.duration) && (
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <FaRegClock />
                    <span>{parseDuration(selectedLecture.duration)}</span>
                  </div>
                )}
              </div>

              {/* Mark as Complete Button */}
              {selectedLecture && (
                <button
                  onClick={handleMarkComplete}
                  disabled={progressLoading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isCompleted
                      ? "bg-green-100 text-green-700 border border-green-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg"
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <FaCheckCircle className="text-green-600" />
                      <span>{progressLoading ? "Updating..." : "Completed ✓"}</span>
                    </>
                  ) : (
                    <>
                      <FaCircle className="text-white/70" />
                      <span>{progressLoading ? "Saving..." : "Mark as Complete"}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Mobile Progress Bar */}
            <div className="mt-4 md:hidden">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Course Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── Tabs: Description | AI Notes | Ask AI ── */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => handleTabChange("description")}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                  activeTab === "description"
                    ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <MdOutlineMenuBook className="text-base" />
                Description
              </button>
              <button
                onClick={() => handleTabChange("notes")}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                  activeTab === "notes"
                    ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <FaFileLines className="text-sm" />
                📝 AI Notes
              </button>
              <button
                onClick={() => handleTabChange("ask")}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                  activeTab === "ask"
                    ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <FaRobot className="text-sm" />
                🤖 Ask AI
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-5">
              {/* ─ Description Tab ─ */}
              {activeTab === "description" && (
                <div>
                  {selectedLecture?.description ? (
                    <p className="text-gray-700 leading-relaxed">{selectedLecture.description}</p>
                  ) : (
                    <p className="text-gray-400 italic">No description available for this lecture.</p>
                  )}

                  {/* Documents */}
                  {selectedLecture?.documents?.length > 0 && (
                    <div className="mt-5">
                      <h3 className="font-semibold text-gray-700 mb-3">📎 Attached Documents</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedLecture.documents.map((doc, i) => (
                          <a
                            key={i}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={doc.title || "document"}
                            className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition flex items-center gap-1.5 border border-green-200"
                          >
                            📄 {doc.title || "Document"}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─ AI Notes Tab ─ */}
              {activeTab === "notes" && (
                <div>
                  {summaryLoading && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                      <p className="text-gray-500 text-sm">Generating AI notes with Gemini... (may take 5-10s)</p>
                    </div>
                  )}

                  {summaryError && !summaryLoading && (
                    <div className="text-center py-10">
                      <p className="text-red-500 mb-2 text-sm">{summaryError}</p>
                      <button
                        onClick={() => handleGetAiNotes(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                      >
                        🔄 Retry
                      </button>
                    </div>
                  )}

                  {aiSummary && !summaryLoading && (
                    <div>
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                        <div className="p-1.5 bg-indigo-100 rounded-lg">
                          <FaRobot className="text-indigo-600 text-sm" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          AI-Generated Study Notes
                        </span>
                        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          Powered by Gemini
                        </span>
                      </div>
                      {/* Render the notes — preserve line breaks */}
                      <div className="text-gray-700 text-sm leading-7 whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-4 border border-gray-200">
                        {aiSummary}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─ Ask AI (RAG) Tab ─ */}
              {activeTab === "ask" && (
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <FaRobot className="text-purple-600 text-sm" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 block">
                        Ask about this lecture
                      </span>
                      <span className="text-xs text-gray-400">
                        AI answers based on lecture content only
                      </span>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="min-h-[200px] max-h-[320px] overflow-y-auto flex flex-col gap-3 mb-4 pr-1">
                    {chatMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-40 text-center">
                        <FaRobot className="text-4xl text-gray-300 mb-3" />
                        <p className="text-gray-400 text-sm">
                          Ask any question about this lecture
                        </p>
                        <p className="text-gray-300 text-xs mt-1">
                          e.g. "What is the main concept explained here?"
                        </p>
                      </div>
                    )}

                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-indigo-600 text-white rounded-br-sm"
                              : "bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200"
                          }`}
                        >
                          {msg.role === "ai" && (
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <FaRobot className="text-indigo-500 text-xs" />
                              <span className="text-xs font-medium text-indigo-500">AI Tutor</span>
                            </div>
                          )}
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    ))}

                    {askLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                          <span className="text-xs text-gray-400">AI is thinking...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Box */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
                      placeholder="Ask about this lecture..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500"
                    />
                    <button
                      onClick={handleAskQuestion}
                      disabled={!userQuestion.trim() || askLoading}
                      className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5"
                    >
                      <FaPaperPlane className="text-sm" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column: Lectures List + Instructor ── */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          {/* Course Info Card */}
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
            <h1 className="text-xl font-bold text-gray-800 mb-3">{selectedCourse.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {selectedCourse.category}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                {selectedCourse.level}
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                {selectedCourse.lectures?.length || 0} lectures
              </span>
            </div>

            {/* Progress in sidebar */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>{completedLectures.length} / {selectedCourse.lectures?.length || 0} completed</span>
                <span className="font-semibold text-indigo-600">{progressPercent}%</span>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {progressPercent === 100 && (
                <div className="mt-3 flex flex-col gap-2">
                  <p className="text-green-600 text-xs font-medium flex items-center gap-1">
                    <FaCheckCircle /> Course completed! 🎉
                  </p>
                  <button
                    onClick={() => navigate(`/certificate/${courseId}`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:from-yellow-600 hover:to-orange-600 transition shadow-md"
                  >
                    <FaTrophy className="text-sm" />
                    Get Certificate
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Lectures List */}
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Course Content</h2>
              <span className="text-sm text-gray-500">{selectedCourse.lectures?.length} lectures</span>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search lectures..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="max-h-[500px] overflow-y-auto pr-1 space-y-2">
              {filteredLectures.length > 0 ? (
                filteredLectures.map((lecture, index) => {
                  const done = completedLectures.includes(lecture._id.toString());
                  return (
                    <div
                      key={lecture._id}
                      onClick={() => handleLectureSelect(lecture)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedLecture?._id === lecture._id
                          ? "bg-indigo-50 border-indigo-300 shadow-sm"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Completion indicator */}
                        <div className="flex-shrink-0">
                          {done ? (
                            <FaCheckCircle className="text-green-500 text-lg" />
                          ) : (
                            <span className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-400 text-xs font-bold">
                              {(index + 1).toString().padStart(2, "0")}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium text-sm truncate ${done ? "text-gray-500 line-through" : "text-gray-800"}`}>
                            {lecture.lectureTitle}
                          </h4>
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-0.5">
                            <FaRegClock className="text-[10px]" />
                            <span>{parseDuration(lecture.duration) || "N/A"}</span>
                          </div>
                        </div>
                        <FaPlayCircle className={`text-sm flex-shrink-0 ${selectedLecture?._id === lecture._id ? "text-indigo-500" : "text-gray-400"}`} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No lectures found
                </div>
              )}
            </div>
          </div>

          {/* Instructor Card */}
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Instructor</h3>
            <div className="flex items-start gap-3">
              <img
                onClick={() => navigate(`/user/${selectedCourse.creator?._id}`)}
                src={selectedCourse.creator?.photoUrl || "/default-avatar.png"}
                alt="Instructor"
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 shadow-sm cursor-pointer"
              />
              <div>
                <h4 className="font-medium text-gray-800 text-sm">
                  {selectedCourse.creator?.name || "Unknown Instructor"}
                </h4>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                  {selectedCourse.creator?.description || "No bio available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewLecture;
