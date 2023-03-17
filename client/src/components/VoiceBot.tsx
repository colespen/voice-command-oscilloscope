import React, { useState, useEffect, useMemo } from "react";
import io from "socket.io-client";

import "./index.css";

const SERVER = "http://127.0.0.1:8001";
//Temporary fix?
const socket = io(SERVER, {
  transports: ["websocket"],
});

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceBot: React.FC = () => {
  const [listening, setListening] = useState(false);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const recognition = useMemo(
    () => new SpeechRecognition(),
    [SpeechRecognition]
  );

  console.log("listening: ", listening);

  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = true;

  
  const botSpeak = (text: string | undefined) => {
    //  .speechSynthesis (returns obj --> entry point into Web Speech API)
    const synth = window.speechSynthesis;
    //                    SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  const handleClick = () => {
    if (listening) {
      recognition.stop();
      botSpeak("Until next time!");
      setListening(false);
    } else {
      botSpeak("Yo! What is good?!");
      recognition.start();
      setListening(true);
    }
  };

  useEffect(() => {
    recognition.onresult = (e: { results: string | any[] }) => {
      //console.log(e.results); // e.results :SpeechRecognitionResult object
      const last = e.results.length - 1;
      const text = e.results[last][0].transcript;
      socket.emit("user message", text);
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onerror = (e: { error: any }) => {
      console.log(e.error);
      recognition.stop();
    };
  }, [recognition]);

  // open link with user speech
  useEffect(() => {
    const handleBotMessage = (answer: { msg: any; link: any; }) => {
      const { msg, link } = answer;
      botSpeak(msg);
      if (link) {
        window.open(link, "_blank");
      }
    };
  
    socket.on("bot message", handleBotMessage);
  
    return () => {
      socket.off("bot message", handleBotMessage);
    }
  }, []);
  
  // useEffect(() => {
  //   socket.on("bot message", (answer) => {
  //     const { msg, link } = answer;
  //     botSpeak(msg);
  //     if (link) {
  //       window.open(link, "_blank");
  //     }
  //   });
  // }, []);

  return (
    <button onClick={handleClick}>
      <img alt="mic" src="./mic.png" />
      {""}
      {listening ? "Listening ..." : "Click to Speak & Surf"}
    </button>
  );
};

export default VoiceBot;
