import React, { useState, useEffect, useRef } from 'react';
import { Play, Volume2, VolumeX, Maximize2, RefreshCw, Home } from 'lucide-react';
import './GameWidget.css';

// Game information with proper titles
const games = [
  {
    url: 'https://html5.gamedistribution.com/84306950ffed41d5a7c05093e0092e84/?gd_sdk_referrer_url=https://www.example.com/games/game1',
    title: 'Candy Match Puzzle',
    category: 'Puzzle'
  },
  {
    url: 'https://html5.gamedistribution.com/991449eb63004b51b02e5482bc9ab7ff/?gd_sdk_referrer_url=https://www.example.com/games/game2',
    title: 'Space Invaders',
    category: 'Arcade'
  },
  {
    url: 'https://html5.gamedistribution.com/731cd1514aad4ad196d1c1ccde21b403/?gd_sdk_referrer_url=https://www.example.com/games/game3',
    title: 'Car Racing 3D',
    category: 'Racing'
  },
  {
    url: 'https://html5.gamedistribution.com/f91602ea0cae446386b1db3be3200c5e/?gd_sdk_referrer_url=https://www.example.com/games/game4',
    title: 'Block Puzzle',
    category: 'Puzzle'
  },
  {
    url: 'https://html5.gamedistribution.com/51951e60e1a94facb44b8e588c1ce21b/?gd_sdk_referrer_url=https://www.example.com/games/game5',
    title: 'Zombie Survival',
    category: 'Action'
  },
  {
    url: 'https://html5.gamedistribution.com/202557c3e71e430d8c81881208900488/?gd_sdk_referrer_url=https://www.example.com/games/game6',
    title: 'Bubble Shooter',
    category: 'Arcade'
  }
];

const GameWidget = () => {
  const [currentGame, setCurrentGame] = useState(games[0]);
  const [showGames, setShowGames] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gameFilter, setGameFilter] = useState('All');
  const containerRef = useRef(null);
  const audioRef = useRef(null);

  // Filter categories
  const categories = ['All', ...new Set(games.map(game => game.category))];
  
  // Filtered games based on category
  const filteredGames = gameFilter === 'All' 
    ? games 
    : games.filter(game => game.category === gameFilter);

  useEffect(() => {
    // Create audio element for background sound
    audioRef.current = new Audio('/api/placeholder/400/320');
    audioRef.current.loop = true;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    // Handle audio muting
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Audio autoplay prevented"));
      }
    }
  }, [isMuted]);

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleGameSelect = (game) => {
    setIsLoading(true);
    setCurrentGame(game);
    setShowGames(false);
    // Play selection sound
    const selectSound = new Audio('/api/placeholder/400/320');
    selectSound.play().catch(e => console.log("Audio play prevented"));
  };

  const handleReload = () => {
    setIsLoading(true);
    setCurrentGame({...currentGame});
  };

  return (
    <div className="game-widget-container" ref={containerRef}>
      <div className="game-header">
        <h2 className="game-title">
          <Play className="icon" size={24} />
          Arcade Zone
        </h2>
        <div className="control-buttons">
          <button 
            className="control-btn"
            onClick={() => setIsMuted(!isMuted)} 
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button 
            className="control-btn"
            onClick={toggleFullscreen} 
            title="Fullscreen"
          >
            <Maximize2 size={18} />
          </button>
          <button 
            className="control-btn"
            onClick={handleReload} 
            title="Reload Game"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            className="control-btn home-btn"
            onClick={() => setShowGames(!showGames)} 
            title="Game Selection"
          >
            <Home size={18} />
          </button>
        </div>
      </div>
      
      {showGames ? (
        <div className="game-selection-panel">
          <div className="category-filter">
            {categories.map(category => (
              <button 
                key={category}
                className={`category-btn ${gameFilter === category ? 'active' : ''}`}
                onClick={() => setGameFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="games-grid">
            {filteredGames.map((game, index) => (
              <div 
                key={index} 
                className="game-card"
                onClick={() => handleGameSelect(game)}
              >
                <div className="game-card-img">
                  <img 
                    src={`/api/placeholder/${400 + index}/${300 + index}`} 
                    alt={game.title}
                  />
                  <div className="play-overlay">
                    <Play size={40} />
                  </div>
                </div>
                <div className="game-card-info">
                  <h3>{game.title}</h3>
                  <span className="game-category">{game.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="game-iframe-wrapper">
          {isLoading && <div className="loading-spinner"></div>}
          <iframe
            src={currentGame.url}
            className="game-iframe"
            title={currentGame.title}
            onLoad={() => setIsLoading(false)}
            allowFullScreen
          ></iframe>
          <div className="game-controls-hint">
            <p>
              <strong>Now Playing:</strong> {currentGame.title}
              <br />
              Use your keyboard to play. Click on the game to focus!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameWidget;