import React, { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const InputHub = ({ setLessonData, setIsLoading, setError }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const searchRef = useRef(null);
  const textRef = useRef(null);
  const urlRef = useRef(null);
  const youtubeRef = useRef(null);

  const handleGenerateLesson = async (inputType, inputRef = null) => {
    const data = inputRef?.current?.value || "";
    
    if (!data && inputType !== 'pdf') {
      setError('Please enter a value');
      return;
    }
    
    if (inputType === 'pdf' && !pdfFile) {
      setError('Please select a PDF file');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      let requestBody = { inputType, data };
      
      if (inputType === 'pdf' && pdfFile) {
        // For PDF, we'll send the file name and a placeholder
        requestBody = { 
          inputType: 'pdf', 
          data: pdfFile.name,
          fileData: 'placeholder' // In production, you'd read and encode the file
        };
      }

      const { data: result, error } = await supabase.functions.invoke('generate-lesson', {
        body: requestBody
      });

      if (error) throw error;

      if (result.error) {
        throw new Error(result.error);
      }

      setLessonData({ ...result.lessonKit, sourceText: result.sourceText });
      
      // Clear inputs after successful generation
      if (inputRef?.current) inputRef.current.value = '';
      if (inputType === 'pdf') setPdfFile(null);
    } catch (error) {
      console.error("Error generating lesson:", error);
      setError(error.message || 'Failed to generate lesson');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugPdf = async () => {
    if (!pdfFile) {
      setError('Please select a PDF file to debug');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For demo: show PDF info
      setError(`PDF selected: ${pdfFile.name}, Size: ${pdfFile.size} bytes. PDF parsing will be implemented in production.`);
    } catch (err) {
      console.error('Debug PDF error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Choose Your Learning Source
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search Topic */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all">
          <div className="flex items-center mb-3">
            <span className="text-3xl mr-3">🔍</span>
            <label className="text-xl font-semibold text-white">Search Topic</label>
          </div>
          <input
            ref={searchRef}
            type="text"
            className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="e.g., Quantum Physics, Machine Learning..."
          />
          <button
            type="button"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105"
            onClick={() => handleGenerateLesson("search", searchRef)}
          >
            Search & Learn
          </button>
        </div>

        {/* Paste Text */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-green-500 transition-all">
          <div className="flex items-center mb-3">
            <span className="text-3xl mr-3">📝</span>
            <label className="text-xl font-semibold text-white">Paste Text</label>
          </div>
          <textarea
            ref={textRef}
            className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none resize-none"
            rows="4"
            placeholder="Paste your study material here..."
          ></textarea>
          <button
            type="button"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105"
            onClick={() => handleGenerateLesson("paste", textRef)}
          >
            Generate Lesson
          </button>
        </div>

        {/* Link URL */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-purple-500 transition-all">
          <div className="flex items-center mb-3">
            <span className="text-3xl mr-3">🔗</span>
            <label className="text-xl font-semibold text-white">Website URL</label>
          </div>
          <input
            ref={urlRef}
            type="url"
            className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            placeholder="https://example.com/article"
          />
          <button
            type="button"
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105"
            onClick={() => handleGenerateLesson("url", urlRef)}
          >
            Fetch & Analyze
          </button>
        </div>

        {/* YouTube Link */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-red-500 transition-all">
          <div className="flex items-center mb-3">
            <span className="text-3xl mr-3">🎥</span>
            <label className="text-xl font-semibold text-white">YouTube Video</label>
          </div>
          <input
            ref={youtubeRef}
            type="url"
            className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
            placeholder="https://youtube.com/watch?v=..."
          />
          <button
            type="button"
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105"
            onClick={() => handleGenerateLesson("youtube", youtubeRef)}
          >
            Transcribe Video
          </button>
        </div>

        {/* Upload PDF - Full Width */}
        <div className="md:col-span-2 bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-yellow-500 transition-all">
          <div className="flex items-center mb-3">
            <span className="text-3xl mr-3">📄</span>
            <label className="text-xl font-semibold text-white">Upload PDF Document</label>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="file"
              accept=".pdf"
              className="flex-1 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-500 file:text-white file:cursor-pointer hover:file:bg-yellow-600"
              onChange={(e) => setPdfFile(e.target.files[0])}
            />
            <div className="flex gap-3 w-full md:w-auto">
              <button
                type="button"
                className="flex-1 md:flex-none bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold px-8 py-3 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                onClick={() => handleGenerateLesson("pdf", null)}
                disabled={!pdfFile}
              >
                Analyze PDF
              </button>
              <button
                type="button"
                className="flex-1 md:flex-none bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-3 rounded-lg transition-all"
                onClick={handleDebugPdf}
                disabled={!pdfFile}
              >
                Debug PDF
              </button>
            </div>
          </div>
          {pdfFile && (
            <p className="mt-3 text-sm text-gray-400">Selected: {pdfFile.name}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputHub;
