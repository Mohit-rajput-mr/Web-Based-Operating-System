import React from 'react';
import './PropertiesModal.css';
const PropertiesModal = ({ item, onClose }) => {
  if (!item) return null;
  return (
    <div className="properties-overlay">
      <div className="properties-content">
        <h2>Properties</h2>
        <p><strong>Name:</strong> {item.name}</p>
        <p><strong>Type:</strong> {item.type}</p>
        <p><strong>Date Modified:</strong> {item.dateModified}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
export default PropertiesModal;
