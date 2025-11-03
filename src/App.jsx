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
    <div className="min-h-screen bg-background dark">
      <Header />
      {isLoading && <LoadingSpinner />}
      {error && (
        <div className="container mx-auto p-4 max-w-2xl">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-4 material-elevation-2">
            <p className="text-destructive-foreground">⚠️ Error: {error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-destructive underline hover:text-destructive/80"
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
