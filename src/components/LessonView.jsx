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
        className="group glass px-6 py-3 rounded-2xl mb-8 transition-all duration-300 hover:scale-105 flex items-center space-x-3 border border-border/50 hover:border-primary elevation-1 hover:elevation-2"
      >
        <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="font-semibold text-foreground">{selectedMode ? "Back to Modes" : "Back to Home"}</span>
      </button>

      <div className="animate-in fade-in duration-500">
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
    </div>
  );
};

export default LessonView;
