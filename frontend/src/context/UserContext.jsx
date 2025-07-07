import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

export const userDataContext = createContext();

function UserContext({ children }) {
  //why not working
  const serverUrl =  "https://assistant-ten-peach.vercel.app/";
  //const serverUrl = "https://virtualassistantbackend-ztzi.onrender.com";
    //  const serverUrl="http://localhost:8000";
  const [userData, setUserData] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleCurrentUser = async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      });
      if (data) setUserData(data);
    } catch (error) {
      console.error("❌ Error fetching current user:", error.response?.data || error.message);
    }
  };

  const getGeminiResponse = async (command) => {
    if (!command || typeof command !== "string") {
      return {
        type: "error",
        userInput: command,
        response: "Invalid input. Please try again.",
      };
    }

    try {
      const { data } = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        { command },
        { withCredentials: true }
      );
      return data;
    } catch (error) {
      console.error("❌ Gemini Error:", error.response?.data || error.message);
      return {
        type: "error",
        userInput: command,
        response: "Sorry, I couldn't understand that.",
      };
    }
  };

  useEffect(() => {
    handleCurrentUser();
  }, []);

  return (
<userDataContext.Provider value={{
  serverUrl,
  userData,
  setUserData,
  backendImage,
  setBackendImage,
  frontendImage,
  setFrontendImage,
  selectedImage,
  setSelectedImage,
  getGeminiResponse,
}}>
  {children}
</userDataContext.Provider>

  );
}

export default UserContext;
