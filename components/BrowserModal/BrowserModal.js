import React from 'react';
import './BrowserModal.css';
const BrowserModal = ({ onClose }) => {
  return (
    <div className="browser-modal">
      <div className="browser-header">
        <span>Browser</span>
        <button onClick={onClose} className="close-browser">X</button>
      </div>
      <iframe title="My Browser" src="https://www.google.com" className="browser-iframe"></iframe>
    </div>
  );
};
export default BrowserModal;
