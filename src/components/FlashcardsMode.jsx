import React, { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, Sparkles } from "lucide-react";

const FlashcardsMode = ({ lessonData }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState(lessonData.jargon || []);
  const [studiedCards, setStudiedCards] = useState(new Set());

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setStudiedCards(new Set([...studiedCards, currentCard]));
    }
  };

  const handleNext = () => {
    if (currentCard < cards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentCard(0);
    setIsFlipped(false);
    setStudiedCards(new Set());
  };

  const handleReset = () => {
    setCurrentCard(0);
    setIsFlipped(false);
    setStudiedCards(new Set());
  };

  if (cards.length === 0) {
    return (
      <div className="glass rounded-3xl p-16 elevation-2 border border-border/50 text-center">
        <p className="text-lg text-muted-foreground">No flashcards available for this lesson.</p>
      </div>
    );
  }

  const progress = Math.round((studiedCards.size / cards.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <div className="glass rounded-2xl p-6 elevation-2 border border-border/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Card {currentCard + 1} of {cards.length}
          </span>
          <span className="text-sm font-bold text-accent">
            Progress: {studiedCards.size}/{cards.length} ({progress}%)
          </span>
        </div>
        <div className="relative w-full bg-background/50 rounded-full h-3 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-accent rounded-full transition-all duration-500 elevation-1"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative h-[450px] perspective-1000">
        <div
          onClick={handleFlip}
          className={`absolute inset-0 cursor-pointer transition-all duration-700 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front of Card */}
          <div className={`absolute inset-0 backface-hidden transition-opacity duration-300 ${isFlipped ? "opacity-0" : "opacity-100"}`}>
            <div className="glass rounded-3xl p-12 h-full elevation-3 border border-border/50 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:elevation-4 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-accent/10 mb-6">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-sm font-bold text-accent uppercase tracking-wider">TERM</span>
                </div>
                <h2 className="text-5xl font-black text-foreground mb-8 leading-tight">
                  {cards[currentCard].term}
                </h2>
                <p className="text-muted-foreground text-lg">Click to reveal definition</p>
              </div>
            </div>
          </div>

          {/* Back of Card */}
          <div className={`absolute inset-0 backface-hidden rotate-y-180 transition-opacity duration-300 ${isFlipped ? "opacity-100" : "opacity-0"}`}>
            <div className="glass rounded-3xl p-12 h-full elevation-3 border-2 border-primary/50 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:elevation-4 transition-all glow">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary-glow/10"></div>
              <div className="relative">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-primary uppercase tracking-wider">DEFINITION</span>
                </div>
                <p className="text-2xl text-foreground leading-relaxed font-medium max-w-2xl mb-8">
                  {cards[currentCard].definition}
                </p>
                <p className="text-muted-foreground text-lg">Click to see term</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="glass rounded-2xl p-6 elevation-2 border border-border/50">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentCard === 0}
            className="flex items-center space-x-2 glass border border-border/50 hover:border-primary/50 text-foreground font-bold px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 elevation-1"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleReset}
              className="glass border border-border/50 hover:border-primary/50 text-foreground p-3 rounded-xl transition-all duration-300 hover:scale-110 elevation-1"
              title="Reset progress"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={handleShuffle}
              className="glass border border-border/50 hover:border-accent/50 text-foreground p-3 rounded-xl transition-all duration-300 hover:scale-110 elevation-1"
              title="Shuffle cards"
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleNext}
            disabled={currentCard === cards.length - 1}
            className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-glow text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 elevation-1 hover:glow"
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-10 gap-2">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentCard(index);
              setIsFlipped(false);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentCard
                ? "bg-gradient-to-r from-primary to-primary-glow scale-125 glow"
                : studiedCards.has(index)
                ? "bg-accent"
                : "bg-muted"
            }`}
            title={`Card ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FlashcardsMode;
