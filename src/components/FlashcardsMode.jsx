import React, { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle } from "lucide-react";

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
      <div className="bg-card rounded-xl p-12 material-elevation-2 border border-border text-center">
        <p className="text-muted-foreground text-lg">No flashcards available for this lesson.</p>
      </div>
    );
  }

  const progress = Math.round((studiedCards.size / cards.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <div className="bg-card rounded-xl p-6 material-elevation-2 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Card {currentCard + 1} of {cards.length}
          </span>
          <span className="text-sm font-medium text-accent">
            Progress: {studiedCards.size}/{cards.length}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative h-[400px] perspective-1000">
        <div
          onClick={handleFlip}
          className={`absolute inset-0 cursor-pointer transition-all duration-500 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front of Card */}
          <div className={`absolute inset-0 backface-hidden ${isFlipped ? "opacity-0" : "opacity-100"}`}>
            <div className="bg-card rounded-xl p-12 h-full material-elevation-3 border border-border flex flex-col items-center justify-center text-center">
              <div className="text-sm font-medium text-accent mb-4">TERM</div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                {cards[currentCard].term}
              </h2>
              <p className="text-muted-foreground">Click to reveal definition</p>
            </div>
          </div>

          {/* Back of Card */}
          <div className={`absolute inset-0 backface-hidden rotate-y-180 ${isFlipped ? "opacity-100" : "opacity-0"}`}>
            <div className="bg-card rounded-xl p-12 h-full material-elevation-3 border border-primary flex flex-col items-center justify-center text-center">
              <div className="text-sm font-medium text-primary mb-4">DEFINITION</div>
              <p className="text-xl text-foreground leading-relaxed">
                {cards[currentCard].definition}
              </p>
              <p className="text-muted-foreground mt-6">Click to see term</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-card rounded-xl p-6 material-elevation-2 border border-border">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentCard === 0}
            className="flex items-center space-x-2 bg-muted hover:bg-muted/80 text-foreground font-medium px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleReset}
              className="bg-muted hover:bg-muted/80 text-foreground p-3 rounded-lg transition-all hover:scale-105"
              title="Reset progress"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={handleShuffle}
              className="bg-muted hover:bg-muted/80 text-foreground p-3 rounded-lg transition-all hover:scale-105"
              title="Shuffle cards"
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleNext}
            disabled={currentCard === cards.length - 1}
            className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-primary-foreground font-medium px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Studied Cards Indicator */}
      <div className="grid grid-cols-10 gap-2">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentCard(index);
              setIsFlipped(false);
            }}
            className={`h-2 rounded-full transition-all ${
              index === currentCard
                ? "bg-primary scale-125"
                : studiedCards.has(index)
                ? "bg-accent"
                : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default FlashcardsMode;
