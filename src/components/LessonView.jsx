import React, { useState } from "react";
import LessonTab from "./LessonTab";
import PracticeTab from "./PracticeTab";

const LessonView = ({ lessonData, setLessonData }) => {
  const [activeTab, setActiveTab] = useState("lesson");

  return (
    <div className="container mx-auto p-4">
      <button
        onClick={() => setLessonData(null)}
        className="bg-gray-500 text-white px-4 py-2 rounded mb-4"
      >
        Back
      </button>
      <div className="flex mb-4">
        <button
          onClick={() => setActiveTab("lesson")}
          className={`px-4 py-2 rounded mr-2 ${
            activeTab === "lesson" ? "bg-blue-500" : "bg-gray-700"
          }`}
        >
          Lesson
        </button>
        <button
          onClick={() => setActiveTab("practice")}
          className={`px-4 py-2 rounded ${
            activeTab === "practice" ? "bg-blue-500" : "bg-gray-700"
          }`}
        >
          Practice
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
        <PracticeTab fullTextContext={lessonData.fullText} />
      )}
    </div>
  );
};

export default LessonView;
