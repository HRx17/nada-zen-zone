import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mic, MicOff, Send, Bot, User, Volume2 } from "lucide-react";

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
    <div className="flex flex-col h-[calc(100vh-280px)] bg-card border border-border rounded-2xl elevation-2 overflow-hidden">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-500`}
          >
            <div className={`flex items-start space-x-3 max-w-[85%] sm:max-w-[75%] ${msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center elevation-1 ${
                msg.sender === "user"
                  ? "bg-primary"
                  : "bg-accent"
              }`}>
                {msg.sender === "user" ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              
              {/* Message Bubble */}
              <div
                className={`px-5 py-4 rounded-2xl elevation-1 ${
                  msg.sender === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-muted text-foreground border border-border rounded-tl-sm"
                }`}
              >
                <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        
        {isTutorSpeaking && !isSending && (
          <div className="flex justify-start animate-in fade-in duration-500">
            <div className="flex items-start space-x-3 max-w-[75%]">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent flex items-center justify-center elevation-1">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-muted border border-border px-5 py-4 rounded-2xl rounded-tl-sm elevation-1">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-accent animate-pulse" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                  <p className="text-sm italic text-muted-foreground ml-2">Speaking...</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 sm:p-6 bg-card">
        <div className="flex items-end space-x-3">
          <button
            onClick={handleMicClick}
            disabled={isTutorSpeaking || isSending}
            className={`flex-shrink-0 p-3 sm:p-4 rounded-xl transition-all elevation-1 disabled:opacity-50 disabled:cursor-not-allowed ${
              isListening
                ? "bg-destructive text-white animate-pulse"
                : "bg-secondary hover:bg-secondary-hover text-white hover:scale-110 active:scale-95"
            }`}
            title={isListening ? "Stop recording" : "Start voice input"}
            aria-label={isListening ? "Stop recording" : "Start voice input"}
          >
            {isListening ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          <div className="flex-1 bg-muted rounded-xl border border-input focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use voice input..."
              disabled={isTutorSpeaking || isSending}
              className="w-full p-3 sm:p-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
              rows={2}
              aria-label="Message input"
            />
          </div>

          <button
            onClick={handleSendClick}
            disabled={!inputText.trim() || isTutorSpeaking || isSending}
            className="flex-shrink-0 p-3 sm:p-4 rounded-xl bg-primary hover:bg-primary-hover text-white transition-all elevation-1 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Send message"
            aria-label="Send message"
          >
            <Send className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex items-center justify-center mt-3 sm:mt-4">
          {isListening ? (
            <div className="flex items-center space-x-2 text-destructive">
              <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
              <p className="text-xs font-semibold">Listening... Speak now</p>
            </div>
          ) : isTutorSpeaking ? (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Volume2 className="w-4 h-4 text-accent" />
              <p className="text-xs font-semibold">Waiting for Lumi to finish...</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              💡 Press <span className="font-semibold">Enter</span> to send, <span className="font-semibold">Shift+Enter</span> for new line
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorMode;
