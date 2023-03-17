import React, {useState} from 'react';
import Visualizer from './components/Visualizer';
import VoiceBot from './components/VoiceBot'
import './App.css';

function App() {
  const [isClicked, setIsClicked] = useState(false)
  const [text, setText] = useState("")

  return (
    <div className="App">
      <header className="App-header">
        <Visualizer 
          isClicked={isClicked} 
          text={text}/>
        <VoiceBot 
        setIsClicked={setIsClicked}
        setText={setText}
        />
      </header>
    </div>
  );
}

export default App;
