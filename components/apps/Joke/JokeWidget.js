import React, { useEffect, useState, useRef } from 'react';
import './JokeWidget.css';

const JokeWidget = () => {
  const [joke, setJoke] = useState('');
  const [previousJokes, setPreviousJokes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('purple');
  const [videoVisible, setVideoVisible] = useState(false);
  const [animationState, setAnimationState] = useState('initial');
  const [jokeCategory, setJokeCategory] = useState('Any');
  const jokeRef = useRef(null);

  const themes = {
    purple: {
      background: 'linear-gradient(145deg, #fce5ff, #f8d5f5)',
      color: '#8a2be2',
      buttonBg: '#cc33ff',
      buttonHover: '#a600cc'
    },
    blue: {
      background: 'linear-gradient(145deg, #e5f6ff, #d5ebf5)',
      color: '#1e90ff',
      buttonBg: '#4d94ff',
      buttonHover: '#3a75c4'
    },
    green: {
      background: 'linear-gradient(145deg, #e5ffe6, #d5f5d7)',
      color: '#2e8b57',
      buttonBg: '#3cb371',
      buttonHover: '#2e8b57'
    },
    orange: {
      background: 'linear-gradient(145deg, #fff5e5, #f5ebd5)',
      color: '#ff8c00',
      buttonBg: '#ffa500',
      buttonHover: '#cc8400'
    }
  };

  const categories = ['Any', 'Programming', 'Misc', 'Pun', 'Spooky', 'Christmas'];

  const fetchJoke = (category = jokeCategory) => {
    setLoading(true);
    setAnimationState('exit');
    
    // Delay the fetch to allow for exit animation
    setTimeout(() => {
      fetch(`https://v2.jokeapi.dev/joke/${category}?blacklistFlags=nsfw,religious,political,racist,sexist,explicit`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError("Couldn't fetch a joke. Try again later!");
            setLoading(false);
            return;
          }
          
          const newJoke = data.type === 'single' 
            ? data.joke 
            : `${data.setup} ... ${data.delivery}`;
          
          // Add current joke to history before setting new one
          if (joke) {
            setPreviousJokes(prev => [joke, ...prev].slice(0, 5));
          }
          
          setJoke(newJoke);
          setError(null);
          setLoading(false);
          setAnimationState('enter');
        })
        .catch(err => {
          setError("Failed to connect to joke service!");
          setLoading(false);
        });
    }, 500); // Match this delay with the exit animation duration
  };

  const toggleTheme = () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  };

  const handleCategoryChange = (category) => {
    setJokeCategory(category);
    fetchJoke(category);
  };

  useEffect(() => {
    fetchJoke();
    
    // Setup a joke refresh every 2 minutes
    const intervalId = setInterval(() => {
      fetchJoke();
    }, 120000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Handle bounce animation on new joke
  useEffect(() => {
    if (animationState === 'enter' && jokeRef.current) {
      jokeRef.current.focus();
    }
  }, [animationState]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(joke).then(() => {
      // Visual feedback for copy action
      setAnimationState('bounce');
      setTimeout(() => setAnimationState('enter'), 600);
    });
  };

  const currentTheme = themes[theme];

  return (
    <div 
      className="joke-widget-container" 
      style={{ 
        background: currentTheme.background,
        boxShadow: `0 10px 20px rgba(0,0,0,0.1)`
      }}
    >
      <div className="joke-header">
        <h2 style={{ color: currentTheme.color }}>
          <span className="joke-icon">😂</span> 
          Joke Box
        </h2>
        <button 
          className="theme-toggle-btn"
          onClick={toggleTheme}
          style={{ backgroundColor: currentTheme.buttonBg }}
        >
          <span className="theme-icon">🎨</span>
        </button>
      </div>

      <div className="joke-category-selector">
        {categories.map(category => (
          <button 
            key={category}
            className={`category-btn ${category === jokeCategory ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category)}
            style={{ 
              backgroundColor: category === jokeCategory ? currentTheme.buttonBg : 'transparent',
              color: category === jokeCategory ? 'white' : currentTheme.color,
              borderColor: currentTheme.color
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div 
        className={`joke-content ${loading ? 'loading' : ''} ${animationState}`}
        ref={jokeRef}
        tabIndex="-1"
      >
        {loading ? (
          <div className="joke-loader">
            <div className="loader-circle" style={{ borderTopColor: currentTheme.buttonBg }}></div>
            <p>Finding a great joke...</p>
          </div>
        ) : error ? (
          <p className="joke-error">{error}</p>
        ) : (
          <p className="joke-text">{joke}</p>
        )}
      </div>

      <div className="joke-controls">
        <button 
          onClick={() => fetchJoke()}
          style={{ 
            backgroundColor: currentTheme.buttonBg,
            boxShadow: `0 4px 8px rgba(0,0,0,0.1)`
          }}
        >
          <span className="btn-icon">🔄</span> New Joke
        </button>
        <button 
          onClick={copyToClipboard}
          style={{ 
            backgroundColor: currentTheme.buttonBg,
            boxShadow: `0 4px 8px rgba(0,0,0,0.1)`
          }}
        >
          <span className="btn-icon">📋</span> Copy
        </button>
        <button 
          onClick={() => setVideoVisible(!videoVisible)}
          style={{ 
            backgroundColor: videoVisible ? currentTheme.buttonHover : currentTheme.buttonBg,
            boxShadow: `0 4px 8px rgba(0,0,0,0.1)`
          }}
        >
          <span className="btn-icon">{videoVisible ? '🎬' : '📺'}</span> 
          {videoVisible ? 'Hide Video' : 'Show Video'}
        </button>
      </div>
      
      {videoVisible && (
        <div className="funny-video">
          <iframe 
            width="100%" 
            height="200" 
            src="https://www.youtube.com/embed/6InQQ4qDgVE" 
            title="Funny Video" 
            frameBorder="0" 
            allowFullScreen
          ></iframe>
        </div>
      )}
      
      {previousJokes.length > 0 && (
        <div className="joke-history">
          <h3 style={{ color: currentTheme.color }}>Previous Jokes</h3>
          <div className="history-list">
            {previousJokes.map((oldJoke, index) => (
              <div 
                key={index} 
                className="history-item"
                style={{ borderLeftColor: currentTheme.buttonBg }}
              >
                {oldJoke.length > 80 ? oldJoke.substring(0, 80) + '...' : oldJoke}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JokeWidget;