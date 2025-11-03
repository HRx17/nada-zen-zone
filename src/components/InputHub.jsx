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
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-foreground mb-4">
          Choose Your Learning Source
        </h1>
        <p className="text-xl text-muted-foreground">
          Transform any content into an interactive learning experience
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search Topic */}
        <div className="bg-card p-8 rounded-xl material-elevation-2 border border-border hover:border-primary transition-all duration-300 group">
          <div className="flex items-center mb-4">
            <div className="bg-primary/10 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl">🔍</span>
            </div>
            <label className="text-xl font-semibold text-foreground">Search Topic</label>
          </div>
          <input
            ref={searchRef}
            type="text"
            className="w-full p-4 mb-4 bg-muted text-foreground rounded-lg border border-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="e.g., Quantum Physics, Machine Learning..."
          />
          <button
            type="button"
            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-6 py-4 rounded-lg transition-all transform hover:scale-105 material-elevation-2"
            onClick={() => handleGenerateLesson("search", searchRef)}
          >
            Search & Learn
          </button>
        </div>

        {/* Paste Text */}
        <div className="bg-card p-8 rounded-xl material-elevation-2 border border-border hover:border-secondary transition-all duration-300 group">
          <div className="flex items-center mb-4">
            <div className="bg-secondary/10 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl">📝</span>
            </div>
            <label className="text-xl font-semibold text-foreground">Paste Text</label>
          </div>
          <textarea
            ref={textRef}
            className="w-full p-4 mb-4 bg-muted text-foreground rounded-lg border border-input focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 resize-none transition-all"
            rows="4"
            placeholder="Paste your study material here..."
          ></textarea>
          <button
            type="button"
            className="w-full bg-secondary hover:bg-secondary-hover text-secondary-foreground font-semibold px-6 py-4 rounded-lg transition-all transform hover:scale-105 material-elevation-2"
            onClick={() => handleGenerateLesson("paste", textRef)}
          >
            Generate Lesson
          </button>
        </div>

        {/* Link URL */}
        <div className="bg-card p-8 rounded-xl material-elevation-2 border border-border hover:border-accent transition-all duration-300 group">
          <div className="flex items-center mb-4">
            <div className="bg-accent/10 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl">🔗</span>
            </div>
            <label className="text-xl font-semibold text-foreground">Website URL</label>
          </div>
          <input
            ref={urlRef}
            type="url"
            className="w-full p-4 mb-4 bg-muted text-foreground rounded-lg border border-input focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
            placeholder="https://example.com/article"
          />
          <button
            type="button"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-4 rounded-lg transition-all transform hover:scale-105 material-elevation-2"
            onClick={() => handleGenerateLesson("url", urlRef)}
          >
            Fetch & Analyze
          </button>
        </div>

        {/* YouTube Link */}
        <div className="bg-card p-8 rounded-xl material-elevation-2 border border-border hover:border-destructive transition-all duration-300 group">
          <div className="flex items-center mb-4">
            <div className="bg-destructive/10 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl">🎥</span>
            </div>
            <label className="text-xl font-semibold text-foreground">YouTube Video</label>
          </div>
          <input
            ref={youtubeRef}
            type="url"
            className="w-full p-4 mb-4 bg-muted text-foreground rounded-lg border border-input focus:border-destructive focus:outline-none focus:ring-2 focus:ring-destructive/20 transition-all"
            placeholder="https://youtube.com/watch?v=..."
          />
          <button
            type="button"
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold px-6 py-4 rounded-lg transition-all transform hover:scale-105 material-elevation-2"
            onClick={() => handleGenerateLesson("youtube", youtubeRef)}
          >
            Transcribe Video
          </button>
        </div>

        {/* Upload PDF - Full Width */}
        <div className="md:col-span-2 bg-card p-8 rounded-xl material-elevation-2 border border-border hover:border-primary transition-all duration-300 group">
          <div className="flex items-center mb-4">
            <div className="bg-primary/10 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl">📄</span>
            </div>
            <label className="text-xl font-semibold text-foreground">Upload PDF Document</label>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="file"
              accept=".pdf"
              className="flex-1 p-3 bg-muted text-foreground rounded-lg border border-input focus:border-primary focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer hover:file:bg-primary-hover transition-all"
              onChange={(e) => setPdfFile(e.target.files[0])}
            />
            <div className="flex gap-3 w-full md:w-auto">
              <button
                type="button"
                className="flex-1 md:flex-none bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-8 py-4 rounded-lg transition-all transform hover:scale-105 material-elevation-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                onClick={() => handleGenerateLesson("pdf", null)}
                disabled={!pdfFile}
              >
                Analyze PDF
              </button>
              <button
                type="button"
                className="flex-1 md:flex-none bg-muted hover:bg-muted/80 text-foreground font-semibold px-4 py-4 rounded-lg transition-all"
                onClick={handleDebugPdf}
                disabled={!pdfFile}
              >
                Debug PDF
              </button>
            </div>
          </div>
          {pdfFile && (
            <p className="mt-3 text-sm text-muted-foreground">Selected: {pdfFile.name}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputHub;
