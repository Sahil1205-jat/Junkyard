import React from 'react';
import Canvas from './components/Canvas';
import ScrapHeap from './components/ScrapHeap';
import ControlPanel from './components/ControlPanel';

function App() {
  return (
    <div className="app-container">
      <ControlPanel />
      <div className="main-content">
        <ScrapHeap />
        <Canvas />
      </div>
    </div>
  );
}

export default App;
