import React, { useState } from 'react';
import './PowerButton.css';
const PowerButton = () => {
  const [isShutdown, setIsShutdown] = useState(false);
  const [isSleep, setIsSleep] = useState(false);
  const handleShutdown = () => { setIsShutdown(true); setIsSleep(false); };
  const handleRestart = () => window.location.reload();
  const handleSleep = () => { setIsSleep(true); setIsShutdown(false); };
  const wakeUp = () => { setIsShutdown(false); setIsSleep(false); };
  return (
    <div className="power-container">
      {!isShutdown && !isSleep && (
        <div className="power-buttons">
          <button onClick={handleShutdown}>Shutdown</button>
          <button onClick={handleRestart}>Restart</button>
          <button onClick={handleSleep}>Sleep</button>
        </div>
      )}
      {(isShutdown || isSleep) && (
        <div className="power-screen">
          <div className="power-message">
            <h2>{isShutdown ? 'Shutting Down...' : 'System Sleeping...'}</h2>
            <button onClick={wakeUp} className="wake-up-btn">Press to Wake Up</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default PowerButton;
