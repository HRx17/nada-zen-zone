import React, { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy, Sparkles } from "lucide-react";

const QuizMode = ({ lessonData }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const quiz = lessonData.quiz || [];

  const handleAnswerSelect = (option) => {
    if (showResult) return;
    setSelectedAnswer(option);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === quiz[currentQuestion].answer;
    setShowResult(true);

    const newAnsweredQuestions = [...answeredQuestions, {
      question: quiz[currentQuestion].question,
      selectedAnswer,
      correctAnswer: quiz[currentQuestion].answer,
      isCorrect
    }];
    setAnsweredQuestions(newAnsweredQuestions);

    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnsweredQuestions([]);
    setQuizCompleted(false);
  };

  if (quiz.length === 0) {
    return (
      <div className="glass rounded-3xl p-16 elevation-2 border border-border/50 text-center">
        <p className="text-lg text-muted-foreground">No quiz questions available for this lesson.</p>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / quiz.length) * 100);
    return (
      <div className="glass rounded-3xl p-12 elevation-2 border border-border/50 text-center space-y-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl animate-pulse-glow"></div>
          <Trophy className="relative w-24 h-24 text-accent mx-auto animate-float" />
        </div>
        
        <div>
          <h2 className="text-5xl font-black text-foreground mb-4">Quiz Complete!</h2>
          <div className="text-7xl font-black gradient-text my-6">
            {score}/{quiz.length}
          </div>
          <p className="text-2xl text-muted-foreground">
            You scored {percentage}%
          </p>
        </div>
        
        {/* Results Summary */}
        <div className="max-w-2xl mx-auto mt-12 space-y-4">
          <h3 className="text-2xl font-bold text-foreground mb-6">Review Your Answers</h3>
          {answeredQuestions.map((item, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl text-left glass border-2 elevation-1 ${
                item.isCorrect ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
              }`}
            >
              <div className="flex items-start space-x-4">
                {item.isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-foreground mb-3 text-lg">{item.question}</p>
                  <p className="text-sm text-muted-foreground mb-1">
                    Your answer: <span className={item.isCorrect ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>{item.selectedAnswer}</span>
                  </p>
                  {!item.isCorrect && (
                    <p className="text-sm text-muted-foreground">
                      Correct answer: <span className="text-green-500 font-semibold">{item.correctAnswer}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleRestartQuiz}
          className="bg-gradient-to-r from-primary to-primary-glow text-white font-bold px-10 py-5 rounded-2xl transition-all duration-300 hover:scale-105 elevation-2 hover:glow flex items-center justify-center space-x-3 mx-auto"
        >
          <RotateCcw className="w-6 h-6" />
          <span>Retry Quiz</span>
        </button>
      </div>
    );
  }

  const question = quiz[currentQuestion];

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="glass rounded-2xl p-6 elevation-2 border border-border/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Question {currentQuestion + 1} of {quiz.length}
          </span>
          <span className="text-sm font-bold text-primary">
            Score: {score}/{quiz.length}
          </span>
        </div>
        <div className="relative w-full bg-background/50 rounded-full h-3 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-glow rounded-full transition-all duration-500 elevation-1"
            style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="glass rounded-3xl p-10 elevation-2 border border-border/50">
        <div className="flex items-start space-x-4 mb-10">
          <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-secondary">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground leading-tight">
            {question.question}
          </h2>
        </div>

        <div className="space-y-4">
          {question.options?.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === question.answer;
            const showCorrectAnswer = showResult && isCorrect;
            const showWrongAnswer = showResult && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showResult}
                className={`w-full p-6 rounded-2xl text-left transition-all duration-300 border-2 elevation-1 hover:elevation-2 ${
                  showCorrectAnswer
                    ? "bg-green-500/10 border-green-500 text-foreground"
                    : showWrongAnswer
                    ? "bg-red-500/10 border-red-500 text-foreground"
                    : isSelected
                    ? "bg-primary/10 border-primary text-foreground scale-[1.02]"
                    : "glass border-border/50 hover:border-primary/50 text-foreground"
                } ${showResult ? "cursor-not-allowed" : "cursor-pointer hover:scale-[1.01]"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">{option}</span>
                  {showResult && isCorrect && (
                    <CheckCircle2 className="w-7 h-7 text-green-500 flex-shrink-0" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="w-7 h-7 text-red-500 flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex items-center justify-end">
          {!showResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="bg-gradient-to-r from-primary to-primary-glow text-white font-bold px-10 py-4 rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 elevation-2 hover:glow"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="bg-gradient-to-r from-primary to-primary-glow text-white font-bold px-10 py-4 rounded-2xl transition-all duration-300 hover:scale-105 elevation-2 hover:glow"
            >
              {currentQuestion < quiz.length - 1 ? "Next Question" : "Finish Quiz"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizMode;
