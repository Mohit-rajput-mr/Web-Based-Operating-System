import React, { useState } from 'react';
import './PersonalizationModal.css';

const PersonalizationModal = ({ currentBackground, onChange, onClose }) => {
  const [color, setColor] = useState(currentBackground.color);
  const [imageUrl, setImageUrl] = useState(currentBackground.image);

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange({ color, image: imageUrl });
    onClose();
  };

  return (
    <div className="personalization-modal">
      <div className="modal-content">
        <h2>Personalize</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Background Color:</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Background Image URL:</label>
            <input
              type="text"
              placeholder="Paste image URL here..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <div className="modal-buttons">
            <button type="submit">Apply</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalizationModal;
