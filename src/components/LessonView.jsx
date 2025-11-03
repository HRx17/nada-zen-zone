import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import LearningModeSelector from "./LearningModeSelector";
import LearnMode from "./LearnMode";
import QuizMode from "./QuizMode";
import FlashcardsMode from "./FlashcardsMode";
import TutorMode from "./TutorMode";

const LessonView = ({ lessonData, setLessonData }) => {
  const [selectedMode, setSelectedMode] = useState(null);

  const handleBack = () => {
    if (selectedMode) {
      setSelectedMode(null);
    } else {
      setLessonData(null);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <button
        onClick={handleBack}
        className="bg-card hover:bg-muted text-foreground font-medium px-6 py-3 rounded-lg mb-6 transition-all material-elevation-2 hover:scale-105 flex items-center space-x-2 border border-border"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{selectedMode ? "Back to Modes" : "Back to Home"}</span>
      </button>

      {!selectedMode ? (
        <LearningModeSelector onSelectMode={setSelectedMode} lessonData={lessonData} />
      ) : (
        <div>
          {selectedMode === "learn" && <LearnMode lessonData={lessonData} />}
          {selectedMode === "quiz" && <QuizMode lessonData={lessonData} />}
          {selectedMode === "flashcards" && <FlashcardsMode lessonData={lessonData} />}
          {selectedMode === "tutor" && <TutorMode lessonData={lessonData} />}
        </div>
      )}
    </div>
  );
};

export default LessonView;
