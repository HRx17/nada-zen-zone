import React, { useState } from "react";
import { ChevronDown, BookOpen, FileText, Info, Check } from "lucide-react";

const LearnMode = ({ lessonData }) => {
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [showJargon, setShowJargon] = useState(false);

  return (
    <div className="space-y-6">
      {/* Chapters Section */}
      <div className="glass rounded-3xl p-8 elevation-2 border border-border/50">
        <div className="flex items-center mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary-glow mr-4">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Chapters</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessonData.chapters?.map((chapter, index) => (
            <button
              key={index}
              onClick={() => setSelectedChapter(index)}
              className={`group relative p-6 rounded-2xl text-left transition-all duration-300 elevation-1 hover:elevation-3 hover:scale-[1.02] ${
                selectedChapter === index
                  ? "bg-gradient-to-br from-primary to-primary-glow text-white glow"
                  : "glass border border-border/50 hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`text-xs font-bold mb-3 uppercase tracking-wider ${
                    selectedChapter === index ? "text-white/80" : "text-muted-foreground"
                  }`}>
                    Chapter {index + 1}
                  </div>
                  <h3 className={`font-bold text-lg mb-2 ${
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
                </div>
                {selectedChapter === index && (
                  <Check className="w-6 h-6 text-white flex-shrink-0 ml-4" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Key Terms Section */}
      <div className="glass rounded-3xl p-8 elevation-2 border border-border/50">
        <button
          onClick={() => setShowJargon(!showJargon)}
          className="flex items-center justify-between w-full group"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-secondary mr-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Key Terms</h2>
          </div>
          <ChevronDown className={`w-6 h-6 text-muted-foreground transition-transform duration-300 ${
            showJargon ? "rotate-180" : ""
          }`} />
        </button>
        
        {showJargon && (
          <div className="grid md:grid-cols-2 gap-4 mt-8 animate-in fade-in duration-500">
            {lessonData.jargon?.map((item, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl glass border border-border/50 hover:border-secondary/50 transition-all duration-300 elevation-1 hover:elevation-2"
              >
                <h3 className="font-bold text-xl text-foreground mb-3 group-hover:text-secondary transition-colors">
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
        <div className="glass rounded-3xl p-8 elevation-2 border border-border/50">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-accent mr-4">
              <Info className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Summary</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {lessonData.summary}
          </p>
        </div>
      )}
    </div>
  );
};

export default LearnMode;
