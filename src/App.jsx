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
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      {isLoading && <LoadingSpinner />}
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
