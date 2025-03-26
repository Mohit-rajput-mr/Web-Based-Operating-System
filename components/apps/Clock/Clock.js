import React, { useState, useEffect } from 'react';
const Clock = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  useEffect(() => { const interval = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000); return () => clearInterval(interval); }, []);
  return (
    <div style={{ padding: 10 }}>
      <h2>Clock</h2>
      <p>{time}</p>
    </div>
  );
};
export default Clock;
