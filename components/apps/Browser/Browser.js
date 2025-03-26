import React from 'react';
import './Browser.css';

const Browser = () => {
  return (
    <div className="browser-container">
      <iframe
        title="Web Browser"
        src="https://www.google.com/webhp?igu=1"
        className="browser-iframe"
      />
    </div>
  );
};

export default Browser;
