import { useState } from 'react';
import Header from './components/Header.jsx';
import InputHub from './components/InputHub.jsx';
import LessonView from './components/LessonView.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

function App() {
  const [lessonData, setLessonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Header />
      {isLoading && <LoadingSpinner />}
      {error && (
        <div className="container mx-auto p-4 max-w-2xl">
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-200">⚠️ Error: {error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-300 underline hover:text-red-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {!lessonData && !isLoading && (
        <InputHub setLessonData={setLessonData} setIsLoading={setIsLoading} setError={setError} />
      )}
      {lessonData && !isLoading && (
        <LessonView lessonData={lessonData} setLessonData={setLessonData} />
      )}
    </div>
  );
}

export default App;
