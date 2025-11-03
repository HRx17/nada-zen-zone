import React, { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy, Award } from "lucide-react";

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
      <div className="bg-card border-2 border-border rounded-2xl p-12 elevation-2 text-center">
        <p className="text-lg text-muted-foreground">No quiz questions available for this lesson.</p>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / quiz.length) * 100);
    const isPerfect = percentage === 100;
    const isGood = percentage >= 70;

    return (
      <div className="bg-card border-2 border-border rounded-2xl p-10 sm:p-14 elevation-3 text-center space-y-8 max-w-3xl mx-auto">
        <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full ${
          isPerfect ? "bg-success/10" : isGood ? "bg-primary/10" : "bg-secondary/10"
        } elevation-2`}>
          {isPerfect ? (
            <Trophy className="w-16 h-16 text-success" />
          ) : (
            <Award className="w-16 h-16 text-primary" />
          )}
        </div>
        
        <div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">Quiz Complete!</h2>
          <div className="text-6xl sm:text-7xl font-black text-primary my-6">
            {score}/{quiz.length}
          </div>
          <p className="text-xl sm:text-2xl text-muted-foreground font-semibold">
            You scored {percentage}%
          </p>
          {isPerfect && (
            <p className="text-success font-bold mt-3 text-lg">Perfect Score! 🎉</p>
          )}
        </div>
        
        {/* Results Summary */}
        <div className="max-w-2xl mx-auto mt-12 space-y-4">
          <h3 className="text-2xl font-bold text-foreground mb-6">Review Your Answers</h3>
          {answeredQuestions.map((item, index) => (
            <div
              key={index}
              className={`p-5 rounded-xl text-left border-2 elevation-1 ${
                item.isCorrect 
                  ? "border-success/30 bg-success/5" 
                  : "border-destructive/30 bg-destructive/5"
              }`}
            >
              <div className="flex items-start space-x-4">
                {item.isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground mb-3 text-base">{item.question}</p>
                  <p className="text-sm text-muted-foreground mb-1">
                    Your answer: <span className={`font-semibold ${item.isCorrect ? "text-success" : "text-destructive"}`}>
                      {item.selectedAnswer}
                    </span>
                  </p>
                  {!item.isCorrect && (
                    <p className="text-sm text-muted-foreground">
                      Correct answer: <span className="text-success font-semibold">{item.correctAnswer}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleRestartQuiz}
          className="bg-primary hover:bg-primary-hover text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 elevation-1 flex items-center justify-center space-x-2 mx-auto"
          aria-label="Retry quiz"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Retry Quiz</span>
        </button>
      </div>
    );
  }

  const question = quiz[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.length) * 100;

  return (
    <div className="space-y-5">
      {/* Progress Bar */}
      <div className="bg-card border border-border rounded-xl p-5 elevation-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-muted-foreground">
            Question {currentQuestion + 1} of {quiz.length}
          </span>
          <span className="text-xs font-bold text-primary">
            Score: {score}/{quiz.length}
          </span>
        </div>
        <div className="relative w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-card border border-border rounded-xl p-6 elevation-1">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6 leading-tight">
          {question.question}
        </h2>

        <div className="space-y-3" role="radiogroup" aria-label="Answer options">
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
                className={`w-full p-4 rounded-lg text-left transition-all duration-200 border ${
                  showCorrectAnswer
                    ? "bg-success/10 border-success text-foreground"
                    : showWrongAnswer
                    ? "bg-destructive/10 border-destructive text-foreground"
                    : isSelected
                    ? "bg-primary/10 border-primary text-foreground elevation-1"
                    : "bg-muted border-transparent hover:border-primary hover:bg-card"
                } ${showResult ? "cursor-not-allowed" : "cursor-pointer"}`}
                role="radio"
                aria-checked={isSelected}
                aria-label={option}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm pr-3">{option}</span>
                  {showResult && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end">
          {!showResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="bg-primary hover:bg-primary-hover text-white font-bold px-6 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
              aria-label="Submit answer"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="bg-primary hover:bg-primary-hover text-white font-bold px-6 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
              aria-label={currentQuestion < quiz.length - 1 ? "Next question" : "Finish quiz"}
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
