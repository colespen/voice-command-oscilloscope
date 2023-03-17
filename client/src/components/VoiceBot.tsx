import React, { useState, useEffect, useMemo, useCallback } from "react";
import io from "socket.io-client";

import "./index.css";

const SERVER = "https://voice-command-oscilloscope-server.onrender.com";
// const SERVER = "http://127.0.0.1:8001";
const socket = io(SERVER, {
  transports: ["websocket"],
});

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type VoiceBotProps = {
  setIsClicked: React.Dispatch<React.SetStateAction<boolean>>;
  setText: React.Dispatch<React.SetStateAction<string>>;
};

const VoiceBot: React.FC<VoiceBotProps> = ({
  setIsClicked,
  setText,
}: VoiceBotProps) => {
  const [listening, setListening] = useState(false);
  const [botSpeaking, setBotSpeaking] = useState(false);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

    const recognition = useMemo(() => new SpeechRecognition(), [SpeechRecognition])

  // const recognition = useMemo(() => {
  //   if (!SpeechRecognition) {
  //     alert("Speech Recognition unavaiable.");
  //   } else {
  //     return new SpeechRecognition();
  //   }
  // }, [SpeechRecognition]);

  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = true;

  // instantiate speechSynth and control recogintion start stop
  const botSpeak = useCallback(
    (text: string | undefined) => {
      //  .speechSynthesis (returns obj --> entry point into Web Speech API)
      const synth = window.speechSynthesis;
      //                    SpeechSynthesisUtterance
      const utterance = new SpeechSynthesisUtterance(text);
      synth.speak(utterance);

      utterance.onstart = () => {
        recognition.stop();
        console.log("recognition.stop()");
        setBotSpeaking(true);
      };
      utterance.onend = () => {
        recognition.start();
        console.log("recognition.start()");
        setBotSpeaking(false);
      };
    },
    [recognition]
  );

  // start / stop listening with button
  const handleClick = () => {
    if (listening) {
      setListening(false);
      setText("");
      botSpeak("OK bye, !");

      const stopDelay = setTimeout(() => {
        recognition.stop();
        console.log("recognition.stop()");
        return () => clearTimeout(stopDelay);
      }, 1200);
    } else {
      setIsClicked(true);
      setListening(true);
      botSpeak("Yo! What is good?!");
    }
  };

  // matches sent from user
  useEffect(() => {
    recognition.onresult = (e: { results: string | any[] }) => {
      //console.log(e.results); // e.results :SpeechRecognitionResult object
      const last = e.results.length - 1;
      const text = e.results[last][0].transcript;
      console.log("text: ", text);

      const subStr = text.length > 15 ? text.substring(0, 18) + "..." : text;

      // send msg to server
      if (!botSpeaking) {
        socket.emit("user message", text);
        const writeDelay = setTimeout(() => {
          setText(subStr);
          return () => clearTimeout(writeDelay);
        }, 250);
      }
      if (text === "end transmission" || text === "and transmission") {
        const stopDelay = setTimeout(() => {
          setListening(false);
          recognition.stop();
          console.log("recognition.stop() end-transmission");
          setText("");
          return () => clearTimeout(stopDelay);
        }, 1700);
      }
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };
  }, [recognition, botSpeaking, setText]);

  // stop on error or silence timeout
  useEffect(() => {
    recognition.onerror = (e: { error: any }) => {
      console.log("onerror: ", e.error);

      if (e.error === "no-speech") {
        setListening(false);
        botSpeak("Transmission ended.");

        const stopDelay = setTimeout(() => {
          recognition.stop();
          console.log("recognition.stop() no-speech");
          setText("");
          return () => clearTimeout(stopDelay);
        }, 1700);
      }
      recognition.stop();
    };
  }, [botSpeak, recognition, setText]);

  // open link with user speech and -botSpeak-
  useEffect(() => {
    const handleBotMessage = (answer: { msg: any; link: any }) => {
      const { msg, link } = answer;
      botSpeak(msg);
      if (link) {
        window.open(link, "_blank");
      }
    };
    socket.on("bot message", handleBotMessage);

    return () => {
      socket.off("bot message", handleBotMessage);
    };
  }, [botSpeak]);

  return (
    <button onClick={handleClick}>
      <img alt="mic" src="./mic.png" />
      {""}
      {listening ? "Listening ..." : "Click to Speak & Surf"}
    </button>
  );
};

export default VoiceBot;
