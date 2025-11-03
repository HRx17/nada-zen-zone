import React, { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, FlipHorizontal } from "lucide-react";

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
      <div className="bg-card border border-border rounded-2xl p-12 elevation-2 text-center">
        <p className="text-lg text-muted-foreground">No flashcards available for this lesson.</p>
      </div>
    );
  }

  const progress = Math.round((studiedCards.size / cards.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <div className="bg-card border border-border rounded-xl p-6 elevation-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-muted-foreground">
            Card {currentCard + 1} of {cards.length}
          </span>
          <span className="text-sm font-bold text-accent">
            Studied: {studiedCards.size}/{cards.length} ({progress}%)
          </span>
        </div>
        <div className="relative w-full bg-muted rounded-full h-3 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative h-[420px] perspective-1000">
        <div
          onClick={handleFlip}
          className={`absolute inset-0 cursor-pointer transition-all duration-700 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && handleFlip()}
          aria-label={isFlipped ? "Show term" : "Show definition"}
        >
          {/* Front of Card (Term) */}
          <div className={`absolute inset-0 backface-hidden transition-opacity duration-300 ${isFlipped ? "opacity-0" : "opacity-100"}`}>
            <div className="bg-card border border-border rounded-2xl p-12 h-full elevation-3 flex flex-col items-center justify-center text-center hover:border-primary transition-all duration-200">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-accent/10 mb-6">
                <FlipHorizontal className="w-4 h-4 text-accent" />
                <span className="text-sm font-bold text-accent uppercase tracking-wide">TERM</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-8 leading-tight">
                {cards[currentCard].term}
              </h2>
              <p className="text-muted-foreground text-base">Click to reveal definition</p>
            </div>
          </div>

          {/* Back of Card (Definition) */}
          <div className={`absolute inset-0 backface-hidden rotate-y-180 transition-opacity duration-300 ${isFlipped ? "opacity-100" : "opacity-0"}`}>
            <div className="bg-primary/5 border-2 border-primary rounded-2xl p-12 h-full elevation-3 flex flex-col items-center justify-center text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
                <FlipHorizontal className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-wide">DEFINITION</span>
              </div>
              <p className="text-xl sm:text-2xl text-foreground leading-relaxed font-medium max-w-2xl mb-8">
                {cards[currentCard].definition}
              </p>
              <p className="text-muted-foreground text-base">Click to see term</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-card border border-border rounded-xl p-6 elevation-2">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentCard === 0}
            className="flex items-center space-x-2 bg-muted hover:bg-card border border-border hover:border-primary text-foreground font-bold px-5 py-3 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 disabled:hover:scale-100"
            aria-label="Previous card"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleReset}
              className="bg-muted hover:bg-card border border-border hover:border-primary text-foreground p-3 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
              title="Reset progress"
              aria-label="Reset progress"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={handleShuffle}
              className="bg-muted hover:bg-card border border-border hover:border-accent text-foreground p-3 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
              title="Shuffle cards"
              aria-label="Shuffle cards"
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleNext}
            disabled={currentCard === cards.length - 1}
            className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white font-bold px-5 py-3 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 disabled:hover:scale-100 elevation-1"
            aria-label="Next card"
          >
            <span className="hidden sm:inline">Next</span>
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
            className={`h-2 rounded-full transition-all duration-200 ${
              index === currentCard
                ? "bg-primary scale-125"
                : studiedCards.has(index)
                ? "bg-accent"
                : "bg-muted"
            }`}
            title={`Go to card ${index + 1}`}
            aria-label={`Go to card ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FlashcardsMode;
