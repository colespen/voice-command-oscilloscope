import React, { useRef, useEffect, useCallback } from "react";

import "./index.css";

type visualizeDataProps = {
  isClicked: boolean;
  text: string;
};

const Visualizer: React.FC<visualizeDataProps> = ({isClicked, text}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const devicePixelRatio = window.devicePixelRatio || 1;



  // draw to canvas
  const visualizeData = useCallback(() => {
    let animationController: number | null;
    animationController = window.requestAnimationFrame(visualizeData);

    if (!analyser.current) {
      return cancelAnimationFrame(animationController!);
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(devicePixelRatio, devicePixelRatio);

    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyser.current.getFloatTimeDomainData(dataArray);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#00f125";
    ctx.beginPath();
    const sliceWidth = (WIDTH * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      // const v = dataArray[i] / 128.0; (for Uint8Array)
      const v = dataArray[i];
      const y = (v * HEIGHT) / 1.75 + HEIGHT / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth + 1;
    }
    ctx.lineTo(WIDTH, HEIGHT / 2);
    ctx.stroke();

    if (!isClicked) {
      ctx.font = "125px sans-serif";
      ctx.strokeText("Speak & Surf", 10, HEIGHT / 2.01);
    }
    
    if (isClicked) {
      ctx.font = "125px sans-serif";
      ctx.strokeText(text, 10, HEIGHT / 2.01);
    }
  }, [devicePixelRatio, isClicked, text]);

  //create new context
  const handleAudioPlay = useCallback(async () => {
    if (!analyser.current) {
      try {
        // Get audio stream from mic input  - WORKS!!
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const audioContext = new AudioContext();
        const audioSrc = audioContext.createMediaStreamSource(stream);
        analyser.current = audioContext.createAnalyser();
        audioSrc.connect(analyser.current);
        // analyser.current.connect(audioContext.destination);
        // analyser.current.fftSize = 2 ** 200;
      } catch (error) {
        console.error(error);
      }
    }
    visualizeData();
  }, [visualizeData]);

  // new context on first render
  useEffect(() => {
    handleAudioPlay();
  }, [handleAudioPlay]);

  return (
    <>
      <canvas ref={canvasRef} />
    </>
  );
};

export default Visualizer;
