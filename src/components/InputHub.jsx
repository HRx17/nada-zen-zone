import React, { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Youtube, Upload, Sparkles, BookOpen, Brain, Layers, FileText, X } from "lucide-react";

const InputHub = ({ setLessonData, setIsLoading, setError }) => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSearchSubmit = async () => {
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

  const handleYouTubeSubmit = async () => {
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileSubmit = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

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
      setSelectedFile(null);
    } catch (err) {
      console.error("Error processing file:", err);
      setError(err.message || "Failed to process file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 px-4">
      {/* Hero Section */}
      <div className="max-w-2xl mx-auto text-center mb-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-primary/10 rounded-full mb-5">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-wide">Powered by AI</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4 leading-tight">
          Transform Content Into<br />Learning Magic ✨
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Choose your source, and Lumi creates complete lessons with chapters, flashcards, and quizzes
        </p>
      </div>

      {/* Input Methods */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border-2 border-border rounded-2xl p-6 elevation-2">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl">
            {[
              { id: 'search', icon: Search, label: 'Search Topic' },
              { id: 'youtube', icon: Youtube, label: 'YouTube Link' },
              { id: 'upload', icon: Upload, label: 'Upload File' }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-card text-foreground elevation-1'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-label={tab.label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-foreground mb-3">
                  <Search className="w-4 h-4 text-primary" />
                  <span>What would you like to learn?</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Quantum Physics, Spanish Grammar, Machine Learning..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  className="w-full px-4 py-3.5 bg-background border-2 border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
              <button
                onClick={handleSearchSubmit}
                disabled={!searchQuery.trim()}
                className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-3.5 px-4 rounded-xl transition-all duration-200 elevation-1 hover:elevation-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
              >
                🚀 Generate Learning Path
              </button>
            </div>
          )}

          {/* YouTube Tab */}
          {activeTab === 'youtube' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-foreground mb-3">
                  <Youtube className="w-4 h-4 text-secondary" />
                  <span>Paste YouTube URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleYouTubeSubmit()}
                  className="w-full px-4 py-3.5 bg-background border-2 border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all"
                />
              </div>
              <button
                onClick={handleYouTubeSubmit}
                disabled={!youtubeUrl.trim()}
                className="w-full bg-secondary hover:bg-secondary-hover text-secondary-foreground font-bold py-3.5 px-4 rounded-xl transition-all duration-200 elevation-1 hover:elevation-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
              >
                📺 Generate from Video
              </button>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-foreground mb-3">
                  <Upload className="w-4 h-4 text-accent" />
                  <span>Upload Your Document</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-input rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/50 hover:border-accent transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-accent" />
                    </div>
                    <span className="text-sm font-semibold text-foreground mb-1">Click to upload</span>
                    <span className="text-xs text-muted-foreground">PDF, DOC, DOCX, or TXT • Max 20MB</span>
                  </label>
                </div>
                {selectedFile && (
                  <div className="flex items-center justify-between p-4 bg-accent/5 border border-accent/20 rounded-xl mt-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-accent" />
                      </div>
                      <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{selectedFile.name}</span>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleFileSubmit}
                disabled={!selectedFile}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3.5 px-4 rounded-xl transition-all duration-200 elevation-1 hover:elevation-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
              >
                📄 Generate from Document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-4xl mx-auto mt-16 grid sm:grid-cols-3 gap-6">
        {[
          { icon: BookOpen, title: "Structured Chapters", desc: "Organized, bite-sized learning modules", color: "primary" },
          { icon: Brain, title: "Smart Quizzes", desc: "AI-generated practice questions", color: "secondary" },
          { icon: Layers, title: "Interactive Flashcards", desc: "Master key concepts with spaced repetition", color: "accent" }
        ].map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div key={i} className="bg-card border border-border rounded-xl p-6 text-center elevation-1 hover:elevation-2 transition-all duration-200 hover:border-primary/30">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-${feature.color}/10 mb-4`}>
                <Icon className={`w-7 h-7 text-${feature.color}`} />
              </div>
              <h3 className="font-bold text-foreground mb-2 text-base">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InputHub;
