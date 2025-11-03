import React from "react";
import { BookOpen, Brain, Layers, MessageSquare } from "lucide-react";

const LearningModeSelector = ({ onSelectMode, lessonData }) => {
  const modes = [
    {
      id: "learn",
      title: "Learn",
      description: "Explore chapters, concepts, and key terms",
      icon: BookOpen,
      color: "from-primary to-primary-hover",
      bgColor: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      id: "quiz",
      title: "Quiz",
      description: "Test your knowledge with interactive questions",
      icon: Brain,
      color: "from-secondary to-secondary-hover",
      bgColor: "bg-secondary/10",
      iconColor: "text-secondary"
    },
    {
      id: "flashcards",
      title: "Flashcards",
      description: "Review key terms and definitions",
      icon: Layers,
      color: "from-accent to-accent",
      bgColor: "bg-accent/10",
      iconColor: "text-accent"
    },
    {
      id: "tutor",
      title: "AI Tutor",
      description: "Practice with voice conversation",
      icon: MessageSquare,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <div className="bg-card rounded-xl p-8 material-elevation-2 border border-border">
        <h1 className="text-4xl font-bold text-foreground mb-3">
          {lessonData.title}
        </h1>
        {lessonData.summary && (
          <p className="text-muted-foreground text-lg leading-relaxed">
            {lessonData.summary}
          </p>
        )}
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className="group bg-card rounded-xl p-8 material-elevation-2 border border-border hover:border-primary transition-all duration-300 hover:scale-105 text-left"
            >
              <div className="flex items-start space-x-4">
                <div className={`${mode.bgColor} p-4 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${mode.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {mode.title}
                  </h3>
                  <p className="text-muted-foreground text-base">
                    {mode.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-6 material-elevation-1 border border-border text-center">
          <div className="text-3xl font-bold text-primary">
            {lessonData.chapters?.length || 0}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Chapters</div>
        </div>
        <div className="bg-card rounded-lg p-6 material-elevation-1 border border-border text-center">
          <div className="text-3xl font-bold text-secondary">
            {lessonData.quiz?.length || 0}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Quiz Questions</div>
        </div>
        <div className="bg-card rounded-lg p-6 material-elevation-1 border border-border text-center">
          <div className="text-3xl font-bold text-accent">
            {lessonData.jargon?.length || 0}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Key Terms</div>
        </div>
        <div className="bg-card rounded-lg p-6 material-elevation-1 border border-border text-center">
          <div className="text-3xl font-bold text-purple-500">100%</div>
          <div className="text-sm text-muted-foreground mt-1">Ready</div>
        </div>
      </div>
    </div>
  );
};

export default LearningModeSelector;
