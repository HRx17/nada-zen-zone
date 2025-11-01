import React, { useState } from "react";
import LessonTab from "./LessonTab";
import PracticeTab from "./PracticeTab";

const LessonView = ({ lessonData, setLessonData }) => {
  const [activeTab, setActiveTab] = useState("lesson");

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <button
        onClick={() => setLessonData(null)}
        className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold px-6 py-2 rounded-lg mb-6 transition-all transform hover:scale-105 flex items-center"
      >
        <span className="mr-2">←</span> Back to Home
      </button>
      
      {/* Lesson Title */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          {lessonData.title || "Your Lesson"}
        </h1>
        {lessonData.summary && (
          <p className="text-gray-300 mt-3 leading-relaxed">{lessonData.summary}</p>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("lesson")}
          className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 ${
            activeTab === "lesson"
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
              : "bg-gray-800 text-gray-400 border border-gray-700 hover:border-blue-500"
          }`}
        >
          📖 Lesson Content
        </button>
        <button
          onClick={() => setActiveTab("practice")}
          className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 ${
            activeTab === "practice"
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
              : "bg-gray-800 text-gray-400 border border-gray-700 hover:border-purple-500"
          }`}
        >
          🎤 Practice
        </button>
      </div>
      {activeTab === "lesson" && (
        <LessonTab
          chapters={lessonData.chapters}
          jargon={lessonData.jargon}
          quiz={lessonData.quiz}
        />
      )}
      {activeTab === "practice" && (
        <PracticeTab fullTextContext={lessonData.sourceText} />
      )}
    </div>
  );
};

export default LessonView;
