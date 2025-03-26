import React from "react";
import "./ContextMenu.css";
export default function ContextMenu({ x, y, options, onClose }) {
  return (
    <div className="context-menu" style={{ top: y, left: x }} onClick={onClose}>
      <ul>
        {options.map((opt, idx) => (
          <li key={idx} onClick={opt.action}>
            {opt.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
