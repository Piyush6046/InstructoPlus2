import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeftLong, FaMedal, FaDownload, FaPrint } from "react-icons/fa6";
import { MdVerified } from "react-icons/md";

function Certificate() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const certRef = useRef(null);

  const { userData } = useSelector((state) => state.user);
  const { courseData } = useSelector((state) => state.course);

  const course = courseData?.find((c) => c._id === courseId);
  const user = userData?.user;

  const completionDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Generate a unique certificate ID
  const certId = `IPLS-${courseId?.slice(-6).toUpperCase()}-${user?._id?.slice(-6).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  if (!course || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course or user data not found.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-4 md:p-8">
      {/* Controls - hidden on print */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition"
        >
          <FaArrowLeftLong />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition border border-white/20"
          >
            <FaPrint className="text-sm" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* ── Certificate ── */}
      <div
        ref={certRef}
        className="max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {/* Top border decoration */}
        <div className="h-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500" />

        <div className="p-10 md:p-16 relative">
          {/* Background watermark */}
          <div
            className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none"
            aria-hidden="true"
          >
            <span
              style={{
                fontSize: "12rem",
                fontWeight: "bold",
                transform: "rotate(-30deg)",
                color: "#4f46e5",
              }}
            >
              InstructoPlus
            </span>
          </div>

          {/* Header */}
          <div className="text-center mb-10 relative">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-indigo-400" />
              <FaMedal className="text-yellow-500 text-3xl" />
              <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-indigo-400" />
            </div>
            <p
              className="text-indigo-600 text-sm font-sans font-semibold tracking-widest uppercase mb-2"
            >
              InstructoPlus Learning Platform
            </p>
            <h1
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-2"
              style={{ letterSpacing: "0.05em" }}
            >
              Certificate of Completion
            </h1>
            <p className="text-gray-400 font-sans text-sm">
              This certifies that the following student has successfully completed
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
          </div>

          {/* Student Name */}
          <div className="text-center mb-8">
            <p className="text-gray-500 font-sans text-sm uppercase tracking-widest mb-2">
              Proudly presented to
            </p>
            <h2
              className="text-5xl md:text-6xl font-bold mb-3"
              style={{
                background: "linear-gradient(135deg, #4f46e5, #7c3aed, #db2777)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {user.name}
            </h2>
            <div className="flex items-center justify-center gap-2 text-indigo-600">
              <MdVerified className="text-lg" />
              <span className="font-sans text-sm font-medium">Verified Student</span>
            </div>
          </div>

          {/* Course Name */}
          <div className="text-center mb-8 px-4 md:px-12">
            <p className="text-gray-500 font-sans text-sm uppercase tracking-widest mb-3">
              for successfully completing
            </p>
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 rounded-2xl p-6">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
                {course.title}
              </h3>
              <div className="flex items-center justify-center gap-3 mt-3">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-sans font-medium">
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-sans font-medium">
                  {course.level}
                </span>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-sans font-medium">
                  {course.lectures?.length} Lectures
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
          </div>

          {/* Footer: Instructor + Date + Cert ID */}
          <div className="grid grid-cols-3 gap-6 text-center">
            {/* Instructor */}
            <div>
              <div className="w-32 h-px bg-gray-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-700 text-sm">
                {course.creator?.name || "Instructor"}
              </p>
              <p className="text-gray-400 font-sans text-xs">Course Instructor</p>
            </div>

            {/* Medal center */}
            <div className="flex flex-col items-center justify-end">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg mb-1">
                <FaMedal className="text-white text-2xl" />
              </div>
              <p className="text-gray-400 font-sans text-xs">Achievement</p>
            </div>

            {/* Date */}
            <div>
              <div className="w-32 h-px bg-gray-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-700 text-sm">{completionDate}</p>
              <p className="text-gray-400 font-sans text-xs">Date of Completion</p>
            </div>
          </div>

          {/* Certificate ID */}
          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <p className="font-sans text-xs text-gray-400">
              Certificate ID:{" "}
              <span className="font-mono text-gray-600 font-semibold">{certId}</span>
            </p>
            <p className="font-sans text-xs text-gray-400 mt-1">
              Issued by <span className="text-indigo-500 font-medium">InstructoPlus</span> · {completionDate}
            </p>
          </div>
        </div>

        {/* Bottom border decoration */}
        <div className="h-3 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600" />
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default Certificate;
