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
    <div className="min-h-screen">
      <Header />
      {isLoading && <LoadingSpinner />}
      {error && (
        <div className="container mx-auto p-6 max-w-2xl">
          <div className="glass border-2 border-destructive/50 rounded-2xl p-6 mb-6 elevation-2 bg-destructive/5">
            <p className="text-destructive font-semibold">⚠️ Error: {error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-3 text-sm text-destructive underline hover:text-destructive/80 font-medium"
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
