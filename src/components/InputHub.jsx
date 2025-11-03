import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, FileText, Link as LinkIcon, Youtube, Upload, Sparkles } from "lucide-react";

const InputHub = ({ setLessonData, setIsLoading, setError }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Please enter a search query");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: { query: searchQuery, sourceType: 'query' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setLessonData(data);
      setSearchQuery("");
    } catch (err) {
      console.error("Error generating lesson:", err);
      setError(err.message || "Failed to generate lesson. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteText = async (e) => {
    e.preventDefault();
    if (!pasteText.trim()) {
      setError("Please paste some text content");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: { query: pasteText, sourceType: 'text' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setLessonData(data);
      setPasteText("");
    } catch (err) {
      console.error("Error generating lesson:", err);
      setError(err.message || "Failed to generate lesson. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: { query: urlInput, sourceType: 'url' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setLessonData(data);
      setUrlInput("");
    } catch (err) {
      console.error("Error processing URL:", err);
      setError(err.message || "Failed to process URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleYoutubeSubmit = async (e) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: { query: youtubeUrl, sourceType: 'youtube' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setLessonData(data);
      setYoutubeUrl("");
    } catch (err) {
      console.error("Error processing YouTube video:", err);
      setError(err.message || "Failed to process YouTube video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-lesson`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process file');
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setLessonData(data);
      setFile(null);
    } catch (err) {
      console.error("Error processing file:", err);
      setError(err.message || "Failed to process file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputCards = [
    {
      id: "search",
      title: "Search & Learn",
      subtitle: "Research any topic",
      icon: Search,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      buttonBg: "bg-primary hover:bg-primary-hover",
      buttonText: "Generate from Search",
      placeholder: "What do you want to learn about?",
      value: searchQuery,
      onChange: (e) => setSearchQuery(e.target.value),
      onSubmit: handleSearch,
      inputType: "input"
    },
    {
      id: "paste",
      title: "Paste Content",
      subtitle: "From notes or articles",
      icon: FileText,
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      buttonBg: "bg-secondary hover:bg-secondary-hover",
      buttonText: "Generate from Text",
      placeholder: "Paste your text here...",
      value: pasteText,
      onChange: (e) => setPasteText(e.target.value),
      onSubmit: handlePasteText,
      inputType: "textarea"
    },
    {
      id: "url",
      title: "From URL",
      subtitle: "Web articles & blogs",
      icon: LinkIcon,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      buttonBg: "bg-primary hover:bg-primary-hover",
      buttonText: "Generate from URL",
      placeholder: "https://example.com/article",
      value: urlInput,
      onChange: (e) => setUrlInput(e.target.value),
      onSubmit: handleUrlSubmit,
      inputType: "input"
    },
    {
      id: "youtube",
      title: "YouTube Video",
      subtitle: "Learn from videos",
      icon: Youtube,
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      buttonBg: "bg-secondary hover:bg-secondary-hover",
      buttonText: "Generate from YouTube",
      placeholder: "https://youtube.com/watch?v=...",
      value: youtubeUrl,
      onChange: (e) => setYoutubeUrl(e.target.value),
      onSubmit: handleYoutubeSubmit,
      inputType: "input"
    }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Powered by AI</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
          <span className="text-primary">Transform Any Content</span>
          <br />
          <span className="text-foreground">Into Learning Magic</span>
        </h1>
        
        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
          Choose your source, and Lumi will create a complete lesson kit with chapters, flashcards, and quizzes
        </p>
      </div>

      {/* Input Cards Grid */}
      <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
        {inputCards.map((card) => {
          const Icon = card.icon;
          return (
            <form 
              key={card.id} 
              onSubmit={card.onSubmit}
              className="bg-card border border-border rounded-2xl p-6 sm:p-8 elevation-2 hover:elevation-3 transition-all duration-200"
            >
              {/* Header */}
              <div className="flex items-start space-x-4 mb-6">
                <div className={`${card.iconBg} p-3 rounded-xl flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.subtitle}
                  </p>
                </div>
              </div>

              {/* Input Field */}
              {card.inputType === "textarea" ? (
                <textarea
                  value={card.value}
                  onChange={card.onChange}
                  placeholder={card.placeholder}
                  rows={4}
                  className="w-full px-4 py-3 bg-muted border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none mb-4 transition-all"
                  aria-label={card.title}
                />
              ) : (
                <input
                  type="text"
                  value={card.value}
                  onChange={card.onChange}
                  placeholder={card.placeholder}
                  className="w-full px-4 py-3 bg-muted border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-4 transition-all"
                  aria-label={card.title}
                />
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!card.value.trim()}
                className={`w-full ${card.buttonBg} text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 elevation-1`}
                aria-label={card.buttonText}
              >
                {card.buttonText}
              </button>
            </form>
          );
        })}
      </div>

      {/* File Upload Section */}
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleFileUpload} className="bg-card border border-border rounded-2xl p-8 elevation-2 hover:elevation-3 transition-all duration-200">
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-foreground">Upload Document</h3>
                <p className="text-sm text-muted-foreground">PDF, DOC, DOCX, or TXT files</p>
              </div>
            </div>

            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="file-upload"
              aria-label="Upload file"
            />
            
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full py-12 bg-muted border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200 mb-6"
            >
              <Upload className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-base font-semibold text-foreground mb-2">
                {file ? file.name : "Click to browse or drag and drop"}
              </p>
              <p className="text-sm text-muted-foreground">
                Maximum file size: 20MB
              </p>
            </label>

            <button
              type="submit"
              disabled={!file}
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 elevation-1"
              aria-label="Analyze document"
            >
              Analyze Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputHub;
