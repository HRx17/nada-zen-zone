import React from "react";
import { BookOpen, Brain, Layers, MessageSquare, ArrowRight } from "lucide-react";

const LearningModeSelector = ({ onSelectMode, lessonData }) => {
  const modes = [
    {
      id: "learn",
      title: "Learn",
      description: "Explore structured chapters and key concepts",
      icon: BookOpen,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      borderHover: "hover:border-primary"
    },
    {
      id: "quiz",
      title: "Quiz",
      description: "Test your knowledge interactively",
      icon: Brain,
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      borderHover: "hover:border-secondary"
    },
    {
      id: "flashcards",
      title: "Flashcards",
      description: "Review terms with flip cards",
      icon: Layers,
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
      borderHover: "hover:border-accent"
    },
    {
      id: "tutor",
      title: "AI Tutor",
      description: "Practice with voice conversation",
      icon: MessageSquare,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      borderHover: "hover:border-primary"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <div className="bg-card border border-border rounded-xl p-6 elevation-1">
        <div className="mb-2">
          <span className="inline-block px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
            Your Lesson
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-2 leading-tight">
          {lessonData.title}
        </h1>
        {lessonData.summary && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {lessonData.summary}
          </p>
        )}
      </div>

      {/* Mode Selection Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`group bg-card border-2 border-border ${mode.borderHover} rounded-xl p-5 elevation-1 hover:elevation-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] text-left`}
              aria-label={`Start ${mode.title} mode`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`${mode.iconBg} p-3 rounded-lg group-hover:scale-105 transition-transform duration-200`}>
                  <Icon className={`w-6 h-6 ${mode.iconColor}`} />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1.5">
                {mode.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {mode.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Chapters", value: lessonData.chapters?.length || 0, color: "text-primary", bg: "bg-primary/10" },
          { label: "Questions", value: lessonData.quiz?.length || 0, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Key Terms", value: lessonData.jargon?.length || 0, color: "text-accent", bg: "bg-accent/10" },
          { label: "Ready", value: "100%", color: "text-success", bg: "bg-success/10" }
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 text-center elevation-1 hover:elevation-2 transition-all duration-200">
            <div className={`text-2xl font-black ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-xs font-semibold text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningModeSelector;
