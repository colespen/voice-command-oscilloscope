import { useState } from "react";
import Visualizer from "./components/Visualizer";
import VoiceBot from "./components/VoiceBot";
import "./App.css";

function App() {
  const [isClicked, setIsClicked] = useState(false);
  const [userText, setUserText] = useState("Click to Surf.");

  return (
    <div className="App">
      <header className="App-header">
        <Visualizer isClicked={isClicked} text={userText} />
        <VoiceBot setIsClicked={setIsClicked} setUserText={setUserText} />
      </header>
    </div>
  );
}

export default App;
