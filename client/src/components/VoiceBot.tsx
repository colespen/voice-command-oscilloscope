import React, { useState, useEffect, useMemo, useCallback } from "react";
import io from "socket.io-client";

import "./index.css";

// const SERVER = "https://voice-command-oscilloscope-server.onrender.com";
const SERVER = "http://127.0.0.1:8001";
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
  setUserText: React.Dispatch<React.SetStateAction<string>>;
};

const VoiceBot: React.FC<VoiceBotProps> = ({
  setIsClicked,
  setUserText,
}: VoiceBotProps) => {
  const [listening, setListening] = useState(false);
  const [botSpeaking, setBotSpeaking] = useState(false);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const recognition = useMemo(
    () => new SpeechRecognition(),
    [SpeechRecognition]
  );

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
      setUserText("");
      setIsClicked(false);
      setListening(false);
      botSpeak("OK bye, !");

      const stopDelay = setTimeout(() => {
        recognition.stop();
        console.log("recognition.stop()");
        setUserText("Click to Surf.");
        return () => clearTimeout(stopDelay);
      }, 1200);
    } else {
      setUserText("");
      setIsClicked(true);
      setListening(true);
      botSpeak("Yo! What is good?!");

      const startDelay = setTimeout(() => {
        setUserText("listening...");
        return () => clearTimeout(startDelay);
      }, 2000);
    }
  };

  // matches sent from user
  useEffect(() => {
    recognition.onresult = (e: { results: string | any[] }) => {
      //console.log(e.results);
      // e.results: SpeechRecognitionResult object
      const last = e.results.length - 1;
      const text = e.results[last][0].transcript;
      console.log("text: ", text);

      const subStr = text.length > 15 ? text.substring(0, 18) + "..." : text;

      // send msg to server w .emit() and set UI text
      if (!botSpeaking) {
        socket.emit("user message", text);
        const writeDelay = setTimeout(() => {
          if (
            text === "end transmission" ||
            text === "and transmission" ||
            text === "close transmission"
          ) {
            setUserText("Transmission Ended.");
          } else {
            setUserText(subStr);
          }
          return () => clearTimeout(writeDelay);
        }, 250);
      }
      if (
        text === "end transmission" ||
        text === "and transmission" ||
        text === "close transmission"
      ) {
        const stopDelay = setTimeout(() => {
          setListening(false);
          recognition.stop();
          setUserText("Click to Surf.");
          console.log("recognition.stop() end-transmission");
          return () => clearTimeout(stopDelay);
        }, 1700);
      }
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };
  }, [recognition, botSpeaking, setUserText]);

  // stop on error or silence timeout
  useEffect(() => {
    recognition.onerror = (e: { error: any }) => {
      console.log("onerror: ", e.error);

      if (e.error === "no-speech") {
        setListening(false);
        botSpeak("I couldn't hear you.");
        setUserText("I coudn't hear you.");

        const stopDelay = setTimeout(() => {
          recognition.stop();
          setUserText("Click to Surf.");
          console.log("recognition.stop() no-speech");
          return () => clearTimeout(stopDelay);
        }, 1700);
      }
      recognition.stop();
    };
  }, [botSpeak, recognition, setUserText]);

  // open link with user speech and -botSpeak-
  useEffect(() => {
    const handleBotMessage = (answer: { msg: string; link: string }) => {
      const { msg, link } = answer;
      botSpeak(msg);
      if (link) {
        window.open(link, "_blank", "noreferrer");
      }
    };
    socket.on("bot message", handleBotMessage);

    return () => {
      socket.off("bot message", handleBotMessage);
    };
  }, [botSpeak]);

  return (
    <button onClick={handleClick}>{/* fyi this div is overlapped */}</button>
  );
};

export default VoiceBot;
