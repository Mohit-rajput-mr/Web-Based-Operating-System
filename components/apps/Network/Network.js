import React, { useState } from 'react';
const mockNetworks = [
  { ssid: 'Home_WiFi' },
  { ssid: 'Office_WiFi' },
  { ssid: 'Mobile_Hotspot' }
];
const Network = () => {
  const [selectedSSID, setSelectedSSID] = useState(null);
  const [password, setPassword] = useState('');
  const [connected, setConnected] = useState(false);
  const handleConnect = () => { if (!selectedSSID || !password) return; setConnected(true); };
  return (
    <div style={{ padding: 10 }}>
      <h2>Available Networks</h2>
      <ul>
        {mockNetworks.map(net => (
          <li key={net.ssid} style={{ cursor: 'pointer', marginBottom: '5px' }}
            onClick={() => { setSelectedSSID(net.ssid); setConnected(false); }}>
            {net.ssid} {selectedSSID === net.ssid && connected && ' (Connected)'}
          </li>
        ))}
      </ul>
      {selectedSSID && !connected && (
        <div style={{ marginTop: '10px' }}>
          <p>Enter password for {selectedSSID}:</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleConnect} style={{ marginLeft: '5px' }}>Connect</button>
        </div>
      )}
    </div>
  );
};
export default Network;
