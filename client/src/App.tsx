import React from 'react';
import Visualizer from './components/Visualizer';
import VoiceBot from './components/VoiceBot'
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Visualizer />
        <VoiceBot />
      </header>
    </div>
  );
}

export default App;
