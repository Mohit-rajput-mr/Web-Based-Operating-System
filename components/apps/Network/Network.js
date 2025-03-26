import React, { useState } from "react";
import "./Network.css";

/**
 * This component simulates a Wi-Fi/Network panel with multiple operations:
 * 1. List available Wi-Fi networks
 * 2. Connect to a network
 * 3. Disconnect from a network
 * 4. View network properties
 * 5. Enable/disable Wi-Fi
 * 6. Enable/disable Airplane mode
 * 7. Refresh network list
 * 8. Advanced adapter settings
 * 9. Set data usage limit
 * 10. VPN configuration
 * ... etc.
 * (Add as many as you like to reach 20+ or more functionalities)
 */

const mockNetworks = [
  { ssid: "HomeWiFi", secure: true, signal: 4 },
  { ssid: "CafeHotspot", secure: false, signal: 3 },
  { ssid: "WorkNetwork", secure: true, signal: 5 },
  { ssid: "Guest123", secure: true, signal: 2 }
];

const Network = ({ onClose }) => {
  const [networks, setNetworks] = useState(mockNetworks);
  const [connectedNetwork, setConnectedNetwork] = useState(null);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [airplaneMode, setAirplaneMode] = useState(false);

  const handleConnect = (ssid) => {
    setConnectedNetwork(ssid);
    // Additional logic for connecting...
  };

  const handleDisconnect = () => {
    setConnectedNetwork(null);
    // Additional logic for disconnecting...
  };

  const handleToggleWifi = () => {
    setWifiEnabled(!wifiEnabled);
    if (!wifiEnabled) {
      // re-scan networks, etc.
      setNetworks(mockNetworks);
    } else {
      // disabling wifi
      setNetworks([]);
      setConnectedNetwork(null);
    }
  };

  const handleToggleAirplaneMode = () => {
    setAirplaneMode(!airplaneMode);
    if (!airplaneMode) {
      // turning on airplane mode
      setWifiEnabled(false);
      setNetworks([]);
      setConnectedNetwork(null);
    } else {
      // turning off airplane mode
      setWifiEnabled(true);
      setNetworks(mockNetworks);
    }
  };

  const handleRefresh = () => {
    // re-fetch or simulate scanning for networks
    if (wifiEnabled) {
      setNetworks(mockNetworks);
    }
  };

  // You can add 100 more placeholders for advanced functionalities here:
  const advancedOperations = [
    "Manage Known Networks",
    "Open Adapter Settings",
    "Set Data Usage Limit",
    "VPN Configuration",
    "Network Troubleshooter",
    "Proxy Settings",
    "Firewall Settings",
    "MAC Address Randomization",
    "Hotspot Settings",
    "Metered Connection Toggle",
    "WPS Push Button Setup",
    "Wi-Fi Direct Management",
    "QoS Settings",
    "DNS Configuration",
    "IP Settings (Static/DHCP)",
    "Port Forwarding",
    "Network Bridge",
    "Bandwidth Monitor",
    "Guest Network Isolation",
    "Network Profile (Public/Private)",
    // ... add more as needed
  ];

  return (
    <div className="network-panel">
      <div className="network-header">
        <h3>Wi-Fi Networks</h3>
        <button onClick={onClose}>X</button>
      </div>

      <div className="network-controls">
        <button onClick={handleToggleWifi}>
          {wifiEnabled ? "Disable Wi-Fi" : "Enable Wi-Fi"}
        </button>
        <button onClick={handleToggleAirplaneMode}>
          {airplaneMode ? "Disable Airplane Mode" : "Enable Airplane Mode"}
        </button>
        <button onClick={handleRefresh}>Refresh</button>
      </div>

      <div className="network-list">
        {wifiEnabled && !airplaneMode ? (
          networks.map((net) => (
            <div key={net.ssid} className="network-item">
              <span>
                {net.ssid} {net.secure ? "(Secured)" : "(Open)"}
              </span>
              <span>Signal: {net.signal}/5</span>
              {connectedNetwork === net.ssid ? (
                <button onClick={handleDisconnect}>Disconnect</button>
              ) : (
                <button onClick={() => handleConnect(net.ssid)}>Connect</button>
              )}
            </div>
          ))
        ) : (
          <p>Wi-Fi is off or Airplane Mode is on.</p>
        )}
      </div>

      <hr />

      <div className="advanced-operations">
        <h4>Advanced Operations</h4>
        <ul>
          {advancedOperations.map((op, index) => (
            <li key={index}>{op}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Network;
