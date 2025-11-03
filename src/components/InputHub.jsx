import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Upload, Youtube, Sparkles } from "lucide-react";

const InputHub = ({ setLessonData, setIsLoading, setError }) => {
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: { query: searchQuery, sourceType: 'query' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setLessonData(data);
    } catch (err) {
      console.error("Error generating lesson:", err);
      setError(err.message || "Failed to generate lesson. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleYoutubeSubmit = async (e) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: { query: youtubeUrl, sourceType: 'youtube' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setLessonData(data);
    } catch (err) {
      console.error("Error processing YouTube video:", err);
      setError(err.message || "Failed to process YouTube video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

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
    } catch (err) {
      console.error("Error processing file:", err);
      setError(err.message || "Failed to process file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "search", label: "Search Topic", icon: Search },
    { id: "youtube", label: "YouTube Link", icon: Youtube },
    { id: "upload", label: "Upload File", icon: Upload }
  ];

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-16 space-y-6">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass elevation-1 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Powered by AI</span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-black mb-6">
          <span className="gradient-text">Learn Anything,</span>
          <br />
          <span className="text-foreground">Anytime</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Transform any topic, video, or document into personalized interactive lessons with quizzes, flashcards, and AI tutoring.
        </p>
      </div>

      {/* Input Card */}
      <div className="glass rounded-3xl p-8 elevation-3 max-w-3xl mx-auto">
        {/* Tab Selector */}
        <div className="flex items-center justify-center space-x-2 mb-8 p-2 bg-background/50 rounded-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-primary to-primary-glow text-white shadow-lg glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "search" && (
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What would you like to learn today?"
                  className="w-full pl-12 pr-4 py-5 bg-background/80 border-2 border-border rounded-2xl text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="w-full bg-gradient-to-r from-primary to-primary-glow text-white font-bold py-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 elevation-2 hover:glow group"
              >
                <span className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Generate Lesson</span>
                </span>
              </button>
            </form>
          )}

          {activeTab === "youtube" && (
            <form onSubmit={handleYoutubeSubmit} className="space-y-4">
              <div className="relative">
                <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="Paste YouTube video URL..."
                  className="w-full pl-12 pr-4 py-5 bg-background/80 border-2 border-border rounded-2xl text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={!youtubeUrl.trim()}
                className="w-full bg-gradient-to-r from-primary to-primary-glow text-white font-bold py-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 elevation-2 hover:glow group"
              >
                <span className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Generate Lesson</span>
                </span>
              </button>
            </form>
          )}

          {activeTab === "upload" && (
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full py-12 bg-background/80 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary transition-colors group"
                >
                  <Upload className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
                  <p className="text-lg font-semibold text-foreground mb-2">
                    {file ? file.name : "Click to upload file"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PDF, DOC, DOCX, or TXT
                  </p>
                </label>
              </div>
              <button
                type="submit"
                disabled={!file}
                className="w-full bg-gradient-to-r from-primary to-primary-glow text-white font-bold py-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 elevation-2 hover:glow group"
              >
                <span className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Generate Lesson</span>
                </span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
        {[
          { title: "Interactive Learning", desc: "Engage with dynamic content", gradient: "from-primary to-primary-glow" },
          { title: "AI-Powered Quizzes", desc: "Test your knowledge", gradient: "from-secondary to-secondary" },
          { title: "Voice Tutoring", desc: "Chat with AI tutor", gradient: "from-accent to-accent" }
        ].map((feature, i) => (
          <div key={i} className="glass rounded-2xl p-6 elevation-1 hover:elevation-3 transition-all duration-300 group">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 group-hover:scale-110 transition-transform`}></div>
            <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InputHub;
