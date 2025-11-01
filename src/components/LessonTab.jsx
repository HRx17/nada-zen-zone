import React, { useState } from "react";

const LessonTab = ({ chapters, jargon, quiz }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Chapters Section */}
      {chapters && chapters.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <span className="text-3xl mr-3">📚</span>
            Smart Chapters
          </h2>
          <ol className="space-y-4">
            {chapters.map((chapter, index) => (
              <li key={index} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                <div className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg text-blue-400">{chapter.title}</h3>
                    {chapter.timestamp && chapter.timestamp !== 'N/A' && (
                      <p className="text-sm text-gray-400 mt-1">⏱️ {chapter.timestamp}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Jargon Flashcards Section */}
      {jargon && jargon.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <span className="text-3xl mr-3">🔤</span>
            Jargon Flashcards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jargon.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-900/50 to-gray-700 rounded-lg p-5 border border-purple-500/30 hover:border-purple-500 transition-all hover:scale-105 cursor-pointer"
              >
                <h3 className="font-bold text-lg text-purple-400 mb-2">{item.term}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Section */}
      {quiz && quiz.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <span className="text-3xl mr-3">❓</span>
            Quick Quiz
          </h2>
          <div className="space-y-6">
            {quiz.map((question, qIndex) => (
              <div key={qIndex} className="bg-gray-700 p-5 rounded-lg border border-gray-600">
                <p className="font-semibold text-lg mb-4 text-white">
                  {qIndex + 1}. {question.question}
                </p>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => {
                    const isSelected = selectedAnswers[qIndex] === option;
                    const isCorrect = option === question.answer;
                    const showCorrect = showResults && isCorrect;
                    const showIncorrect = showResults && isSelected && !isCorrect;

                    return (
                      <button
                        key={oIndex}
                        onClick={() => !showResults && handleAnswerSelect(qIndex, option)}
                        disabled={showResults}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          showCorrect
                            ? "bg-green-600 border-green-400 text-white"
                            : showIncorrect
                            ? "bg-red-600 border-red-400 text-white"
                            : isSelected
                            ? "bg-blue-600 border-blue-400 text-white"
                            : "bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
                        } ${showResults ? "cursor-default" : "cursor-pointer"}`}
                      >
                        <span className="font-medium">{String.fromCharCode(65 + oIndex)}.</span> {option}
                        {showCorrect && " ✓"}
                        {showIncorrect && " ✗"}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-4 justify-center">
            {!showResults ? (
              <button
                onClick={checkAnswers}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-all transform hover:scale-105"
              >
                Check Answers
              </button>
            ) : (
              <button
                onClick={resetQuiz}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-all transform hover:scale-105"
              >
                Try Again
              </button>
            )}
          </div>
          {showResults && (
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold">
                Score: {Object.values(selectedAnswers).filter((ans, idx) => ans === quiz[idx]?.answer).length} / {quiz.length}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonTab;
