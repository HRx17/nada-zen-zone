import React, { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen, FileText, Info, Check } from "lucide-react";

const LearnMode = ({ lessonData }) => {
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [showJargon, setShowJargon] = useState(false);

  return (
    <div className="space-y-6">
      {/* Chapters Section */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 elevation-2">
        <div className="flex items-center mb-6">
          <div className="bg-primary/10 p-3 rounded-xl mr-3">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Chapters</h2>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessonData.chapters?.map((chapter, index) => (
            <button
              key={index}
              onClick={() => setSelectedChapter(index)}
              className={`group p-5 rounded-xl text-left transition-all duration-200 border-2 ${
                selectedChapter === index
                  ? "bg-primary text-white border-primary elevation-2"
                  : "bg-muted border-transparent hover:border-primary hover:bg-card"
              }`}
              aria-label={`Chapter ${index + 1}: ${chapter.title}`}
              aria-pressed={selectedChapter === index}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`text-xs font-bold uppercase tracking-wider ${
                  selectedChapter === index ? "text-white/80" : "text-muted-foreground"
                }`}>
                  Chapter {index + 1}
                </div>
                {selectedChapter === index && (
                  <Check className="w-5 h-5 text-white flex-shrink-0" />
                )}
              </div>
              <h3 className={`font-bold text-base mb-2 ${
                selectedChapter === index ? "text-white" : "text-foreground"
              }`}>
                {chapter.title}
              </h3>
              {chapter.timestamp && (
                <p className={`text-sm ${
                  selectedChapter === index ? "text-white/70" : "text-muted-foreground"
                }`}>
                  {chapter.timestamp}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Key Terms Section */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 elevation-2">
        <button
          onClick={() => setShowJargon(!showJargon)}
          className="flex items-center justify-between w-full group"
          aria-expanded={showJargon}
          aria-label="Toggle key terms section"
        >
          <div className="flex items-center">
            <div className="bg-secondary/10 p-3 rounded-xl mr-3">
              <FileText className="w-6 h-6 text-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Key Terms</h2>
          </div>
          <ChevronDown className={`w-6 h-6 text-muted-foreground transition-transform duration-200 ${
            showJargon ? "rotate-180" : ""
          }`} />
        </button>
        
        {showJargon && (
          <div className="grid sm:grid-cols-2 gap-4 mt-6 animate-in fade-in duration-300">
            {lessonData.jargon?.map((item, index) => (
              <div
                key={index}
                className="group p-5 rounded-xl bg-muted border border-transparent hover:border-secondary hover:bg-card transition-all duration-200"
              >
                <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-secondary transition-colors">
                  {item.term}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Section */}
      {lessonData.summary && (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 elevation-2">
          <div className="flex items-center mb-4">
            <div className="bg-accent/10 p-3 rounded-xl mr-3">
              <Info className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Summary</h2>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed">
            {lessonData.summary}
          </p>
        </div>
      )}
    </div>
  );
};

export default LearnMode;
