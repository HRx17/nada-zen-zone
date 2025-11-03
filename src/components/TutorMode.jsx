import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mic, MicOff, Send, Bot, User } from "lucide-react";

const TutorMode = ({ lessonData }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTutorSpeaking, setIsTutorSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      setAudioContext(new AudioContextClass());
    }

    setMessages([{
      sender: "tutor",
      text: "Hi! I'm Lumi, your AI tutor. I'm here to help you master this lesson. Feel free to ask me anything!"
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const playAudio = async (audioBuffer) => {
    if (!audioContext) {
      console.error("Audio context not available");
      setIsTutorSpeaking(false);
      return;
    }

    try {
      const audioBufferDecoded = await audioContext.decodeAudioData(audioBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBufferDecoded;
      source.connect(audioContext.destination);
      source.start(0);
      
      source.onended = () => {
        setIsTutorSpeaking(false);
      };
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsTutorSpeaking(false);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || isSending) return;

    const userMessage = text.trim();
    setInputText("");
    setIsSending(true);
    
    const newUserMessage = { role: "user", parts: [{ text: userMessage }] };
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);

    const fullHistory = [...messages.map(msg => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    })), newUserMessage];

    setIsTutorSpeaking(true);

    try {
      const { data: chatResult, error: chatError } = await supabase.functions.invoke('chat-response', {
        body: { history: fullHistory, context: lessonData.sourceText }
      });
      
      if (chatError) throw chatError;
      if (chatResult.error) throw new Error(chatResult.error);
      
      const tutorResponseText = chatResult.text;
      setMessages((prev) => [...prev, { sender: "tutor", text: tutorResponseText }]);

      const { data: ttsResult, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
        body: { text: tutorResponseText }
      });
      
      if (ttsError) throw ttsError;
      if (ttsResult.error) throw new Error(ttsResult.error);
      
      await playAudio(ttsResult);

    } catch (error) {
      console.error("Error in chat interaction:", error);
      setMessages((prev) => [...prev, { sender: "tutor", text: "Sorry, I encountered an error. Please try again." }]);
      setIsTutorSpeaking(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleMicClick = () => {
    if (!recognition) {
      alert("Speech Recognition not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting recognition:", error);
        setIsListening(false);
      }
    }
  };

  const handleSendClick = () => {
    sendMessage(inputText);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-280px)]">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 glass rounded-t-3xl elevation-2 border border-b-0 border-border/50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-500`}
          >
            <div className={`flex items-start space-x-3 max-w-[80%] ${msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center elevation-1 ${
                msg.sender === "user"
                  ? "bg-gradient-to-br from-primary to-primary-glow"
                  : "bg-gradient-to-br from-accent to-accent"
              }`}>
                {msg.sender === "user" ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              
              {/* Message Bubble */}
              <div
                className={`px-6 py-4 rounded-2xl elevation-1 ${
                  msg.sender === "user"
                    ? "bg-gradient-to-br from-primary to-primary-glow text-white rounded-tr-sm"
                    : "glass border border-border/50 text-foreground rounded-tl-sm"
                }`}
              >
                <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        
        {isTutorSpeaking && !isSending && (
          <div className="flex justify-start animate-in fade-in duration-500">
            <div className="flex items-start space-x-3 max-w-[80%]">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent flex items-center justify-center elevation-1">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="glass border border-border/50 px-6 py-4 rounded-2xl rounded-tl-sm elevation-1">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                  <p className="text-sm italic text-muted-foreground">Speaking...</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="glass p-6 rounded-b-3xl elevation-2 border border-t-0 border-border/50">
        <div className="flex items-end space-x-3">
          <button
            onClick={handleMicClick}
            disabled={isTutorSpeaking || isSending}
            className={`flex-shrink-0 p-4 rounded-xl transition-all elevation-1 disabled:opacity-50 disabled:cursor-not-allowed ${
              isListening
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse glow"
                : "bg-gradient-to-r from-secondary to-secondary text-white hover:scale-110"
            }`}
            title={isListening ? "Stop recording" : "Start voice input"}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <div className="flex-1 glass rounded-xl border border-border/50 focus-within:border-primary focus-within:glow transition-all">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use voice input..."
              disabled={isTutorSpeaking || isSending}
              className="w-full p-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
              rows={2}
            />
          </div>

          <button
            onClick={handleSendClick}
            disabled={!inputText.trim() || isTutorSpeaking || isSending}
            className="flex-shrink-0 p-4 rounded-xl bg-gradient-to-r from-primary to-primary-glow text-white transition-all elevation-1 hover:scale-110 hover:glow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Send message"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          {isListening ? "🎤 Listening... Speak now" : isTutorSpeaking ? "⏳ Waiting for Lumi..." : "💡 Press Enter to send, Shift+Enter for new line"}
        </p>
      </div>
    </div>
  );
};

export default TutorMode;
