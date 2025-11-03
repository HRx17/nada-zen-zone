import React, { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";

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
      <div className="bg-card rounded-xl p-12 material-elevation-2 border border-border text-center">
        <p className="text-muted-foreground text-lg">No quiz questions available for this lesson.</p>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / quiz.length) * 100);
    return (
      <div className="bg-card rounded-xl p-12 material-elevation-2 border border-border text-center space-y-6">
        <Trophy className="w-20 h-20 text-accent mx-auto" />
        <h2 className="text-4xl font-bold text-foreground">Quiz Complete!</h2>
        <div className="text-6xl font-bold text-primary">
          {score}/{quiz.length}
        </div>
        <p className="text-2xl text-muted-foreground">
          You scored {percentage}%
        </p>
        
        {/* Results Summary */}
        <div className="max-w-2xl mx-auto mt-8 space-y-4">
          <h3 className="text-xl font-bold text-foreground mb-4">Review Your Answers</h3>
          {answeredQuestions.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg text-left ${
                item.isCorrect ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"
              }`}
            >
              <div className="flex items-start space-x-3">
                {item.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-foreground mb-2">{item.question}</p>
                  <p className="text-sm text-muted-foreground">
                    Your answer: <span className={item.isCorrect ? "text-green-500" : "text-red-500"}>{item.selectedAnswer}</span>
                  </p>
                  {!item.isCorrect && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Correct answer: <span className="text-green-500">{item.correctAnswer}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleRestartQuiz}
          className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-8 py-4 rounded-lg transition-all material-elevation-2 hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Retry Quiz</span>
        </button>
      </div>
    );
  }

  const question = quiz[currentQuestion];

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-card rounded-xl p-6 material-elevation-2 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentQuestion + 1} of {quiz.length}
          </span>
          <span className="text-sm font-medium text-primary">
            Score: {score}/{quiz.length}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-card rounded-xl p-8 material-elevation-2 border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-8">
          {question.question}
        </h2>

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
                className={`w-full p-6 rounded-lg text-left transition-all duration-300 border-2 ${
                  showCorrectAnswer
                    ? "bg-green-500/10 border-green-500 text-foreground"
                    : showWrongAnswer
                    ? "bg-red-500/10 border-red-500 text-foreground"
                    : isSelected
                    ? "bg-primary/10 border-primary text-foreground"
                    : "bg-muted border-border hover:border-primary text-foreground"
                } ${showResult ? "cursor-not-allowed" : "cursor-pointer hover:scale-102"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-base">{option}</span>
                  {showResult && isCorrect && (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-end space-x-4">
          {!showResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-8 py-3 rounded-lg transition-all material-elevation-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-8 py-3 rounded-lg transition-all material-elevation-2 hover:scale-105"
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
