import React, { useState, useEffect, useRef } from 'react';
import './Terminal.css';

const Terminal = ({ onClose }) => {
  const [output, setOutput] = useState([
    "Welcome to Mohit's Terminal. Type 'help' for commands."
  ]);
  const [command, setCommand] = useState('');
  const terminalEndRef = useRef(null);

  // For window controls
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // For the ephemeral file system
  const [currentDir, setCurrentDir] = useState('/');
  const [folders] = useState({
    '/': ['home', 'documents', 'pictures'],
    '/home': ['projects', 'videos'],
    '/documents': [],
    '/pictures': []
  });

  // For real-time crypto watch
  const [cryptoWatchInterval, setCryptoWatchInterval] = useState(null);

  // Scroll to bottom on output change
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output]);

  // A few arrays for fun commands
  const eightBallReplies = [
    "Yes", "No", "Maybe", "Ask again later", "Absolutely", "Definitely not"
  ];
  const funFacts = [
    "A group of flamingos is called a flamboyance.",
    "Honey never spoils.",
    "Bananas are berries, but strawberries are not.",
    "There are more stars in the universe than grains of sand on Earth."
  ];
  const randomQuotes = [
    "The only limit to our realization of tomorrow is our doubts of today. - FDR",
    "In the middle of difficulty lies opportunity. - Einstein",
    "Stay hungry, stay foolish. - Steve Jobs",
    "Life is short, live it. - Unknown"
  ];

  // Minimizing toggles the body hidden
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Maximizing toggles full-screen style
  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  // Closing
  const handleClose = () => {
    // Stop any crypto watch if active
    if (cryptoWatchInterval) {
      clearInterval(cryptoWatchInterval);
      setCryptoWatchInterval(null);
    }
    onClose && onClose();
  };

  // Command Dictionary
  const handleCommand = async (cmd) => {
    const parts = cmd.trim().split(' ');
    const base = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Helper commands
    const commands = {
      help: async () => {
        const msg = [
          "Available commands:",
          " help, clear/cls, exit",
          " whoami, date, time, random, eightball, fact, quote, systeminfo",
          " calc <expr>, crypto, ghrepos <username>",
          " cd <folder>, ls, pwd",
          " crypto-watch, crypto-stop",
          " ...and more placeholders to expand"
        ];
        return msg.join('\n');
      },
      clear: async () => {
        setOutput([]);
        return null;
      },
      cls: async () => {
        setOutput([]);
        return null;
      },
      exit: async () => {
        handleClose();
        return "Terminal closed.";
      },
      whoami: async () => {
        return "You are the user visiting Mohit's  OS!";
      },
      date: async () => {
        return new Date().toLocaleDateString();
      },
      time: async () => {
        return new Date().toLocaleTimeString();
      },
      random: async () => {
        return "Random Number: " + Math.random();
      },
      eightball: async () => {
        const reply = eightBallReplies[Math.floor(Math.random() * eightBallReplies.length)];
        return "Magic 8-ball says: " + reply;
      },
      fact: async () => {
        const fact = funFacts[Math.floor(Math.random() * funFacts.length)];
        return "Fun Fact: " + fact;
      },
      quote: async () => {
        const q = randomQuotes[Math.floor(Math.random() * randomQuotes.length)];
        return "Quote: " + q;
      },
      systeminfo: async () => {
        const cores = navigator.hardwareConcurrency || 'N/A';
        return `CPU Cores: ${cores}`;
      },
      calc: async () => {
        if (args.length === 0) return "Usage: calc <expression>";
        const expr = args.join(' ');
        try {
          // eslint-disable-next-line
          const r = eval(expr);
          return `Result: ${r}`;
        } catch {
          return "Error in calculation.";
        }
      },
      crypto: async () => {
        // One-time fetch of multiple cryptos
        try {
          const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,dogecoin,solana,cardano&vs_currencies=usd');
          const data = await res.json();
          const btc = data.bitcoin.usd;
          const eth = data.ethereum.usd;
          const doge = data.dogecoin.usd;
          const sol = data.solana.usd;
          const ada = data.cardano.usd;
          return `BTC: $${btc}, ETH: $${eth}, DOGE: $${doge}, SOL: $${sol}, ADA: $${ada}`;
        } catch (err) {
          return "Error fetching crypto prices.";
        }
      },
      'crypto-watch': async () => {
        if (cryptoWatchInterval) {
          return "Crypto watch already running. Type 'crypto-stop' to stop.";
        }
        // Start interval
        const intervalId = setInterval(async () => {
          try {
            const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,dogecoin,solana,cardano&vs_currencies=usd');
            const data = await res.json();
            const btc = data.bitcoin.usd;
            const eth = data.ethereum.usd;
            const doge = data.dogecoin.usd;
            const sol = data.solana.usd;
            const ada = data.cardano.usd;
            // Append to output
            setOutput(prev => [
              ...prev,
              `BTC: $${btc}, ETH: $${eth}, DOGE: $${doge}, SOL: $${sol}, ADA: $${ada}`
            ]);
          } catch (err) {
            setOutput(prev => [...prev, "Error fetching crypto prices."]);
          }
        }, 1000);
        setCryptoWatchInterval(intervalId);
        return "Started real-time crypto watch. Updating every second. Type 'crypto-stop' to end.";
      },
      'crypto-stop': async () => {
        if (!cryptoWatchInterval) {
          return "No crypto watch is running.";
        }
        clearInterval(cryptoWatchInterval);
        setCryptoWatchInterval(null);
        return "Stopped real-time crypto watch.";
      },
      ghrepos: async () => {
        if (args.length === 0) return "Usage: ghrepos <username>";
        const username = args[0];
        try {
          const res = await fetch(`https://api.github.com/users/${username}/repos`);
          const data = await res.json();
          if (Array.isArray(data)) {
            if (data.length === 0) {
              return "No public repos found.";
            }
            const repoNames = data.map(repo => repo.name).join(', ');
            return `Public Repos for ${username}: ${repoNames}`;
          } else if (data.message) {
            return `Error: ${data.message}`;
          } else {
            return "Unknown response from GitHub.";
          }
        } catch (err) {
          return "Error fetching repos from GitHub.";
        }
      },
      ls: async () => {
        if (!folders[currentDir]) {
          return "No items.";
        }
        return folders[currentDir].join('  ');
      },
      cd: async () => {
        if (args.length === 0) return "Usage: cd <folder>";
        const target = args[0];
        let newPath = currentDir;
        if (target === '..') {
          if (currentDir === '/') return "Already at root.";
          const parts = currentDir.split('/').filter(Boolean);
          parts.pop();
          newPath = '/' + parts.join('/');
          if (newPath === '') newPath = '/';
        } else {
          if (currentDir === '/') {
            newPath = '/' + target;
          } else {
            newPath = currentDir + '/' + target;
          }
        }
        if (!folders[newPath]) {
          return `No such folder: ${target}`;
        }
        setCurrentDir(newPath);
        return `Directory changed to ${newPath}`;
      },
      pwd: async () => {
        return currentDir;
      }
    };

    // Command check
    if (commands[base]) {
      const result = await commands[base]();
      return result;
    } else {
      return `Unknown command: ${cmd}`;
    }
  };

  // Process the command
  const processCommand = async () => {
    const cmd = command.trim();
    if (!cmd) return;
    setOutput(prev => [...prev, `> ${cmd}`]);
    const result = await handleCommand(cmd);
    if (result !== null && typeof result === 'string') {
      setOutput(prev => [...prev, result]);
    }
    setCommand('');
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processCommand();
    }
  };

  // Dynamic style for maximize
  const windowStyle = isMaximized
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        borderRadius: 0
      }
    : {};

  // If minimized, hide the body
  return (
    <div className="terminal-modal" style={windowStyle}>
      <div className="terminal-header">
        <div className="title-group">
          <span className="terminal-title">Mohit's Terminal </span>
        </div>
        <div className="window-buttons">
          <button onClick={handleMinimize} className="min-btn">_</button>
          <button onClick={handleMaximize} className="max-btn">
            {isMaximized ? '\u2750' : '\u2610'}
          </button>
          <button onClick={handleClose} className="close-terminal">X</button>
        </div>
      </div>
      {!isMinimized && (
        <div className="terminal-body">
          <div className="terminal-output">
            {output.map((line, i) => (
              <div key={i} className="terminal-line">{line}</div>
            ))}
            <div ref={terminalEndRef}></div>
          </div>
          <input
            type="text"
            className="terminal-input"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            autoFocus
          />
        </div>
      )}
    </div>
  );
};

export default Terminal;
