
// ye sabse achha code hai the best sirf ans type nhi kar rha 
import React, { useContext, useEffect, useRef, useState } from 'react';
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const synth = window.speechSynthesis;

  const speak = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    const voices = synth.getVoices();
    const hindiVoice = voices.find(v => v.lang === 'hi-IN');
    if (hindiVoice) utterance.voice = hindiVoice;

    isSpeakingRef.current = true;
    utterance.onend = () => {
      isSpeakingRef.current = false;
      setAiText("");
      startRecognition();
    };

    synth.cancel();
    synth.speak(utterance);
  };

  const startRecognition = () => {
    try {
      recognitionRef.current?.start();
      console.log("🎤 Listening...");
    } catch (err) {
      if (err.name !== "InvalidStateError") console.error(err);
    }
  };

  const handleCommand = (data) => {
    console.log("📦 handleCommand received:", data);
    const { type, userInput, response } = data;

    if (!type || type === "error") {
      speak("I couldn't understand that.");
      return;
    }

    speak(response);

    const urlMap = {
      'google-search': `https://www.google.com/search?q=${encodeURIComponent(userInput)}`,
      'youtube-search': `https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`,
      'youtube-play': `https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`,
      'youtube-open': `https://www.youtube.com/`,
      'instagram-open': `https://www.instagram.com/`,
      'facebook-open': `https://www.facebook.com/`,
      'linkedin-open': `https://www.linkedin.com/`,
      'chatgpt-open': `https://chat.openai.com/`,
      'whatsapp-open': `https://web.whatsapp.com/`,
      'calculator-open': `https://www.google.com/search?q=calculator`,
      'weather-show': `https://www.google.com/search?q=weather`,
    };

    const url = urlMap[type];
    if (url) {
      setTimeout(() => {
        window.open(url, "_blank");
      }, 1000);
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognitionRef.current = recognition;
    let isMounted = true;


    const greet = () => {
      speak(`Hello ${userData?.name || "there"}, what can I help you with?`);
    };

    if (userData) greet();

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      if (isMounted && !isSpeakingRef.current) setTimeout(() => recognition.start(), 1000);
    };

    recognition.onerror = (event) => {
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !== "aborted") setTimeout(() => recognition.start(), 1000);
    };

recognition.onresult = async (e) => {
  const transcript = e.results[e.results.length - 1][0].transcript.trim();

  if (userData?.assistantName && transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
    recognition.stop();
    isRecognizingRef.current = false;
    setListening(false);

    setUserText(transcript); // 👈 User ka input dikhana hai

    try {
      const data = await getGeminiResponse(transcript);

      setUserText(""); // 👈 User text hata do
      setAiText(data?.response || ""); // 👈 Gemini ka response dikhana hai

      handleCommand(data);
      speak(data?.response);
    } catch {
      speak("Sorry, I couldn't process that.");
    }
  }
};

    return () => {
      isMounted = false;
      recognition.stop();
      setListening(false);
    };
  }, [userData]);


return (
  <div className='w-full h-screen bg-gradient-to-t from-black to-[#02023d] flex flex-col justify-center items-center gap-4 overflow-hidden relative'>

    {/* 🔼 Top-right buttons — Responsive, clean */}
    <div className='absolute top-6 right-4 sm:top-8 sm:right-6 flex flex-col items-end gap-3'>
      <button
        className='bg-white text-black px-4 py-3 sm:px-5 sm:py-4 min-w-[150px] sm:min-w-[140px] text-sm sm:text-[17px] font-semibold rounded-full shadow-xl cursor-pointer'
        onClick={async () => {
          await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
          setUserData(null);
          navigate("/signin");
        }}
      >
        Log Out
      </button>

      <button
        className='bg-white text-black px-6 py-3 sm:px-8 sm:py-4 min-w-[150px] sm:min-w-[200px] text-sm sm:text-[18px] font-semibold rounded-full shadow-xl cursor-pointer'
        onClick={() => navigate("/customize")}
      >
        Customize your Assistant
      </button>
    </div>

    {/* 🤖 Assistant Image */}
    <div className='w-64 h-80 sm:w-72 sm:h-96 flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
      <img src={userData?.assistantImage} alt="assistant" className='h-full object-cover' />
    </div>

    {/* 🔊 Assistant Name */}
    <h1 className='text-white text-lg font-semibold text-center mt-2'>
      I'm {userData?.assistantName}
    </h1>

    {/* 🌀 AI/User GIF */}
    <img src={aiText ? aiImg : userImg} alt="chat" className='w-36 sm:w-48' />

    {/* 🧠 Spoken/Heard Text */}
    <h1 className='text-white text-base sm:text-lg font-medium text-center px-4 break-words max-w-[90%] leading-snug'>
      {userText || aiText}
    </h1>

  </div>
);


}

export default Home;
















