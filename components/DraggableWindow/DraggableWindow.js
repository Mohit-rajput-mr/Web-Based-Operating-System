import React, { useState, useRef, useEffect } from 'react';
import './DraggableWindow.css';
import { FaWindowMinimize, FaWindowMaximize, FaTimes } from 'react-icons/fa';
const DraggableWindow = ({ title, children, onClose, onMinimize }) => {
  const windowRef = useRef(null);
  const [position, setPosition] = useState({ x: 80, y: 80 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [maximized, setMaximized] = useState(false);
  const [size, setSize] = useState({ width: 900, height: 600 });
  const handleMouseDown = (e) => { setDragging(true); setOffset({ x: e.clientX - position.x, y: e.clientY - position.y }); };
  const handleMouseMove = (e) => { if (dragging && !maximized) { setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y }); } };
  const handleMouseUp = () => setDragging(false);
  const toggleMinimize = () => { onMinimize && onMinimize(); };
  const toggleMaximize = () => {
    if (maximized) { setMaximized(false); setSize({ width: 900, height: 600 }); setPosition({ x: 80, y: 80 }); }
    else { setMaximized(true); setPosition({ x: 0, y: 0 }); setSize({ width: window.innerWidth, height: window.innerHeight - 50 }); }
  };
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  });
  return (
    <div className="draggable-window" ref={windowRef} style={{ top: position.y, left: position.x, width: size.width, height: size.height, display: 'flex', flexDirection: 'column' }}>
      <div className="window-header" onMouseDown={handleMouseDown}>
        <span className="window-title">{title}</span>
        <div className="window-controls">
          <button onClick={toggleMinimize}><FaWindowMinimize /></button>
          <button onClick={toggleMaximize} className='max'><FaWindowMaximize /></button>
          <button onClick={onClose}><FaTimes /></button>
        </div>
      </div>
      <div className="window-content">{children}</div>
    </div>
  );
};
export default DraggableWindow;
