import React from 'react';
import './SystemInfo.css';
const SystemInfo = () => {
  const cpuCores = navigator.hardwareConcurrency || 'N/A';
  return (
    <div className="systeminfo-container">
      <h2>System Information</h2>
      <p><strong>CPU Cores:</strong> {cpuCores}</p>
    </div>
  );
};
export default SystemInfo;
