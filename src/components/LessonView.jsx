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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <button
        onClick={handleBack}
        className="group inline-flex items-center space-x-1.5 px-3 py-2 bg-card border border-border rounded-lg mb-6 hover:border-primary hover:bg-primary/5 transition-all duration-200 text-sm font-semibold"
        aria-label={selectedMode ? "Back to learning modes" : "Back to home"}
      >
        <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="text-foreground">{selectedMode ? "Back to Modes" : "Back to Home"}</span>
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
