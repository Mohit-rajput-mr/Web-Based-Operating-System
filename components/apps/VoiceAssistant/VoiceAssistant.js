import React, { useState, useEffect } from 'react';
import './VoiceAssistant.css';
const VoiceAssistant = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
  useEffect(() => {
    if (recognition) {
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          finalTranscript += event.results[i][0].transcript;
        }
        setTranscript(prev => prev + ' ' + finalTranscript);
      };
      recognition.onerror = (event) => { console.error(event.error); };
    }
  }, [recognition]);
  const startListening = () => { if (recognition) { recognition.start(); setListening(true); } };
  const stopListening = () => { if (recognition) { recognition.stop(); setListening(false); } };
  return (
    <div className="voice-assistant-container">
      <h2>Voice Assistant</h2>
      <div className="voice-controls">
        {listening ? (
          <button onClick={stopListening}>Stop Listening</button>
        ) : (
          <button onClick={startListening}>Start Listening</button>
        )}
      </div>
      <div className="transcript">
        <p>{transcript}</p>
      </div>
    </div>
  );
};
export default VoiceAssistant;
