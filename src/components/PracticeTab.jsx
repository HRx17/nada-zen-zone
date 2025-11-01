import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const PracticeTab = ({ fullTextContext }) => {
  const [messages, setMessages] = useState([]);
  const [isTutorSpeaking, setIsTutorSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        sendChatMessage(transcript);
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

    // Initialize Audio Context
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      setAudioContext(new AudioContextClass());
    }
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

  const sendChatMessage = async (userMessageText) => {
    const newUserMessage = { role: "user", parts: [{ text: userMessageText }] };
    setMessages((prev) => [...prev, { sender: "user", text: userMessageText }]);

    const fullHistory = [...messages.map(msg => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    })), newUserMessage];

    setIsTutorSpeaking(true);

    try {
      // Call Gemini Chat API
      const { data: chatResult, error: chatError } = await supabase.functions.invoke('chat-response', {
        body: { history: fullHistory, context: fullTextContext }
      });
      
      if (chatError) throw chatError;
      if (chatResult.error) throw new Error(chatResult.error);
      
      const tutorResponseText = chatResult.text;
      setMessages((prev) => [...prev, { sender: "tutor", text: tutorResponseText }]);

      // Call ElevenLabs API
      const { data: ttsResult, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
        body: { text: tutorResponseText }
      });
      
      if (ttsError) throw ttsError;
      if (ttsResult.error) throw new Error(ttsResult.error);
      
      // The result is already an ArrayBuffer from the edge function
      await playAudio(ttsResult);

    } catch (error) {
      console.error("Error in chat interaction:", error);
      setMessages((prev) => [...prev, { sender: "tutor", text: "Sorry, I encountered an error. Please try again." }]);
      setIsTutorSpeaking(false);
    }
  };

  const startConversation = () => {
    sendChatMessage("Hi Lumi, let's start practicing!");
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

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gray-800 p-4 rounded-t-xl border-b border-gray-700">
        <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          💬 Practice with Lumi
        </h2>
        {messages.length === 0 && (
          <button
            onClick={startConversation}
            className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105"
          >
            Start Practice Session
          </button>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-lg">Click "Start Practice Session" to begin your conversation with Lumi!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-2xl shadow-lg ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                    : "bg-gray-700 text-white rounded-bl-none border border-gray-600"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))
        )}
        {isTutorSpeaking && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-white p-4 rounded-2xl rounded-bl-none border border-gray-600">
              <div className="flex items-center space-x-2">
                <div className="animate-bounce">🔊</div>
                <p className="text-sm italic">Lumi is speaking...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Microphone Button */}
      <div className="bg-gray-800 p-6 rounded-b-xl border-t border-gray-700">
        <div className="flex justify-center">
          <button
            onClick={handleMicClick}
            disabled={isTutorSpeaking}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg ${
              isListening
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            }`}
          >
            {isListening ? "⏸️" : "🎤"}
          </button>
        </div>
        <p className="text-center text-sm text-gray-400 mt-3">
          {isListening ? "Listening... Speak now" : isTutorSpeaking ? "Please wait..." : "Click microphone to speak"}
        </p>
      </div>
    </div>
  );
};

export default PracticeTab;
