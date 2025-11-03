import React, { useState } from "react";
import { ChevronRight, BookOpen, FileText, Info } from "lucide-react";

const LearnMode = ({ lessonData }) => {
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [showJargon, setShowJargon] = useState(false);

  return (
    <div className="space-y-6">
      {/* Chapters Section */}
      <div className="bg-card rounded-xl p-8 material-elevation-2 border border-border">
        <div className="flex items-center mb-6">
          <BookOpen className="w-6 h-6 text-primary mr-3" />
          <h2 className="text-2xl font-bold text-foreground">Chapters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessonData.chapters?.map((chapter, index) => (
            <button
              key={index}
              onClick={() => setSelectedChapter(index)}
              className={`p-6 rounded-lg text-left transition-all duration-300 ${
                selectedChapter === index
                  ? "bg-primary text-primary-foreground material-elevation-2"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className={`text-sm font-medium mb-2 ${
                    selectedChapter === index ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}>
                    Chapter {index + 1}
                  </div>
                  <h3 className="font-semibold text-base">{chapter.title}</h3>
                  {chapter.timestamp && (
                    <p className={`text-sm mt-2 ${
                      selectedChapter === index ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}>
                      {chapter.timestamp}
                    </p>
                  )}
                </div>
                <ChevronRight className={`w-5 h-5 flex-shrink-0 ${
                  selectedChapter === index ? "opacity-100" : "opacity-40"
                }`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Key Terms (Jargon) Section */}
      <div className="bg-card rounded-xl p-8 material-elevation-2 border border-border">
        <button
          onClick={() => setShowJargon(!showJargon)}
          className="flex items-center justify-between w-full mb-6"
        >
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-secondary mr-3" />
            <h2 className="text-2xl font-bold text-foreground">Key Terms</h2>
          </div>
          <ChevronRight className={`w-6 h-6 text-muted-foreground transition-transform ${
            showJargon ? "rotate-90" : ""
          }`} />
        </button>
        
        {showJargon && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
            {lessonData.jargon?.map((item, index) => (
              <div
                key={index}
                className="p-6 rounded-lg bg-muted border border-border hover:border-secondary transition-all"
              >
                <h3 className="font-bold text-lg text-foreground mb-2">
                  {item.term}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Section */}
      {lessonData.summary && (
        <div className="bg-card rounded-xl p-8 material-elevation-2 border border-border">
          <div className="flex items-center mb-4">
            <Info className="w-6 h-6 text-accent mr-3" />
            <h2 className="text-2xl font-bold text-foreground">Summary</h2>
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {lessonData.summary}
          </p>
        </div>
      )}
    </div>
  );
};

export default LearnMode;
