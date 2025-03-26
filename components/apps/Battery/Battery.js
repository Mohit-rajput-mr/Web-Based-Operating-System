import React, { useState } from "react";
import "./Battery.css";

/**
 * This component simulates a Battery/Power panel with multiple operations:
 * 1. Current battery level
 * 2. Power source (AC or battery)
 * 3. Battery saver mode toggle
 * 4. Battery usage by app
 * 5. Battery health info
 * 6. Estimated time remaining
 * 7. Power plan selection
 * 8. Sleep/Hibernate settings
 * ... etc.
 */

const mockBatteryUsage = [
  { app: "Browser", usage: 15 },
  { app: "Music Player", usage: 10 },
  { app: "Video Game", usage: 25 }
];

const Battery = ({ onClose }) => {
  const [batteryLevel, setBatteryLevel] = useState(75);
  const [isPluggedIn, setIsPluggedIn] = useState(false);
  const [batterySaver, setBatterySaver] = useState(false);
  const [usageData] = useState(mockBatteryUsage);

  // Additional placeholders for advanced battery operations
  const advancedBatteryFeatures = [
    "Battery Health Check",
    "Calibrate Battery",
    "Optimize Power Plan",
    "Background App Restrictions",
    "Hibernate Timer",
    "Sleep Timer",
    "Low Battery Notification",
    "Critical Battery Action",
    "Battery Report",
    "CPU Throttling Settings",
    "GPU Power Saving",
    "Screen Brightness Automation",
    "Adaptive Brightness",
    "USB Power Management",
    "Battery Temperature",
    "Battery Cycle Count",
    "Battery Wear Level",
    "Fast Charging Toggle",
    "Energy Saver Schedules",
    "Power Diagnostics",
    // ... add more as needed
  ];

  const toggleBatterySaver = () => {
    setBatterySaver(!batterySaver);
  };

  const togglePluggedIn = () => {
    setIsPluggedIn(!isPluggedIn);
  };

  return (
    <div className="battery-panel">
      <div className="battery-header">
        <h3>Battery & Power</h3>
        <button onClick={onClose}>X</button>
      </div>

      <div className="battery-status">
        <p>Battery Level: {batteryLevel}%</p>
        <p>Power Source: {isPluggedIn ? "AC" : "Battery"}</p>
        <p>Battery Saver: {batterySaver ? "On" : "Off"}</p>
      </div>

      <div className="battery-controls">
        <button onClick={togglePluggedIn}>
          {isPluggedIn ? "Unplug" : "Plug In"}
        </button>
        <button onClick={toggleBatterySaver}>
          {batterySaver ? "Disable Battery Saver" : "Enable Battery Saver"}
        </button>
      </div>

      <div className="battery-usage">
        <h4>Battery Usage by App</h4>
        <ul>
          {usageData.map((item, idx) => (
            <li key={idx}>
              {item.app}: {item.usage}%
            </li>
          ))}
        </ul>
      </div>

      <hr />

      <div className="advanced-battery">
        <h4>Advanced Battery Features</h4>
        <ul>
          {advancedBatteryFeatures.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Battery;
