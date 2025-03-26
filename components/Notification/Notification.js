import React from "react";
import "./Notification.css";
export default function Notification({ message, onClose }) {
  return (
    <div className="notification">
      <span>{message}</span>
      <button onClick={onClose}>×</button>
    </div>
  );
}
