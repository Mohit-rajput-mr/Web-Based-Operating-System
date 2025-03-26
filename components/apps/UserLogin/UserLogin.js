import React, { useState } from 'react';
import './UserLogin.css';

const UserLogin = () => {
  const [username, setUsername] = useState('');
  const handleLogin = () => alert(`Logged in as ${username}`);
  return (
    <div className="user-login">
      <h2>Please Enter Your Username</h2>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter Username" />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default UserLogin;
