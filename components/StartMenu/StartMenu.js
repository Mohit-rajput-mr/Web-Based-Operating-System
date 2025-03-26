import React from "react";
import "./StartMenu.css";
import { FaUser, FaPowerOff } from "react-icons/fa";
export default function StartMenu({ onClose, onOpenApp }) {
  const pinnedApps = [
    { id: "fileExplorer", label: "File Explorer", icon: <FaUser /> },
    { id: "calculator", label: "Calculator", icon: <FaUser /> },
    { id: "weather", label: "Weather", icon: <FaUser /> }
  ];
  return (
    <div className="start-menu">
      <div className="start-menu-header">
        <FaUser size={24} />
        <span>User</span>
      </div>
      <div className="start-menu-content">
        {pinnedApps.map((app) => (
          <div key={app.id} className="start-menu-item" onClick={() => { onOpenApp(app.id); onClose(); }}>
            <div className="start-menu-icon">{app.icon}</div>
            <span>{app.label}</span>
          </div>
        ))}
      </div>
      <div className="start-menu-footer">
        <button onClick={() => onOpenApp("systemInfo")}>
          <FaPowerOff size={16} /> Power
        </button>
      </div>
    </div>
  );
}
