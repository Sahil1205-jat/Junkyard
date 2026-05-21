import React from 'react';

const ControlPanel = () => {
  return (
    <header className="control-panel glass-panel">
      <div className="logo-section" style={{ display: 'flex', alignItems: 'center' }}>
        <img src="/favicon.svg" alt="Junkyard Logo" style={{ height: '36px', marginRight: '1rem', filter: 'drop-shadow(0 0 5px rgba(0,85,255,0.5))' }} />
        <h1 className="glitch" data-text="JUNKYARD">JUNKYARD</h1>
      </div>
      <div className="controls">
        <button className="cyber-btn"><span>PLAY</span></button>
        <button className="cyber-btn warning"><span>PAUSE</span></button>
        <button className="cyber-btn danger"><span>RESET</span></button>
        <button className="cyber-btn"><span>EXPORT</span></button>
      </div>
    </header>
  );
};

export default ControlPanel;
