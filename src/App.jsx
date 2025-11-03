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
    <div className="min-h-screen bg-background">
      <Header />
      {isLoading && <LoadingSpinner />}
      {error && (
        <div className="container mx-auto p-6 max-w-2xl">
          <div className="bg-card border-2 border-destructive rounded-xl p-6 mb-6 elevation-2">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center text-sm font-bold">!</div>
              <div className="flex-1">
                <p className="text-destructive font-semibold mb-2">Error</p>
                <p className="text-foreground text-sm mb-3">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-sm text-primary hover:text-primary-hover underline font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
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
