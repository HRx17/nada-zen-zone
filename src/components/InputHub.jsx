import React, { useState } from "react";

const InputHub = ({ setLessonData, setIsLoading, setError }) => {
  const [pdfFile, setPdfFile] = useState(null);

  const handleGenerateLesson = async (inputType, data) => {
    setIsLoading(true);
    setError(null);
    try {
      let response;
      if (inputType === 'pdf' && pdfFile) {
        const formData = new FormData();
        formData.append('inputType', inputType);
        formData.append('file', pdfFile);

        response = await fetch('http://localhost:3001/api/generate-lesson', {
          method: 'POST',
          body: formData
        });
      } else {
        response = await fetch('http://localhost:3001/api/generate-lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputType, data })
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { lessonKit, sourceText } = await response.json();
      setLessonData({ ...lessonKit, sourceText });
    } catch (error) {
      console.error("Error generating lesson:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Choose Your Input Method
      </h1>
      <form className="flex flex-col md:grid md:grid-cols-2 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <label className="block text-white mb-2">Search Topic</label>
          <input
            type="text"
            className="w-full p-2 mb-2 bg-gray-600 text-white rounded"
            placeholder="Enter topic"
          />
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleGenerateLesson("search", "topic")}
          >
            Search
          </button>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <label className="block text-white mb-2">Paste Text</label>
          <textarea
            className="w-full p-2 mb-2 bg-gray-600 text-white rounded"
            rows="4"
            placeholder="Paste your text here"
          ></textarea>
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleGenerateLesson("text", "text")}
          >
            Generate
          </button>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <label className="block text-white mb-2">Link URL</label>
          <input
            type="url"
            className="w-full p-2 mb-2 bg-gray-600 text-white rounded"
            placeholder="https://example.com"
          />
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleGenerateLesson("url", "url")}
          >
            Fetch
          </button>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <label className="block text-white mb-2">YouTube Link</label>
          <input
            type="url"
            className="w-full p-2 mb-2 bg-gray-600 text-white rounded"
            placeholder="https://youtube.com/watch?v=..."
          />
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleGenerateLesson("youtube", "url")}
          >
            Transcribe
          </button>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg md:col-span-2">
          <label className="block text-white mb-2">Upload PDF</label>
          <input
            type="file"
            accept=".pdf"
            className="w-full p-2 mb-2 bg-gray-600 text-white rounded"
            onChange={(e) => setPdfFile(e.target.files[0])}
          />
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleGenerateLesson("pdf", null)}
            disabled={!pdfFile}
          >
            Analyze
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputHub;
