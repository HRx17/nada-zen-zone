import React, { useState, useEffect } from "react";

const PracticeTab = ({ fullTextContext }) => {
  const [messages, setMessages] = useState([]);
  const [isTutorSpeaking, setIsTutorSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audio, setAudio] = useState(null);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  useEffect(() => {
    if (recognition) {
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        sendChatMessage(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }
  }, [recognition]);

  const playAudio = async (audioBuffer) => {
    if (audioContext) {
      audioContext.decodeAudioData(audioBuffer, (buffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
        source.onended = () => {
          setIsTutorSpeaking(false);
        };
      });
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
      const chatResponse = await fetch('http://localhost:3001/api/chat-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: fullHistory, context: fullTextContext })
      });
      const { text: tutorResponseText } = await chatResponse.json();
      setMessages((prev) => [...prev, { sender: "tutor", text: tutorResponseText }]);

      // Call ElevenLabs API
      const ttsResponse = await fetch('http://localhost:3001/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: tutorResponseText })
      });
      const audioBuffer = await ttsResponse.arrayBuffer();
      playAudio(audioBuffer);

    } catch (error) {
      console.error("Error in chat interaction:", error);
      setIsTutorSpeaking(false);
    }
  };

  const startConversation = () => {
    sendChatMessage("Hi Lumi, let's start practicing!");
  };

  const handleMicClick = () => {
    if (!recognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">AI Voice Tutor</h2>
      <button
        onClick={startConversation}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Start Practice
      </button>
      <div className="chat-bubble-container mb-4 max-h-96 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded ${
              msg.sender === "user"
                ? "bg-blue-600 self-end"
                : "bg-gray-600 self-start"
            }`}
          >
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <button
        onClick={handleMicClick}
        className="bg-red-500 text-white px-4 py-2 rounded"
        disabled={isTutorSpeaking}
      >
        {isListening ? "Listening..." : "🎤"}
      </button>
      {isTutorSpeaking && <p className="mt-2">Tutor is speaking...</p>}
    </div>
  );
};

export default PracticeTab;
