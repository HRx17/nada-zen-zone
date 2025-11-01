import React from "react";

const LessonTab = ({ chapters, jargon, quiz }) => {
  return (
    <div className="p-4">
      {chapters && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Smart Chapters</h2>
          <ul className="list-disc list-inside">
            {chapters.map((chapter, index) => (
              <li key={index} className="mb-2">
                <strong>{chapter.title}:</strong> {chapter.content}
              </li>
            ))}
          </ul>
        </div>
      )}
      {jargon && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Jargon Flashcards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jargon.map((item, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-bold">{item.term}</h3>
                <p>{item.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {quiz && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Quiz</h2>
          {quiz.map((question, index) => (
            <div key={index} className="mb-4">
              <p className="font-semibold">{question.question}</p>
              <ul className="list-disc list-inside">
                {question.options.map((option, optIndex) => (
                  <li key={optIndex}>{option}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonTab;
