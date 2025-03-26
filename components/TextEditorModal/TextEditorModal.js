import React, { useState, useEffect } from 'react';
import './TextEditorModal.css';

export default function TextEditorModal({ file, onClose, onSave }) {
  const [text, setText] = useState(file.content || '');

  useEffect(() => {
    setText(file.content || '');
  }, [file]);

  const handleSave = () => {
    const updatedFile = { ...file, content: text };
    onSave(updatedFile);
    onClose();
  };

  return (
    <div className="text-editor-modal">
      <div className="text-editor-header">
        <span>{file.name}</span>
        <div>
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
      <textarea
        className="text-editor-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
}
