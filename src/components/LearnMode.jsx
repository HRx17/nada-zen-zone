import React, { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen, FileText, Info, Check } from "lucide-react";

const LearnMode = ({ lessonData }) => {
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [showJargon, setShowJargon] = useState(false);

  return (
    <div className="space-y-5">
      {/* Chapters Section */}
      <div className="bg-card border border-border rounded-xl p-5 elevation-1">
        <div className="flex items-center mb-4">
          <div className="bg-primary/10 p-2.5 rounded-lg mr-2.5">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Chapters</h2>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {lessonData.chapters?.map((chapter, index) => (
            <button
              key={index}
              onClick={() => setSelectedChapter(index)}
              className={`group p-4 rounded-lg text-left transition-all duration-200 border ${
                selectedChapter === index
                  ? "bg-primary text-white border-primary elevation-1"
                  : "bg-muted border-transparent hover:border-primary hover:bg-card"
              }`}
              aria-label={`Chapter ${index + 1}: ${chapter.title}`}
              aria-pressed={selectedChapter === index}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`text-[10px] font-bold uppercase tracking-wider ${
                  selectedChapter === index ? "text-white/80" : "text-muted-foreground"
                }`}>
                  Chapter {index + 1}
                </div>
                {selectedChapter === index && (
                  <Check className="w-4 h-4 text-white flex-shrink-0" />
                )}
              </div>
              <h3 className={`font-bold text-sm mb-1 ${
                selectedChapter === index ? "text-white" : "text-foreground"
              }`}>
                {chapter.title}
              </h3>
              {chapter.timestamp && (
                <p className={`text-xs ${
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
      <div className="bg-card border border-border rounded-xl p-5 elevation-1">
        <button
          onClick={() => setShowJargon(!showJargon)}
          className="flex items-center justify-between w-full group"
          aria-expanded={showJargon}
          aria-label="Toggle key terms section"
        >
          <div className="flex items-center">
            <div className="bg-secondary/10 p-2.5 rounded-lg mr-2.5">
              <FileText className="w-5 h-5 text-secondary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Key Terms</h2>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
            showJargon ? "rotate-180" : ""
          }`} />
        </button>
        
        {showJargon && (
          <div className="grid sm:grid-cols-2 gap-3 mt-4 animate-in fade-in duration-300">
            {lessonData.jargon?.map((item, index) => (
              <div
                key={index}
                className="group p-4 rounded-lg bg-muted border border-transparent hover:border-secondary hover:bg-card transition-all duration-200"
              >
                <h3 className="font-bold text-base text-foreground mb-1.5 group-hover:text-secondary transition-colors">
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
        <div className="bg-card border border-border rounded-xl p-5 elevation-1">
          <div className="flex items-center mb-3">
            <div className="bg-accent/10 p-2.5 rounded-lg mr-2.5">
              <Info className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Summary</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {lessonData.summary}
          </p>
        </div>
      )}
    </div>
  );
};

export default LearnMode;
